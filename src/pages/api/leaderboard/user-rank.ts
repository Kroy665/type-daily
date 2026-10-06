import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { apiRoute } from '@/lib/server/api'
import { getUserId } from '@/lib/server/auth'
import { userRankQuerySchema } from '@/lib/validations'
import { leaderboardUserSelect } from '@/lib/server/leaderboard'

export default apiRoute(['GET'], async (req, res) => {
    const userId = await getUserId(req, res)
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const { orderBy } = userRankQuerySchema.parse(req.query)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { ...leaderboardUserSelect, createdAt: true },
    })
    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    const { createdAt, ...publicUser } = user
    if (user.totalTests === 0) {
        return res.status(200).json({ ...publicUser, rank: null })
    }

    // Same ordering as the leaderboard: metric desc, then earliest account, then id.
    const value = user[orderBy]
    const ahead = await prisma.user.count({
        where: {
            totalTests: { gt: 0 },
            OR: [
                { [orderBy]: { gt: value } },
                { [orderBy]: value, createdAt: { lt: createdAt } },
                { [orderBy]: value, createdAt, id: { lt: user.id } },
            ],
        } as Prisma.UserWhereInput,
    })

    return res.status(200).json({ ...publicUser, rank: ahead + 1 })
})
