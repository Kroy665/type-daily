import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { useSession } from "next-auth/react";
import { Difficulty } from ".prisma/client";

const TypingSpeed = () => {
    const [text, setText] = useState("");
    const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
    const [userText, setUserText] = useState("");
    const [selectedTime, setSelectedTime] = useState(60);
    const [time, setTime] = useState(60);
    const [isStart, setIsStart] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const textDisplayRef = useRef<HTMLDivElement>(null);
    const currentWordRef = useRef<HTMLSpanElement>(null);
    const { data: session } = useSession();
    const { createResult, getRandomText } = useStore();

    const [result, setResult] = useState({
        wpm: 0,
        accuracy: 0,
        wrongWords: 0,
        show: false
    });

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isStart && time > 0) {
            interval = setInterval(() => {
                setTime(prevTime => {
                    if (prevTime <= 1) {
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isStart, time]);

    useEffect(() => {
        if (time === 0 && isStart) {
            setIsStart(false);
            calculateResult();
        }
    }, [time, isStart]);

    const onStart = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const randomText = await getRandomText(difficulty, selectedTime);

            if (!randomText || !randomText.text) {
                throw new Error('No text found for this difficulty and time. Please add texts first.');
            }

            setText(randomText.text);
            setUserText("");
            setCurrentWordIndex(0);
            setResult({ wpm: 0, accuracy: 0, wrongWords: 0, show: false });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load text');
            setIsStart(false);
        } finally {
            setIsLoading(false);
        }
    }

    const showTimeInMinutes = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    }

    const calculateResult = () => {
        const words = userText.trim().split(" ");
        const correctWords = words.filter((word, index) => word === text.split(" ")[index]);
        const wrongWordsCount = words.length - correctWords.length;
        const wpm = Math.round(correctWords.length / (selectedTime / 60));
        const accuracy = Math.round((correctWords.length / words.length) * 100) || 0;

        const newResult = { wpm, accuracy, wrongWords: wrongWordsCount, show: true };
        setResult(newResult);

        if (session && session.user && wpm > 0 && accuracy > 0) {
            createResult({ difficulty, selectedTime, wpm, accuracy, wrongWords: wrongWordsCount });
        }
    }

    // Update current word index based on user input
    useEffect(() => {
        if (!isStart || !text) return;

        const sourceWords = text.split(/\s+/);
        const spaceCount = (userText.match(/\s/g) || []).length;
        let newIndex = Math.min(spaceCount, sourceWords.length - 1);

        setCurrentWordIndex(newIndex);
    }, [userText, text, isStart]);

    // Auto-scroll to current word
    useEffect(() => {
        if (currentWordRef.current && textDisplayRef.current) {
            const wordElement = currentWordRef.current;
            const containerElement = textDisplayRef.current;

            const wordRect = wordElement.getBoundingClientRect();
            const containerRect = containerElement.getBoundingClientRect();

            if (wordRect.bottom > containerRect.bottom - 50) {
                const scrollTop = wordElement.offsetTop - containerElement.offsetTop - containerElement.clientHeight / 2 + wordElement.clientHeight / 2;
                containerElement.scrollTo({
                    top: Math.max(0, scrollTop),
                    behavior: 'smooth'
                });
            }
        }
    }, [currentWordIndex]);

    // Helper function to get word status
    const getWordStatus = (wordIndex: number) => {
        const sourceWords = text.split(/\s+/);
        const userWords = userText.trim().split(/\s+/).filter(Boolean);

        if (userWords.length === 0 || !userText) {
            return wordIndex === 0 ? 'current' : 'upcoming';
        }

        const hasMovedPast = currentWordIndex > wordIndex;
        const isCurrentWord = currentWordIndex === wordIndex;

        if (hasMovedPast) {
            const userWord = userWords[wordIndex] || '';
            const sourceWord = sourceWords[wordIndex] || '';
            return userWord === sourceWord ? 'correct' : 'incorrect';
        }

        if (isCurrentWord) {
            const currentUserWord = userWords[wordIndex] || '';
            const currentSourceWord = sourceWords[wordIndex] || '';

            if (currentUserWord && !currentSourceWord.startsWith(currentUserWord)) {
                return 'current-error';
            }
            return 'current';
        }

        return 'upcoming';
    };

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
                                    disabled={isStart}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                                        difficulty === diff
                                            ? diff === 'EASY' ? 'bg-green-600 text-white' :
                                              diff === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                                              'bg-red-600 text-white'
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
                                    disabled={isStart}
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
                            time <= 10 && isStart ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                        }`}>
                            {showTimeInMinutes(time)}
                        </div>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={() => {
                            setIsStart(!isStart);
                            if (!isStart) {
                                onStart();
                                setTime(selectedTime);
                            }
                        }}
                        disabled={isLoading}
                        className={`px-4 py-1.5 text-sm font-medium text-white rounded transition-colors ${
                            isStart
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-green-600 hover:bg-green-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLoading ? 'Loading...' : isStart ? 'Stop' : 'Start'}
                    </button>
                </div>
            </div>

            {/* Typing Area */}
            <div className="flex-1 grid md:grid-cols-2 gap-3 overflow-hidden">
                {/* Source Text */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 flex flex-col">
                    <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                        Text to Type
                    </h3>
                    <div
                        ref={textDisplayRef}
                        className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 rounded overflow-y-auto text-base leading-relaxed"
                        style={{ userSelect: "none" }}
                    >
                        {text ? (
                            <div className="flex flex-wrap gap-1.5">
                                {text.split(/\s+/).map((word, index) => {
                                    const status = getWordStatus(index);
                                    let className = "px-1.5 py-0.5 rounded transition-colors ";

                                    switch (status) {
                                        case 'correct':
                                            className += "bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-200";
                                            break;
                                        case 'incorrect':
                                            className += "bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-200 line-through";
                                            break;
                                        case 'current':
                                            className += "bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-blue-100 font-medium";
                                            break;
                                        case 'current-error':
                                            className += "bg-red-200 dark:bg-red-700 text-red-900 dark:text-red-100 font-medium";
                                            break;
                                        case 'upcoming':
                                            className += "text-gray-700 dark:text-gray-400";
                                            break;
                                    }

                                    const isCurrentWord = index === currentWordIndex;

                                    return (
                                        <span
                                            key={index}
                                            ref={isCurrentWord ? currentWordRef : null}
                                            className={className}
                                        >
                                            {word}
                                        </span>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                <p className="text-center text-sm">
                                    Click <span className="font-semibold text-green-600 dark:text-green-400">Start</span> to begin typing
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 flex flex-col">
                    <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                        Your Input
                    </h3>
                    <textarea
                        className="flex-1 p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none dark:placeholder-gray-500"
                        value={userText}
                        onChange={(e) => setUserText(e.target.value)}
                        disabled={!isStart}
                        placeholder={isStart ? "Start typing here..." : "Press Start to begin..."}
                        autoFocus={isStart}
                    />
                </div>
            </div>

            {/* Results Modal */}
            {result.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded p-6 max-w-md w-full border border-gray-200 dark:border-gray-700 animate-scale-in">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
                                Test Complete
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Your results</p>

                            <div className="space-y-3 mb-5">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-800">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Words Per Minute</p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{result.wpm}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-100 dark:border-green-800">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Accuracy</p>
                                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{result.accuracy}%</p>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-100 dark:border-red-800">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Errors</p>
                                        <p className="text-xl font-bold text-red-600 dark:text-red-400">{result.wrongWords}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setResult({ wpm: 0, accuracy: 0, wrongWords: 0, show: false })}
                                className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TypingSpeed;
