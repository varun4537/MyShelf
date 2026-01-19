import React, { useState } from 'react';
import { Book, ReadingStatus } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface BookDetailsModalProps {
    book: Book;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (book: Book) => void;
    onDelete: (isbn: string) => void;
}

const STATUS_OPTIONS: { value: ReadingStatus; label: string; emoji: string }[] = [
    { value: 'unread', label: 'Unread', emoji: '📚' },
    { value: 'reading', label: 'Reading', emoji: '📖' },
    { value: 'read', label: 'Read', emoji: '✅' },
    { value: 'wishlist', label: 'Wishlist', emoji: '🎁' },
];

const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
    book,
    isOpen,
    onClose,
    onUpdate,
    onDelete
}) => {
    const [editedBook, setEditedBook] = useState<Book>(book);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!isOpen) return null;

    const handleStatusChange = (status: ReadingStatus) => {
        const updated = { ...editedBook, readingStatus: status };
        setEditedBook(updated);
        onUpdate(updated);
    };

    const handleRatingChange = (rating: number) => {
        const newRating = editedBook.rating === rating ? null : rating;
        const updated = { ...editedBook, rating: newRating };
        setEditedBook(updated);
        onUpdate(updated);
    };

    const handleFavoriteToggle = () => {
        const updated = { ...editedBook, favorite: !editedBook.favorite };
        setEditedBook(updated);
        onUpdate(updated);
    };

    const handleNotesChange = (notes: string) => {
        setEditedBook({ ...editedBook, notes });
    };

    const handleNotesSave = () => {
        onUpdate(editedBook);
    };

    const handleDelete = () => {
        onDelete(book.isbn);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-2xl overflow-hidden animate-slide-up"
                style={{ background: 'var(--color-surface)' }}
            >
                {/* Header with cover image */}
                <div className="relative h-48" style={{ background: 'linear-gradient(to bottom, var(--color-primary-glow), transparent)' }}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-black/30 transition z-10"
                        style={{ color: 'var(--color-text)' }}
                    >
                        ✕
                    </button>

                    {/* Book Cover */}
                    <div className="absolute -bottom-12 left-6">
                        <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-24 h-36 object-cover rounded-lg shadow-2xl"
                            style={{ border: '2px solid var(--color-primary)' }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x225?text=No+Cover';
                            }}
                        />
                    </div>

                    {/* Favorite Button */}
                    <button
                        onClick={handleFavoriteToggle}
                        className="absolute bottom-4 right-6 text-3xl transition-transform hover:scale-110"
                    >
                        {editedBook.favorite ? '❤️' : '🤍'}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 pt-16 overflow-y-auto max-h-[60vh]">
                    {/* Title & Author */}
                    <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>{book.title}</h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                        {book.authors.join(', ')} • {book.pageCount || '?'} pages
                    </p>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {book.genre.map(g => (
                            <span key={g} className="px-2 py-1 glass rounded-full text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                {g}
                            </span>
                        ))}
                    </div>

                    {/* Description */}
                    <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        {book.description || 'No description available.'}
                    </p>

                    {/* Reading Status */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Reading Status</h3>
                        <div className="flex gap-2 flex-wrap">
                            {STATUS_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleStatusChange(opt.value)}
                                    className={`px-3 py-2 rounded-full text-sm font-medium transition ${editedBook.readingStatus === opt.value
                                            ? 'btn-primary'
                                            : 'glass-button'
                                        }`}
                                    style={{ color: editedBook.readingStatus === opt.value ? 'white' : 'var(--color-text)' }}
                                >
                                    {opt.emoji} {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Rating</h3>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => handleRatingChange(star)}
                                    className="text-2xl transition-transform hover:scale-110"
                                >
                                    {editedBook.rating && star <= editedBook.rating ? '⭐' : '☆'}
                                </button>
                            ))}
                            {editedBook.rating && (
                                <span className="ml-2 text-sm self-center" style={{ color: 'var(--color-text-secondary)' }}>
                                    {editedBook.rating}/5
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Personal Notes</h3>
                        <textarea
                            value={editedBook.notes}
                            onChange={(e) => handleNotesChange(e.target.value)}
                            onBlur={handleNotesSave}
                            placeholder="Add your thoughts about this book..."
                            className="w-full h-24 glass rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            style={{ color: 'var(--color-text)' }}
                        />
                    </div>

                    {/* ISBN & Date Added */}
                    <div className="text-xs mb-6" style={{ color: 'var(--color-text-muted)' }}>
                        <p>ISBN: {book.isbn}</p>
                        <p>Added: {new Date(book.dateAdded).toLocaleDateString()}</p>
                    </div>

                    {/* Delete Button */}
                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full py-3 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/30 transition"
                        >
                            <TrashIcon className="w-5 h-5" />
                            Remove from Library
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 glass-button rounded-xl"
                                style={{ color: 'var(--color-text)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookDetailsModal;
