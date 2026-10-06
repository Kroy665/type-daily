import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { TYPING_TEXT, Word, type TypingInputHandle } from './WordsView';

// Both panes share one look and size: the same text style as the inline view,
// tall enough to read several lines ahead, scaled to the viewport.
// On wider screens the panes fill the viewport below the toolbar; the 13rem is
// the header, toolbar, progress bar and buttons. On phones the typing box is
// shorter so both panes stay above the on-screen keyboard. Scrollbars are
// hidden; the panes still scroll (and follow the current word) as you type.
const PANE = `no-scrollbar rounded-xl border border-border px-5 py-3 sm:px-6 sm:py-4 md:h-[clamp(20rem,calc(100vh-13rem),56rem)] ${TYPING_TEXT}`;

interface Props {
    words: string[];
    typed: string;
    disabled: boolean;
    onInput: (value: string) => void;
}

// Source text beside a plain text box. Uses the same per-letter feedback,
// typography and scoring as the inline view.
const ClassicView = forwardRef<TypingInputHandle, Props>(function ClassicView({ words, typed, disabled, onInput }, ref) {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const sourceRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }), []);

    const typedWords = typed.split(' ');
    const currentIndex = typedWords.length - 1;

    // Keep the current line in the upper part of the source pane. Scroll in whole
    // lines, leaving the previous line visible, so no line is cut off at the top.
    useEffect(() => {
        const pane = sourceRef.current;
        const word = pane?.firstElementChild?.children[currentIndex] as HTMLElement | undefined;
        if (!pane || !word) return;
        const lineTop = word.offsetTop - parseFloat(getComputedStyle(pane).paddingTop);
        const visibleTop = lineTop - pane.scrollTop;
        if (visibleTop < 0 || visibleTop > pane.clientHeight / 2) {
            // Previous line starts at the pane's top edge, so nothing above it peeks through the padding.
            pane.scrollTo({ top: Math.max(0, word.offsetTop - word.offsetHeight), behavior: 'smooth' });
        }
    }, [currentIndex]);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div ref={sourceRef} className={`relative h-44 select-none overflow-y-auto sm:h-72 ${PANE}`} aria-label="Text to type">
                <div className="flex flex-wrap">
                    {words.map((word, i) => (
                        <Word
                            key={i}
                            word={word}
                            typed={i <= currentIndex ? typedWords[i] : undefined}
                            state={i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'pending'}
                            highlight={i === currentIndex}
                        />
                    ))}
                </div>
            </div>
            <textarea
                ref={inputRef}
                value={typed}
                onChange={(e) => onInput(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                disabled={disabled}
                autoFocus
                placeholder="Start typing here…"
                aria-label="Type the text shown"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className={`resize-none bg-transparent text-fg caret-caret placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 h-32 sm:h-72 ${PANE}`}
            />
        </div>
    );
});

export default ClassicView;
