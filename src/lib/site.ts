// Canonical site details used in metadata, the sitemap and share images.
export const SITE_NAME = 'TypeDaily';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://type-daily.kroy.dev').replace(/\/$/, '');
export const SITE_TAGLINE = 'Free typing test with streaks and a leaderboard';
export const SITE_DESCRIPTION =
    'Take a free online typing test in 1, 5 or 15 minutes. Measure your WPM and accuracy, keep a daily practice streak, unlock achievements and climb the global leaderboard.';
export const REPO_URL = 'https://github.com/Kroy665/type-daily';
// Where privacy and account-deletion requests go. Falls back to GitHub issues.
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';

export function absoluteUrl(path = '/'): string {
    return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
