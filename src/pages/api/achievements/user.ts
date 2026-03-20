import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import authOptions from '@/lib/authOptions'

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ message: 'Method not allowed' })
        }

        const session = await getServerSession(req, res, authOptions)
        if (!session || !session.user) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        // Get all achievements
        const allAchievements = await prisma.achievement.findMany()

        // Get user's unlocked achievements
        const userAchievements = await prisma.userAchievement.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                achievement: true
            }
        })

        const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId))

        const achievements = allAchievements.map(achievement => ({
            ...achievement,
            unlocked: unlockedIds.has(achievement.id),
            unlockedAt: userAchievements.find(ua => ua.achievementId === achievement.id)?.unlockedAt || null
        }))

        return res.status(200).json(achievements)

    } catch (error) {
        console.error('Error fetching achievements:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
