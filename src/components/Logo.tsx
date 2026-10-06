import Link from 'next/link';

export default function Logo() {
    return (
        <Link href="/" className="group flex items-center gap-2 rounded-lg" aria-label="TypeDaily home">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-mono text-sm font-bold text-accent-fg transition-transform group-hover:-rotate-6">
                td
            </span>
            <span className="hidden font-mono text-base font-semibold tracking-tight text-fg sm:inline">
                type<span className="text-accent-text">daily</span>
            </span>
        </Link>
    );
}
