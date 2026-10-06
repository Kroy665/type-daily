import type { GetServerSideProps } from 'next';
import { absoluteUrl } from '@/lib/site';

// Share images under /api/og must stay crawlable: X and other link-preview
// bots honour robots.txt and would otherwise show no image.
function buildRobots(): string {
    return [
        'User-agent: *',
        'Allow: /',
        'Allow: /api/og',
        'Disallow: /api/',
        'Disallow: /profile',
        'Disallow: /text',
        'Disallow: /auth/',
        '',
        `Sitemap: ${absoluteUrl('/sitemap.xml')}`,
        '',
    ].join('\n');
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
    res.end(buildRobots());
    return { props: {} };
};

export default function Robots() {
    return null;
}
