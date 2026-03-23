import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store';
import { useSession } from "next-auth/react";
import { Difficulty } from ".prisma/client";
import HeroSection from './HeroSection';

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
    const [showConfetti, setShowConfetti] = useState(false);
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

        if (stats.wpm > 80 || stats.accuracy === 100) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        }

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
            case 'EASY': return 'from-green-400 to-green-600';
            case 'MEDIUM': return 'from-yellow-400 to-orange-500';
            case 'HARD': return 'from-red-400 to-pink-600';
            default: return 'from-gray-400 to-gray-600';
        }
    };

    const getDifficultyEmoji = (diff: Difficulty) => {
        switch (diff) {
            case 'EASY': return '🌱';
            case 'MEDIUM': return '🔥';
            case 'HARD': return '⚡';
            default: return '📝';
        }
    };

    const diff = computeDiff(text, typed);
    const stats = computeStats(text, typed, elapsedMs);
    const cursorPos = typed.length;
    const progress = text.length > 0 ? Math.min(100, Math.round((typed.length / text.length) * 100)) : 0;

    return (
        <div className="relative flex flex-col items-center justify-center w-full px-4 py-4 max-w-6xl mx-auto">
            {/* Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-fade-in"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-10%`,
                                animation: `confetti ${2 + Math.random() * 2}s linear forwards`,
                                fontSize: `${20 + Math.random() * 20}px`,
                            }}
                        >
                            {['🎉', '🎊', '⭐', '✨', '🌟'][Math.floor(Math.random() * 5)]}
                        </div>
                    ))}
                </div>
            )}

            {/* Error Alert */}
            {error && (
                <div className="w-full mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl animate-scale-in">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⚠️</span>
                        <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
                    </div>
                </div>
            )}

            {/* Controls Panel */}
            <div className="w-full mb-6 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl px-6 py-4 hover-lift">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Difficulty Selector */}
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span>🎯</span> Difficulty
                        </label>
                        <div className="flex gap-2">
                            {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((diff) => (
                                <button
                                    key={diff}
                                    onClick={() => setDifficulty(diff)}
                                    disabled={started}
                                    className={`px-4 py-3 rounded-xl font-bold transition-all transform ${difficulty === diff
                                            ? `bg-gradient-to-r ${getDifficultyColor(diff)} text-white scale-105 shadow-lg`
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <span className="mr-1">{getDifficultyEmoji(diff)}</span>
                                    {diff}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Selector */}
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span>⏱️</span> Duration
                        </label>
                        <div className="flex gap-2">
                            {[
                                { value: 60, label: '1 min' },
                                { value: 300, label: '5 mins' },
                                { value: 900, label: '15 mins' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setSelectedTime(option.value);
                                        setTime(option.value);
                                    }}
                                    disabled={started}
                                    className={`px-4 py-3 rounded-xl font-bold transition-all ${selectedTime === option.value
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Start Button */}
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <label className="text-sm font-semibold text-gray-700 invisible">Action</label>
                        <button
                            onClick={() => {
                                if (!started && !text) {
                                    onStart();
                                } else {
                                    reset();
                                }
                            }}
                            disabled={isLoading}
                            className={`px-8 py-3 rounded-xl font-bold text-white transition-all transform hover:scale-105 shadow-lg ${started || text
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                                } disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-slow`}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Loading...
                                </span>
                            ) : (started || text) ? (
                                <span>🔄 Reset</span>
                            ) : (
                                <span>🚀 Start</span>
                            )}
                        </button>
                    </div>

                    {/* Timer Display */}
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">Time Left</label>
                        <div className={`text-3xl font-bold text-center px-6 py-3 rounded-xl ${time <= 10 && started ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                            }`}>
                            {showTimeInMinutes(time)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Stats Bar */}
            {text && (
                <div className="w-full mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "WPM", value: started ? stats.wpm : "—", color: "from-blue-400 to-indigo-500" },
                        { label: "Accuracy", value: started ? stats.accuracy + "%" : "—", color: "from-green-400 to-teal-500" },
                        { label: "Errors", value: stats.wrong + stats.extra, color: "from-red-400 to-pink-500" },
                        { label: "Progress", value: progress + "%", color: "from-purple-400 to-pink-500" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className={`bg-gradient-to-r ${color} rounded-2xl p-4 shadow-lg`}>
                            <div className="text-xs text-white/80 mb-1 font-semibold uppercase tracking-wide">{label}</div>
                            <div className="text-3xl font-bold text-white">{value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Progress Bar */}
            {text && (
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 overflow-hidden">
                    <div
                        className={`h-full ${finished ? 'bg-green-500' : 'bg-blue-500'} rounded-full transition-all duration-100`}
                        style={{ width: progress + "%" }}
                    />
                </div>
            )}

            {/* Diff Display */}
            <div className="w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-gray-200">
                    <span>✨</span> Character Diff Mode
                </h3>
                <div
                    ref={textDisplayRef}
                    className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-2xl min-h-80 border-2 border-purple-100 dark:border-purple-800 cursor-text"
                    style={{
                        fontSize: '20px',
                        lineHeight: '2',
                        letterSpacing: '0.02em',
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
                                                background: '#6366f1',
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

                            {/* Cursor at end */}
                            {cursorPos >= diff.length && !finished && (
                                <span style={{
                                    display: 'inline-block',
                                    width: '2px',
                                    height: '1em',
                                    background: '#6366f1',
                                    opacity: showCursor ? 1 : 0,
                                    transition: 'opacity 0.1s',
                                    borderRadius: '1px',
                                    verticalAlign: 'middle',
                                }} />
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                            <span className="text-6xl mb-4 animate-bounce-slow">⌨️</span>
                            <p className="text-center text-lg">
                                Click <span className="font-bold text-green-500 dark:text-green-400">Start</span> to begin typing!
                            </p>
                            <p className="text-base mt-2">Choose difficulty and time above</p>
                        </div>
                    )}
                </div>

                {/* Legend */}
                {text && (
                    <div className="flex gap-6 mt-4 flex-wrap justify-center">
                        {[
                            { color: "#639922", label: "correct" },
                            { color: "#E24B4A", label: "wrong" },
                            { color: "#BA7517", label: "extra" },
                            { color: "#9ca3af", label: "pending" },
                        ].map(({ color, label }) => (
                            <div key={label} className="flex items-center gap-2">
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color }} />
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</span>
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
                <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
                        <div className="text-center">
                            <div className="text-7xl mb-4 animate-bounce-slow">
                                {stats.wrong === 0 && stats.extra === 0 ? '🏆' : stats.accuracy === 100 ? '🏆' : stats.wpm > 80 ? '🌟' : stats.wpm > 50 ? '🎯' : '👍'}
                            </div>
                            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                                {stats.wrong === 0 && stats.extra === 0
                                    ? "Perfect Run!"
                                    : stats.accuracy === 100 ? 'Perfect!' : stats.wpm > 80 ? 'Excellent!' : stats.wpm > 50 ? 'Great Job!' : 'Nice Try!'}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {stats.wrong === 0 && stats.extra === 0
                                    ? "Zero errors!"
                                    : `${stats.wrong + stats.extra} error${stats.wrong + stats.extra !== 1 ? "s" : ""}`}
                            </p>

                            <div className="space-y-4 mb-6">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-2xl">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Words Per Minute</p>
                                    <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{stats.wpm}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 p-4 rounded-2xl">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Accuracy</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.accuracy}%</p>
                                    </div>
                                    <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 p-4 rounded-2xl">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Errors</p>
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.wrong + stats.extra}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={reset}
                                    className="flex-1 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-105 shadow-lg"
                                >
                                    🔄 Retry
                                </button>
                                <button
                                    onClick={() => {
                                        setFinished(false);
                                        onStart();
                                    }}
                                    className="flex-1 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
                                >
                                    ✨ Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 mt-10">
                <HeroSection />
            </div>
        </div>
    );
};

export default TypingDiff;
