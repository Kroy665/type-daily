import type { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>;

// Wraps an API route: rejects other HTTP methods, maps validation errors to
// 400 and anything unexpected to a logged 500.
export function apiRoute(methods: string[], handler: Handler) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        if (!req.method || !methods.includes(req.method)) {
            res.setHeader('Allow', methods.join(', '));
            return res.status(405).json({ message: 'Method not allowed' });
        }
        try {
            await handler(req, res);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({ message: 'Validation error', errors: error.issues });
            }
            console.error(`[api] ${req.method} ${req.url} failed:`, error);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    };
}
