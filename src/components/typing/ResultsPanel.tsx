import Link from 'next/link';
import React from 'react';
import type { FinalResult } from './useTypingTest';
import { ArrowRightIcon, RefreshIcon } from '@/components/icons';
import ShareButtons from '@/components/ShareButtons';
import { DURATION_LABELS, DURATION_SLUGS, type DurationValue } from '@/lib/constants';
import { absoluteUrl, SITE_NAME } from '@/lib/site';

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">{label}</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-fg">{value}</p>
            {sub && <p className="text-xs text-muted">{sub}</p>}
        </div>
    );
}

function SaveStatus({ result }: { result: FinalResult }) {
    const { save } = result;
    switch (save.kind) {
        case 'saving':
            return <p className="text-sm text-muted">Saving your result…</p>;
        case 'saved':
            return <p className="text-sm text-success">Saved to your profile.</p>;
        case 'not-saved':
            return <p className="text-sm text-danger">{save.message}</p>;
        case 'anonymous':
            return (
                <p className="text-sm text-muted">
                    <Link href="/auth/login" className="font-medium text-accent-text underline-offset-4 hover:underline">
                        Sign in
                    </Link>{' '}
                    to save results, track streaks and join the leaderboard.
                </p>
            );
    }
}

export default function ResultsPanel({
    result,
    duration,
    onNext,
    onRestart,
}: {
    result: FinalResult;
    duration: DurationValue;
    onNext: () => void;
    onRestart: () => void;
}) {
    const { score, elapsedMs, save } = result;
    const seconds = Math.round(elapsedMs / 1000);
    // Saved results get their own card page; otherwise share the matching test page.
    const shareUrl =
        save.kind === 'saved' ? absoluteUrl(`/r/${save.resultId}`) : absoluteUrl(`/typing-test/${DURATION_SLUGS[duration]}`);
    const shareText = `I just typed ${score.wpm} WPM at ${score.accuracy}% accuracy on the ${DURATION_LABELS[duration]} ${SITE_NAME} test. Can you beat it?`;
    const canShare = score.wpm > 0 && save.kind !== 'saving';

    return (
        <section className="animate-fade-in-up" aria-live="polite">
            <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-subtle">wpm</p>
                    <p className="font-mono text-7xl font-bold leading-none text-accent-text sm:text-8xl">{score.wpm}</p>
                </div>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:border-l sm:border-border sm:pl-8">
                    <Stat label="accuracy" value={`${score.accuracy}%`} />
                    <Stat label="raw" value={score.rawWpm} sub="wpm incl. errors" />
                    <Stat label="errors" value={score.wrongWords} sub={score.wrongWords === 1 ? 'word' : 'words'} />
                    <Stat label="time" value={`${seconds}s`} sub={`${score.correctChars}/${score.typedChars} chars`} />
                </div>
            </div>

            {result.save.kind === 'saved' && result.save.unlocked.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                    {result.save.unlocked.map((a) => (
                        <div key={a.type} className="flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 py-1.5 pl-2 pr-3.5 text-sm">
                            <span aria-hidden="true">{a.icon}</span>
                            <span className="font-medium text-fg">Unlocked: {a.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {canShare && (
                <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="text-sm font-medium text-fg">Share your result</span>
                    <ShareButtons url={shareUrl} text={shareText} />
                    {save.kind === 'saved' && (
                        <Link href={`/r/${save.resultId}`} className="text-sm text-accent-text underline-offset-4 hover:underline">
                            View card
                        </Link>
                    )}
                </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <SaveStatus result={result} />
                <div className="flex gap-2">
                    <button type="button" onClick={onRestart} className="btn-ghost">
                        <RefreshIcon width={16} height={16} /> Retry
                    </button>
                    <button type="button" onClick={onNext} className="btn-primary" autoFocus>
                        Next test <ArrowRightIcon width={16} height={16} />
                    </button>
                </div>
            </div>
        </section>
    );
}
