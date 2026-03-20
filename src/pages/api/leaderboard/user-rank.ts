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

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                image: true,
                bestWpm: true,
                bestAccuracy: true,
                totalTests: true,
                currentStreak: true,
                longestStreak: true,
            }
        })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // Calculate user's rank based on WPM
        const higherRankedUsers = await prisma.user.count({
            where: {
                bestWpm: {
                    gt: user.bestWpm
                },
                totalTests: {
                    gt: 0
                }
            }
        })

        const rank = higherRankedUsers + 1

        return res.status(200).json({
            ...user,
            rank
        })

    } catch (error) {
        console.error('Error fetching user rank:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
