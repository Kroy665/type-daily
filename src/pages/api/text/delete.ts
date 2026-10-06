import { prisma } from '@/lib/db'
import { apiRoute } from '@/lib/server/api'
import { requireAdmin } from '@/lib/server/auth'
import { idSchema } from '@/lib/validations'

export default apiRoute(['DELETE'], async (req, res) => {
    const admin = await requireAdmin(req, res)
    if (!admin.ok) {
        return res.status(admin.status).json({ message: admin.message })
    }

    const { id } = idSchema.parse(req.query)
    const { count } = await prisma.text.deleteMany({ where: { id } })

    if (count === 0) {
        return res.status(404).json({ message: 'Text not found' })
    }
    return res.status(200).json({ message: 'Text deleted', id })
})
