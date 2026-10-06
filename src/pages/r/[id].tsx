import type { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import Avatar from '@/components/Avatar';
import ShareButtons from '@/components/ShareButtons';
import { ArrowRightIcon } from '@/components/icons';
import { prisma } from '@/lib/db';
import { DURATION_LABELS, DURATION_SLUGS, type DurationValue } from '@/lib/constants';
import { absoluteUrl, SITE_NAME } from '@/lib/site';

interface SharedResult {
    id: string;
    userId: string;
    wpm: number;
    accuracy: number;
    wrongWords: number;
    difficulty: string;
    selectedTime: number;
    created: string;
    name: string;
    image: string | null;
    isPersonalBest: boolean;
}

function Stat({ label, value }: { label: string; value: string | number }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-subtle">{label}</dt>
            <dd className="mt-1 font-mono text-2xl font-semibold text-fg">{value}</dd>
        </div>
    );
}

export default function SharedResultPage({ result }: { result: SharedResult }) {
    const { data: session } = useSession();
    const isOwner = session?.user?.id === result.userId;
    const duration = DURATION_LABELS[result.selectedTime as DurationValue] ?? `${result.selectedTime}s`;
    const slug = DURATION_SLUGS[result.selectedTime as DurationValue] ?? DURATION_SLUGS[60];
    const difficulty = result.difficulty.charAt(0) + result.difficulty.slice(1).toLowerCase();
    const date = new Date(result.created).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const url = absoluteUrl(`/r/${result.id}`);
    const shareText = isOwner
        ? `I just typed ${result.wpm} WPM at ${result.accuracy}% accuracy on ${SITE_NAME}. Can you beat it?`
        : `${result.name} typed ${result.wpm} WPM on ${SITE_NAME}. Can you beat it?`;

    return (
        <Layout>
            <Seo
                title={`${result.name} typed ${result.wpm} WPM`}
                description={`${result.name} typed ${result.wpm} words per minute at ${result.accuracy}% accuracy on a ${duration} ${difficulty.toLowerCase()} typing test. Take the free test and see if you can beat it.`}
                image={`/api/og/result/${result.id}`}
                imageAlt={`${result.name}: ${result.wpm} WPM, ${result.accuracy}% accuracy`}
                type="article"
                // Individual results are for sharing, not search results.
                noindex
            />
            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
                <article className="card relative overflow-hidden p-6 sm:p-10">
                    <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />
                    <header className="relative flex flex-wrap items-center gap-3">
                        <Avatar name={result.name} image={result.image} size={44} />
                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-semibold text-fg">{result.name}</h1>
                            <p className="text-sm text-muted">
                                <time dateTime={result.created}>{date}</time>
                            </p>
                        </div>
                        {result.isPersonalBest && (
                            <span className="ml-auto rounded-full border border-accent/50 px-3 py-1 text-xs font-semibold text-accent-text">
                                Personal best
                            </span>
                        )}
                    </header>

                    <div className="relative mt-8 flex items-baseline gap-3">
                        <span className="font-mono text-8xl font-bold leading-none tracking-tight text-accent-text sm:text-9xl">{result.wpm}</span>
                        <span className="font-mono text-2xl text-muted">wpm</span>
                    </div>

                    <dl className="relative mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6 sm:grid-cols-4">
                        <Stat label="Accuracy" value={`${result.accuracy}%`} />
                        <Stat label="Errors" value={result.wrongWords} />
                        <Stat label="Test" value={duration} />
                        <Stat label="Level" value={difficulty} />
                    </dl>
                </article>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <ShareButtons url={url} text={shareText} />
                    <a href={`/api/og/result/${result.id}`} download={`typedaily-${result.wpm}wpm.png`} className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
                        Download image
                    </a>
                </div>

                <section className="mt-12 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight text-fg">
                        {isOwner ? 'Go again?' : `Think you can beat ${result.wpm} WPM?`}
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                        Take the same {duration} {difficulty.toLowerCase()} typing test. It&apos;s free, and no account is needed to play.
                    </p>
                    <Link href={`/typing-test/${slug}`} className="btn-primary mt-6 px-6 py-2.5">
                        Take the {duration} test <ArrowRightIcon width={16} height={16} />
                    </Link>
                </section>
            </div>
        </Layout>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const id = typeof context.params?.id === 'string' ? context.params.id : '';
    const result = await prisma.result.findUnique({
        where: { id },
        select: {
            id: true,
            userId: true,
            wpm: true,
            accuracy: true,
            wrongWords: true,
            difficulty: true,
            selectedTime: true,
            created: true,
            user: { select: { name: true, image: true, bestWpm: true } },
        },
    });

    if (!result) {
        return { notFound: true };
    }

    // Results don't change, so let the CDN cache the page.
    context.res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    const { user, created, ...rest } = result;
    const props: SharedResult = {
        ...rest,
        created: created.toISOString(),
        name: user.name ?? 'A typist',
        image: user.image,
        isPersonalBest: result.wpm >= user.bestWpm,
    };
    return { props: { result: props } };
}
