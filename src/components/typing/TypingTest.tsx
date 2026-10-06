import React, { useEffect, useRef, useState } from 'react';
import { DIFFICULTIES, DURATIONS, DURATION_LABELS, type DifficultyValue, type DurationValue } from '@/lib/constants';
import { useTypingTest, type TestConfig } from './useTypingTest';
import WordsView, { type TypingInputHandle } from './WordsView';
import ClassicView from './ClassicView';
import ResultsPanel from './ResultsPanel';
import { RefreshIcon, RestartIcon } from '@/components/icons';

type View = 'inline' | 'classic';

interface Prefs extends TestConfig {
    view: View;
}

const DEFAULT_PREFS: Prefs = { difficulty: 'EASY', duration: 60, view: 'inline' };
const PREFS_KEY = 'typedaily:prefs';

function readPrefs(): Prefs {
    try {
        const saved = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}');
        return {
            difficulty: DIFFICULTIES.includes(saved.difficulty) ? saved.difficulty : DEFAULT_PREFS.difficulty,
            duration: DURATIONS.includes(saved.duration) ? saved.duration : DEFAULT_PREFS.duration,
            view: saved.view === 'classic' ? 'classic' : 'inline',
        };
    } catch {
        return DEFAULT_PREFS;
    }
}

function writePrefs(prefs: Prefs) {
    try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
        // Preferences are a convenience; ignore storage failures.
    }
}

