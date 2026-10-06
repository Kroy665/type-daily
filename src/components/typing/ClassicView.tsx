import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { TypingInputHandle } from './WordsView';

// Both panes share one size: tall enough to read several lines ahead, scaled to
// the viewport so the test still fits on one screen.
const PANE_SIZE = 'h-56 text-lg leading-9 sm:h-64 md:h-[clamp(20rem,55vh,38rem)] md:text-xl md:leading-10';

interface Props {
    words: string[];
    typed: string;
    disabled: boolean;
    onInput: (value: string) => void;
}

// Source text on one side and a plain text box on the other, with word-level
// feedback. Shares input handling and scoring with the inline view.
const ClassicView = forwardRef<TypingInputHandle, Props>(function ClassicView({ words, typed, disabled, onInput }, ref) {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const sourceRef = useRef<HTMLDivElement>(null);
    const currentRef = useRef<HTMLSpanElement>(null);

    useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }), []);

    const typedWords = typed.split(' ');
    const currentIndex = typedWords.length - 1;

    // Keep the current word visible in the source pane.
    useEffect(() => {
        const word = currentRef.current;
        const pane = sourceRef.current;
        if (!word || !pane) return;
        const top = word.offsetTop - pane.offsetTop;
        if (top < pane.scrollTop || top > pane.scrollTop + pane.clientHeight - word.offsetHeight * 2) {
            pane.scrollTo({ top: Math.max(0, top - pane.clientHeight / 3), behavior: 'smooth' });
        }
    }, [currentIndex]);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div
                ref={sourceRef}
                className={`card select-none overflow-y-auto p-6 font-mono ${PANE_SIZE}`}
                aria-label="Text to type"
            >
                {words.map((word, i) => {
                    const typedWord = typedWords[i];
                    let cls = 'text-subtle';
                    if (i < currentIndex) {
                        cls = typedWord === word ? 'text-success' : 'text-danger line-through decoration-danger/60';
                    } else if (i === currentIndex) {
                        cls =
                            typedWord && !word.startsWith(typedWord)
                                ? 'bg-danger/15 text-danger'
                                : 'bg-accent/20 text-fg';
                    }
                    return (
                        <React.Fragment key={i}>
                            <span ref={i === currentIndex ? currentRef : undefined} className={`rounded px-0.5 ${cls}`}>
                                {word}
                            </span>{' '}
                        </React.Fragment>
                    );
                })}
            </div>
            <textarea
                ref={inputRef}
                value={typed}
                onChange={(e) => onInput(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                disabled={disabled}
                autoFocus
                placeholder="Start typing here — the timer starts on your first keystroke"
                aria-label="Type the text shown"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className={`input resize-none p-6 font-mono ${PANE_SIZE}`}
            />
        </div>
    );
});

export default ClassicView;
