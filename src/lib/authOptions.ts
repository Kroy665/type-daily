import { prisma } from "@/lib/db"
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from 'next-auth/providers/google'
import { isAdminUser } from "@/lib/admin";

// Fail fast at runtime, but not while `next build` evaluates modules (CI builds
// don't have production secrets).
if (process.env.NEXT_PHASE !== 'phase-production-build') {
    const missing = ['NEXTAUTH_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'].filter(
        (key) => !process.env[key],
    );
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { email: true, role: true },
                });
                token.isAdmin = dbUser ? isAdminUser(dbUser) : false;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.isAdmin = token.isAdmin ?? false;
            }
            return session;
        },
    },
}

export default authOptions;
