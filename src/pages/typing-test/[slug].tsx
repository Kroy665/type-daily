import type { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Seo from '@/components/Seo';
import TestPage from '@/components/content/TestPage';
import { DURATIONS, DURATION_SLUGS, type DurationValue } from '@/lib/constants';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';

interface LandingCopy {
    title: string;
    description: string;
    heading: string;
    subheading: string;
    body: string[];
}

const COPY: Record<DurationValue, LandingCopy> = {
    60: {
        title: '1-minute typing test',
        description:
            'Take a free 1-minute typing test and get your WPM and accuracy instantly. A quick daily warm-up with easy, medium and hard texts — no sign-up needed.',
        heading: '1-minute typing test',
        subheading: 'A quick sprint — get your WPM in sixty seconds',
        body: [
            'The 1-minute typing test is the fastest way to check your speed. It is short enough to take every day as a warm-up, and long enough to give you a meaningful words-per-minute score.',
            'Because a minute is short, one slow word can move your score a lot. Take a few tests and look at your average rather than a single run — your profile chart does this for you once you sign in.',
        ],
    },
    300: {
        title: '5-minute typing test',
        description:
            'Take a free 5-minute typing test for a reliable measure of your real typing speed and accuracy. Choose easy, medium or hard text and track your progress.',
        heading: '5-minute typing test',
        subheading: 'The standard length for a reliable WPM score',
        body: [
            'Five minutes is long enough to smooth out lucky streaks and slow starts, so the 5-minute test gives a more dependable measure of your everyday typing speed. It is a common length for typing assessments in job applications.',
            'Keep a steady rhythm rather than bursting ahead. Your accuracy over five minutes says as much about your typing as your top speed.',
        ],
    },
    900: {
        title: '15-minute typing test',
        description:
            'Take a free 15-minute typing test to build typing endurance. See whether you can hold your WPM and accuracy over a long passage.',
        heading: '15-minute typing test',
        subheading: 'An endurance run — can you hold your pace?',
        body: [
            'The 15-minute typing test is about stamina. Most people slow down and make more mistakes as they tire; long tests show how consistent you really are and train you to stay relaxed.',
            'Sit comfortably, keep your wrists loose and breathe. If your accuracy drops in the second half, that is the thing to practise.',
        ],
    },
};

const DURATION_BY_SLUG = Object.fromEntries(DURATIONS.map((d) => [DURATION_SLUGS[d], d])) as Record<string, DurationValue>;

export default function DurationTestPage({ duration }: { duration: DurationValue }) {
    const copy = COPY[duration];
    const path = `/typing-test/${DURATION_SLUGS[duration]}`;
    const others = DURATIONS.filter((d) => d !== duration);

    return (
        <>
            <Seo
                title={copy.title}
                description={copy.description}
                path={path}
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebApplication',
                        name: `${copy.title} · ${SITE_NAME}`,
                        url: absoluteUrl(path),
                        description: copy.description,
                        applicationCategory: 'EducationalApplication',
                        operatingSystem: 'Any',
                        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
                            { '@type': 'ListItem', position: 2, name: copy.title, item: absoluteUrl(path) },
                        ],
                    },
                ]}
            />
            <TestPage
                heading={copy.heading}
                subheading={copy.subheading}
                duration={duration}
                intro={
                    <>
                        <h2>About the {copy.title}</h2>
                        {copy.body.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                        <p>
                            Try a different length:{' '}
                            {others.map((d, i) => (
                                <span key={d}>
                                    {i > 0 && ' or '}
                                    <Link href={`/typing-test/${DURATION_SLUGS[d]}`}>{COPY[d].title}</Link>
                                </span>
                            ))}
                            .
                        </p>
                    </>
                }
            />
        </>
    );
}

export const getStaticPaths: GetStaticPaths = async () => ({
    paths: DURATIONS.map((d) => ({ params: { slug: DURATION_SLUGS[d] } })),
    fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const duration = DURATION_BY_SLUG[String(params?.slug)];
    return duration ? { props: { duration } } : { notFound: true };
};
