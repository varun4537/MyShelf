import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Book } from '../types';
import { isAuthorized, getLibrary, addBook, clearLibrary } from './lib/db.js';

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

    try {
        if (req.method === 'GET') {
            const library = await getLibrary();
            return res.status(200).json(library);
        }

        if (req.method === 'POST') {
            const book = req.body as Book;
            if (!book?.isbn) {
                return res.status(400).json({ error: 'Invalid book data' });
            }

            const added = await addBook(book);
            if (!added) {
                return res.status(200).json({ status: 'exists' });
            }
            return res.status(201).json({ status: 'added' });
        }

        if (req.method === 'DELETE') {
            await clearLibrary();
            return res.status(200).json({ status: 'cleared' });
        }
    } catch (error) {
        console.error('Library request failed:', error);
        return res.status(500).json({ error: 'Database error' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
