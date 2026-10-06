// Shared scoring used by the client (live stats) and the server (authoritative
// result). Scoring is word-aligned: the typed input is split on spaces and each
// typed word is compared with the target word at the same position, so a
// single slip doesn't mark every following character wrong.

export interface Score {
    wpm: number;
    rawWpm: number;
    accuracy: number;
    wrongWords: number;
    correctChars: number;
    typedChars: number;
}

export function splitWords(text: string): string[] {
    return text.trim().split(/\s+/).filter(Boolean);
}

// Collapses whitespace to single spaces and drops leading whitespace, matching
// what the typing input allows.
export function normalizeTyped(raw: string): string {
    return raw.replace(/\s+/g, ' ').replace(/^ /, '');
}

export function scoreTest(target: string, rawTyped: string, elapsedMs: number): Score {
    const targetWords = splitWords(target);
    const typed = normalizeTyped(rawTyped);
    const typedWords = typed.split(' ');
    // Every word except the last has been committed with a space; the last is
    // the word in progress (empty if the input ends with a space).
    const committed = typedWords.slice(0, -1);
    const current = typedWords[typedWords.length - 1] ?? '';

    let wpmChars = 0;
    let correctChars = 0;
    let typedChars = 0;
    let wrongWords = 0;

    const compareChars = (typedWord: string, targetWord: string) => {
        for (let i = 0; i < typedWord.length; i++) {
            if (typedWord[i] === targetWord[i]) correctChars++;
        }
        typedChars += typedWord.length;
    };

    committed.forEach((word, i) => {
        const targetWord = targetWords[i] ?? '';
        compareChars(word, targetWord);
        // Characters skipped by committing a word early count as misses.
        typedChars += Math.max(0, targetWord.length - word.length);
        // The space that committed the word is always in the right place.
        typedChars += 1;
        correctChars += 1;
        if (word === targetWord) {
            wpmChars += word.length + 1;
        } else {
            wrongWords++;
        }
    });

    if (current) {
        const targetWord = targetWords[committed.length] ?? '';
        compareChars(current, targetWord);
        if (current === targetWord) {
            wpmChars += current.length;
        } else if (!targetWord.startsWith(current)) {
            wrongWords++;
        }
    }

    const minutes = Math.max(elapsedMs, 1000) / 60_000;
    return {
        wpm: Math.round(wpmChars / 5 / minutes),
        rawWpm: Math.round(typed.length / 5 / minutes),
        accuracy: typedChars > 0 ? Math.round((correctChars / typedChars) * 100) : 0,
        wrongWords,
        correctChars,
        typedChars,
    };
}

// True once every target word has been typed and the last one matches.
export function isComplete(target: string, rawTyped: string): boolean {
    const targetWords = splitWords(target);
    const typedWords = normalizeTyped(rawTyped).split(' ');
    return (
        typedWords.length >= targetWords.length &&
        typedWords[targetWords.length - 1] === targetWords[targetWords.length - 1]
    );
}