function Segmented<T extends string | number>({
    label,
    value,
    options,
    onChange,
    disabled,
}: {
    label: string;
    value: T;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
    disabled?: boolean;
}) {
    return (
        <div role="radiogroup" aria-label={label} className="flex items-center gap-0.5 rounded-lg bg-surface-2 p-0.5">
            {options.map((option) => {
                const selected = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={disabled}
                        onClick={() => onChange(option.value)}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                            selected ? 'bg-surface text-fg shadow-sm' : 'text-muted hover:text-fg'
                        }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

function formatClock(ms: number) {
    const total = Math.ceil(ms / 1000);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function TypingTestInner({ initial }: { initial: Prefs }) {
    const [prefs, setPrefs] = useState<Prefs>(initial);
    const test = useTypingTest({ difficulty: prefs.difficulty, duration: prefs.duration });
    const inputRef = useRef<TypingInputHandle>(null);
    const running = test.status === 'running';

    const updatePrefs = (patch: Partial<Prefs>) => {
        setPrefs((prev) => {
            const next = { ...prev, ...patch };
            writePrefs(next);
            return next;
        });
    };

    // Refocus the input whenever a fresh text is ready.
    useEffect(() => {
        if (test.status === 'ready') inputRef.current?.focus();
    }, [test.status, prefs.view]);

    // Tab = new text, Esc = restart (only while typing, so Tab still navigates
    // the page elsewhere). Any printable key refocuses the input if focus was lost.
    const { nextText, restart, status } = test;
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const inTest = target.getAttribute('aria-label') === 'Type the text shown';
            if (inTest && e.key === 'Tab') {
                e.preventDefault();
                nextText();
            } else if (inTest && e.key === 'Escape') {
                e.preventDefault();
                restart();
            } else if (
                target === document.body &&
                (status === 'ready' || status === 'running') &&
                e.key.length === 1 &&
                !e.metaKey &&
                !e.ctrlKey &&
                !e.altKey
            ) {
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [nextText, restart, status]);

    const live = test.liveScore;
    // WPM over the first couple of seconds is mostly noise; hold it back until it settles.
    const liveSettled = prefs.duration * 1000 - test.remainingMs >= 2000;
    const finished = test.status === 'finished';

    return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
            {/* Toolbar: timer, settings and live stats share one row on wide screens.
                Settings fade out while typing (and collapse on phones) to keep focus on the text. */}
            <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-4">
                <div
                    className={`order-1 min-w-[5.5rem] font-mono text-3xl font-semibold tabular-nums text-accent-text ${
                        finished ? 'invisible' : ''
                    }`}
                    aria-label="Time remaining"
                >
                    {formatClock(test.remainingMs)}
                </div>
                <div
                    className={`order-3 flex w-full flex-wrap items-center justify-center gap-2 transition-opacity duration-300 lg:order-2 lg:w-auto lg:flex-1 ${
                        running ? 'pointer-events-none opacity-0 max-lg:hidden' : 'opacity-100'
                    }`}
                >
                    <Segmented
                        label="Difficulty"
                        value={prefs.difficulty}
                        options={DIFFICULTIES.map((d) => ({ value: d, label: d.charAt(0) + d.slice(1).toLowerCase() }))}
                        onChange={(difficulty: DifficultyValue) => updatePrefs({ difficulty })}
                        disabled={running}
                    />
                    <Segmented
                        label="Duration"
                        value={prefs.duration}
                        options={DURATIONS.map((d) => ({ value: d, label: DURATION_LABELS[d] }))}
                        onChange={(duration: DurationValue) => updatePrefs({ duration })}
                        disabled={running}
                    />
                    <Segmented
                        label="View"
                        value={prefs.view}
                        options={[
                            { value: 'inline' as View, label: 'Inline' },
                            { value: 'classic' as View, label: 'Classic' },
                        ]}
                        onChange={(view: View) => updatePrefs({ view })}
                        disabled={running}
                    />
                </div>
                <div
                    className={`order-2 ml-auto flex min-w-[5.5rem] justify-end gap-5 font-mono text-sm text-muted transition-opacity lg:order-3 ${
                        running ? 'opacity-100' : 'opacity-0'
                    }`}
                    aria-live="off"
                >
                    <span>
                        <span className="tabular-nums text-fg">{live && liveSettled ? live.wpm : '–'}</span> wpm
                    </span>
                    <span>
                        <span className="tabular-nums text-fg">{live && liveSettled ? `${live.accuracy}%` : '–'}</span> acc
                    </span>
                </div>
            </div>

            {test.status === 'finished' && test.result ? (
                <ResultsPanel result={test.result} duration={prefs.duration} onNext={test.nextText} onRestart={test.restart} />
            ) : (
                <section aria-label="Typing test">
                    {test.status === 'error' ? (
                        <div className="card flex flex-col items-center gap-4 px-6 py-12 text-center">
                            <p className="text-sm text-danger">{test.error}</p>
                            <button type="button" onClick={test.nextText} className="btn-ghost">
                                <RefreshIcon width={16} height={16} /> Try again
                            </button>
                        </div>
                    ) : test.status === 'loading' ? (
                        <div className="space-y-4 py-2" aria-label="Loading text">
                            {[100, 92, 70].map((w) => (
                                <div key={w} className="h-6 animate-pulse rounded bg-surface-2" style={{ width: `${w}%` }} />
                            ))}
                        </div>
                    ) : prefs.view === 'inline' ? (
                        <WordsView
                            ref={inputRef}
                            words={test.targetWords}
                            typed={test.typed}
                            active
                            idle={test.status === 'ready'}
                            disabled={false}
                            onInput={test.handleInput}
                        />
                    ) : (
                        <ClassicView
                            ref={inputRef}
                            words={test.targetWords}
                            typed={test.typed}
                            disabled={false}
                            onInput={test.handleInput}
                        />
                    )}

                    {/* Progress */}
                    <div className="mt-6 h-0.5 overflow-hidden rounded-full bg-surface-2">
                        <div
                            className="h-full bg-accent transition-[width] duration-200"
                            style={{ width: `${test.progress * 100}%` }}
                        />
                    </div>

                    {/* Visible buttons for mouse and touch users; the shortcut is shown on each. */}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
                        <button type="button" onClick={test.restart} className="btn-ghost px-3 py-1.5 text-xs">
                            <RestartIcon width={14} height={14} /> Restart
                            <kbd className="kbd hidden sm:inline">esc</kbd>
                        </button>
                        <button type="button" onClick={test.nextText} className="btn-ghost px-3 py-1.5 text-xs">
                            <RefreshIcon width={14} height={14} /> New text
                            <kbd className="kbd hidden sm:inline">tab</kbd>
                        </button>
                    </div>
                    {test.status === 'ready' && (
                        <p className="mt-3 text-center text-xs text-subtle">The timer starts on your first keystroke.</p>
                    )}
                </section>
            )}
        </div>
    );
}

export default function TypingTest({ duration }: { duration?: DurationValue }) {
    // Preferences live in localStorage, so wait for the client before loading a
    // text to avoid fetching one for the defaults and another for the saved prefs.
    // A page-specific duration (the /typing-test/* pages) overrides the saved one.
    const [initial, setInitial] = useState<Prefs | null>(null);
    useEffect(() => {
        const saved = readPrefs();
        setInitial(duration ? { ...saved, duration } : saved);
    }, [duration]);

    if (!initial) {
        return <div className="mx-auto min-h-[30rem] w-full max-w-6xl" />;
    }
    return <TypingTestInner initial={initial} />;
}
