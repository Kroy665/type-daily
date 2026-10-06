import type { Prisma } from '@prisma/client'
import type { LeaderboardMetric } from '@/lib/constants'

export const leaderboardUserSelect = {
    id: true,
    name: true,
    image: true,
    bestWpm: true,
    bestAccuracy: true,
    totalTests: true,
    currentStreak: true,
    longestStreak: true,
} satisfies Prisma.UserSelect

// Ties go to whoever joined first, then by id, so ranks are stable across requests.
export function leaderboardOrder(metric: LeaderboardMetric): Prisma.UserOrderByWithRelationInput[] {
    return [{ [metric]: 'desc' }, { createdAt: 'asc' }, { id: 'asc' }]
}
