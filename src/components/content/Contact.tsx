import { CONTACT_EMAIL, REPO_URL } from '@/lib/site';

export default function Contact() {
    return CONTACT_EMAIL ? (
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    ) : (
        <a href={`${REPO_URL}/issues`} rel="noopener">
            the project&apos;s GitHub issues
        </a>
    );
}
