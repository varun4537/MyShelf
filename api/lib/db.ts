import type { VercelRequest } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import type { Book } from '../../types';

/**
 * Neon Postgres data layer.
 *
 * Each book is its own row (keyed by ISBN), so concurrent adds/edits from
 * different devices can't overwrite each other — unlike the previous
 * single-JSON-blob-in-Redis design.
 */

// Lazy so a missing env var fails the request, not the module import
const getSql = () => {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) {
        throw new Error('No DATABASE_URL/POSTGRES_URL configured');
    }
    return neon(url);
};

// Create the table on first use per instance; reset on failure so the
// next request retries instead of caching a rejected promise
let tableReady: Promise<unknown> | null = null;
const ensureTable = () => {
    if (!tableReady) {
        tableReady = getSql()`
            CREATE TABLE IF NOT EXISTS books (
                isbn TEXT PRIMARY KEY,
                data JSONB NOT NULL
            )
        `.catch((err) => {
            tableReady = null;
            throw err;
        });
    }
    return tableReady;
};

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
 * Get all books, newest first (dateAdded is an ISO string, so
 * lexicographic order is chronological)
 */
export const getLibrary = async (): Promise<Book[]> => {
    await ensureTable();
    const rows = await getSql()`
        SELECT data FROM books
        ORDER BY data->>'dateAdded' DESC NULLS LAST
    `;
    return rows.map((row) => row.data as Book);
};

/**
 * Insert a book. Returns false if the ISBN already exists.
 */
export const addBook = async (book: Book): Promise<boolean> => {
    await ensureTable();
    const rows = await getSql()`
        INSERT INTO books (isbn, data)
        VALUES (${book.isbn}, ${JSON.stringify(book)}::jsonb)
        ON CONFLICT (isbn) DO NOTHING
        RETURNING isbn
    `;
    return rows.length > 0;
};

/**
 * Bulk-insert books, skipping ISBNs that already exist (and duplicate
 * ISBNs within the batch). Returns the number actually inserted.
 */
export const addBooks = async (books: Book[]): Promise<number> => {
    if (books.length === 0) return 0;
    await ensureTable();
    const rows = await getSql()`
        INSERT INTO books (isbn, data)
        SELECT DISTINCT ON (elem->>'isbn') elem->>'isbn', elem
        FROM jsonb_array_elements(${JSON.stringify(books)}::jsonb) AS elem
        WHERE COALESCE(elem->>'isbn', '') <> ''
        ON CONFLICT (isbn) DO NOTHING
        RETURNING isbn
    `;
    return rows.length;
};

/**
 * Replace a book's data by ISBN
 */
export const updateBook = async (isbn: string, book: Book): Promise<void> => {
    await ensureTable();
    await getSql()`
        UPDATE books SET data = ${JSON.stringify(book)}::jsonb
        WHERE isbn = ${isbn}
    `;
};

/**
 * Delete a book by ISBN
 */
export const deleteBook = async (isbn: string): Promise<void> => {
    await ensureTable();
    await getSql()`DELETE FROM books WHERE isbn = ${isbn}`;
};

/**
 * Delete every book
 */
export const clearLibrary = async (): Promise<void> => {
    await ensureTable();
    await getSql()`DELETE FROM books`;
};
