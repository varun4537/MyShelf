import type { VercelRequest } from '@vercel/node';
import { createClient } from '@vercel/kv';
import type { Book } from '../../types';

export const LIBRARY_KEY = 'myshelf:library';

/**
 * Get KV/Redis client supporting both Vercel KV and REDIS_URL formats
 */
export const getKVClient = () => {
    // If standard Vercel KV vars exist, use them
    if (process.env.KV_REST_API_URL) {
        return createClient({
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN || ''
        });
    }

    // Parse REDIS_URL (format: redis://default:TOKEN@HOST:PORT)
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        throw new Error('No KV/Redis URL configured');
    }

    // Parse redis:// URL
    const match = redisUrl.match(/redis:\/\/default:([^@]+)@([^:]+):(\d+)/);
    if (!match) {
        throw new Error('Invalid REDIS_URL format');
    }

    const [, token, host, port] = match;
    const httpsUrl = `https://${host}:${port}`;

    return createClient({ url: httpsUrl, token });
};

/**
 * Shared KV client instance
 */
export const kv = getKVClient();

/**
 * Check if request is authorized using Bearer token
 */
export const isAuthorized = (req: VercelRequest): boolean => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return false;

    const [username, password] = Buffer.from(token, 'base64').toString('utf-8').split(':');
    return username === process.env.APP_USER && password === process.env.APP_PASS;
};

/**
 * Get library from KV store
 */
export const getLibrary = async (): Promise<Book[]> => {
    const stored = await kv.get<Book[]>(LIBRARY_KEY);
    return stored || [];
};

/**
 * Save library to KV store
 */
export const saveLibrary = async (library: Book[]): Promise<void> => {
    await kv.set(LIBRARY_KEY, library);
};
