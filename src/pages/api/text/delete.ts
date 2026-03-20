import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { deleteTextSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { requireAdmin } from '@/lib/middleware/adminOnly'

export default async function DELETE(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'DELETE') {
            return res.status(405).json({ message: 'Method not allowed' })
        }

        // Check if user is admin
        const { authorized, error } = await requireAdmin(req, res)
        if (!authorized) {
            return res.status(error === 'Unauthorized' ? 401 : 403).json({ message: error })
        }

        // Validate query parameters
        const { id } = deleteTextSchema.parse(req.query)

        const thisText = await prisma.text.findUnique({
            where: {
                id
            },
        });

        if (!thisText) {
            return res.status(404).json({ message: 'Text not found' })
        }

        await prisma.text.delete({
            where: {
                id: thisText.id
            }
        })

        return res.status(200).json({ message: 'Text deleted successfully', data: thisText })

    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.issues
            })
        }

        console.error('Error deleting text:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}