import Seo from '@/components/Seo';
import TestPage from '@/components/content/TestPage';
import { faqJsonLd } from '@/components/content/TypingGuide';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';

const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    image: absoluteUrl('/api/og'),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
};

export default function Home() {
    return (
        <>
            <Seo path="/" jsonLd={[websiteJsonLd, webAppJsonLd, faqJsonLd()]} />
            <TestPage
                heading="Free online typing test"
                subheading="Measure your WPM and accuracy — no sign-up needed"
                intro={
                    <>
                        <h2>A typing test you can take every day</h2>
                        <p>
                            TypeDaily is a free typing speed test. Pick a difficulty and a length — 1, 5 or 15 minutes — and start typing.
                            The timer starts on your first keystroke, and you get your words per minute (WPM), accuracy and errors the
                            moment you finish.
                        </p>
                        <p>
                            Sign in to save every result, build a daily practice streak, unlock achievements and see where you rank on the
                            global leaderboard. Each saved result gets its own shareable card, so you can challenge friends to beat your score.
                        </p>
                    </>
                }
            />
        </>
    );
}
