import React from 'react';
import Layout from '@/components/Layout';
import TypingTest from '@/components/typing/TypingTest';
import TypingGuide from '@/components/content/TypingGuide';
import type { DurationValue } from '@/lib/constants';

// Shared shell for the home page and the per-duration landing pages: a short
// visible heading, the test itself, then guide content below the fold.
export default function TestPage({
    heading,
    subheading,
    duration,
    intro,
}: {
    heading: string;
    subheading: string;
    duration?: DurationValue;
    intro?: React.ReactNode;
}) {
    return (
        <Layout>
            <div className="mx-auto max-w-5xl px-4 pt-8 text-center sm:px-6 sm:pt-10">
                <h1 className="text-sm font-medium text-fg">{heading}</h1>
                <p className="mt-1 text-xs text-muted">{subheading}</p>
            </div>
            <TypingTest key={duration ?? 'default'} duration={duration} />
            <TypingGuide intro={intro} />
        </Layout>
    );
}
