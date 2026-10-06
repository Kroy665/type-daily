import { prisma } from '@/lib/db'
import { apiRoute } from '@/lib/server/api'
import { requireAdmin } from '@/lib/server/auth'

export default apiRoute(['GET'], async (req, res) => {
    const admin = await requireAdmin(req, res)
    if (!admin.ok) {
        return res.status(admin.status).json({ message: admin.message })
    }

    const texts = await prisma.text.findMany({
        orderBy: [{ difficulty: 'asc' }, { time: 'asc' }, { created: 'desc' }],
    })

    return res.status(200).json(texts)
})
