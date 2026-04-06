import React, { useState } from 'react';
import TypingSpeed from './TypingSpeed';
import TypingDiff from './TypingDiff';

type TypingMode = 'word' | 'character';

const TypingTest = () => {
    const [mode, setMode] = useState<TypingMode>('word');

    return (
        <div className="relative">
            {/* Mode Selector */}
            <div className="flex justify-center mb-3">
                <div className="inline-flex bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setMode('word')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            mode === 'word'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        Word Mode
                    </button>
                    <button
                        onClick={() => setMode('character')}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ${
                            mode === 'character'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        Character Mode
                    </button>
                </div>
            </div>

            {/* Render the selected mode */}
            {mode === 'word' ? <TypingSpeed /> : <TypingDiff />}
        </div>
    );
};

export default TypingTest;
