
export type ReadingStatus = 'unread' | 'reading' | 'read' | 'wishlist';

export interface Book {
  isbn: string;
  title: string;
  authors: string[];
  coverUrl: string;
  genre: string[];
  dateAdded: string;
  description: string;
  pageCount: number;
  source?: string;
  // V2 Enhanced fields
  readingStatus: ReadingStatus;
  rating: number | null;  // 1-5 stars, null if unrated
  notes: string;
  favorite: boolean;
  publisher?: string;
  publishYear?: number;
  language?: string;
}

/**
 * Creates a new book with default values for V2 fields
 */
export const createBook = (partial: Omit<Book, 'readingStatus' | 'rating' | 'notes' | 'favorite'>): Book => ({
  ...partial,
  readingStatus: 'unread',
  rating: null,
  notes: '',
  favorite: false,
});

/**
 * Migrates old book format to new format with V2 fields
 */
export const migrateBook = (book: any): Book => ({
  isbn: book.isbn || '',
  title: book.title || 'Unknown',
  authors: book.authors || [],
  coverUrl: book.coverUrl || '',
  genre: book.genre || [],
  dateAdded: book.dateAdded || new Date().toISOString(),
  description: book.description || '',
  pageCount: book.pageCount || 0,
  // Add V2 fields with defaults if missing
  readingStatus: book.readingStatus || 'unread',
  rating: book.rating ?? null,
  notes: book.notes || '',
  favorite: book.favorite || false,
  publisher: book.publisher,
  publishYear: book.publishYear,
  language: book.language,
});
