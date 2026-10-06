import { prisma } from '@/lib/db'
import { apiRoute } from '@/lib/server/api'
import { getUserId } from '@/lib/server/auth'
import { idSchema } from '@/lib/validations'

// Called on the first keystroke so the server's clock, not the client's,
// measures how long the test took.
export default apiRoute(['POST'], async (req, res) => {
    const userId = await getUserId(req, res)
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const { id } = idSchema.parse(req.query)
    const { count } = await prisma.testSession.updateMany({
        where: { id, userId, startedAt: null, completedAt: null },
        data: { startedAt: new Date() },
    })

    if (count === 0) {
        return res.status(409).json({ message: 'Test already started or not found' })
    }
    return res.status(204).end()
})
