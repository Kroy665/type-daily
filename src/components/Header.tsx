import Link from 'next/link'
import React, { useEffect } from 'react'
import Image from 'next/image';
import { sessionType } from "@/types/sessionType";

import { useSession, signIn, signOut } from "next-auth/react";
import { useStore } from '@/store';

function Header(
    {
        session
    }: {
        session: sessionType
    }
) {

    const [showMenu, setShowMenu] = React.useState(false);
    const showMenuRef = React.useRef<HTMLDivElement>(null);

    const { getResults } = useStore();

    useEffect(() => {
        const fetchResults = async () => {
            const results = await getResults();
            console.log("results:::",results);

        }

        fetchResults();
    }, [])

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (showMenuRef.current && !showMenuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        }

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        }
    }, [])



    return (
        <div
            className="fixed top-0 left-0 flex gap-5 w-full px-5"
            style={{
                height: '4.5rem',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                backgroundColor: '#fff',
                // opacity: 0.9,
                // blur the background with 
                backdropFilter: 'blur(30px)'
            }}
        >
            <Link
                className="text-xl font-bold w-32"
                href="/"
            >
                Type Daily
            </Link>
            {/* <div
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
            </div> */}
            <div>
                {session ? (
                    <div
                        className='relative'
                        ref={showMenuRef}
                    >
                        {(session && session.user && session.user.image) ?
                            <Image
                                src={(session && session.user && session.user.image)}
                                alt="profile"
                                width={40}
                                height={40}
                                className="rounded-full cursor-pointer hover:opacity-80 transition-all duration-300 ease-in-out"
                                onClick={() => setShowMenu(!showMenu)}
                            />
                            :
                            <div
                                className="bg-gray-600 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer text-white font-bold text-lg hover:bg-gray-500 transition-all duration-300 ease-in-out"
                                onClick={() => setShowMenu(!showMenu)}
                            >
                                {session.user?.name?.charAt(0)}
                            </div>
                        }
                        <div
                            className={"absolute top-10 right-0 w-36" + (showMenu ? " block" : " hidden")}

                        >
                            <div
                                className="bg-white rounded-md shadow-md w-full py-2 px-3 flex flex-col gap-2"
                            >
                                <Link
                                    href="/profile"
                                    className="w-full text-left hover:bg-gray-100 px-2 py-1 rounded-md"
                                >
                                    Profile
                                </Link>
                                <Link
                                    href="/text"
                                    className="w-full text-left hover:bg-gray-100 px-2 py-1 rounded-md"
                                >
                                    Texts
                                </Link>
                                <button
                                    onClick={() =>  signOut({ callbackUrl: '/auth/login' })}
                           
                                    className="text-red-500 w-full text-left hover:bg-red-100 px-2 py-1 rounded-md"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Link
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                        href="/auth/login"
                    >
                        Login with Google
                    </Link>
                )}
            </div>
        </div>
    )
}

export default Header