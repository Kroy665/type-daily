import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import authOptions from '@/lib/authOptions'
import { User, Result } from '@prisma/client'
export default async function POST(req: NextApiRequest, res: NextApiResponse) {
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

    if (req.method === 'POST') {
        const {
            difficulty,
            selectedTime,
            wpm,
            accuracy,
            wrongWords
        }:{
            difficulty: Result['difficulty'],
            selectedTime: Result['selectedTime'],
            wpm: Result['wpm'],
            accuracy: Result['accuracy'],
            wrongWords: Result['wrongWords']
        } = req.body

        const result = await prisma.result.create({
            data: {
                difficulty,
                selectedTime,
                wpm,
                accuracy,
                wrongWords,
                userId: user.id
            }
        })

        return res.status(201).json(result)

    }

}