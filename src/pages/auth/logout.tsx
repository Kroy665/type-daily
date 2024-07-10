import React from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

function logout() {
    const router = useRouter();

    signOut({
        callbackUrl: `/`
    });

    
    return (
        <div>
            Logout
        </div>
    )
}

export default logout