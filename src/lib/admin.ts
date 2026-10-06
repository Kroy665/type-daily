import type { Role } from '@prisma/client';

// A user is an admin if their role is ADMIN or their email is listed in
// ADMIN_EMAILS (comma-separated, case-insensitive, whitespace ignored).
export function isAdminUser(user: { email: string; role: Role }): boolean {
    if (user.role === 'ADMIN') return true;
    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
    return adminEmails.includes(user.email.toLowerCase());
}
