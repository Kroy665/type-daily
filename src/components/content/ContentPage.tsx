import React from 'react';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';

export default function ContentPage({
    title,
    description,
    path,
    updated,
    children,
}: {
    title: string;
    description: string;
    path: string;
    updated?: string;
    children: React.ReactNode;
}) {
    return (
        <Layout>
            <Seo title={title} description={description} path={path} />
            <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
                <header className="mb-10 border-b border-border pb-8">
                    <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{title}</h1>
                    <p className="mt-3 text-base text-muted">{description}</p>
                    {updated && <p className="mt-4 text-xs text-subtle">Last updated {updated}</p>}
                </header>
                <div className="prose-page">{children}</div>
            </article>
        </Layout>
    );
}
