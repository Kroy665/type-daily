import Head from 'next/head';
import { useRouter } from 'next/router';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, absoluteUrl } from '@/lib/site';

interface SeoProps {
    /** Page title without the site name; omit for the home page. */
    title?: string;
    description?: string;
    /** Path of the canonical URL; defaults to the current path without query. */
    path?: string;
    /** Absolute or root-relative URL of the share image. */
    image?: string;
    imageAlt?: string;
    noindex?: boolean;
    type?: 'website' | 'article' | 'profile';
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export default function Seo({
    title,
    description = SITE_DESCRIPTION,
    path,
    image = '/api/og',
    imageAlt = `${SITE_NAME} — ${SITE_TAGLINE}`,
    noindex = false,
    type = 'website',
    jsonLd,
}: SeoProps) {
    const { asPath } = useRouter();
    const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
    const url = absoluteUrl(path ?? asPath.split(/[?#]/)[0]);
    const imageUrl = image.startsWith('http') ? image : absoluteUrl(image);

    return (
        <Head>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />
            {noindex && <meta name="robots" content="noindex, follow" />}

            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={imageAlt} />
            <meta property="og:locale" content="en_US" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
            <meta name="twitter:image:alt" content={imageAlt} />

            {jsonLd && (
                <script
                    type="application/ld+json"
                    // JSON-LD can't contain user HTML here; escape `<` anyway so it can't close the tag.
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
                />
            )}
        </Head>
    );
}
