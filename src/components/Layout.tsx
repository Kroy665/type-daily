import React from 'react'
import { sessionType } from "@/types/sessionType";
import Header from "@/components/Header";

function Layout({
    session,
    children
}: {
    session: sessionType;
    children: React.ReactNode;
}) {
    return (
        <div
            className='max-w-full'
        >
            <Header
                session={session}
            />
            <div
                className="w-full mt-20"
            >
                {children}
            </div>
        </div>
    )
}

export default Layout