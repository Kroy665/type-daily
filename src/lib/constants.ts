export const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;
export type DifficultyValue = (typeof DIFFICULTIES)[number];

// Test durations in seconds. Texts are stored per duration, so the admin form
// and the test picker must both use this list.
export const DURATIONS = [60, 300, 900] as const;
export type DurationValue = (typeof DURATIONS)[number];

export const DURATION_LABELS: Record<DurationValue, string> = {
    60: '1 min',
    300: '5 min',
    900: '15 min',
};

// Results above this are treated as automated input and are not saved.
export const MAX_PLAUSIBLE_WPM = 300;

// Allowance for network latency between the client's timer ending and the
// completion request reaching the server.
export const COMPLETION_GRACE_MS = 10_000;

export const LEADERBOARD_METRICS = ['bestWpm', 'bestAccuracy', 'currentStreak', 'totalTests'] as const;
export type LeaderboardMetric = (typeof LEADERBOARD_METRICS)[number];
