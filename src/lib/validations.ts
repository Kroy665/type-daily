import { z } from 'zod';
import { DIFFICULTIES, DURATIONS, LEADERBOARD_METRICS } from '@/lib/constants';

const difficulty = z.enum(DIFFICULTIES);
const duration = z.union(DURATIONS.map((d) => z.literal(d)) as [z.ZodLiteral<60>, z.ZodLiteral<300>, z.ZodLiteral<900>]);

export const startTestSchema = z.object({
    difficulty,
    selectedTime: duration,
    // Retry the same text instead of drawing a new one.
    textId: z.string().min(1).optional(),
});

export const completeTestSchema = z.object({
    typed: z.string().max(20_000),
    timeZone: z.string().max(64).optional(),
});

export const createTextSchema = z.object({
    text: z.string().trim().min(10).max(10_000),
    difficulty,
    time: duration,
});

export type CreateTextInput = z.infer<typeof createTextSchema>;

export const idSchema = z.object({
    id: z.string().min(1),
});

export const leaderboardQuerySchema = z.object({
    orderBy: z.enum(LEADERBOARD_METRICS).catch('bestWpm'),
    limit: z.coerce.number().int().catch(100).transform((n) => Math.min(Math.max(n, 1), 100)),
});

export const userRankQuerySchema = z.object({
    orderBy: z.enum(LEADERBOARD_METRICS).catch('bestWpm'),
});
