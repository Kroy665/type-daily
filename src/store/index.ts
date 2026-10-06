import { create } from 'zustand';

import { User, Result, Text } from '@prisma/client'

export type LeaderboardUser = {
    id: string;
    name: string | null;
    image: string | null;
    bestWpm: number;
    bestAccuracy: number;
    totalTests: number;
    currentStreak: number;
    longestStreak: number;
    rank: number;
};

export type Achievement = {
    id: string;
    type: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt: Date | null;
};

export type StoreTypes = {
    user: {
        id: string;
        name: string;
        email: string;
    };
    setUser: (user: StoreTypes['user']) => void;
    results: Result[];
    setResults: (results: Result[]) => void;
    getResults: () => Promise<Result[]>;
    createResult: (result: {
        difficulty: Result['difficulty'],
        selectedTime: Result['selectedTime'],
        wpm: Result['wpm'],
        accuracy: Result['accuracy'],
        wrongWords: Result['wrongWords']
    }) => Promise<void>;

    saveText: (text: string, difficulty: string, time: number) => Promise<Text | undefined>;
    getTexts: () => Promise<Text[]>;
    texts: Text[];
    getRandomText: (difficulty: Text['difficulty'], time: Text['time']) => Promise<Text>;
    deleteText: (id: string) => Promise<Text | undefined>;

    // Leaderboard
    getLeaderboard: (orderBy?: string, limit?: number) => Promise<LeaderboardUser[]>;
    getUserRank: () => Promise<LeaderboardUser>;

    // Achievements
    getAchievements: () => Promise<Achievement[]>;
};

// Throws with the API's error message so callers' try/catch can surface it
async function parseOrThrow(res: Response, fallback: string) {
    const data = await res.json().catch(() => null);
    if (!res.ok) {
        throw new Error(data?.message || fallback);
    }
    return data;
}

export const useStore = create<StoreTypes>((set, get) => ({
    user: {
        id: '',
        name: '',
        email: '',
    },
    setUser: (user) => set({ user }),
    results: [],
    setResults: (results) => set({ results }),
    getResults: async () => {
        const res = await fetch('/api/results/get-all');
        // Logged-out or failed requests leave an empty list rather than an error object
        const results = res.ok ? await res.json() : [];
        get().setResults(results);

        return results;
    },
    createResult: async (result) => {
        const res = await fetch('/api/results/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(result),
        });
        if (!res.ok) {
            console.error('Failed to save result:', res.status);
            return;
        }
        const newResult = await res.json();
        get().setResults([...get().results, newResult]);
    },
    saveText: async (text, difficulty, time) => {
        const res = await fetch('/api/text/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                difficulty,
                time,
            }),
        });

        if (res.ok) {
            const data = await res.json();
            return data;
        }
    },
    getTexts: async () => {
        const res = await fetch('/api/text/get-all');
        const texts: Text[] = res.ok ? await res.json() : [];

        // sort by text length smallest to largest
        texts.sort((a: Text, b: Text) => a.text.split(' ').length - b.text.split(' ').length);
        set({ texts });
        return texts;
    },
    texts: [],
    getRandomText: async (difficulty, time) => {
        const res = await fetch(`/api/text/get-random?difficulty=${difficulty}&time=${time}`);
        return parseOrThrow(res, 'Failed to load text');
    },
    deleteText: async (id) => {
        const res = await fetch(`/api/text/delete?id=${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            console.error('Failed to delete text:', res.status);
            return;
        }
        const { data } = await res.json();
        return data;
    },

    // Leaderboard functions
    getLeaderboard: async (orderBy = 'bestWpm', limit = 100) => {
        const res = await fetch(`/api/leaderboard/global?orderBy=${orderBy}&limit=${limit}`);
        return parseOrThrow(res, 'Failed to load leaderboard');
    },

    getUserRank: async () => {
        const res = await fetch('/api/leaderboard/user-rank');
        return parseOrThrow(res, 'Failed to load rank');
    },

    // Achievements functions
    getAchievements: async () => {
        const res = await fetch('/api/achievements/user');
        return parseOrThrow(res, 'Failed to load achievements');
    },
}));