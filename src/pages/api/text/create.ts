import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { createTextSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { requireAdmin } from '@/lib/middleware/adminOnly'

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method not allowed' })
        }

        // Check if user is admin
        const { authorized, error } = await requireAdmin(req, res)
        if (!authorized) {
            return res.status(error === 'Unauthorized' ? 401 : 403).json({ message: error })
        }

        // Validate input
        const validatedData = createTextSchema.parse(req.body)

        const textData = await prisma.text.create({
            data: validatedData
        })

        return res.status(201).json(textData)

    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.issues
            })
        }

        console.error('Error creating text:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}