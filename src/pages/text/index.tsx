import type { GetServerSidePropsContext } from 'next';
import React, { useEffect, useMemo, useState } from 'react';
import Layout, { PageHeader } from '@/components/Layout';
import { TrashIcon } from '@/components/icons';
import { api, errorMessage } from '@/lib/client';
import { DIFFICULTIES, DURATIONS, DURATION_LABELS, type DifficultyValue, type DurationValue } from '@/lib/constants';
import { splitWords } from '@/lib/scoring';
import { getPageSession } from '@/lib/server/auth';
import type { TextItem } from '@/types/api';

const DIFFICULTY_STYLES: Record<DifficultyValue, string> = {
    EASY: 'bg-success/10 text-success',
    MEDIUM: 'bg-warning/10 text-warning',
    HARD: 'bg-danger/10 text-danger',
};

const label = (d: string) => d.charAt(0) + d.slice(1).toLowerCase();

export default function TextManagement() {
    const [texts, setTexts] = useState<TextItem[] | null>(null);
    const [draft, setDraft] = useState('');
    const [difficulty, setDifficulty] = useState<DifficultyValue>('EASY');
    const [duration, setDuration] = useState<DurationValue>(60);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<DifficultyValue | 'ALL'>('ALL');

    const refresh = () =>
        api.texts()
            .then(setTexts)
            .catch((err) => setError(errorMessage(err, 'Could not load texts.')));

    useEffect(() => {
        refresh();
    }, []);

    const wordCount = splitWords(draft).length;

    const onSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await api.createText({ text: draft.trim(), difficulty, time: duration });
            setDraft('');
            await refresh();
        } catch (err) {
            setError(errorMessage(err, 'Could not save the text.'));
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async (text: TextItem) => {
        if (!window.confirm(`Delete this ${label(text.difficulty).toLowerCase()} text? This can't be undone.`)) return;
        setError(null);
        try {
            await api.deleteText(text.id);
            setTexts((prev) => prev?.filter((t) => t.id !== text.id) ?? null);
        } catch (err) {
            setError(errorMessage(err, 'Could not delete the text.'));
        }
    };

    // How many texts each test configuration can draw from.
    const coverage = useMemo(() => {
        const counts = new Map<string, number>();
        texts?.forEach((t) => counts.set(`${t.difficulty}:${t.time}`, (counts.get(`${t.difficulty}:${t.time}`) ?? 0) + 1));
        return counts;
    }, [texts]);

    const visible = texts?.filter((t) => filter === 'ALL' || t.difficulty === filter) ?? [];

    return (
        <Layout title="Manage texts">
            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
                <PageHeader title="Texts" description="Passages that tests draw from, by difficulty and duration." />

                <section className="card mb-6 overflow-x-auto p-5">
                    <h2 className="mb-3 text-sm font-semibold text-fg">Coverage</h2>
                    <table className="w-full min-w-[20rem] text-sm">
                        <thead>
                            <tr className="text-left text-xs text-subtle">
                                <th className="pb-2 font-medium" />
                                {DURATIONS.map((d) => (
                                    <th key={d} className="pb-2 text-center font-medium">{DURATION_LABELS[d]}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DIFFICULTIES.map((diff) => (
                                <tr key={diff}>
                                    <td className="py-1 pr-4 text-muted">{label(diff)}</td>
                                    {DURATIONS.map((d) => {
                                        const n = coverage.get(`${diff}:${d}`) ?? 0;
                                        return (
                                            <td key={d} className="py-1 text-center">
                                                <span className={`inline-block min-w-8 rounded-md px-2 py-0.5 font-mono text-xs ${n === 0 ? 'bg-danger/10 text-danger' : 'bg-surface-2 text-fg'}`}>
                                                    {texts ? n : '·'}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <form onSubmit={onSave} className="card mb-6 p-5">
                    <h2 className="mb-3 text-sm font-semibold text-fg">Add a text</h2>
                    <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Paste or write a passage (at least 10 characters)…"
                        className="input h-36 resize-y font-mono leading-relaxed"
                        required
                        minLength={10}
                        maxLength={10000}
                    />
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as DifficultyValue)}
                            className="input w-auto"
                            aria-label="Difficulty"
                        >
                            {DIFFICULTIES.map((d) => (
                                <option key={d} value={d}>{label(d)}</option>
                            ))}
                        </select>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value) as DurationValue)}
                            className="input w-auto"
                            aria-label="Duration"
                        >
                            {DURATIONS.map((d) => (
                                <option key={d} value={d}>{DURATION_LABELS[d]}</option>
                            ))}
                        </select>
                        <span className="text-xs text-muted">
                            {wordCount} words · about {Math.round(wordCount / (duration / 60))} wpm to finish in time
                        </span>
                        <button type="submit" disabled={saving || draft.trim().length < 10} className="btn-primary ml-auto">
                            {saving ? 'Saving…' : 'Add text'}
                        </button>
                    </div>
                    {error && <p className="mt-3 text-sm text-danger" role="alert">{error}</p>}
                </form>

                <section className="card overflow-hidden">
                    <div className="flex items-center justify-between border-b border-border px-5 py-3">
                        <h2 className="text-sm font-semibold text-fg">All texts {texts && <span className="font-normal text-muted">({visible.length})</span>}</h2>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as DifficultyValue | 'ALL')}
                            className="input w-auto py-1 text-xs"
                            aria-label="Filter by difficulty"
                        >
                            <option value="ALL">All difficulties</option>
                            {DIFFICULTIES.map((d) => (
                                <option key={d} value={d}>{label(d)}</option>
                            ))}
                        </select>
                    </div>
                    {!texts ? (
                        <p className="px-5 py-10 text-center text-sm text-muted">Loading…</p>
                    ) : visible.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm text-muted">No texts yet.</p>
                    ) : (
                        <ul className="divide-y divide-border">
                            {visible.map((t) => (
                                <li key={t.id} className="flex items-start gap-4 px-5 py-3.5">
                                    <div className="min-w-0 flex-1">
                                        <p className="line-clamp-2 text-sm text-fg">{t.text}</p>
                                        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                                            <span className={`rounded px-1.5 py-0.5 font-medium ${DIFFICULTY_STYLES[t.difficulty]}`}>{label(t.difficulty)}</span>
                                            <span>{DURATION_LABELS[t.time as DurationValue] ?? `${t.time}s`}</span>
                                            <span>·</span>
                                            <span>{splitWords(t.text).length} words</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(t)}
                                        className="btn-ghost h-8 w-8 shrink-0 p-0 hover:bg-danger/10 hover:text-danger"
                                        aria-label="Delete text"
                                    >
                                        <TrashIcon width={16} height={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </Layout>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getPageSession(context);
    if (!session) {
        return { redirect: { destination: '/auth/login?callbackUrl=/text', permanent: false } };
    }
    if (!session.user?.isAdmin) {
        return { notFound: true };
    }
    return { props: { session } };
}
