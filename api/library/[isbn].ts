import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Book } from '../../types';
import { isAuthorized, getLibrary, saveLibrary } from '../lib/kv';

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

    if (req.method === 'PUT') {
        const updatedBook = req.body as Book;
        if (!updatedBook?.isbn) {
            return res.status(400).json({ error: 'Invalid book data' });
        }

        const library = await getLibrary();
        const updated = library.map(book => (book.isbn === isbn ? updatedBook : book));
        await saveLibrary(updated);
        return res.status(200).json({ status: 'updated' });
    }

    if (req.method === 'DELETE') {
        const library = await getLibrary();
        const updated = library.filter(book => book.isbn !== isbn);
        await saveLibrary(updated);
        return res.status(200).json({ status: 'deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
