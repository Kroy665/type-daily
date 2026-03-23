import Link from 'next/link'
import React, { useEffect } from 'react'
import Image from 'next/image';
import { sessionType } from "@/types/sessionType";

import { useSession, signIn, signOut } from "next-auth/react";
import { useStore } from '@/store';
import { useTheme } from '@/context/ThemeContext';

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
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const fetchResults = async () => {
            await getResults();
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
            className="fixed top-0 left-0 flex gap-5 w-full px-5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 shadow-sm"
            style={{
                height: '4.5rem',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
            }}
        >
            <Link
                className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent hover:scale-105 transition-transform flex items-center gap-2"
                href="/"
            >
                <span className="text-3xl">⚡</span>
                Type Daily
            </Link>
            <div
                className="flex gap-3 items-center max-md:hidden"
            >
                <Link
                    href="/leaderboard"
                    className="px-4 py-2 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all flex items-center gap-2 group"
                >
                    <span className="group-hover:animate-bounce">🏆</span>
                    Leaderboard
                </Link>

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    aria-label="Toggle dark mode"
                >
                    {theme === 'dark' ? (
                        <span className="text-2xl">☀️</span>
                    ) : (
                        <span className="text-2xl">🌙</span>
                    )}
                </button>
            </div>
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
                                className="bg-white dark:bg-gray-800 rounded-md shadow-md w-full py-2 px-3 flex flex-col gap-2"
                            >
                                <Link
                                    href="/profile"
                                    className="w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded-md"
                                >
                                    Profile
                                </Link>
                                <Link
                                    href="/text"
                                    className="w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded-md"
                                >
                                    Texts
                                </Link>
                                <button
                                    onClick={() =>  signOut({ callbackUrl: '/auth/login' })}

                                    className="text-red-500 dark:text-red-400 w-full text-left hover:bg-red-100 dark:hover:bg-red-900/30 px-2 py-1 rounded-md"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Link
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg hover:shadow-xl flex items-center gap-2"
                        href="/auth/login"
                    >
                        <span>🚀</span>
                        Login with Google
                    </Link>
                )}
            </div>
        </div>
    )
}

export default Header