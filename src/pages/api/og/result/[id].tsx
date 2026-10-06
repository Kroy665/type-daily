import { prisma } from '@/lib/db';
import { apiRoute } from '@/lib/server/api';
import { OG_COLORS, OgFrame, Wordmark, fetchImageDataUrl, sendOgImage } from '@/lib/server/og';
import { DURATION_LABELS, type DurationValue } from '@/lib/constants';
import { SITE_URL } from '@/lib/site';
import { idSchema } from '@/lib/validations';

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 22, color: OG_COLORS.subtle, textTransform: 'uppercase', letterSpacing: 2 }}>{label}</div>
            <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 48, color: OG_COLORS.fg, marginTop: 6 }}>{value}</div>
        </div>
    );
}

// Share image for a single saved result.
export default apiRoute(['GET', 'HEAD'], async (req, res) => {
    const { id } = idSchema.parse(req.query);
    const result = await prisma.result.findUnique({
        where: { id },
        select: {
            wpm: true,
            accuracy: true,
            difficulty: true,
            selectedTime: true,
            created: true,
            user: { select: { name: true, image: true, bestWpm: true } },
        },
    });
    if (!result) {
        return res.status(404).json({ message: 'Result not found' });
    }

    const name = result.user.name ?? 'A typist';
    const avatar = await fetchImageDataUrl(result.user.image);
    const isBest = result.wpm >= result.user.bestWpm;
    const duration = DURATION_LABELS[result.selectedTime as DurationValue] ?? `${result.selectedTime}s`;
    const difficulty = result.difficulty.charAt(0) + result.difficulty.slice(1).toLowerCase();

    await sendOgImage(
        res,
        <OgFrame>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Wordmark />
                {isBest && (
                    <div
                        style={{
                            display: 'flex',
                            padding: '10px 22px',
                            borderRadius: 999,
                            border: `2px solid ${OG_COLORS.accent}`,
                            color: OG_COLORS.accent,
                            fontSize: 24,
                            fontWeight: 600,
                        }}
                    >
                        Personal best
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 56 }}>
                {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} width={64} height={64} style={{ borderRadius: 999 }} alt="" />
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 64,
                            height: 64,
                            borderRadius: 999,
                            background: OG_COLORS.surface,
                            border: `2px solid ${OG_COLORS.border}`,
                            fontSize: 30,
                            color: OG_COLORS.muted,
                        }}
                    >
                        {name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div style={{ display: 'flex', fontSize: 36, fontWeight: 600, maxWidth: 900 }}>
                    {name.length > 32 ? `${name.slice(0, 31)}…` : name}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 64, marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                    <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 210, lineHeight: 1, color: OG_COLORS.accent, letterSpacing: -6 }}>
                        {String(result.wpm)}
                    </div>
                    <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 52, color: OG_COLORS.muted }}>wpm</div>
                </div>
                <div style={{ display: 'flex', gap: 56, paddingBottom: 18 }}>
                    <Stat label="Accuracy" value={`${result.accuracy}%`} />
                    <Stat label="Test" value={`${duration}`} />
                    <Stat label="Level" value={difficulty} />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: 26 }}>
                <div style={{ display: 'flex', color: OG_COLORS.fg }}>
                    Can you beat it?&nbsp;<span style={{ color: OG_COLORS.accent }}>{SITE_URL.replace(/^https?:\/\//, '')}</span>
                </div>
                <div style={{ display: 'flex', color: OG_COLORS.subtle }}>
                    {result.created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            </div>
        </OgFrame>,
        // Results never change; the "personal best" badge may, so keep the CDN copy for a day.
        'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    );
});
