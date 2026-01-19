import { Book, createBook } from '../types';

/**
 * Fetch book data by ISBN using the secure serverless API
 * The API key is kept server-side for security
 */
export async function fetchBookByISBN(isbn: string): Promise<Book | null> {
  try {
    // Use relative path - works in both dev and prod
    const apiUrl = `/api/book?isbn=${isbn}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Book not found for ISBN: ${isbn}`);
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return createBook({
      isbn: data.isbn,
      title: data.title,
      authors: data.authors || ['Unknown Author'],
      genre: data.genre || ['Uncategorized'],
      description: data.description || '',
      coverUrl: data.coverUrl || `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
      dateAdded: new Date().toISOString(),
      pageCount: data.pageCount || 0,
      publisher: data.publisher,
      publishYear: data.publishYear,
      language: data.language,
    });
  } catch (error) {
    console.error('Error fetching book by ISBN:', error);
    return null;
  }
}