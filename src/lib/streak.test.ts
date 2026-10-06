import { describe, expect, it } from 'vitest';
import { dayNumber, isValidTimeZone, nextStreak } from './streak';

describe('nextStreak', () => {
    const tz = 'America/New_York';

    it('starts at 1 for a first test', () => {
        expect(nextStreak(0, null, new Date(), tz)).toBe(1);
    });

    it('keeps the streak for a second test on the same day', () => {
        expect(nextStreak(3, new Date('2026-03-10T14:00:00Z'), new Date('2026-03-10T20:00:00Z'), tz)).toBe(3);
    });

    it('increments on the next local day even when UTC dates match', () => {
        // 9pm and 11pm New York on consecutive days... and 23:30 → 08:00 next day
        const last = new Date('2026-03-11T03:30:00Z'); // Mar 10, 11:30pm in New York (EDT)
        const now = new Date('2026-03-11T12:00:00Z'); // Mar 11, 8am in New York
        expect(nextStreak(4, last, now, tz)).toBe(5);
        // In UTC both are Mar 11, so the streak would not advance
        expect(nextStreak(4, last, now, 'UTC')).toBe(4);
    });

    it('resets after a missed day', () => {
        expect(nextStreak(9, new Date('2026-03-01T12:00:00Z'), new Date('2026-03-03T12:00:00Z'), tz)).toBe(1);
    });
});

describe('dayNumber', () => {
    it('differs by one across local midnight', () => {
        const before = new Date('2026-06-01T03:59:00Z'); // 11:59pm EDT
        const after = new Date('2026-06-01T04:01:00Z'); // 12:01am EDT
        expect(dayNumber(after, 'America/New_York') - dayNumber(before, 'America/New_York')).toBe(1);
    });
});

describe('isValidTimeZone', () => {
    it('accepts IANA names and rejects junk', () => {
        expect(isValidTimeZone('Asia/Kolkata')).toBe(true);
        expect(isValidTimeZone('Not/AZone')).toBe(false);
    });
});
