import type { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Layout, { PageHeader } from '@/components/Layout';
import Avatar from '@/components/Avatar';
import { FlameIcon } from '@/components/icons';
import { api, errorMessage } from '@/lib/client';
import type { LeaderboardMetric } from '@/lib/constants';
import { getPageSession } from '@/lib/server/auth';
import type { LeaderboardUser } from '@/types/api';

const METRICS: { value: LeaderboardMetric; label: string; format: (u: LeaderboardUser) => string }[] = [
    { value: 'bestWpm', label: 'Speed', format: (u) => `${u.bestWpm} wpm` },
    { value: 'bestAccuracy', label: 'Accuracy', format: (u) => `${u.bestAccuracy}%` },
    { value: 'currentStreak', label: 'Streak', format: (u) => `${u.currentStreak} ${u.currentStreak === 1 ? 'day' : 'days'}` },
    { value: 'totalTests', label: 'Tests', format: (u) => `${u.totalTests}` },
];

const MEDALS = ['🥇', '🥈', '🥉'];

function RankCell({ rank }: { rank: number | null }) {
    if (rank !== null && rank <= 3) {
        return <span className="text-lg" aria-label={`Rank ${rank}`}>{MEDALS[rank - 1]}</span>;
    }
    return <span className="font-mono text-sm text-muted">{rank ?? '—'}</span>;
}

export default function Leaderboard() {
    const { data: session } = useSession();
    const [metric, setMetric] = useState<LeaderboardMetric>('bestWpm');
    const [rows, setRows] = useState<LeaderboardUser[] | null>(null);
    const [me, setMe] = useState<LeaderboardUser | null>(null);
    const [error, setError] = useState<string | null>(null);
    const signedIn = Boolean(session?.user);
    const current = METRICS.find((m) => m.value === metric)!;

    useEffect(() => {
        let cancelled = false;
        setRows(null);
        setError(null);
        api.leaderboard(metric)
            .then((data) => !cancelled && setRows(data))
            .catch((err) => !cancelled && setError(errorMessage(err, 'Could not load the leaderboard.')));
        if (signedIn) {
            api.userRank(metric)
                .then((data) => !cancelled && setMe(data))
                .catch(() => !cancelled && setMe(null));
        }
        return () => {
            cancelled = true;
        };
    }, [metric, signedIn]);

    return (
        <Layout title="Leaderboard">
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
                <PageHeader
                    title="Leaderboard"
                    description="Top typists by personal best. Ties go to whoever got there first."
                    actions={
                        <div role="tablist" aria-label="Rank by" className="flex gap-0.5 rounded-lg bg-surface-2 p-0.5">
                            {METRICS.map((m) => (
                                <button
                                    key={m.value}
                                    type="button"
                                    role="tab"
                                    aria-selected={metric === m.value}
                                    onClick={() => setMetric(m.value)}
                                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                        metric === m.value ? 'bg-surface text-fg shadow-sm' : 'text-muted hover:text-fg'
                                    }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    }
                />

                {me && (
                    <div className="card mb-6 flex flex-wrap items-center gap-x-8 gap-y-4 border-accent/40 bg-accent/5 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <Avatar name={me.name} image={me.image} size={40} />
                            <div>
                                <p className="text-xs text-muted">Your rank</p>
                                <p className="font-mono text-2xl font-semibold text-accent-text">
                                    {me.rank ? `#${me.rank}` : '—'}
                                </p>
                            </div>
                        </div>
                        {me.rank ? (
                            <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                                {METRICS.map((m) => (
                                    <div key={m.value}>
                                        <dt className="text-xs text-muted">{m.label}</dt>
                                        <dd className="font-mono text-fg">{m.format(me)}</dd>
                                    </div>
                                ))}
                            </dl>
                        ) : (
                            <p className="text-sm text-muted">
                                <Link href="/" className="font-medium text-accent-text hover:underline">
                                    Finish a test
                                </Link>{' '}
                                to get on the board.
                            </p>
                        )}
                    </div>
                )}

                <div className="card overflow-hidden">
                    {error ? (
                        <p className="px-6 py-12 text-center text-sm text-danger">{error}</p>
                    ) : !rows ? (
                        <div className="divide-y divide-border">
                            {Array.from({ length: 6 }, (_, i) => (
                                <div key={i} className="flex items-center gap-4 px-5 py-4">
                                    <div className="h-8 w-8 animate-pulse rounded-full bg-surface-2" />
                                    <div className="h-4 w-40 animate-pulse rounded bg-surface-2" />
                                </div>
                            ))}
                        </div>
                    ) : rows.length === 0 ? (
                        <p className="px-6 py-12 text-center text-sm text-muted">
                            No one on the board yet.{' '}
                            <Link href="/" className="font-medium text-accent-text hover:underline">
                                Be the first.
                            </Link>
                        </p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-subtle">
                                <tr>
                                    <th scope="col" className="w-16 px-5 py-3 font-medium">#</th>
                                    <th scope="col" className="px-2 py-3 font-medium">Typist</th>
                                    <th scope="col" className="px-5 py-3 text-right font-medium">{current.label}</th>
                                    <th scope="col" className="hidden px-5 py-3 text-right font-medium sm:table-cell">
                                        {metric === 'bestWpm' ? 'Accuracy' : 'Speed'}
                                    </th>
                                    <th scope="col" className="hidden px-5 py-3 text-right font-medium md:table-cell">Tests</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {rows.map((user) => {
                                    const isMe = user.id === session?.user?.id;
                                    return (
                                        <tr key={user.id} className={isMe ? 'bg-accent/5' : 'hover:bg-surface-2/60'}>
                                            <td className="px-5 py-3">
                                                <RankCell rank={user.rank} />
                                            </td>
                                            <td className="px-2 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={user.name} image={user.image} size={32} />
                                                    <span className="truncate font-medium text-fg">{user.name ?? 'Anonymous'}</span>
                                                    {isMe && (
                                                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-text">
                                                            you
                                                        </span>
                                                    )}
                                                    {user.currentStreak >= 3 && (
                                                        <span className="flex items-center gap-0.5 text-xs text-warning" title={`${user.currentStreak}-day streak`}>
                                                            <FlameIcon width={14} height={14} /> {user.currentStreak}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right font-mono font-semibold text-fg">{current.format(user)}</td>
                                            <td className="hidden px-5 py-3 text-right font-mono text-muted sm:table-cell">
                                                {metric === 'bestWpm' ? `${user.bestAccuracy}%` : `${user.bestWpm} wpm`}
                                            </td>
                                            <td className="hidden px-5 py-3 text-right font-mono text-muted md:table-cell">{user.totalTests}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    return { props: { session: await getPageSession(context) } };
}
