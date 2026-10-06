import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from '@/context/ThemeContext';
import Logo from '@/components/Logo';
import Avatar from '@/components/Avatar';
import { FileTextIcon, KeyboardIcon, LogOutIcon, MoonIcon, SunIcon, TrophyIcon, UserIcon } from '@/components/icons';

const NAV = [
    { href: '/', label: 'Test', icon: KeyboardIcon },
    { href: '/leaderboard', label: 'Leaderboard', icon: TrophyIcon },
];

function UserMenu() {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    // Close after navigating via a menu link.
    useEffect(() => {
        const close = () => setOpen(false);
        router.events.on('routeChangeStart', close);
        return () => router.events.off('routeChangeStart', close);
    }, [router.events]);

    const user = session?.user;
    if (!user) return null;

    const itemClass = 'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-fg hover:bg-surface-2';

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Account menu"
                className="rounded-full ring-offset-2 ring-offset-bg transition hover:ring-2 hover:ring-border"
            >
                <Avatar name={user.name} image={user.image} size={32} />
            </button>
            {open && (
                <div
                    role="menu"
                    className="card absolute right-0 top-11 z-50 w-56 animate-fade-in-up p-1.5 shadow-xl shadow-black/10"
                >
                    <div className="border-b border-border px-2.5 pb-2 pt-1.5">
                        <p className="truncate text-sm font-medium text-fg">{user.name}</p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                    <div className="pt-1.5">
                        <Link role="menuitem" href="/profile" className={itemClass}>
                            <UserIcon className="text-muted" /> Profile
                        </Link>
                        {user.isAdmin && (
                            <Link role="menuitem" href="/text" className={itemClass}>
                                <FileTextIcon className="text-muted" /> Manage texts
                            </Link>
                        )}
                        <button
                            role="menuitem"
                            type="button"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className={`${itemClass} text-danger`}
                        >
                            <LogOutIcon /> Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Header() {
    const { status } = useSession();
    const { theme, toggleTheme } = useTheme();
    const { pathname } = useRouter();

    return (
        <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/80 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:gap-6 sm:px-6">
                <Logo />
                <nav className="flex items-center gap-1" aria-label="Main">
                    {NAV.map(({ href, label, icon: NavIcon }) => {
                        const active = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                aria-current={active ? 'page' : undefined}
                                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                                    active ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg'
                                }`}
                            >
                                <NavIcon className="hidden sm:block" width={16} height={16} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="ml-auto flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="btn-ghost h-9 w-9 p-0"
                        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                    >
                        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </button>
                    {status === 'authenticated' ? (
                        <UserMenu />
                    ) : status === 'unauthenticated' ? (
                        <Link href="/auth/login" className="btn-primary py-1.5">
                            Sign in
                        </Link>
                    ) : (
                        <span className="h-8 w-8 animate-pulse rounded-full bg-surface-2" />
                    )}
                </div>
            </div>
        </header>
    );
}
