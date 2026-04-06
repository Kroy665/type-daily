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
            className="fixed top-0 left-0 flex gap-4 w-full px-6 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800"
            style={{
                height: '3.5rem',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
            }}
        >
            <Link
                className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                href="/"
            >
                TypeDaily
            </Link>
            <div
                className="flex gap-4 items-center max-md:hidden"
            >
                <Link
                    href="/leaderboard"
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    Leaderboard
                </Link>

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    {theme === 'dark' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
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
                        className="bg-blue-600 text-white px-4 py-1.5 text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                        href="/auth/login"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </div>
    )
}

export default Header