import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import { getServerSession, type Session } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/db';
import { isAdminUser } from '@/lib/admin';

export async function getUserId(req: NextApiRequest, res: NextApiResponse): Promise<string | null> {
    const session = await getServerSession(req, res, authOptions);
    return session?.user?.id ?? null;
}

// Checks admin status against the database rather than the session token, so
// revoking access takes effect immediately.
export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
    const userId = await getUserId(req, res);
    if (!userId) {
        return { ok: false as const, status: 401, message: 'Unauthorized' };
    }
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true },
    });
    if (!user || !isAdminUser(user)) {
        return { ok: false as const, status: 403, message: 'Forbidden: admin access required' };
    }
    return { ok: true as const, user };
}

// Session for getServerSideProps, made JSON-serializable (Next rejects
// `undefined` values in props).
export async function getPageSession(context: GetServerSidePropsContext): Promise<Session | null> {
    const session = await getServerSession(context.req, context.res, authOptions);
    return session ? JSON.parse(JSON.stringify(session)) : null;
}
