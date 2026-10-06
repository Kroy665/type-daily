import Link from 'next/link';
import ContentPage from '@/components/content/ContentPage';
import Contact from '@/components/content/Contact';

export default function Privacy() {
    return (
        <ContentPage
            title="Privacy policy"
            description="What TypeDaily collects, why, and what you can do about it."
            path="/privacy"
            updated="October 6, 2026"
        >
            <p>
                TypeDaily is a typing practice site. You can use the typing test without an account; signing in is only needed to save
                results. This page explains what we store and why.
            </p>

            <h2>If you don&apos;t sign in</h2>
            <p>
                We don&apos;t store your typing or your results. Your theme and test preferences (difficulty, length and view) are kept in
                your own browser&apos;s local storage and never sent to us.
            </p>

            <h2>If you sign in with Google</h2>
            <p>We receive and store:</p>
            <ul>
                <li>
                    <strong>Your Google profile:</strong> your name, email address and profile picture, plus the sign-in tokens Google issues so
                    you can stay signed in.
                </li>
                <li>
                    <strong>Your results:</strong> for each saved test, the WPM, accuracy, number of errors, difficulty, length and date.
                </li>
                <li>
                    <strong>Your stats:</strong> best speed and accuracy, number of tests, current and longest streak, and achievements unlocked.
                </li>
                <li>
                    <strong>Test sessions:</strong> which passage you were given and when you started and finished, used to score the test on
                    the server. These are deleted within about a day.
                </li>
            </ul>
            <p>
                The text you type is sent to our server to calculate your score, but it isn&apos;t stored.
            </p>

            <h2>What other people can see</h2>
            <ul>
                <li>
                    Once you&apos;ve saved a test, your name, profile picture and best stats appear on the public{' '}
                    <Link href="/leaderboard">leaderboard</Link>.
                </li>
                <li>
                    Every saved result has a shareable link (<code>/r/…</code>) showing your name, picture and that result. Anyone with the
                    link can open it. These pages are hidden from search engines.
                </li>
                <li>Your email address is never shown to anyone else.</li>
            </ul>

            <h2>Cookies</h2>
            <p>
                We use only the cookies needed to keep you signed in and to protect sign-in from forgery. We don&apos;t use advertising or
                analytics cookies, and we don&apos;t sell or share your data with advertisers.
            </p>

            <h2>Where your data lives</h2>
            <p>
                The site is hosted on Vercel and the database on Neon (PostgreSQL). Sign-in is provided by Google. These providers process
                data on our behalf to run the service.
            </p>

            <h2>Your choices</h2>
            <p>
                You can sign out at any time. To have your account and all of its results deleted, or to ask what we hold about you, contact
                us through <Contact />. You can also remove TypeDaily&apos;s access from your Google account settings.
            </p>

            <h2>Changes</h2>
            <p>If this policy changes, we&apos;ll update the date at the top of this page.</p>
        </ContentPage>
    );
}
