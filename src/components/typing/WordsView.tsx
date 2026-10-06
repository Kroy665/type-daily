import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

// Visible lines of text; the current line is kept second once you're past the first.
const VISIBLE_LINES = 3;

type WordState = 'pending' | 'active' | 'done';

const Word = memo(function Word({ word, typed, state }: { word: string; typed: string | undefined; state: WordState }) {
    const wrong = state === 'done' && typed !== word;
    const extra = typed && typed.length > word.length ? typed.slice(word.length) : '';
    return (
        <span
            className={`relative mr-[0.6em] inline-block whitespace-nowrap ${wrong ? 'underline decoration-danger/70 decoration-2 underline-offset-[6px]' : ''}`}
        >
            {word.split('').map((char, i) => {
                const typedChar = typed?.[i];
                const cls =
                    typedChar === undefined
                        ? state === 'done'
                            ? 'text-danger/50' // skipped by an early space
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
                <span key={`x${i}`} data-ch="" className="text-danger/60">
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
    const [width, setWidth] = useState(0);

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
        const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
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
        <div ref={containerRef} className="relative" onClick={() => inputRef.current?.focus()}>
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
                className={`overflow-hidden font-mono text-[1.35rem] leading-[2.4] transition-[filter,opacity] duration-200 sm:text-[1.6rem] ${
                    !focused && !disabled ? 'opacity-40 blur-[3px]' : ''
                }`}
                style={{ height: `${VISIBLE_LINES * 2.4}em` }}
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
