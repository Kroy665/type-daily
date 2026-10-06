import { randomInt } from 'crypto'
import { prisma } from '@/lib/db'
import { apiRoute } from '@/lib/server/api'
import { getUserId } from '@/lib/server/auth'
import { startTestSchema } from '@/lib/validations'

const SESSION_RETENTION_MS = 24 * 60 * 60 * 1000

// Draws a text for a test. Signed-in users also get a single-use session that
// the result is later scored against; anonymous users can practise unsaved.
export default apiRoute(['POST'], async (req, res) => {
    const { difficulty, selectedTime, textId } = startTestSchema.parse(req.body)
    const where = { difficulty, time: selectedTime }

    let text: { id: string; text: string } | null = null
    if (textId) {
        text = await prisma.text.findFirst({ where: { ...where, id: textId }, select: { id: true, text: true } })
    } else {
        const count = await prisma.text.count({ where })
        if (count > 0) {
            text = await prisma.text.findFirst({
                where,
                select: { id: true, text: true },
                orderBy: { id: 'asc' },
                skip: randomInt(count),
            })
        }
    }

    if (!text) {
        return res.status(404).json({ message: 'No texts available for this difficulty and duration yet.' })
    }

    let sessionId: string | null = null
    const userId = await getUserId(req, res)
    if (userId) {
        // Sessions only matter until their test ends; prune old ones as we go.
        await prisma.testSession.deleteMany({
            where: { userId, created: { lt: new Date(Date.now() - SESSION_RETENTION_MS) } },
        })
        const session = await prisma.testSession.create({
            data: { userId, textId: text.id, difficulty, selectedTime },
            select: { id: true },
        })
        sessionId = session.id
    }

    return res.status(201).json({ textId: text.id, text: text.text, sessionId })
})
