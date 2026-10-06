import type { GetServerSideProps } from 'next';
import { DURATIONS, DURATION_SLUGS } from '@/lib/constants';
import { absoluteUrl } from '@/lib/site';

// Public, indexable pages. Result cards, profiles, auth and admin pages are
// deliberately left out (they're noindex).
const PAGES: { path: string; priority: number; changefreq: string }[] = [
    { path: '/', priority: 1.0, changefreq: 'weekly' },
    ...DURATIONS.map((d) => ({ path: `/typing-test/${DURATION_SLUGS[d]}`, priority: 0.9, changefreq: 'monthly' })),
    { path: '/leaderboard', priority: 0.7, changefreq: 'daily' },
    { path: '/about', priority: 0.5, changefreq: 'monthly' },
    { path: '/privacy', priority: 0.2, changefreq: 'yearly' },
    { path: '/terms', priority: 0.2, changefreq: 'yearly' },
];

function buildSitemap(): string {
    const urls = PAGES.map(
        ({ path, priority, changefreq }) =>
            `  <url>\n    <loc>${absoluteUrl(path)}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`,
    ).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
    res.end(buildSitemap());
    return { props: {} };
};

export default function Sitemap() {
    return null;
}
