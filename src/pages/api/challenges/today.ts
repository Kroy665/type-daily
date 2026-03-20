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

        // Get today's date at midnight
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Check if today's challenge exists
        let challenge = await prisma.dailyChallenge.findUnique({
            where: { date: today },
            include: {
                text: true,
                results: {
                    where: {
                        userId: session.user.id
                    }
                }
            }
        })

        // If no challenge exists for today, create one
        if (!challenge) {
            // Get a random text
            const texts = await prisma.text.findMany({
                where: {
                    difficulty: 'MEDIUM',
                    time: 60
                }
            })

            if (texts.length === 0) {
                return res.status(404).json({ message: 'No texts available for daily challenge' })
            }

            const randomText = texts[Math.floor(Math.random() * texts.length)]

            challenge = await prisma.dailyChallenge.create({
                data: {
                    date: today,
                    textId: randomText.id,
                    difficulty: 'MEDIUM',
                    timeLimit: 60
                },
                include: {
                    text: true,
                    results: {
                        where: {
                            userId: session.user.id
                        }
                    }
                }
            })
        }

        // Check if user has completed today's challenge
        const userCompleted = challenge.results.length > 0

        // Get leaderboard for this challenge
        const leaderboard = await prisma.dailyChallengeResult.findMany({
            where: {
                challengeId: challenge.id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: [
                { wpm: 'desc' },
                { accuracy: 'desc' }
            ],
            take: 10
        })

        return res.status(200).json({
            challenge: {
                id: challenge.id,
                date: challenge.date,
                text: challenge.text.text,
                difficulty: challenge.difficulty,
                timeLimit: challenge.timeLimit,
                completed: userCompleted,
                userResult: challenge.results[0] || null
            },
            leaderboard: leaderboard.map((result, index) => ({
                rank: index + 1,
                user: result.user,
                wpm: result.wpm,
                accuracy: result.accuracy,
                isCurrentUser: result.userId === session.user!.id
            }))
        })

    } catch (error) {
        console.error('Error fetching daily challenge:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
