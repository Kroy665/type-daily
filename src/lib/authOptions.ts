import { prisma } from "@/lib/db"
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'


const providers = [];


if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push(
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        })
    );
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
    secret: process.env.NEXTAUTH_SECRET || "secret",
    providers,
    callbacks: {
        async session({ session, user, token }) {
            if (session.user) {
                session.user.id = user?.id ?? token.id;
            }
            return session;
        },
        async signIn({ user }) {
            return !!user;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    },
}

export default authOptions;


