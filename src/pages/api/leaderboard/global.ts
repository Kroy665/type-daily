import { prisma } from '@/lib/db'
import { apiRoute } from '@/lib/server/api'
import { leaderboardQuerySchema } from '@/lib/validations'
import { leaderboardOrder, leaderboardUserSelect } from '@/lib/server/leaderboard'

export default apiRoute(['GET'], async (req, res) => {
    const { orderBy, limit } = leaderboardQuerySchema.parse(req.query)

    const users = await prisma.user.findMany({
        where: { totalTests: { gt: 0 } },
        select: leaderboardUserSelect,
        orderBy: leaderboardOrder(orderBy),
        take: limit,
    })

    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120')
    return res.status(200).json(users.map((user, index) => ({ ...user, rank: index + 1 })))
})
