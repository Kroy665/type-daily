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
    const [showConfetti, setShowConfetti] = useState(false);
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

        if (wpm > 80 || accuracy === 100) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        }

        if (session && session.user && wpm > 0 && accuracy > 0) {
            createResult({ difficulty, selectedTime, wpm, accuracy, wrongWords: wrongWordsCount });
        }
    }

    const getDifficultyColor = (diff: Difficulty) => {
        switch (diff) {
            case 'EASY': return 'from-green-400 to-green-600';
            case 'MEDIUM': return 'from-yellow-400 to-orange-500';
            case 'HARD': return 'from-red-400 to-pink-600';
            default: return 'from-gray-400 to-gray-600';
        }
    }

    const getDifficultyEmoji = (diff: Difficulty) => {
        switch (diff) {
            case 'EASY': return '🌱';
            case 'MEDIUM': return '🔥';
            case 'HARD': return '⚡';
            default: return '📝';
        }
    }

    // Update current word index based on user input
    useEffect(() => {
        if (!isStart || !text) return;

        const userWords = userText.trim().split(/\s+/);
        const sourceWords = text.split(/\s+/);

        // Find the current word index
        let newIndex = 0;
        for (let i = 0; i < userWords.length; i++) {
            if (i < sourceWords.length) {
                // Move to next word if current word is complete (followed by space)
                if (userText.endsWith(' ') && i === userWords.length - 1) {
                    newIndex = i + 1;
                } else if (i === userWords.length - 1) {
                    newIndex = i;
                }
            }
        }

        setCurrentWordIndex(Math.min(newIndex, sourceWords.length - 1));
    }, [userText, text, isStart]);

    // Auto-scroll to current word
    useEffect(() => {
        if (currentWordRef.current && textDisplayRef.current) {
            const wordElement = currentWordRef.current;
            const containerElement = textDisplayRef.current;

            // Get positions
            const wordRect = wordElement.getBoundingClientRect();
            const containerRect = containerElement.getBoundingClientRect();

            // Check if word is below the visible area
            if (wordRect.bottom > containerRect.bottom - 50) {
                // Scroll to keep current word in view (centered if possible)
                const scrollTop = wordElement.offsetTop - containerElement.offsetTop - containerElement.clientHeight / 2 + wordElement.clientHeight / 2;
                containerElement.scrollTo({
                    top: Math.max(0, scrollTop),
                    behavior: 'smooth'
                });
            }
        }
    }, [currentWordIndex]);

    // Helper function to get word status (correct, incorrect, current, upcoming)
    const getWordStatus = (wordIndex: number) => {
        const userWords = userText.trim().split(/\s+/).filter(Boolean);
        const sourceWords = text.split(/\s+/);

        if (wordIndex < userWords.length - 1) {
            // Already typed words (not the current one)
            return userWords[wordIndex] === sourceWords[wordIndex] ? 'correct' : 'incorrect';
        } else if (wordIndex === currentWordIndex) {
            // Current word being typed
            const currentUserWord = userWords[wordIndex] || '';
            const currentSourceWord = sourceWords[wordIndex] || '';

            if (currentUserWord && !currentSourceWord.startsWith(currentUserWord)) {
                return 'current-error';
            }
            return 'current';
        } else {
            // Upcoming words
            return 'upcoming';
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center w-full px-4 py-8 max-w-6xl mx-auto">
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

            {/* Hero Section */}
            <div className="text-center mb-8 animate-slide-in-up">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-float">
                    Type Daily ⚡
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Improve your typing speed one keystroke at a time! 🚀
                </p>
            </div>

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
            <div className="w-full mb-6 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 hover-lift">
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
                                    disabled={isStart}
                                    className={`px-4 py-3 rounded-xl font-bold transition-all transform ${
                                        difficulty === diff
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
                                    disabled={isStart}
                                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                                        selectedTime === option.value
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
                                setIsStart(!isStart);
                                if (!isStart) {
                                    onStart();
                                    setTime(selectedTime);
                                }
                            }}
                            disabled={isLoading}
                            className={`px-8 py-3 rounded-xl font-bold text-white transition-all transform hover:scale-105 shadow-lg ${
                                isStart
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-slow`}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Loading...
                                </span>
                            ) : isStart ? (
                                <span>🛑 Stop</span>
                            ) : (
                                <span>🚀 Start</span>
                            )}
                        </button>
                    </div>

                    {/* Timer Display */}
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">Time Left</label>
                        <div className={`text-3xl font-bold text-center px-6 py-3 rounded-xl ${
                            time <= 10 && isStart ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        }`}>
                            {showTimeInMinutes(time)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Typing Area */}
            <div className="w-full grid md:grid-cols-2 gap-6">
                {/* Source Text */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 hover-lift">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-gray-200">
                        <span>📖</span> Text to Type
                    </h3>
                    <div
                        ref={textDisplayRef}
                        className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-2xl h-80 overflow-y-auto text-xl leading-relaxed border-2 border-purple-100 dark:border-purple-800 scroll-smooth"
                        style={{ userSelect: "none" }}
                    >
                        {text ? (
                            <div className="flex flex-wrap gap-2">
                                {text.split(/\s+/).map((word, index) => {
                                    const status = getWordStatus(index);
                                    let className = "px-2 py-1 rounded-lg transition-all duration-200 font-semibold ";

                                    switch (status) {
                                        case 'correct':
                                            className += "bg-green-200 dark:bg-green-900/50 text-green-900 dark:text-green-200";
                                            break;
                                        case 'incorrect':
                                            className += "bg-red-200 dark:bg-red-900/50 text-red-900 dark:text-red-200 line-through";
                                            break;
                                        case 'current':
                                            className += "bg-blue-300 dark:bg-blue-700 text-blue-900 dark:text-blue-100 scale-110 shadow-lg ring-2 ring-blue-400 dark:ring-blue-500";
                                            break;
                                        case 'current-error':
                                            className += "bg-red-300 dark:bg-red-700 text-red-900 dark:text-red-100 scale-110 shadow-lg ring-2 ring-red-400 dark:ring-red-500 animate-pulse";
                                            break;
                                        case 'upcoming':
                                            className += "text-gray-600 dark:text-gray-400";
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
                                <span className="text-6xl mb-4 animate-bounce-slow">⌨️</span>
                                <p className="text-center text-lg">
                                    Click <span className="font-bold text-green-500 dark:text-green-400">Start</span> to begin typing!
                                </p>
                                <p className="text-base mt-2">Choose difficulty and time above</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 hover-lift">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-gray-200">
                        <span>✍️</span> Your Typing
                    </h3>
                    <textarea
                        className="w-full h-80 p-6 bg-gradient-to-br bg-white dark:bg-gray-900 rounded-2xl border-2 border-green-100 text-xl leading-relaxed focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-700 transition-all resize-none dark:placeholder-gray-500 font-semibold"
                        value={userText}
                        onChange={(e) => setUserText(e.target.value)}
                        disabled={!isStart}
                        placeholder={isStart ? "Start typing here..." : "Press Start to begin..."}
                        autoFocus={isStart}
                    />
                    <div className="mt-4 flex items-center justify-between text-base text-gray-600 dark:text-gray-400">
                        <span>Words: <strong className="text-lg">{userText.trim().split(/\s+/).filter(Boolean).length}</strong></span>
                        <span>Characters: <strong className="text-lg">{userText.length}</strong></span>
                    </div>
                </div>
            </div>

            {/* Results Modal */}
            {result.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
                        <div className="text-center">
                            <div className="text-7xl mb-4 animate-bounce-slow">
                                {result.accuracy === 100 ? '🏆' : result.wpm > 80 ? '🌟' : result.wpm > 50 ? '🎯' : '👍'}
                            </div>
                            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                                {result.accuracy === 100 ? 'Perfect!' : result.wpm > 80 ? 'Excellent!' : result.wpm > 50 ? 'Great Job!' : 'Nice Try!'}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">Here are your results</p>

                            <div className="space-y-4 mb-6">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-2xl">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Words Per Minute</p>
                                    <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{result.wpm}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 p-4 rounded-2xl">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Accuracy</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{result.accuracy}%</p>
                                    </div>
                                    <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 p-4 rounded-2xl">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Errors</p>
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{result.wrongWords}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setResult({ wpm: 0, accuracy: 0, wrongWords: 0, show: false })}
                                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
                            >
                                ✨ Try Again
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TypingSpeed;
