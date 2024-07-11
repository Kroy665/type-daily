import { create } from 'zustand';

import { User, Result, Text } from '@prisma/client'

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
    
}));