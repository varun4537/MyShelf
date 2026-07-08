import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Book } from '../../types';
import { isAuthorized, updateBook, deleteBook } from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const isbn = req.query.isbn as string;
    if (!isbn) {
        return res.status(400).json({ error: 'Missing ISBN' });
    }

    try {
        if (req.method === 'PUT') {
            const updatedBook = req.body as Book;
            if (!updatedBook?.isbn) {
                return res.status(400).json({ error: 'Invalid book data' });
            }

            await updateBook(isbn, updatedBook);
            return res.status(200).json({ status: 'updated' });
        }

        if (req.method === 'DELETE') {
            await deleteBook(isbn);
            return res.status(200).json({ status: 'deleted' });
        }
    } catch (error) {
        console.error('Library request failed:', error);
        return res.status(500).json({ error: 'Database error' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
