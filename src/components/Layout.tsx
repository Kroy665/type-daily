import Head from 'next/head';
import React from 'react';
import Header from '@/components/Header';

export default function Layout({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <>
            {title && (
                <Head>
                    <title>{`${title} · TypeDaily`}</title>
                </Head>
            )}
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <footer className="border-t border-border/70 py-6 text-center text-xs text-subtle">
                    TypeDaily · practise a little every day
                </footer>
            </div>
        </>
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
