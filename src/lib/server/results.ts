import type { AchievementType, Difficulty, Prisma } from '@prisma/client';
import { nextStreak } from '@/lib/streak';
import type { Score } from '@/lib/scoring';

interface Stats {
    wpm: number;
    accuracy: number;
    totalTests: number;
    currentStreak: number;
}

// Every tier the stats qualify for. Already-unlocked ones are skipped on insert.
export function qualifyingAchievements(stats: Stats): AchievementType[] {
    const types: AchievementType[] = [];
    if (stats.wpm >= 50) types.push('SPEED_50');
    if (stats.wpm >= 75) types.push('SPEED_75');
    if (stats.wpm >= 100) types.push('SPEED_DEMON');
    if (stats.accuracy >= 90) types.push('ACCURACY_90');
    if (stats.accuracy >= 95) types.push('ACCURACY_95');
    if (stats.accuracy === 100) types.push('PERFECTIONIST');
    if (stats.currentStreak >= 7) types.push('CONSISTENT');
    if (stats.currentStreak >= 30) types.push('MARATHON');
    if (stats.totalTests >= 1) types.push('FIRST_TEST');
    if (stats.totalTests >= 100) types.push('CENTURY');
    return types;
}

interface RecordParams {
    userId: string;
    difficulty: Difficulty;
    selectedTime: number;
    score: Score;
    timeZone: string;
    now: Date;
}

// Saves the result, updates the user's stats and unlocks achievements. Must run
// inside a transaction so the stats read and write can't interleave with
// another completion.
export async function recordResult(tx: Prisma.TransactionClient, params: RecordParams) {
    const { userId, difficulty, selectedTime, score, timeZone, now } = params;

    const result = await tx.result.create({
        data: {
            userId,
            difficulty,
            selectedTime,
            wpm: score.wpm,
            accuracy: score.accuracy,
            wrongWords: score.wrongWords,
        },
    });

    // Lock the user row until the transaction commits so concurrent completions
    // apply their stat updates one after another.
    await tx.$executeRaw`SELECT 1 FROM "User" WHERE id = ${userId} FOR UPDATE`;

    const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { bestWpm: true, bestAccuracy: true, totalTests: true, currentStreak: true, longestStreak: true, lastTestDate: true },
    });

    const currentStreak = nextStreak(user.currentStreak, user.lastTestDate, now, timeZone);
    const totalTests = user.totalTests + 1;

    await tx.user.update({
        where: { id: userId },
        data: {
            bestWpm: Math.max(score.wpm, user.bestWpm),
            bestAccuracy: Math.max(score.accuracy, user.bestAccuracy),
            totalTests,
            currentStreak,
            longestStreak: Math.max(currentStreak, user.longestStreak),
            lastTestDate: now,
        },
    });

    const qualifying = qualifyingAchievements({ wpm: score.wpm, accuracy: score.accuracy, totalTests, currentStreak });
    const [achievements, alreadyUnlocked] = await Promise.all([
        tx.achievement.findMany({ where: { type: { in: qualifying } } }),
        tx.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
    ]);
    const unlockedIds = new Set(alreadyUnlocked.map((ua) => ua.achievementId));
    const newlyUnlocked = achievements.filter((a) => !unlockedIds.has(a.id));

    if (newlyUnlocked.length > 0) {
        await tx.userAchievement.createMany({
            data: newlyUnlocked.map((a) => ({ userId, achievementId: a.id })),
            skipDuplicates: true,
        });
    }

    return {
        result,
        unlocked: newlyUnlocked.map(({ type, name, description, icon }) => ({ type, name, description, icon })),
    };
}
