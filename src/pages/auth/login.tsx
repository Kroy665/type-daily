import type { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Logo from '@/components/Logo';
import { GoogleIcon } from '@/components/icons';
import { getPageSession } from '@/lib/server/auth';

// Only allow redirects back into this site.
function safeCallbackUrl(value: unknown): string {
    return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export default function Login() {
    const router = useRouter();
    const [pending, setPending] = useState(false);

    return (
        <>
            <Head>
                <title>Sign in · TypeDaily</title>
            </Head>
            <div className="grid min-h-screen place-items-center px-4">
                <div className="w-full max-w-sm">
                    <div className="mb-8 flex justify-center">
                        <Logo />
                    </div>
                    <div className="card p-8">
                        <h1 className="text-xl font-semibold text-fg">Welcome back</h1>
                        <p className="mt-1.5 text-sm text-muted">
                            Sign in to save your results, build a daily streak and join the leaderboard.
                        </p>
                        <button
                            type="button"
                            disabled={pending}
                            onClick={() => {
                                setPending(true);
                                signIn('google', { callbackUrl: safeCallbackUrl(router.query.callbackUrl) });
                            }}
                            className="btn mt-6 w-full border border-border bg-surface py-2.5 text-fg hover:bg-surface-2"
                        >
                            <GoogleIcon />
                            {pending ? 'Redirecting…' : 'Continue with Google'}
                        </button>
                    </div>
                    <p className="mt-6 text-center text-sm text-muted">
                        or{' '}
                        <Link href="/" className="font-medium text-accent-text underline-offset-4 hover:underline">
                            practise without an account
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getPageSession(context);
    if (session) {
        return { redirect: { destination: safeCallbackUrl(context.query.callbackUrl), permanent: false } };
    }
    return { props: { session } };
}
