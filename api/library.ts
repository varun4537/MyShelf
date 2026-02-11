import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@vercel/kv';
import type { Book } from '../types';

const LIBRARY_KEY = 'myshelf:library';

// Support both Vercel KV env vars and REDIS_URL
const getKVClient = () => {
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

const kv = getKVClient();

const isAuthorized = (req: VercelRequest) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return false;

    const [username, password] = Buffer.from(token, 'base64').toString('utf-8').split(':');
    return username === process.env.APP_USER && password === process.env.APP_PASS;
};

const getLibrary = async (): Promise<Book[]> => {
    const stored = await kv.get<Book[]>(LIBRARY_KEY);
    return stored || [];
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        const library = await getLibrary();
        return res.status(200).json(library);
    }

    if (req.method === 'POST') {
        const book = req.body as Book;
        if (!book?.isbn) {
            return res.status(400).json({ error: 'Invalid book data' });
        }

        const library = await getLibrary();
        if (library.some(item => item.isbn === book.isbn)) {
            return res.status(200).json({ status: 'exists' });
        }

        const updated = [book, ...library];
        await kv.set(LIBRARY_KEY, updated);
        return res.status(201).json({ status: 'added' });
    }

    if (req.method === 'DELETE') {
        await kv.set(LIBRARY_KEY, []);
        return res.status(200).json({ status: 'cleared' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}