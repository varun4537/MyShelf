import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Models to try (in order)
const MODELS = [
    'google/gemini-2.5-flash',
    'openai/gpt-4o-mini'
];

interface BookData {
    title: string;
    authors: string[];
    genre: string[];
    description: string;
    pageCount: number;
    publisher?: string;
    publishYear?: number;
    language?: string;
    series?: string;
    seriesOrder?: string;
}

// Try Open Library first (fast, free, no API key needed)
async function tryOpenLibrary(isbn: string): Promise<BookData | null> {
    try {
        const response = await fetch(
            `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
        );
        const data = await response.json();
        const bookData = data[`ISBN:${isbn}`];

        if (!bookData) return null;

        // Parse series info if available
        let series = undefined;
        let seriesOrder = undefined;

        // OpenLibrary series format varies
        if (Array.isArray(bookData.series)) {
            series = bookData.series[0]?.name;
        } else if (bookData.series?.name) {
            series = bookData.series.name;
        }

        return {
            title: bookData.title || 'Unknown Title',
            authors: bookData.authors?.map((a: { name: string }) => a.name) || ['Unknown Author'],
            // Enhance: specific subjects only
            genre: bookData.subjects?.slice(0, 5).map((s: { name: string }) => s.name) || ['Uncategorized'],
            description: bookData.notes || bookData.excerpts?.[0]?.text || `${bookData.title} by ${bookData.authors?.[0]?.name || 'Unknown'}`,
            pageCount: bookData.number_of_pages || 0,
            publisher: bookData.publishers?.[0]?.name,
            publishYear: bookData.publish_date ? parseInt(bookData.publish_date) : undefined,
            language: bookData.languages?.[0]?.key?.replace('/languages/', ''),
            series,
            seriesOrder // OpenLibrary rarely provides order cleanly in this endpoint
        };
    } catch {
        return null;
    }
}

// Fallback to LLM if Open Library doesn't have data
async function tryLLM(isbn: string): Promise<BookData | null> {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY not configured');
    }

    const prompt = `You are a book metadata API. Given an ISBN, return ONLY valid JSON with book information.

ISBN: ${isbn}

Return this exact JSON format (no markdown, no explanation):
{
  "title": "Book Title",
  "authors": ["Author Name"],
  "genre": ["Specific Genre 1", "Specific Genre 2", "Mood"],
  "description": "Engaging description (max 3 sentences)",
  "pageCount": 0,
  "series": "Series Name (if any)",
  "seriesOrder": "1" (if any)
}`;

    for (const model of MODELS) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://myshelf.vercel.app',
                    'X-Title': 'MyShelf Book Scanner'
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.1,
                    max_tokens: 500
                })
            });

            if (!response.ok) continue;

            const result = await response.json();
            let content = result.choices?.[0]?.message?.content || '';

            // Clean up markdown formatting
            content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            return JSON.parse(content) as BookData;
        } catch {
            continue;
        }
    }

    return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const isbn = req.query.isbn as string || req.body?.isbn;

    if (!isbn || !/^\d{10,13}$/.test(isbn)) {
        return res.status(400).json({ error: 'Invalid ISBN' });
    }

    try {
        // Try Open Library first (fast)
        let bookData = await tryOpenLibrary(isbn);
        let source = 'openlibrary';

        // Fallback to LLM
        if (!bookData) {
            bookData = await tryLLM(isbn);
            source = 'llm';
        }

        if (!bookData) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Add cover URL
        const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

        return res.status(200).json({
            ...bookData,
            isbn,
            coverUrl,
            source
        });
    } catch (error) {
        console.error('Book lookup error:', error);
        return res.status(500).json({ error: 'Failed to fetch book data' });
    }
}
