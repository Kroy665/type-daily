import type { DifficultyValue, DurationValue, LeaderboardMetric } from '@/lib/constants';
import type {
    AchievementItem,
    CompleteTestResponse,
    LeaderboardUser,
    ResultItem,
    StartTestResponse,
    TextItem,
} from '@/types/api';

export class ApiError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        ...init,
        headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
    });
    const data = res.status === 204 ? null : await res.json().catch(() => null);
    if (!res.ok) {
        throw new ApiError(data?.message || `Request failed (${res.status})`, res.status);
    }
    return data as T;
}

const post = <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });

export const api = {
    startTest: (body: { difficulty: DifficultyValue; selectedTime: DurationValue; textId?: string }) =>
        post<StartTestResponse>('/api/tests/start', body),
    beginTest: (id: string) => post<null>(`/api/tests/${encodeURIComponent(id)}/begin`),
    completeTest: (id: string, typed: string, timeZone: string) =>
        post<CompleteTestResponse>(`/api/tests/${encodeURIComponent(id)}/complete`, { typed, timeZone }),

    results: () => request<ResultItem[]>('/api/results/get-all'),
    achievements: () => request<AchievementItem[]>('/api/achievements/user'),
    leaderboard: (orderBy: LeaderboardMetric) =>
        request<LeaderboardUser[]>(`/api/leaderboard/global?orderBy=${orderBy}`),
    userRank: (orderBy: LeaderboardMetric) =>
        request<LeaderboardUser>(`/api/leaderboard/user-rank?orderBy=${orderBy}`),

    texts: () => request<TextItem[]>('/api/text/get-all'),
    createText: (body: { text: string; difficulty: DifficultyValue; time: DurationValue }) =>
        post<TextItem>('/api/text/create', body),
    deleteText: (id: string) =>
        request<{ id: string }>(`/api/text/delete?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

export function errorMessage(error: unknown, fallback = 'Something went wrong'): string {
    return error instanceof Error && error.message ? error.message : fallback;
}
