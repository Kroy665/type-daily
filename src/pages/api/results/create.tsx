import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import authOptions from '@/lib/authOptions'
import { createResultSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { updateUserStats } from '@/lib/utils/updateUserStats'

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method not allowed' })
        }

        const session = await getServerSession(req, res, authOptions)
        if (!session || !session.user) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const user = await prisma.user.findUnique({
            where: {
                id: session.user.id
            }
        })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // Validate input
        const validatedData = createResultSchema.parse(req.body)

        const result = await prisma.result.create({
            data: {
                ...validatedData,
                userId: user.id
            }
        })

        // Update user stats and check achievements
        await updateUserStats({
            userId: user.id,
            wpm: validatedData.wpm,
            accuracy: validatedData.accuracy
        })

        return res.status(201).json(result)

    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.issues
            })
        }

        console.error('Error creating result:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}