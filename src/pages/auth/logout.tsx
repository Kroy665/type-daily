import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Seo from '@/components/Seo';

export default function Logout() {
    useEffect(() => {
        signOut({ callbackUrl: '/' });
    }, []);

    return (
        <div className="grid min-h-screen place-items-center">
            <Seo title="Signing out" noindex />
            <p className="text-sm text-muted">Signing you out…</p>
        </div>
    );
}
