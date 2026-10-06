// Streaks are counted in calendar days of the user's own timezone, so a test at
// 11pm and one at 7am the next morning count as consecutive days.

export function isValidTimeZone(timeZone: string): boolean {
    try {
        new Intl.DateTimeFormat('en-US', { timeZone });
        return true;
    } catch {
        return false;
    }
}

// Days since the Unix epoch for the calendar date of `date` in `timeZone`.
export function dayNumber(date: Date, timeZone: string): number {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    }).formatToParts(date);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    return Math.floor(Date.UTC(get('year'), get('month') - 1, get('day')) / 86_400_000);
}

export function nextStreak(
    currentStreak: number,
    lastTestDate: Date | null,
    now: Date,
    timeZone: string,
): number {
    if (!lastTestDate) return 1;
    const daysDiff = dayNumber(now, timeZone) - dayNumber(lastTestDate, timeZone);
    if (daysDiff <= 0) return Math.max(currentStreak, 1);
    if (daysDiff === 1) return currentStreak + 1;
    return 1;
}
