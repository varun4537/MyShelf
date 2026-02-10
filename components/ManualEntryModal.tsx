import React, { useState } from 'react';
import { Book, createBook } from '../types';
import { fetchBookByISBN } from '../services/geminiService';

interface ManualEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddBook: (book: Book) => void;
    existingISBNs: string[];
}

const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
    isOpen,
    onClose,
    onAddBook,
    existingISBNs
}) => {
    const [mode, setMode] = useState<'search' | 'manual'>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Manual form state
    const [title, setTitle] = useState('');
    const [authors, setAuthors] = useState('');
    const [genre, setGenre] = useState('');
    const [description, setDescription] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [isbn, setIsbn] = useState('');

    if (!isOpen) return null;

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setError(null);

        try {
            // Check if it's an ISBN
            const cleanQuery = searchQuery.replace(/[-\s]/g, '');
            if (/^\d{10,13}$/.test(cleanQuery)) {
                if (existingISBNs.includes(cleanQuery)) {
                    setError('This book is already in your library');
                    setIsSearching(false);
                    return;
                }

                const book = await fetchBookByISBN(cleanQuery);
                if (book) {
                    // Populate form instead of auto-adding
                    setIsbn(book.isbn);
                    setTitle(book.title);
                    setAuthors(book.authors.join(', '));
                    setGenre(book.genre.join(', '));
                    setDescription(book.description);
                    setCoverUrl(book.coverUrl);

                    setMode('manual');
                    setError(null); // Clear any errors
                    return;
                }
            }

            setError('Book not found. Try entering details manually.');
            setMode('manual');
        } catch (err) {
            setError('Search failed. Please try manual entry.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleManualSubmit = () => {
        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        const book = createBook({
            isbn: isbn.trim() || `MANUAL-${Date.now()}`,
            title: title.trim(),
            authors: authors.split(',').map(a => a.trim()).filter(Boolean) || ['Unknown Author'],
            genre: genre.split(',').map(g => g.trim()).filter(Boolean) || ['Uncategorized'],
            description: description.trim() || `${title} by ${authors || 'Unknown Author'}`,
            coverUrl: coverUrl.trim() || 'https://via.placeholder.com/200x300/1a1a1c/666?text=No+Cover',
            dateAdded: new Date().toISOString(),
            pageCount: 0,
        });

        onAddBook(book);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && mode === 'search') {
            handleSearch();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div
                className="relative w-full max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-2xl overflow-hidden animate-slide-up"
                style={{ background: 'var(--color-surface)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Add Book</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 glass rounded-full flex items-center justify-center"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        ✕
                    </button>
                </div>

                {/* Mode Tabs */}
                <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                        onClick={() => setMode('search')}
                        className={`flex-1 py-3 text-sm font-medium transition ${mode === 'search' ? 'border-b-2' : ''
                            }`}
                        style={{
                            color: mode === 'search' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            borderColor: mode === 'search' ? 'var(--color-primary)' : 'transparent'
                        }}
                    >
                        🔍 Search by ISBN
                    </button>
                    <button
                        onClick={() => setMode('manual')}
                        className={`flex-1 py-3 text-sm font-medium transition ${mode === 'manual' ? 'border-b-2' : ''
                            }`}
                        style={{
                            color: mode === 'manual' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            borderColor: mode === 'manual' ? 'var(--color-primary)' : 'transparent'
                        }}
                    >
                        ✏️ Enter Manually
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {mode === 'search' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                    Enter ISBN
                                </label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="978-0-123456-78-9"
                                    autoFocus
                                    className="w-full glass rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    style={{ color: 'var(--color-text)' }}
                                />
                            </div>

                            <button
                                onClick={handleSearch}
                                disabled={isSearching || !searchQuery.trim()}
                                className="w-full py-3 btn-primary rounded-xl font-medium disabled:opacity-50"
                            >
                                {isSearching ? 'Searching...' : 'Search'}
                            </button>

                            <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                Or switch to Manual Entry to add without ISBN
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                    Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="The Great Gatsby"
                                    autoFocus
                                    className="w-full glass rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    style={{ color: 'var(--color-text)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                    Author(s) <span style={{ color: 'var(--color-text-muted)' }}>(comma separated)</span>
                                </label>
                                <input
                                    type="text"
                                    value={authors}
                                    onChange={e => setAuthors(e.target.value)}
                                    placeholder="F. Scott Fitzgerald"
                                    className="w-full glass rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    style={{ color: 'var(--color-text)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                    Genre(s) <span style={{ color: 'var(--color-text-muted)' }}>(comma separated)</span>
                                </label>
                                <input
                                    type="text"
                                    value={genre}
                                    onChange={e => setGenre(e.target.value)}
                                    placeholder="Fiction, Classic"
                                    className="w-full glass rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    style={{ color: 'var(--color-text)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Brief description..."
                                    rows={2}
                                    className="w-full glass rounded-xl py-3 px-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    style={{ color: 'var(--color-text)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                    Cover Image URL <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
                                </label>
                                <input
                                    type="url"
                                    value={coverUrl}
                                    onChange={e => setCoverUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full glass rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    style={{ color: 'var(--color-text)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                    ISBN <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={isbn}
                                    onChange={e => setIsbn(e.target.value)}
                                    placeholder="978-0-123456-78-9"
                                    className="w-full glass rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    style={{ color: 'var(--color-text)' }}
                                />
                            </div>

                            <button
                                onClick={handleManualSubmit}
                                disabled={!title.trim()}
                                className="w-full py-3 btn-primary rounded-xl font-medium disabled:opacity-50"
                            >
                                Add to Library
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManualEntryModal;
