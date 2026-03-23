import React, { useState } from 'react';
import TypingSpeed from './TypingSpeed';
import TypingDiff from './TypingDiff';

type TypingMode = 'word' | 'character';

const TypingTest = () => {
    const [mode, setMode] = useState<TypingMode>('word');

    return (
        <div className="relative">
            {/* Mode Selector */}
            <div className="flex justify-center mb-4">
                <div className="inline-flex bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-xl border-2 border-purple-100 dark:border-purple-800">
                    <button
                        onClick={() => setMode('word')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all transform ${
                            mode === 'word'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        <span className="mr-2">📝</span>
                        Word Mode
                    </button>
                    <button
                        onClick={() => setMode('character')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all transform ${
                            mode === 'character'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        <span className="mr-2">✨</span>
                        Character Mode
                    </button>
                </div>
            </div>

            {/* Mode Description */}
            <div className="max-w-4xl mx-auto text-center">
                {mode === 'word' ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl inline-block">
                        <span className="font-semibold">Word Mode:</span> Type words side-by-side with real-time word highlighting
                    </p>
                ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl inline-block">
                        <span className="font-semibold">Character Mode:</span> Character-by-character diff with precise error tracking
                    </p>
                )}
            </div>

            {/* Render the selected mode */}
            {mode === 'word' ? <TypingSpeed /> : <TypingDiff />}
        </div>
    );
};

export default TypingTest;
