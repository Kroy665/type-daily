import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

// Lines shown on phones, where the on-screen keyboard takes the lower half.
// On wider screens the view fills TEST_AREA_HEIGHT with as many whole lines as
// fit. Either way the current line is kept second once you're past the first.
const MIN_LINES = 3;
const LINE_HEIGHT_EM = 2.4;

// Height of the test area from tablet width up, shared with the classic view:
// the viewport minus the header, toolbar, progress bar and buttons.
export const TEST_AREA_HEIGHT = 'md:h-[clamp(20rem,calc(100vh-13rem),56rem)]';

// Typography shared by both views so Inline and Classic read the same.
export const TYPING_TEXT = 'font-mono text-[1.35rem] leading-[2.4]';

type WordState = 'pending' | 'active' | 'done';

// One word with per-letter feedback. Used by both the inline and classic views.
export const Word = memo(function Word({
    word,
    typed,
    state,
    highlight = false,
}: {
    word: string;
    typed: string | undefined;
    state: WordState;
    /** Mark the current word (the classic view has no caret in its source pane). */
    highlight?: boolean;
}) {
    const wrong = state === 'done' && typed !== word;
    const extra = typed && typed.length > word.length ? typed.slice(word.length) : '';
    return (
        <span
            className={`relative mr-[0.6em] inline-block whitespace-nowrap rounded-sm ${
                wrong ? 'underline decoration-danger/70 decoration-2 underline-offset-[6px]' : ''
            } ${highlight ? 'underline decoration-accent decoration-2 underline-offset-[6px]' : ''}`}
        >
            {word.split('').map((char, i) => {
                const typedChar = typed?.[i];
                const cls =
                    typedChar === undefined
                        ? state === 'done'
                            ? 'text-danger' // skipped by an early space; the word is underlined as wrong
                            : 'text-subtle'
                        : typedChar === char
                          ? 'text-fg'
                          : 'text-danger';
                return (
                    <span key={i} data-ch="" className={cls}>
                        {char}
                    </span>
                );
            })}
            {extra.split('').map((char, i) => (
                // Extra letters: full-strength red on a light tint, so they stand out
                // without dropping below 4.5:1 contrast.
                <span key={`x${i}`} data-ch="" className="bg-danger/[0.08] text-danger">
                    {char}
                </span>
            ))}
        </span>
    );
});

export interface TypingInputHandle {
    focus: () => void;
}

interface Props {
    words: string[];
    typed: string;
    active: boolean;
    idle: boolean;
    disabled: boolean;
    onInput: (value: string) => void;
}

const WordsView = forwardRef<TypingInputHandle, Props>(function WordsView({ words, typed, active, idle, disabled, onInput }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [focused, setFocused] = useState(false);
    const [caret, setCaret] = useState({ x: 0, y: 0, h: 0 });
    const [offset, setOffset] = useState(0);
    const textRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    const [lines, setLines] = useState(MIN_LINES);

    useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }), []);

    const typedWords = typed.split(' ');
    const currentIndex = typedWords.length - 1;

    // Position the caret at the next character to type, and scroll by whole lines.
    useLayoutEffect(() => {
        const inner = innerRef.current;
        if (!inner) return;
        const wordEl = inner.children[currentIndex] as HTMLElement | undefined;
        if (!wordEl) return;

        const chars = wordEl.querySelectorAll<HTMLElement>('[data-ch]');
        const charIndex = typedWords[currentIndex]?.length ?? 0;
        const innerRect = inner.getBoundingClientRect();
        let rect: DOMRect;
        let x: number;
        if (charIndex < chars.length) {
            rect = chars[charIndex].getBoundingClientRect();
            x = rect.left;
        } else {
            rect = (chars[chars.length - 1] ?? wordEl).getBoundingClientRect();
            x = rect.right;
        }
        const y = rect.top - innerRect.top;
        setCaret({ x: x - innerRect.left, y, h: rect.height });

        const lineHeight = wordEl.getBoundingClientRect().height;
        setOffset(y >= lineHeight ? y - lineHeight : 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typed, words, width]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            setWidth(entry.contentRect.width);
            // From tablet width up the container has a fixed height; fit whole lines into it.
            const text = textRef.current;
            if (!text || !window.matchMedia('(min-width: 768px)').matches) {
                setLines(MIN_LINES);
                return;
            }
            const lineHeight = parseFloat(getComputedStyle(text).lineHeight);
            setLines(Math.max(MIN_LINES, Math.floor(entry.contentRect.height / lineHeight)));
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Keep the input's cursor at the end so arrow keys and clicks can't edit mid-text.
    const pinCursor = useCallback(() => {
        const input = inputRef.current;
        if (input && input.selectionStart !== input.value.length) {
            input.setSelectionRange(input.value.length, input.value.length);
        }
    }, []);

    return (
        <div ref={containerRef} className={`relative ${TEST_AREA_HEIGHT}`} onClick={() => inputRef.current?.focus()}>
            <input
                ref={inputRef}
                value={typed}
                onChange={(e) => onInput(e.target.value)}
                onKeyDown={(e) => {
                    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) e.preventDefault();
                }}
                onSelect={pinCursor}
                onPaste={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                disabled={disabled}
                aria-label="Type the text shown"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                autoFocus
                className="absolute inset-0 z-10 h-full w-full cursor-default opacity-0"
            />
            <div
                ref={textRef}
                className={`overflow-hidden ${TYPING_TEXT} transition-[filter,opacity] duration-200 sm:text-[1.6rem] ${
                    !focused && !disabled ? 'opacity-40 blur-[3px]' : ''
                }`}
                style={{ height: `${lines * LINE_HEIGHT_EM}em` }}
                aria-hidden="true"
            >
                <div
                    ref={innerRef}
                    className="relative flex flex-wrap transition-transform duration-150 ease-out"
                    style={{ transform: `translateY(-${offset}px)` }}
                >
                    {words.map((word, i) => (
                        <Word
                            key={i}
                            word={word}
                            typed={i <= currentIndex ? typedWords[i] : undefined}
                            state={i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'pending'}
                        />
                    ))}
                    {active && focused && (
                        <span
                            className={`pointer-events-none absolute left-0 top-0 w-[2.5px] rounded-full bg-caret transition-transform duration-100 ease-out ${idle ? 'animate-caret-blink' : ''}`}
                            style={{
                                height: caret.h * 0.75,
                                transform: `translate(${caret.x - 1}px, ${caret.y + caret.h * 0.125}px)`,
                            }}
                        />
                    )}
                </div>
            </div>
            {!focused && !disabled && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted">
                    Click here or press any key to focus
                </div>
            )}
        </div>
    );
});

export default WordsView;
