import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, ApiError, errorMessage } from '@/lib/client';
import { isComplete, scoreTest, splitWords, type Score } from '@/lib/scoring';
import type { DifficultyValue, DurationValue } from '@/lib/constants';
import type { UnlockedAchievement } from '@/types/api';

export type TestStatus = 'loading' | 'ready' | 'running' | 'finished' | 'error';

export interface TestConfig {
    difficulty: DifficultyValue;
    duration: DurationValue;
}

export type SaveState =
    | { kind: 'anonymous' }
    | { kind: 'saving' }
    | { kind: 'saved'; resultId: string; unlocked: UnlockedAchievement[] }
    | { kind: 'not-saved'; message: string };

export interface FinalResult {
    score: Score;
    elapsedMs: number;
    save: SaveState;
}

const MAX_EXTRA_CHARS = 50;

// Keeps typed input to what the test accepts: single spaces, no leading space,
// no more words than the text, and a bounded overflow past its end.
function sanitizeInput(raw: string, targetWords: string[], textLength: number): string {
    let value = raw.replace(/\s+/g, ' ').replace(/^ /, '');
    const words = value.split(' ');
    if (words.length > targetWords.length) {
        value = words.slice(0, targetWords.length).join(' ');
    }
    return value.slice(0, textLength + MAX_EXTRA_CHARS);
}

function localTimeZone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
        return 'UTC';
    }
}

export function useTypingTest(config: TestConfig) {
    const [status, setStatusState] = useState<TestStatus>('loading');
    const [text, setText] = useState('');
    const [typed, setTyped] = useState('');
    const [elapsedMs, setElapsedMs] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<FinalResult | null>(null);

    // Refs mirror the values that timer and async callbacks need, so they always
    // see the latest input rather than the value from when they were created.
    const statusRef = useRef<TestStatus>('loading');
    const typedRef = useRef('');
    const textRef = useRef('');
    const startRef = useRef(0);
    const sessionRef = useRef<{ sessionId: string | null; textId: string | null }>({ sessionId: null, textId: null });
    const loadSeq = useRef(0);
    const durationMs = config.duration * 1000;

    const setStatus = (next: TestStatus) => {
        statusRef.current = next;
        setStatusState(next);
    };

    const targetWords = useMemo(() => splitWords(text), [text]);

    const load = useCallback(
        async ({ sameText = false }: { sameText?: boolean } = {}) => {
            const seq = ++loadSeq.current;
            setStatus('loading');
            setError(null);
            setResult(null);
            setTyped('');
            typedRef.current = '';
            setElapsedMs(0);

            try {
                const data = await api.startTest({
                    difficulty: config.difficulty,
                    selectedTime: config.duration,
                    textId: sameText ? sessionRef.current.textId ?? undefined : undefined,
                });
                // A newer load started while this one was in flight.
                if (seq !== loadSeq.current) return;
                sessionRef.current = { sessionId: data.sessionId, textId: data.textId };
                textRef.current = data.text;
                setText(data.text);
                setStatus('ready');
            } catch (err) {
                if (seq !== loadSeq.current) return;
                setError(errorMessage(err, 'Could not load a text. Check your connection and try again.'));
                setStatus('error');
            }
        },
        [config.difficulty, config.duration],
    );

    useEffect(() => {
        load();
    }, [load]);

    const finish = useCallback(() => {
        if (statusRef.current !== 'running') return;
        setStatus('finished');

        const elapsed = Math.min(performance.now() - startRef.current, durationMs);
        const score = scoreTest(textRef.current, typedRef.current, elapsed);
        setElapsedMs(elapsed);

        const { sessionId } = sessionRef.current;
        if (!sessionId) {
            setResult({ score, elapsedMs: elapsed, save: { kind: 'anonymous' } });
            return;
        }

        setResult({ score, elapsedMs: elapsed, save: { kind: 'saving' } });
        api.completeTest(sessionId, typedRef.current, localTimeZone())
            .then((res) => {
                // The server's score is authoritative (it uses its own timing).
                setResult({
                    score: res.score,
                    elapsedMs: elapsed,
                    save: res.saved
                        ? { kind: 'saved', resultId: res.resultId, unlocked: res.unlocked }
                        : { kind: 'not-saved', message: 'Type at least one word correctly to save a result.' },
                });
            })
            .catch((err) => {
                const message =
                    err instanceof ApiError && err.status === 401
                        ? 'Your session expired. Sign in again to save results.'
                        : errorMessage(err, 'Could not save this result.');
                setResult({ score, elapsedMs: elapsed, save: { kind: 'not-saved', message } });
            });
    }, [durationMs]);

    // Countdown while running.
    useEffect(() => {
        if (status !== 'running') return;
        const id = setInterval(() => {
            const elapsed = performance.now() - startRef.current;
            setElapsedMs(Math.min(elapsed, durationMs));
            if (elapsed >= durationMs) finish();
        }, 100);
        return () => clearInterval(id);
    }, [status, durationMs, finish]);

    const handleInput = useCallback(
        (raw: string) => {
            const current = statusRef.current;
            if (current !== 'ready' && current !== 'running') return;

            const value = sanitizeInput(raw, splitWords(textRef.current), textRef.current.length);

            if (current === 'ready') {
                if (!value) return;
                startRef.current = performance.now();
                setStatus('running');
                const { sessionId } = sessionRef.current;
                if (sessionId) {
                    // Best effort: without it the server times from when the text loaded.
                    api.beginTest(sessionId).catch(() => {});
                }
            }

            typedRef.current = value;
            setTyped(value);

            if (isComplete(textRef.current, value)) {
                finish();
            }
        },
        [finish],
    );

    const liveScore = useMemo(
        () => (status === 'running' ? scoreTest(text, typed, elapsedMs) : null),
        [status, text, typed, elapsedMs],
    );

    const progress = targetWords.length > 0 ? Math.min(1, (typed ? typed.split(' ').length - 1 : 0) / targetWords.length) : 0;

    return {
        status,
        text,
        typed,
        targetWords,
        error,
        result,
        liveScore,
        progress,
        remainingMs: Math.max(0, durationMs - elapsedMs),
        handleInput,
        nextText: () => load(),
        restart: () => load({ sameText: true }),
    };
}
