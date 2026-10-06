import { apiRoute } from '@/lib/server/api';
import { OG_COLORS, OgFrame, Wordmark, sendOgImage } from '@/lib/server/og';
import { SITE_URL } from '@/lib/site';

const SAMPLE = 'the quick brown fox jumps over the lazy dog';

// Default share image for pages without their own.
export default apiRoute(['GET', 'HEAD'], async (_req, res) => {
    await sendOgImage(
        res,
        <OgFrame>
            <Wordmark />
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
                <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 40, color: OG_COLORS.subtle, marginBottom: 28 }}>
                    <span style={{ color: OG_COLORS.fg }}>{SAMPLE.slice(0, 19)}</span>
                    <span style={{ width: 4, height: 46, background: OG_COLORS.accent, borderRadius: 2, margin: '2px 2px 0' }} />
                    {/* Non-breaking so the leading space after the caret isn't collapsed */}
                    <span>{SAMPLE.slice(19).replace(/ /g, '\u00a0')}</span>
                </div>
                <div style={{ display: 'flex', fontSize: 72, fontWeight: 600, letterSpacing: -2, lineHeight: 1.05 }}>
                    Free typing test.
                </div>
                <div style={{ display: 'flex', fontSize: 72, fontWeight: 600, letterSpacing: -2, lineHeight: 1.05, color: OG_COLORS.accent }}>
                    Practise a little every day.
                </div>
                <div style={{ display: 'flex', marginTop: 36, fontSize: 28, color: OG_COLORS.muted }}>
                    WPM &amp; accuracy · daily streaks · achievements · global leaderboard
                </div>
            </div>
            <div style={{ display: 'flex', marginTop: 40, fontSize: 24, color: OG_COLORS.subtle }}>
                {SITE_URL.replace(/^https?:\/\//, '')}
            </div>
        </OgFrame>,
        'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
    );
});
