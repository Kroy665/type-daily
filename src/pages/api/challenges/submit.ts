import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import authOptions from '@/lib/authOptions'
import { z } from 'zod'

const submitChallengeSchema = z.object({
    challengeId: z.string(),
    wpm: z.number().int().nonnegative().max(500),
    accuracy: z.number().int().min(0).max(100),
    wrongWords: z.number().int().nonnegative()
})

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method not allowed' })
        }

        const session = await getServerSession(req, res, authOptions)
        if (!session || !session.user) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const { challengeId, wpm, accuracy, wrongWords } = submitChallengeSchema.parse(req.body)

        // Check if challenge exists
        const challenge = await prisma.dailyChallenge.findUnique({
            where: { id: challengeId }
        })

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' })
        }

        // Check if user already completed this challenge
        const existing = await prisma.dailyChallengeResult.findUnique({
            where: {
                userId_challengeId: {
                    userId: session.user.id,
                    challengeId
                }
            }
        })

        if (existing) {
            return res.status(400).json({ message: 'Challenge already completed' })
        }

        // Create challenge result
        const result = await prisma.dailyChallengeResult.create({
            data: {
                userId: session.user.id,
                challengeId,
                wpm,
                accuracy,
                wrongWords,
                completed: true
            }
        })

        return res.status(201).json(result)

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.issues
            })
        }

        console.error('Error submitting challenge:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
