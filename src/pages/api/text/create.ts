import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import authOptions from '@/lib/authOptions'
import { User, Result, Text } from '@prisma/client'
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
            text,
            difficulty,
            time
        }: {
            text: string,
            difficulty: Text['difficulty'],
            time: number
        } = req.body

        const textData = await prisma.text.create({
            data: {
                text,
                difficulty,
                time,
            }
        })

        return res.status(201).json(textData)

    }
}