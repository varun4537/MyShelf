import { Book } from '../types';
import { getAuthToken } from './authService';

const buildAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchBooks = async (): Promise<Book[]> => {
    const response = await fetch('/api/library', {
        headers: buildAuthHeaders()
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch library');
    }

    return response.json();
};

export const addBookRemote = async (book: Book): Promise<void> => {
    const response = await fetch('/api/library', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...buildAuthHeaders()
        },
        body: JSON.stringify(book)
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Unauthorized');
        }
        throw new Error('Failed to add book');
    }
};

export const updateBookRemote = async (book: Book): Promise<void> => {
    const response = await fetch(`/api/library/${book.isbn}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...buildAuthHeaders()
        },
        body: JSON.stringify(book)
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Unauthorized');
        }
        throw new Error('Failed to update book');
    }
};

export const deleteBookRemote = async (isbn: string): Promise<void> => {
    const response = await fetch(`/api/library/${isbn}`, {
        method: 'DELETE',
        headers: buildAuthHeaders()
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Unauthorized');
        }
        throw new Error('Failed to delete book');
    }
};

export const deleteAllBooksRemote = async (): Promise<void> => {
    const response = await fetch('/api/library', {
        method: 'DELETE',
        headers: buildAuthHeaders()
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Unauthorized');
        }
        throw new Error('Failed to clear library');
    }
};