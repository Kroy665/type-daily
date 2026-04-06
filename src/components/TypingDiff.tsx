import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store';
import { useSession } from "next-auth/react";
import { Difficulty } from ".prisma/client";

// ─── Core Diff Algorithm ────────────────────────────────────────────────
// Operates character-by-character on the raw string (preserves spaces, punctuation)
// Returns an array of tokens: { char, status: 'correct'|'wrong'|'extra'|'pending' }

interface DiffToken {
    char: string;
    status: 'correct' | 'wrong' | 'extra' | 'pending';
    index: number;
    typed?: string;
}

function computeDiff(target: string, typed: string): DiffToken[] {
    const result: DiffToken[] = [];
    const tLen = target.length;
    const uLen = typed.length;
    const maxLen = Math.max(tLen, uLen);

    for (let i = 0; i < maxLen; i++) {
        const tChar = target[i];
        const uChar = typed[i];

        if (i >= tLen) {
            // User typed beyond the target → extra characters
            result.push({ char: uChar, status: "extra", index: i });
        } else if (i >= uLen) {
            // User hasn't typed here yet → pending
            result.push({ char: tChar, status: "pending", index: i });
        } else if (uChar === tChar) {
            result.push({ char: tChar, status: "correct", index: i });
        } else {
            // Wrong character — show what user typed, mark position as wrong
            result.push({ char: tChar, status: "wrong", typed: uChar, index: i });
        }
    }

    return result;
}

// ─── Stats Engine ───────────────────────────────────────────────────────
function computeStats(target: string, typed: string, elapsedMs: number) {
    const diff = computeDiff(target, typed);
    const correct = diff.filter((t) => t.status === "correct").length;
    const wrong = diff.filter((t) => t.status === "wrong").length;
    const extra = diff.filter((t) => t.status === "extra").length;
    const pending = diff.filter((t) => t.status === "pending").length;
    const totalTyped = typed.length;
    const accuracy = totalTyped > 0 ? Math.round((correct / totalTyped) * 100) : 100;

    // WPM = (correct chars / 5) / minutes
    const minutes = elapsedMs / 60000 || 1 / 60;
    const wpm = Math.round(correct / 5 / minutes);

    return { correct, wrong, extra, pending, accuracy, wpm, totalTyped };
}

// ─── Token Styles ────────────────────────────────────────────────────────
function getTokenStyle(status: string) {
    const base = { position: 'relative' as const, display: 'inline' as const };
    switch (status) {
        case "correct": return { ...base, color: "#639922" };
        case "wrong": return { ...base, color: "#E24B4A", background: "rgba(226,75,74,0.1)", borderRadius: "2px", padding: "0 1px" };
        case "extra": return { ...base, color: "#BA7517", textDecoration: "underline", textDecorationColor: "#BA7517", textDecorationThickness: "2px" };
        case "pending": return { ...base, color: "#9ca3af" };
        default: return base;
    }
}

