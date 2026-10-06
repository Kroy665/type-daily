import fs from 'fs/promises';
import path from 'path';
import type { NextApiResponse } from 'next';
import { ImageResponse } from 'next/og';
import type { ReactElement } from 'react';

// Share images are rendered in the Node runtime from bundled fonts (see
// outputFileTracingIncludes in next.config.mjs).
const FONT_DIR = path.join(process.cwd(), 'src/assets/fonts');

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
    bg: '#0e0f13',
    surface: '#16181e',
    border: '#2a2e38',
    fg: '#e8e8e4',
    muted: '#9296a2',
    subtle: '#545966',
    accent: '#f7b955',
    accentFg: '#1c1406',
    success: '#6ed68c',
};

let fontsPromise: Promise<NonNullable<ConstructorParameters<typeof ImageResponse>[1]>['fonts']> | null = null;

function loadFonts() {
    fontsPromise ??= Promise.all([
        fs.readFile(path.join(FONT_DIR, 'Inter-400.ttf')),
        fs.readFile(path.join(FONT_DIR, 'Inter-600.ttf')),
        fs.readFile(path.join(FONT_DIR, 'JetBrainsMono-700.ttf')),
    ]).then(([inter400, inter600, mono700]) => [
        { name: 'Inter', data: inter400, weight: 400 as const, style: 'normal' as const },
        { name: 'Inter', data: inter600, weight: 600 as const, style: 'normal' as const },
        { name: 'JetBrains Mono', data: mono700, weight: 700 as const, style: 'normal' as const },
    ]);
    return fontsPromise;
}

// Renders a React element to PNG and sends it from a pages API route.
export async function sendOgImage(res: NextApiResponse, element: ReactElement, cacheControl: string) {
    const image = new ImageResponse(element, { ...OG_SIZE, fonts: await loadFonts() });
    const buffer = Buffer.from(await image.arrayBuffer());
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', cacheControl);
    res.setHeader('Content-Length', buffer.length);
    res.status(200).send(buffer);
}

// Fetches a remote avatar as a data URL so a slow or failing image host can't
// break rendering; returns null on any failure.
export async function fetchImageDataUrl(url: string | null | undefined, timeoutMs = 2500): Promise<string | null> {
    if (!url) return null;
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
        const type = response.headers.get('content-type') ?? '';
        if (!response.ok || !type.startsWith('image/')) return null;
        const data = Buffer.from(await response.arrayBuffer()).toString('base64');
        return `data:${type};base64,${data}`;
    } catch {
        return null;
    }
}

export function LogoMark({ size = 56 }: { size?: number }) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: size,
                height: size,
                borderRadius: size * 0.25,
                background: OG_COLORS.accent,
                color: OG_COLORS.accentFg,
                fontFamily: 'JetBrains Mono',
                fontSize: size * 0.45,
            }}
        >
            td
        </div>
    );
}

export function Wordmark() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <LogoMark />
            <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 34, color: OG_COLORS.fg }}>
                type<span style={{ color: OG_COLORS.accent }}>daily</span>
            </div>
        </div>
    );
}

// Full-bleed dark frame with a soft accent glow shared by all share images.
export function OgFrame({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: '64px 72px',
                backgroundColor: OG_COLORS.bg,
                backgroundImage: 'radial-gradient(circle at 85% 0%, rgba(247,185,85,0.18), transparent 55%)',
                color: OG_COLORS.fg,
                fontFamily: 'Inter',
            }}
        >
            {children}
        </div>
    );
}
