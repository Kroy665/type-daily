import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import authOptions from '@/lib/authOptions'
import { User, Result, Text } from '@prisma/client'
export default async function DELETE(req: NextApiRequest, res: NextApiResponse) {
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

    if (req.method === 'DELETE') {
        if (!('id' in req.query)) {
            return res.status(400).json({ message: 'Missing parameter: id' })
        }

        const { id } = req.query
        console.log("🚀 ~ DELETE ~ id:", id)

        const thisText = await prisma.text.findUnique({
            where: { 
                id: id as string
            },
        });

        if (!thisText) {
            return res.status(404).json({ message: 'Text not found' })
        }

        const text = await prisma.text.delete({
            where: {
                id: thisText.id
            }
        })

        return res.status(200).json(thisText)
    }
}