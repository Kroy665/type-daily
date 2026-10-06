import { prisma } from '@/lib/db'
import { apiRoute } from '@/lib/server/api'
import { getUserId } from '@/lib/server/auth'

export default apiRoute(['GET'], async (req, res) => {
    const userId = await getUserId(req, res)
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const results = await prisma.result.findMany({
        where: { userId },
        orderBy: { created: 'asc' },
    })

    return res.status(200).json(results)
})
