import Link from 'next/link';
import ContentPage from '@/components/content/ContentPage';
import { COMPLETION_GRACE_MS, DURATIONS, DURATION_SLUGS, MAX_PLAUSIBLE_WPM } from '@/lib/constants';
import { REPO_URL } from '@/lib/site';

export default function About() {
    return (
        <ContentPage
            title="About TypeDaily"
            description="How the typing test works, how WPM and accuracy are scored, and how the leaderboard stays fair."
            path="/about"
        >
            <p>
                TypeDaily is a free typing test built around one habit: practising a little every day. Take a{' '}
                {DURATIONS.map((d, i) => (
                    <span key={d}>
                        {i > 0 && (i === DURATIONS.length - 1 ? ' or ' : ', ')}
                        <Link href={`/typing-test/${DURATION_SLUGS[d]}`}>{d / 60}-minute test</Link>
                    </span>
                ))}
                , keep your daily streak alive, unlock achievements and see how you compare on the{' '}
                <Link href="/leaderboard">leaderboard</Link>.
            </p>

            <h2>How a test works</h2>
            <ol>
                <li>Choose a difficulty (easy, medium or hard) and a length. A passage is drawn at random for that combination.</li>
                <li>The timer starts on your first keystroke, not when the page loads, so you can read the first line before you begin.</li>
                <li>The test ends when time runs out or when you finish the passage, whichever comes first.</li>
                <li>Pasting is disabled. <strong>Tab</strong> loads a new passage and <strong>Esc</strong> restarts the current one.</li>
            </ol>

            <h2>How scoring works</h2>
            <p>
                Typing is compared word by word. If you slip on one letter, that word is marked wrong — not every letter after it.
            </p>
            <ul>
                <li>
                    <strong>WPM</strong> follows the standard convention that a &quot;word&quot; is five characters. It counts the characters of
                    every correctly typed word plus the space after it, divided by five, divided by the minutes elapsed.
                </li>
                <li>
                    <strong>Raw WPM</strong> counts everything you typed, mistakes included.
                </li>
                <li>
                    <strong>Accuracy</strong> is the share of typed characters that match the passage. Letters you skip by pressing space early
                    count as misses.
                </li>
                <li>
                    <strong>Errors</strong> is the number of words that don&apos;t match. A word you&apos;re still typing isn&apos;t counted as an
                    error until it stops matching the passage.
                </li>
            </ul>

            <h2>Keeping the leaderboard fair</h2>
            <p>
                Your browser never sends a score. When a signed-in test starts, the server issues a one-time test session and records the
                moment you type your first key. When the test ends, your browser sends only the text you typed; the server scores it against
                the passage using its own clock.
            </p>
            <ul>
                <li>Each test session can be submitted once.</li>
                <li>Results that arrive more than {COMPLETION_GRACE_MS / 1000} seconds after the timer should have ended are rejected.</li>
                <li>Results above {MAX_PLAUSIBLE_WPM} WPM are rejected as automated.</li>
            </ul>
            <p>
                Leaderboard ties go to whoever reached the score first. If you spot a score that looks wrong, please let us know.
            </p>

            <h2>Streaks and achievements</h2>
            <p>
                Finish at least one saved test on a calendar day to extend your streak. Days are counted in your own timezone. Achievements
                unlock automatically for speed (50, 75 and 100+ WPM), accuracy (90%, 95% and 100%), streaks (7 and 30 days) and
                milestones such as your first and hundredth test.
            </p>

            <h2>Open source</h2>
            <p>
                TypeDaily is built with Next.js, PostgreSQL and Prisma. The source code is on{' '}
                <a href={REPO_URL} rel="noopener">GitHub</a>.
            </p>
        </ContentPage>
    );
}
