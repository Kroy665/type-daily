import { prisma } from '@/lib/db'
import { apiRoute } from '@/lib/server/api'
import { requireAdmin } from '@/lib/server/auth'
import { createTextSchema } from '@/lib/validations'

export default apiRoute(['POST'], async (req, res) => {
    const admin = await requireAdmin(req, res)
    if (!admin.ok) {
        return res.status(admin.status).json({ message: admin.message })
    }

    const data = createTextSchema.parse(req.body)
    const text = await prisma.text.create({ data })

    return res.status(201).json(text)
})
