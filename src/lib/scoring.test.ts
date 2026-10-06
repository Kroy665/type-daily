import { describe, expect, it } from 'vitest';
import { isComplete, normalizeTyped, scoreTest } from './scoring';

const TEXT = 'the quick brown fox';
const MINUTE = 60_000;

describe('scoreTest', () => {
    it('scores a perfect run', () => {
        const score = scoreTest(TEXT, TEXT, MINUTE);
        // 19 chars typed correctly in one minute = 19/5 ≈ 4 WPM
        expect(score).toMatchObject({ wpm: 4, accuracy: 100, wrongWords: 0 });
    });

    it('counts a mistyped word without penalising the words after it', () => {
        const score = scoreTest(TEXT, 'the quikc brown fox', MINUTE);
        expect(score.wrongWords).toBe(1);
        // "the " + "brown " + "fox" are counted for WPM, the wrong word is not
        expect(score.wpm).toBe(Math.round(13 / 5));
        expect(score.accuracy).toBe(Math.round((17 / 19) * 100));
    });

    it('does not treat an in-progress prefix as an error', () => {
        expect(scoreTest(TEXT, 'the qui', MINUTE).wrongWords).toBe(0);
        expect(scoreTest(TEXT, 'the qx', MINUTE).wrongWords).toBe(1);
    });

    it('counts characters skipped by an early space as misses', () => {
        const score = scoreTest(TEXT, 'the qu brown', MINUTE);
        expect(score.wrongWords).toBe(1);
        expect(score.typedChars).toBe(4 + 6 + 5);
    });

    it('scales with elapsed time', () => {
        expect(scoreTest(TEXT, TEXT, MINUTE / 2).wpm).toBe(8);
    });

    it('returns zeros for empty input', () => {
        expect(scoreTest(TEXT, '', MINUTE)).toMatchObject({ wpm: 0, accuracy: 0, wrongWords: 0 });
    });

    it('ignores extra whitespace in the input', () => {
        expect(scoreTest(TEXT, ' the  quick\nbrown fox', MINUTE)).toEqual(scoreTest(TEXT, TEXT, MINUTE));
    });
});

describe('isComplete', () => {
    it('is true once the last word matches', () => {
        expect(isComplete(TEXT, TEXT)).toBe(true);
        expect(isComplete(TEXT, 'the quikc brown fox')).toBe(true);
    });

    it('is false while the last word is incomplete or wrong', () => {
        expect(isComplete(TEXT, 'the quick brown fo')).toBe(false);
        expect(isComplete(TEXT, 'the quick brown fxo')).toBe(false);
    });
});

describe('normalizeTyped', () => {
    it('collapses whitespace and strips the leading space', () => {
        expect(normalizeTyped('  a \n\tb  ')).toBe('a b ');
    });
});
