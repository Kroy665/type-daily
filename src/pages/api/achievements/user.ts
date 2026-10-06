import { prisma } from '@/lib/db'
import { apiRoute } from '@/lib/server/api'
import { getUserId } from '@/lib/server/auth'

export default apiRoute(['GET'], async (req, res) => {
    const userId = await getUserId(req, res)
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const [allAchievements, userAchievements] = await Promise.all([
        prisma.achievement.findMany({ orderBy: { created: 'asc' } }),
        prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true, unlockedAt: true } }),
    ])
    const unlockedAt = new Map(userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt]))

    return res.status(200).json(
        allAchievements.map((achievement) => ({
            ...achievement,
            unlocked: unlockedAt.has(achievement.id),
            unlockedAt: unlockedAt.get(achievement.id) ?? null,
        })),
    )
})
