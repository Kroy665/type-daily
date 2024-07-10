import { create } from 'zustand';

import { User, Result } from '@prisma/client'

export type StoreTypes = {
    user: {
        id: string;
        name: string;
        email: string;
    };
    setUser: (user: StoreTypes['user']) => void;
    results: Result[];
    setResults: (results: Result[]) => void;
    getResults: () => Promise<void>;
    createResult: (result: {
        difficulty: Result['difficulty'],
        selectedTime: Result['selectedTime'],
        wpm: Result['wpm'],
        accuracy: Result['accuracy'],
        wrongWords: Result['wrongWords']
    }) => Promise<void>;
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
}));