import React from 'react';
import Layout from '@/components/Layout';
import TypingTest from '@/components/typing/TypingTest';
import TypingGuide from '@/components/content/TypingGuide';
import type { DurationValue } from '@/lib/constants';

// Shared shell for the home page and the per-duration landing pages: the test
// first, then guide content below the fold. The page's H1 lives at the top of
// the guide so it stays visible to readers and search engines without taking
// space above the test.
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
            <TypingTest key={duration ?? 'default'} duration={duration} />
            <TypingGuide heading={heading} subheading={subheading} intro={intro} />
        </Layout>
    );
}
