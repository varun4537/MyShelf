import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import type { Book } from '../types';

const LIBRARY_KEY = 'myshelf:library';

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