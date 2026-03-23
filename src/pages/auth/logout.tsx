import React, { useEffect } from 'react';
import { signOut } from 'next-auth/react';

function Logout() {
    useEffect(() => {
        signOut({
            callbackUrl: `/`
        });
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="text-4xl mb-4">👋</div>
                <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Logging out...</p>
            </div>
        </div>
    )
}

export default Logout

// Prevent static generation for this page
export async function getServerSideProps() {
    return { props: {} };
}