import Link from 'next/link';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';

export default function NotFound() {
    return (
        <Layout>
            <Seo title="Page not found" noindex />
            <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
                <p className="font-mono text-6xl font-bold text-accent-text">404</p>
                <h1 className="mt-4 text-xl font-semibold text-fg">This page doesn&apos;t exist</h1>
                <p className="mt-2 text-sm text-muted">The link may be broken, or the page may have moved.</p>
                <Link href="/" className="btn-primary mt-8">
                    Start typing
                </Link>
            </div>
        </Layout>
    );
}
