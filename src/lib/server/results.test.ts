import { describe, expect, it } from 'vitest';
import { qualifyingAchievements } from './results';

describe('qualifyingAchievements', () => {
    it('includes every lower tier when a higher one is reached', () => {
        const types = qualifyingAchievements({ wpm: 120, accuracy: 100, totalTests: 1, currentStreak: 30 });
        expect(types).toEqual(
            expect.arrayContaining([
                'SPEED_50', 'SPEED_75', 'SPEED_DEMON',
                'ACCURACY_90', 'ACCURACY_95', 'PERFECTIONIST',
                'CONSISTENT', 'MARATHON', 'FIRST_TEST',
            ]),
        );
        expect(types).not.toContain('CENTURY');
    });

    it('returns only first-test for a slow, inaccurate first run', () => {
        expect(qualifyingAchievements({ wpm: 20, accuracy: 70, totalTests: 1, currentStreak: 1 })).toEqual(['FIRST_TEST']);
    });
});
