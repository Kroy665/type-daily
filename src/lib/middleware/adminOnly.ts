import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import authOptions from '@/lib/authOptions'

export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions)

    if (!session || !session.user) {
        return { authorized: false, user: null, error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })

    if (!user) {
        return { authorized: false, user: null, error: 'User not found' }
    }

    // Check if user has admin role
    // For now, we'll check by email domain or specific emails
    // You can update this after running the migration to use user.role
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    const isAdmin = adminEmails.includes(user.email)

    if (!isAdmin) {
        return { authorized: false, user, error: 'Forbidden: Admin access required' }
    }

    return { authorized: true, user, error: null }
}
