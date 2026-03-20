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

export type DailyChallenge = {
    id: string;
    date: Date;
    text: string;
    difficulty: string;
    timeLimit: number;
    completed: boolean;
    userResult: any | null;
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
    deleteText: (id: string) => Promise<Text>;

    // Leaderboard
    getLeaderboard: (orderBy?: string, limit?: number) => Promise<LeaderboardUser[]>;
    getUserRank: () => Promise<LeaderboardUser>;

    // Achievements
    getAchievements: () => Promise<Achievement[]>;

    // Daily Challenge
    getTodayChallenge: () => Promise<any>;
    submitChallenge: (challengeId: string, wpm: number, accuracy: number, wrongWords: number) => Promise<any>;
};

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
        const results = await res.json();
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
        const texts = await res.json();

        // sort by text length smallest to largest
        texts.sort((a: Text, b: Text) => a.text.split(' ').length - b.text.split(' ').length);
        set({ texts });
        return texts;
    },
    texts: [],
    getRandomText: async (difficulty, time) => {
        const res = await fetch(`/api/text/get-random?difficulty=${difficulty}&time=${time}`);
        const text = await res.json();
        return text;
    },
    deleteText: async (id) => {
        const res = await fetch(`/api/text/delete?id=${id}`, {
            method: 'DELETE',
        });
        const text = await res.json();
        return text;
    },

    // Leaderboard functions
    getLeaderboard: async (orderBy = 'bestWpm', limit = 100) => {
        const res = await fetch(`/api/leaderboard/global?orderBy=${orderBy}&limit=${limit}`);
        const leaderboard = await res.json();
        return leaderboard;
    },

    getUserRank: async () => {
        const res = await fetch('/api/leaderboard/user-rank');
        const userRank = await res.json();
        return userRank;
    },

    // Achievements functions
    getAchievements: async () => {
        const res = await fetch('/api/achievements/user');
        const achievements = await res.json();
        return achievements;
    },

    // Daily Challenge functions
    getTodayChallenge: async () => {
        const res = await fetch('/api/challenges/today');
        const challenge = await res.json();
        return challenge;
    },

    submitChallenge: async (challengeId, wpm, accuracy, wrongWords) => {
        const res = await fetch('/api/challenges/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                challengeId,
                wpm,
                accuracy,
                wrongWords
            }),
        });
        const result = await res.json();
        return result;
    },
}));