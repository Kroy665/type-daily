import Link from 'next/link';
import React from 'react';
import { MAX_PLAUSIBLE_WPM } from '@/lib/constants';

export interface FaqItem {
    question: string;
    answer: string;
}

// Plain-text answers so the same copy can feed the FAQ structured data.
export const FAQ: FaqItem[] = [
    {
        question: 'What is a good typing speed?',
        answer:
            'Around 40 words per minute is often quoted as an average for adults. 60 WPM is comfortably above average, 80 WPM is fast, and 100 WPM or more is the territory of competitive typists. Accuracy matters as much as speed: aim for 95% or better before pushing for more WPM.',
    },
    {
        question: 'How is WPM calculated?',
        answer:
            'TypeDaily uses the standard definition: one "word" is five characters. Your WPM counts the characters of every word you typed correctly, plus the spaces after them, divided by five and by the minutes elapsed. Raw WPM counts every character you typed, including mistakes.',
    },
    {
        question: 'How is accuracy calculated?',
        answer:
            'Accuracy is the share of characters you typed that matched the text. Characters you skipped by pressing space early count as misses, so rushing past a word lowers your accuracy.',
    },
    {
        question: 'Do I need an account?',
        answer:
            'No. Anyone can take the typing test. Signing in with Google saves your results, tracks your daily streak, unlocks achievements and puts you on the leaderboard.',
    },
    {
        question: 'Which test length should I choose?',
        answer:
            'The 1-minute test is a quick sprint and good for daily warm-ups. The 5-minute test gives a more reliable measure of your real speed. The 15-minute test builds endurance and shows how well you hold your pace when you tire.',
    },
    {
        question: 'How do daily streaks work?',
        answer:
            'Finish at least one saved test on a calendar day to keep your streak going. Days are counted in your own timezone, so a late-night test and an early-morning test the next day count as two days in a row.',
    },
    {
        question: 'Why wasn’t my result saved?',
        answer: `Results are scored on the server from what you actually typed and how long it took. A result isn't saved if no word was typed correctly, if it arrives after the timer should have ended, or if it's faster than ${MAX_PLAUSIBLE_WPM} WPM, which is beyond human typing speeds on these texts.`,
    },
];

export function faqJsonLd(items: FaqItem[] = FAQ) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
    };
}

const TIPS = [
    ['Keep your eyes on the text', 'Look ahead at the next word, not down at your hands or the letters you just typed.'],
    ['Start from the home row', 'Rest your fingers on ASDF and JKL; — the small bumps on F and J let you find them without looking.'],
    ['Accuracy first, speed second', 'Fixing mistakes costs more time than typing slightly slower. Speed follows once your accuracy is steady.'],
    ['Practise a little every day', 'Ten minutes daily beats an hour once a week. That’s what the streak is for.'],
];

export default function TypingGuide({
    heading,
    subheading,
    intro,
}: {
    heading: string;
    subheading?: string;
    intro?: React.ReactNode;
}) {
    return (
        <div className="border-t border-border/70 bg-surface/40">
            <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
                <header className="mb-8 max-w-3xl">
                    <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{heading}</h1>
                    {subheading && <p className="mt-2 text-base text-muted">{subheading}</p>}
                </header>
                {intro && <div className="prose-page mb-12 max-w-3xl">{intro}</div>}

                <section aria-labelledby="tips-heading">
                    <h2 id="tips-heading" className="text-xl font-semibold tracking-tight text-fg">
                        How to type faster
                    </h2>
                    <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                        {TIPS.map(([title, body], i) => (
                            <li key={title} className="card p-5">
                                <p className="font-mono text-xs text-accent-text">0{i + 1}</p>
                                <h3 className="mt-2 font-medium text-fg">{title}</h3>
                                <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                <section aria-labelledby="faq-heading" className="mt-16">
                    <h2 id="faq-heading" className="text-xl font-semibold tracking-tight text-fg">
                        Frequently asked questions
                    </h2>
                    <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
                        {FAQ.map((item) => (
                            <details key={item.question} className="group px-5 py-4">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-fg [&::-webkit-details-marker]:hidden">
                                    {item.question}
                                    <span className="text-muted transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                                </summary>
                                <p className="mt-3 text-sm leading-6 text-muted">{item.answer}</p>
                            </details>
                        ))}
                    </div>
                    <p className="mt-6 text-sm text-muted">
                        More on how scoring and anti-cheat work on the{' '}
                        <Link href="/about" className="font-medium text-accent-text underline-offset-4 hover:underline">
                            about page
                        </Link>
                        .
                    </p>
                </section>
            </div>
        </div>
    );
}
