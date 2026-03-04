import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Book } from '../types';
import { isAuthorized, getLibrary, kv, LIBRARY_KEY, saveLibrary } from './lib/kv';

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
        await saveLibrary(updated);
        return res.status(201).json({ status: 'added' });
    }

    if (req.method === 'DELETE') {
        await saveLibrary([]);
        return res.status(200).json({ status: 'cleared' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