const TypingDiff = () => {
    const [text, setText] = useState("");
    const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
    const [typed, setTyped] = useState("");
    const [selectedTime, setSelectedTime] = useState(60);
    const [time, setTime] = useState(60);
    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [elapsedMs, setElapsedMs] = useState(0);
    const [showCursor, setShowCursor] = useState(true);

    const startTimeRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const textDisplayRef = useRef<HTMLDivElement>(null);

    const { data: session } = useSession();
    const { createResult, getRandomText } = useStore();

    // Blink cursor
    useEffect(() => {
        const id = setInterval(() => setShowCursor((v) => !v), 530);
        return () => clearInterval(id);
    }, []);

    // Timer
    useEffect(() => {
        if (started && !finished && time > 0) {
            timerRef.current = setInterval(() => {
                const elapsed = Date.now() - (startTimeRef.current || Date.now());
                setElapsedMs(elapsed);

                const newTime = Math.max(0, selectedTime - Math.floor(elapsed / 1000));
                setTime(newTime);

                if (newTime === 0) {
                    handleFinish();
                }
            }, 100);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [started, finished, time]);

    const handleFinish = () => {
        setFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);

        const stats = computeStats(text, typed, elapsedMs);

        if (session && session.user && stats.wpm > 0 && stats.accuracy > 0) {
            createResult({
                difficulty,
                selectedTime,
                wpm: stats.wpm,
                accuracy: stats.accuracy,
                wrongWords: stats.wrong + stats.extra
            });
        }
    };

    const handleInput = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;

            if (!started && value.length > 0) {
                setStarted(true);
                startTimeRef.current = Date.now();
            }

            // Clamp to target length + some overflow buffer (max 50 extra chars)
            const clamped = value.slice(0, text.length + 50);
            setTyped(clamped);

            // Auto-finish when target fully typed correctly
            if (clamped === text) {
                handleFinish();
            }
        },
        [started, text]
    );

    const onStart = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const randomText = await getRandomText(difficulty, selectedTime);

            if (!randomText || !randomText.text) {
                throw new Error('No text found for this difficulty and time. Please add texts first.');
            }

            setText(randomText.text);
            setTyped("");
            setStarted(false);
            setFinished(false);
            setElapsedMs(0);
            setTime(selectedTime);

            setTimeout(() => inputRef.current?.focus(), 100);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load text');
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setTyped("");
        setStarted(false);
        setFinished(false);
        setElapsedMs(0);
        setTime(selectedTime);
        if (timerRef.current) clearInterval(timerRef.current);
        startTimeRef.current = null;
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const showTimeInMinutes = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    };

    const getDifficultyColor = (diff: Difficulty) => {
        switch (diff) {
            case 'EASY': return 'bg-green-600';
            case 'MEDIUM': return 'bg-yellow-600';
            case 'HARD': return 'bg-red-600';
            default: return 'bg-gray-600';
        }
    };

    const diff = computeDiff(text, typed);
    const stats = computeStats(text, typed, elapsedMs);
    const cursorPos = typed.length;
    const progress = text.length > 0 ? Math.min(100, Math.round((typed.length / text.length) * 100)) : 0;

    return (
        <div className="flex flex-col w-full px-4 max-w-7xl mx-auto" style={{ height: 'calc(100vh - 8rem)' }}>
            {/* Error Alert */}
            {error && (
                <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                    <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                </div>
            )}

            {/* Controls Panel - Compact Single Row */}
            <div className="mb-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-4 py-2">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Difficulty Selector */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Difficulty:</label>
                        <div className="flex gap-1">
                            {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((diff) => (
                                <button
                                    key={diff}
                                    onClick={() => setDifficulty(diff)}
                                    disabled={started}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                                        difficulty === diff
                                            ? `${getDifficultyColor(diff)} text-white`
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {diff}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Selector */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Duration:</label>
                        <div className="flex gap-1">
                            {[
                                { value: 60, label: '1m' },
                                { value: 300, label: '5m' },
                                { value: 900, label: '15m' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setSelectedTime(option.value);
                                        setTime(option.value);
                                    }}
                                    disabled={started}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                                        selectedTime === option.value
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Timer Display */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Time:</span>
                        <div className={`text-lg font-semibold px-3 py-0.5 rounded ${
                            time <= 10 && started ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                        }`}>
                            {showTimeInMinutes(time)}
                        </div>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={() => {
                            if (!started && !text) {
                                onStart();
                            } else {
                                reset();
                            }
                        }}
                        disabled={isLoading}
                        className={`px-4 py-1.5 text-sm font-medium text-white rounded transition-colors ${
                            started || text
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-green-600 hover:bg-green-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLoading ? 'Loading...' : (started || text) ? 'Reset' : 'Start'}
                    </button>
                </div>
            </div>

            {/* Live Stats Bar */}
            {text && (
                <div className="mb-3 flex gap-2 text-xs">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-1.5">
                        <span className="text-gray-600 dark:text-gray-400">WPM: </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{started ? stats.wpm : "—"}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-1.5">
                        <span className="text-gray-600 dark:text-gray-400">Accuracy: </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{started ? stats.accuracy + "%" : "—"}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-1.5">
                        <span className="text-gray-600 dark:text-gray-400">Errors: </span>
                        <span className="font-semibold text-red-600 dark:text-red-400">{stats.wrong + stats.extra}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-1.5">
                        <span className="text-gray-600 dark:text-gray-400">Progress: </span>
                        <span className="font-semibold text-gray-900 dark:text-white">{progress}%</span>
                    </div>
                </div>
            )}

            {/* Diff Display */}
            <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 overflow-hidden flex flex-col">
                <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    Character Mode
                </h3>
                <div
                    ref={textDisplayRef}
                    className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 rounded overflow-y-auto cursor-text"
                    style={{
                        fontSize: '16px',
                        lineHeight: '1.8',
                        letterSpacing: '0.01em',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                    }}
                    onClick={() => inputRef.current?.focus()}
                >
                    {text ? (
                        <>
                            {diff.map((token, i) => {
                                const isCursorHere = i === cursorPos && !finished;
                                const style = getTokenStyle(token.status);

                                return (
                                    <span key={i} style={{ position: 'relative', display: 'inline' }}>
                                        {isCursorHere && (
                                            <span style={{
                                                position: 'absolute',
                                                left: 0,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: '2px',
                                                height: '1.1em',
                                                background: '#3b82f6',
                                                opacity: showCursor ? 1 : 0,
                                                transition: 'opacity 0.1s',
                                                borderRadius: '1px',
                                                zIndex: 2,
                                            }} />
                                        )}
                                        <span
                                            title={token.status === "wrong" ? `you typed: "${token.typed}"` : undefined}
                                            style={style}
                                        >
                                            {token.char === ' ' ? '\u00A0' : token.char}
                                        </span>
                                    </span>
                                );
                            })}

                            {cursorPos >= diff.length && !finished && (
                                <span style={{
                                    display: 'inline-block',
                                    width: '2px',
                                    height: '1em',
                                    background: '#3b82f6',
                                    opacity: showCursor ? 1 : 0,
                                    transition: 'opacity 0.1s',
                                    borderRadius: '1px',
                                    verticalAlign: 'middle',
                                }} />
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                            <p className="text-center text-sm">
                                Click <span className="font-semibold text-green-600 dark:text-green-400">Start</span> to begin
                            </p>
                        </div>
                    )}
                </div>

                {/* Legend */}
                {text && (
                    <div className="flex gap-4 mt-3 text-xs flex-wrap">
                        {[
                            { color: "#639922", label: "correct" },
                            { color: "#E24B4A", label: "wrong" },
                            { color: "#BA7517", label: "extra" },
                            { color: "#9ca3af", label: "pending" },
                        ].map(({ color, label }) => (
                            <div key={label} className="flex items-center gap-1.5">
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                                <span className="text-gray-600 dark:text-gray-400">{label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Hidden real input */}
            <textarea
                ref={inputRef}
                value={typed}
                onChange={handleInput}
                disabled={finished || !text}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
            />

            {/* Finished Banner */}
            {finished && (
                <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded p-6 max-w-md w-full border border-gray-200 dark:border-gray-700 animate-scale-in">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
                                Test Complete
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                {stats.wrong + stats.extra} {stats.wrong + stats.extra === 1 ? "error" : "errors"}
                            </p>

                            <div className="space-y-3 mb-5">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-800">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Words Per Minute</p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.wpm}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-100 dark:border-green-800">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Accuracy</p>
                                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.accuracy}%</p>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-100 dark:border-red-800">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Errors</p>
                                        <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.wrong + stats.extra}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={reset}
                                    className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded"
                                >
                                    Retry
                                </button>
                                <button
                                    onClick={() => {
                                        setFinished(false);
                                        onStart();
                                    }}
                                    className="flex-1 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors rounded"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TypingDiff;
