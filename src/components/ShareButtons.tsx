import { useEffect, useState } from 'react';

interface Props {
    url: string;
    text: string;
}

const ShareLink = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="btn-ghost h-9 w-9 p-0">
        {children}
    </a>
);

// Copy link, native share sheet (mobile), and direct links to common networks.
export default function ShareButtons({ url, text }: Props) {
    const [copied, setCopied] = useState(false);
    const [canNativeShare, setCanNativeShare] = useState(false);

    useEffect(() => setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function'), []);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            window.prompt('Copy this link:', url);
        }
    };

    const e = encodeURIComponent;

    return (
        <div className="flex flex-wrap items-center gap-1">
            <button type="button" onClick={copy} className="btn-ghost px-3 py-1.5" aria-live="polite">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {copied ? (
                        <path d="M20 6 9 17l-5-5" />
                    ) : (
                        <>
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </>
                    )}
                </svg>
                {copied ? 'Copied' : 'Copy link'}
            </button>
            {canNativeShare && (
                <button
                    type="button"
                    onClick={() => navigator.share({ url, text }).catch(() => {})}
                    className="btn-ghost px-3 py-1.5"
                >
                    Share…
                </button>
            )}
            <ShareLink href={`https://twitter.com/intent/tweet?text=${e(text)}&url=${e(url)}`} label="Share on X">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            </ShareLink>
            <ShareLink href={`https://www.reddit.com/submit?url=${e(url)}&title=${e(text)}`} label="Share on Reddit">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0Zm6.67 13.38c.03.18.04.36.04.55 0 2.8-3.26 5.07-7.28 5.07s-7.28-2.27-7.28-5.07c0-.19.01-.37.04-.55a1.6 1.6 0 1 1 1.76-2.62 8.9 8.9 0 0 1 4.86-1.54l.92-4.33a.34.34 0 0 1 .4-.26l3.03.64a1.13 1.13 0 1 1-.12.55l-2.71-.57-.83 3.9a8.86 8.86 0 0 1 4.79 1.54 1.6 1.6 0 1 1 1.38 2.69ZM9.13 12.4a1.13 1.13 0 1 0 0 2.26 1.13 1.13 0 0 0 0-2.26Zm5.74 0a1.13 1.13 0 1 0 0 2.26 1.13 1.13 0 0 0 0-2.26Zm-.31 3.37a.3.3 0 0 0-.42 0c-.53.53-1.48.73-2.14.73s-1.61-.2-2.14-.73a.3.3 0 0 0-.42.42c.73.73 2.06.86 2.56.86s1.83-.13 2.56-.86a.3.3 0 0 0 0-.42Z" />
                </svg>
            </ShareLink>
            <ShareLink href={`https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`} label="Share on LinkedIn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
                </svg>
            </ShareLink>
            <ShareLink href={`https://wa.me/?text=${e(`${text} ${url}`)}`} label="Share on WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.43 9.88-9.88 9.88M20.46 3.49A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.42" />
                </svg>
            </ShareLink>
        </div>
    );
}
