import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import authOptions from '@/lib/authOptions'
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
        const results = await prisma.result.findMany({
            where: {
                userId: user.id
            }
        })

        return res.status(200).json(results)

    }

}
