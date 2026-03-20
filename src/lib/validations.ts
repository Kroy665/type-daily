import { z } from 'zod';

// Result validation schema
export const createResultSchema = z.object({
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    selectedTime: z.number().int().positive().min(60).max(3600), // 1 min to 1 hour
    wpm: z.number().int().nonnegative().max(500), // Max 500 WPM (world record is ~200)
    accuracy: z.number().int().min(0).max(100),
    wrongWords: z.number().int().nonnegative()
});

export type CreateResultInput = z.infer<typeof createResultSchema>;

// Text validation schema
export const createTextSchema = z.object({
    text: z.string().min(10).max(10000), // Min 10 chars, max 10k chars
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    time: z.number().int().positive().min(60).max(3600)
});

export type CreateTextInput = z.infer<typeof createTextSchema>;

// Query validation schemas
export const getRandomTextSchema = z.object({
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    time: z.string().transform(Number).pipe(z.number().int().positive())
});

export const deleteTextSchema = z.object({
    id: z.string().min(1)
});
