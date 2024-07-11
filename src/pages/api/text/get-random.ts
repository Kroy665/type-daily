import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import authOptions from '@/lib/authOptions'
import { User, Result, Text, Difficulty } from '@prisma/client'
export default async function GET(req: NextApiRequest, res: NextApiResponse) {
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

    if (req.method === 'GET') {
        if (!('difficulty' in req.query) || !('time' in req.query)) {
            return res.status(400).json({ message: 'Missing parameters: difficulty and time' })
        }

        const {
            difficulty,
            time
        } = req.query

        const timeInt = parseInt(time as string)

        if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty as string)) {
            return res.status(400).json({ message: 'Invalid difficulty' })
        }

        const texts = await prisma.text.findMany({
            where: {
                difficulty: difficulty as Difficulty,
                time: timeInt
            }
        })

        if (texts.length === 0) {
            return res.status(404).json({ message: 'Text not found' })
        }
        const randomText = texts[Math.floor(Math.random() * texts.length)]

        return res.status(200).json(randomText)
    }
}