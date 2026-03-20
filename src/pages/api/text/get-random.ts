import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import authOptions from '@/lib/authOptions'
import { getRandomTextSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { Difficulty } from '@prisma/client'

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
            where: {
                id: session.user.id
            }
        })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // Validate query parameters
        const { difficulty, time } = getRandomTextSchema.parse(req.query)

        const texts = await prisma.text.findMany({
            where: {
                difficulty: difficulty as Difficulty,
                time
            }
        })

        if (texts.length === 0) {
            return res.status(404).json({ message: 'No texts found for this difficulty and time' })
        }

        const randomText = texts[Math.floor(Math.random() * texts.length)]
        return res.status(200).json(randomText)

    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.issues
            })
        }

        console.error('Error fetching random text:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}