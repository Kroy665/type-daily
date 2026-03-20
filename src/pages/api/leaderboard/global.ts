import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ message: 'Method not allowed' })
        }

        const { limit = '100', orderBy = 'bestWpm' } = req.query

        const limitNum = Math.min(parseInt(limit as string), 100) // Max 100 users

        let orderByClause: any = { bestWpm: 'desc' }

        if (orderBy === 'bestAccuracy') {
            orderByClause = { bestAccuracy: 'desc' }
        } else if (orderBy === 'currentStreak') {
            orderByClause = { currentStreak: 'desc' }
        } else if (orderBy === 'totalTests') {
            orderByClause = { totalTests: 'desc' }
        }

        const leaderboard = await prisma.user.findMany({
            where: {
                totalTests: {
                    gt: 0 // Only users who have completed at least one test
                }
            },
            select: {
                id: true,
                name: true,
                image: true,
                bestWpm: true,
                bestAccuracy: true,
                totalTests: true,
                currentStreak: true,
                longestStreak: true,
            },
            orderBy: orderByClause,
            take: limitNum,
        })

        // Add rank to each user
        const rankedLeaderboard = leaderboard.map((user, index) => ({
            ...user,
            rank: index + 1
        }))

        return res.status(200).json(rankedLeaderboard)

    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
