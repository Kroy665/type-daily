import type { Difficulty } from '@prisma/client';
import type { Score } from '@/lib/scoring';

// Shapes returned by the API routes, as seen by the client (dates arrive as strings).

export interface StartTestResponse {
    textId: string;
    text: string;
    sessionId: string | null;
}

export interface UnlockedAchievement {
    type: string;
    name: string;
    description: string;
    icon: string;
}

export type CompleteTestResponse =
    | { saved: true; score: Score; unlocked: UnlockedAchievement[] }
    | { saved: false; score: Score };

export interface ResultItem {
    id: string;
    difficulty: Difficulty;
    selectedTime: number;
    wpm: number;
    accuracy: number;
    wrongWords: number;
    created: string;
}

export interface AchievementItem {
    id: string;
    type: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt: string | null;
}

export interface LeaderboardUser {
    id: string;
    name: string | null;
    image: string | null;
    bestWpm: number;
    bestAccuracy: number;
    totalTests: number;
    currentStreak: number;
    longestStreak: number;
    rank: number | null;
}

export interface TextItem {
    id: string;
    text: string;
    difficulty: Difficulty;
    time: number;
    created: string;
}
