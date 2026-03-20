import { prisma } from '@/lib/db'

interface UpdateStatsParams {
    userId: string
    wpm: number
    accuracy: number
}

export async function updateUserStats({ userId, wpm, accuracy }: UpdateStatsParams) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            bestWpm: true,
            bestAccuracy: true,
            totalTests: true,
            currentStreak: true,
            longestStreak: true,
            lastTestDate: true
        }
    })

    if (!user) {
        throw new Error('User not found')
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    let newStreak = user.currentStreak
    let newLongestStreak = user.longestStreak

    // Calculate streak
    if (user.lastTestDate) {
        const lastTest = new Date(user.lastTestDate)
        const lastTestDay = new Date(lastTest.getFullYear(), lastTest.getMonth(), lastTest.getDate())
        const daysDiff = Math.floor((today.getTime() - lastTestDay.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff === 0) {
            // Same day, no streak change
            newStreak = user.currentStreak
        } else if (daysDiff === 1) {
            // Consecutive day, increment streak
            newStreak = user.currentStreak + 1
        } else {
            // Streak broken, reset to 1
            newStreak = 1
        }
    } else {
        // First test ever
        newStreak = 1
    }

    // Update longest streak if current is higher
    newLongestStreak = Math.max(newStreak, user.longestStreak)

    // Update user stats
    await prisma.user.update({
        where: { id: userId },
        data: {
            bestWpm: Math.max(wpm, user.bestWpm),
            bestAccuracy: Math.max(accuracy, user.bestAccuracy),
            totalTests: user.totalTests + 1,
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastTestDate: now
        }
    })

    // Check and unlock achievements
    await checkAchievements(userId, {
        wpm,
        accuracy,
        totalTests: user.totalTests + 1,
        currentStreak: newStreak
    })
}

async function checkAchievements(
    userId: string,
    stats: { wpm: number; accuracy: number; totalTests: number; currentStreak: number }
) {
    const achievementsToUnlock: string[] = []

    // Check WPM achievements
    if (stats.wpm >= 100) achievementsToUnlock.push('SPEED_DEMON')
    else if (stats.wpm >= 75) achievementsToUnlock.push('SPEED_75')
    else if (stats.wpm >= 50) achievementsToUnlock.push('SPEED_50')

    // Check accuracy achievements
    if (stats.accuracy === 100) achievementsToUnlock.push('PERFECTIONIST')
    else if (stats.accuracy >= 95) achievementsToUnlock.push('ACCURACY_95')
    else if (stats.accuracy >= 90) achievementsToUnlock.push('ACCURACY_90')

    // Check streak achievements
    if (stats.currentStreak >= 30) achievementsToUnlock.push('MARATHON')
    else if (stats.currentStreak >= 7) achievementsToUnlock.push('CONSISTENT')

    // Check test count achievements
    if (stats.totalTests >= 100) achievementsToUnlock.push('CENTURY')
    if (stats.totalTests === 1) achievementsToUnlock.push('FIRST_TEST')

    // Get achievement IDs
    const achievements = await prisma.achievement.findMany({
        where: {
            type: {
                in: achievementsToUnlock as any[]
            }
        }
    })

    // Unlock achievements (ignore if already unlocked)
    for (const achievement of achievements) {
        try {
            await prisma.userAchievement.create({
                data: {
                    userId,
                    achievementId: achievement.id
                }
            })
        } catch (error) {
            // Achievement already unlocked, ignore
        }
    }
}
