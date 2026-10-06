import ContentPage from '@/components/content/ContentPage';
import Contact from '@/components/content/Contact';

export default function Terms() {
    return (
        <ContentPage
            title="Terms of use"
            description="The ground rules for using TypeDaily."
            path="/terms"
            updated="October 6, 2026"
        >
            <p>By using TypeDaily you agree to these terms. They&apos;re short, so please read them.</p>

            <h2>The service</h2>
            <p>
                TypeDaily is a free typing practice site. It is provided as is, without guarantees that it will always be available,
                error-free, or that results and rankings will be kept forever.
            </p>

            <h2>Fair play</h2>
            <ul>
                <li>Type your tests yourself. Don&apos;t use bots, scripts, macros or other automation to produce results.</li>
                <li>Don&apos;t try to tamper with scoring, the leaderboard, or other people&apos;s accounts.</li>
                <li>Don&apos;t overload or disrupt the service.</li>
            </ul>
            <p>
                We may remove results, leaderboard entries or accounts that break these rules.
            </p>

            <h2>Your account</h2>
            <p>
                You sign in with Google and are responsible for activity on your account. Your display name and profile picture come from
                Google and appear publicly on the leaderboard and on result links you share.
            </p>

            <h2>Liability</h2>
            <p>
                To the extent the law allows, TypeDaily isn&apos;t liable for any loss arising from use of the service, including loss of data
                or rankings.
            </p>

            <h2>Changes and contact</h2>
            <p>
                We may update these terms; the date at the top shows the latest version. Questions? Reach us through <Contact />.
            </p>
        </ContentPage>
    );
}
