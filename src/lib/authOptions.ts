import { prisma } from "@/lib/db"
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'


const providers = [];

// providers.push(
//     CredentialsProvider({
//         name: 'Credentials',
//         credentials: {
//             email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
//             password: { label: "Password", type: "password" }
//         },
//         authorize: async (credentials) => {
//             // console.log("🚀 ~ authorize: ~ credentials:", credentials)
//             if (credentials) {
//                 const user = await prisma.user.findUnique({
//                     where: { email: credentials.email },
//                 });

//                 if (user && user.password && credentials.password && user.isUserVerified) {
//                     // Compare the provided password with the hashed password in the database
//                     const isMatch = await bcrypt.compare(credentials.password, user.password);

//                     if (isMatch) {
//                         // Any object returned will be saved in `user` property of the JWT
//                         return Promise.resolve(user);
//                     } else {
//                         // If you return null or false then the credentials will be rejected
//                         return Promise.resolve(null);
//                     }
//                 } else {
//                     return Promise.resolve(null);
//                 }
//             } else {
//                 return Promise.resolve(null);
//             }
//         }
//     })
// );

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
        signIn: "/",
        error: "/auth/error",
    },
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET || "secret",
    providers,
    callbacks: {
        async session({ session, user, token }) {
            if (session.user) {
                // user.id is set for 3rd party providers
                // token.id is set for credentials provider
                session.user.id = user?.id ?? token.id;
                if(user?.id && user?.id !== token.id){
                    const thisUser = await prisma.user.findUnique({
                        where: { id: user.id },
                    });
                    session.user.name = thisUser?.name;
                    session.user.email = thisUser?.email;
                }
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


