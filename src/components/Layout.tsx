import Link from 'next/link';
import React from 'react';
import Header from '@/components/Header';
import Logo from '@/components/Logo';
import { DURATIONS, DURATION_SLUGS } from '@/lib/constants';
import { REPO_URL } from '@/lib/site';

const FOOTER_LINKS = [
    {
        heading: 'Typing tests',
        links: [
            ...DURATIONS.map((d) => ({ href: `/typing-test/${DURATION_SLUGS[d]}`, label: `${d / 60}-minute typing test` })),
            { href: '/leaderboard', label: 'Leaderboard' },
        ],
    },
    {
        heading: 'TypeDaily',
        links: [
            { href: '/about', label: 'About & scoring' },
            { href: '/privacy', label: 'Privacy' },
            { href: '/terms', label: 'Terms' },
            { href: REPO_URL, label: 'Source on GitHub' },
        ],
    },
];

function Footer() {
    return (
        <footer className="border-t border-border/70">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-[2fr_1fr_1fr] sm:px-6">
                <div>
                    <Logo />
                    <p className="mt-3 max-w-xs text-sm text-muted">
                        A free typing test for practising a little every day. Track your speed, keep your streak, climb the board.
                    </p>
                </div>
                {FOOTER_LINKS.map((group) => (
                    <nav key={group.heading} aria-label={group.heading}>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-subtle">{group.heading}</h2>
                        <ul className="mt-3 space-y-2">
                            {group.links.map((link) => (
                                <li key={link.href}>
                                    {link.href.startsWith('http') ? (
                                        <a href={link.href} className="text-sm text-muted hover:text-fg" rel="noopener">
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link href={link.href} className="text-sm text-muted hover:text-fg">
                                            {link.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>
                ))}
            </div>
            <p className="pb-8 text-center text-xs text-subtle">© {new Date().getFullYear()} TypeDaily</p>
        </footer>
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}

// Page heading used by the inner pages.
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
    return (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{title}</h1>
                {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
            </div>
            {actions}
        </div>
    );
}
