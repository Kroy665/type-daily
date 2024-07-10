import Link from 'next/link'
import React from 'react'
import Image from 'next/image';

import { useSession, signIn, signOut } from "next-auth/react";

function Header() {

    const { data: session } = useSession();

    return (
        <header
            className="fixed top-0 left-0 flex gap-5 w-full px-5"
            style={{
                height: '4.5rem',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                backgroundColor: 'transparent',
                opacity: 0.9,
                // blur the background with 
                backdropFilter: 'blur(30px)'
            }}
        >
            <h1
                className="text-xl font-bold w-32"
            >
                Type Daily
            </h1>
            <div
                className="flex gap-5 max-md:flex-wrap"
            >
                <Link
                    href="/"
                    className="text-lg"
                >
                    Home
                </Link>
                <Link
                    href="#"
                    className="text-lg"
                >
                    About
                </Link>
                <Link
                    href="#"
                    className="text-lg"
                >
                    Contact
                </Link>
            </div>
            <div>
                {session ? (
                    <div>
                        {(session && session.user && session.user.image) ?
                            <Image
                                src={(session && session.user && session.user.image)}
                                alt="profile"
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                            :
                            <div
                                className="bg-gray-300 w-10 h-10 rounded-full"
                            >
                                {session.user?.name?.charAt(0)}
                            </div>
                        }
                    </div>
                ) : (
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                        onClick={() => {
                            if (session) {
                                signOut();
                            } else {
                                signIn("google");
                            }
                        }}
                    >
                        Login with Google
                    </button>
                )}
            </div>
        </header>
    )
}

export default Header