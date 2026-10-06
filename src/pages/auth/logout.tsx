import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function Logout() {
    useEffect(() => {
        signOut({ callbackUrl: '/' });
    }, []);

    return (
        <div className="grid min-h-screen place-items-center">
            <p className="text-sm text-muted">Signing you out…</p>
        </div>
    );
}
