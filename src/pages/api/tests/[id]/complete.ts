import { prisma } from '@/lib/db'
import { apiRoute } from '@/lib/server/api'
import { getUserId } from '@/lib/server/auth'
import { recordResult } from '@/lib/server/results'
import { scoreTest } from '@/lib/scoring'
import { isValidTimeZone } from '@/lib/streak'
import { COMPLETION_GRACE_MS, MAX_PLAUSIBLE_WPM } from '@/lib/constants'
import { completeTestSchema, idSchema } from '@/lib/validations'

// Scores the typed input against the session's text using server-side timing
// and records the result. Each session can be completed once.
export default apiRoute(['POST'], async (req, res) => {
    const userId = await getUserId(req, res)
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const { id } = idSchema.parse(req.query)
    const { typed, timeZone } = completeTestSchema.parse(req.body)
    const now = new Date()

    const outcome = await prisma.$transaction(async (tx) => {
        const session = await tx.testSession.findFirst({
            where: { id, userId },
            include: { text: { select: { text: true } } },
        })
        if (!session) {
            return { status: 404, body: { message: 'Test not found' } }
        }

        // Claim the session first: a repeated or concurrent completion matches nothing.
        const claimed = await tx.testSession.updateMany({
            where: { id, completedAt: null },
            data: { completedAt: now },
        })
        if (claimed.count === 0) {
            return { status: 409, body: { message: 'Test already completed' } }
        }

        const limitMs = session.selectedTime * 1000
        const elapsedMs = now.getTime() - (session.startedAt ?? session.created).getTime()
        if (elapsedMs > limitMs + COMPLETION_GRACE_MS) {
            return { status: 422, body: { message: 'Test expired before it was submitted' } }
        }
        if (typed.length > session.text.text.length + 200) {
            return { status: 422, body: { message: 'Input is longer than the test text' } }
        }

        const score = scoreTest(session.text.text, typed, Math.min(elapsedMs, limitMs))
        if (score.wpm > MAX_PLAUSIBLE_WPM) {
            return { status: 422, body: { message: 'Result rejected as implausible' } }
        }
        if (score.wpm === 0) {
            return { status: 200, body: { saved: false, score } }
        }

        const { result, unlocked } = await recordResult(tx, {
            userId,
            difficulty: session.difficulty,
            selectedTime: session.selectedTime,
            score,
            timeZone: timeZone && isValidTimeZone(timeZone) ? timeZone : 'UTC',
            now,
        })
        return { status: 201, body: { saved: true, score, result, unlocked } }
    })

    return res.status(outcome.status).json(outcome.body)
})
