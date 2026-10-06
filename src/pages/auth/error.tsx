import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Logo from '@/components/Logo';

// Error codes from https://next-auth.js.org/configuration/pages#error-page
const MESSAGES: Record<string, string> = {
    Configuration: 'Sign-in is misconfigured on the server. Please try again later.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'This sign-in link has expired or has already been used.',
    OAuthAccountNotLinked: 'This email is already linked to a different sign-in method.',
};

export default function AuthError() {
    const { query } = useRouter();
    const code = typeof query.error === 'string' ? query.error : '';
    const message = MESSAGES[code] ?? 'Something went wrong while signing you in. Please try again.';

    return (
        <>
            <Head>
                <title>Sign-in error · TypeDaily</title>
            </Head>
            <div className="grid min-h-screen place-items-center px-4">
                <div className="w-full max-w-sm text-center">
                    <div className="mb-8 flex justify-center">
                        <Logo />
                    </div>
                    <div className="card p-8">
                        <h1 className="text-xl font-semibold text-fg">Couldn&apos;t sign you in</h1>
                        <p className="mt-2 text-sm text-muted">{message}</p>
                        <div className="mt-6 flex justify-center gap-2">
                            <Link href="/" className="btn-ghost">Home</Link>
                            <Link href="/auth/login" className="btn-primary">Try again</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
