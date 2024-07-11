import React, { useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import { sessionType } from "@/types/sessionType";
import { useRouter } from 'next/router';

const Login = ({
    session
}: {
    session: sessionType;
}) => {
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push('/');
        }
    }, [session])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <img className="mx-auto h-12 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg" alt="Workflow" />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in with Google
                    </h2>
                </div>
                <div>
                    <button
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => signIn("google")}
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};



export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getSession(context);
    return {
        props: { session },
    };
}


export default Login;