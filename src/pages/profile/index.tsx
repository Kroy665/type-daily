import type { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import React, { useEffect, useMemo, useState } from 'react';
import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Layout from '@/components/Layout';
import Avatar from '@/components/Avatar';
import { useTheme } from '@/context/ThemeContext';
import { api, errorMessage } from '@/lib/client';
import { DURATION_LABELS, type DurationValue } from '@/lib/constants';
import { getPageSession } from '@/lib/server/auth';
import type { AchievementItem, LeaderboardUser, ResultItem } from '@/types/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const CHART_POINTS = 30;

function formatDuration(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
    return (
        <div className="card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">{label}</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-fg">{value}</p>
            {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
        </div>
    );
}

// Reads a color token from CSS so the chart follows the active theme.
function token(name: string, alpha = 1) {
    if (typeof window === 'undefined') return '#888';
    const value = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
    return `rgb(${value} / ${alpha})`;
}

function ProgressChart({ results }: { results: ResultItem[] }) {
    const { theme } = useTheme();

    // Recomputed on theme change so colors update.
    const { data, options, count } = useMemo(() => {
        const recent = results.slice(-CHART_POINTS);
        const muted = token('muted');
        return {
            count: recent.length,
            data: {
                labels: recent.map((r) =>
                    new Date(r.created).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                ),
                datasets: [
                    {
                        label: 'WPM',
                        data: recent.map((r) => r.wpm),
                        borderColor: token('accent'),
                        backgroundColor: token('accent', 0.12),
                        fill: true,
                        tension: 0.35,
                        pointRadius: 2.5,
                        pointHoverRadius: 5,
                        yAxisID: 'wpm',
                    },
                    {
                        label: 'Accuracy',
                        data: recent.map((r) => r.accuracy),
                        borderColor: token('success'),
                        backgroundColor: token('success'),
                        borderDash: [4, 4],
                        tension: 0.35,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        yAxisID: 'accuracy',
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index' as const, intersect: false },
                plugins: { tooltip: { padding: 10, cornerRadius: 8 } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: muted, maxRotation: 0, autoSkipPadding: 16 } },
                    wpm: {
                        position: 'left' as const,
                        beginAtZero: true,
                        grid: { color: token('border', 0.6) },
                        ticks: { color: muted },
                    },
                    accuracy: {
                        position: 'right' as const,
                        min: 0,
                        max: 100,
                        grid: { display: false },
                        ticks: { color: muted, callback: (v: string | number) => `${v}%` },
                    },
                },
            },
        };
        // `theme` isn't read directly, but the CSS tokens change with it.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [results, theme]);

    return (
        <div>
            <div className="mb-3 flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> WPM</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> Accuracy</span>
                <span className="ml-auto">last {count} tests</span>
            </div>
            <div className="h-64">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}

export default function Profile() {
    const { data: session } = useSession();
    const [results, setResults] = useState<ResultItem[] | null>(null);
    const [achievements, setAchievements] = useState<AchievementItem[]>([]);
    const [me, setMe] = useState<LeaderboardUser | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([api.results(), api.achievements(), api.userRank('bestWpm')])
            .then(([resultsData, achievementsData, rankData]) => {
                setResults(resultsData);
                setAchievements(achievementsData);
                setMe(rankData);
            })
            .catch((err) => setError(errorMessage(err, 'Could not load your profile.')));
    }, []);

    const summary = useMemo(() => {
        if (!results || results.length === 0) return null;
        const sum = (pick: (r: ResultItem) => number) => results.reduce((acc, r) => acc + pick(r), 0);
        return {
            avgWpm: Math.round(sum((r) => r.wpm) / results.length),
            avgAccuracy: Math.round(sum((r) => r.accuracy) / results.length),
            timeTyped: sum((r) => r.selectedTime),
        };
    }, [results]);

    const user = session?.user;
    const unlockedCount = achievements.filter((a) => a.unlocked).length;
    const days = (n: number | undefined) => (n === 1 ? 'day' : 'days');

    return (
        <Layout title="Profile">
            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
                <div className="mb-8 flex items-center gap-4">
                    <Avatar name={user?.name} image={user?.image} size={56} />
                    <div className="min-w-0">
                        <h1 className="truncate text-2xl font-semibold tracking-tight text-fg">{user?.name ?? 'Your profile'}</h1>
                        <p className="truncate text-sm text-muted">{user?.email}</p>
                    </div>
                    {me?.rank && (
                        <Link href="/leaderboard" className="ml-auto rounded-lg bg-accent/10 px-3 py-2 text-right hover:bg-accent/15">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Global rank</p>
                            <p className="font-mono text-lg font-semibold text-accent-text">#{me.rank}</p>
                        </Link>
                    )}
                </div>

                {error ? (
                    <div className="card px-6 py-12 text-center text-sm text-danger">{error}</div>
                ) : !results ? (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {Array.from({ length: 8 }, (_, i) => (
                            <div key={i} className="card h-24 animate-pulse" />
                        ))}
                    </div>
                ) : results.length === 0 ? (
                    <div className="card flex flex-col items-center px-6 py-16 text-center">
                        <p className="text-lg font-medium text-fg">No tests yet</p>
                        <p className="mt-1 text-sm text-muted">Your stats, progress chart and achievements will show up here.</p>
                        <Link href="/" className="btn-primary mt-6">Take your first test</Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <StatCard label="Best speed" value={me?.bestWpm ?? 0} hint="wpm" />
                            <StatCard label="Avg speed" value={summary?.avgWpm ?? 0} hint="wpm" />
                            <StatCard label="Best accuracy" value={`${me?.bestAccuracy ?? 0}%`} />
                            <StatCard label="Avg accuracy" value={`${summary?.avgAccuracy ?? 0}%`} />
                            <StatCard label="Current streak" value={me?.currentStreak ?? 0} hint={days(me?.currentStreak)} />
                            <StatCard label="Longest streak" value={me?.longestStreak ?? 0} hint={days(me?.longestStreak)} />
                            <StatCard label="Tests" value={results.length} />
                            <StatCard label="Time typed" value={formatDuration(summary?.timeTyped ?? 0)} />
                        </div>

                        <section className="card mt-6 p-5">
                            <h2 className="mb-4 text-base font-semibold text-fg">Progress</h2>
                            <ProgressChart results={results} />
                        </section>

                        <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
                            <section className="card p-5">
                                <div className="mb-4 flex items-baseline justify-between">
                                    <h2 className="text-base font-semibold text-fg">Achievements</h2>
                                    <span className="text-xs text-muted">{unlockedCount} of {achievements.length}</span>
                                </div>
                                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {achievements.map((a) => (
                                        <li
                                            key={a.id}
                                            className={`flex items-center gap-3 rounded-lg border p-3 ${
                                                a.unlocked ? 'border-accent/30 bg-accent/5' : 'border-border opacity-50 grayscale'
                                            }`}
                                        >
                                            <span className="text-2xl" aria-hidden="true">{a.icon}</span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-fg">{a.name}</p>
                                                <p className="truncate text-xs text-muted">
                                                    {a.unlocked && a.unlockedAt
                                                        ? `Unlocked ${new Date(a.unlockedAt).toLocaleDateString()}`
                                                        : a.description}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="card p-5">
                                <h2 className="mb-4 text-base font-semibold text-fg">Recent tests</h2>
                                <ul className="divide-y divide-border">
                                    {results.slice(-8).reverse().map((r) => (
                                        <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                                            <div>
                                                <p className="font-mono font-semibold text-fg">{r.wpm} wpm</p>
                                                <p className="text-xs text-muted">
                                                    {r.difficulty.toLowerCase()} · {DURATION_LABELS[r.selectedTime as DurationValue] ?? `${r.selectedTime}s`}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono text-fg">{r.accuracy}%</p>
                                                <p className="text-xs text-muted">{new Date(r.created).toLocaleDateString()}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getPageSession(context);
    if (!session) {
        return { redirect: { destination: '/auth/login?callbackUrl=/profile', permanent: false } };
    }
    return { props: { session } };
}
