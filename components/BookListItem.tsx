import React from 'react';
import { Book, ReadingStatus } from '../types';

interface BookListItemProps {
  book: Book;
  onDelete: (isbn: string) => void;
  onUpdate: (book: Book) => void;
  onClick: () => void;
}

const STATUS_CONFIG: Record<ReadingStatus, { emoji: string }> = {
  unread: { emoji: '📚' },
  reading: { emoji: '📖' },
  read: { emoji: '✅' },
  wishlist: { emoji: '🎁' },
};

const BookListItem: React.FC<BookListItemProps> = ({ book, onDelete, onUpdate, onClick }) => {
  const [imageError, setImageError] = React.useState(false);
  const statusConfig = STATUS_CONFIG[book.readingStatus];

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({ ...book, favorite: !book.favorite });
  };

  return (
    <div
      className="flex items-center gap-4 p-3 surface rounded-xl cursor-pointer transition-all hover:bg-[var(--color-surface-hover)] active:scale-[0.99]"
      onClick={onClick}
    >
      {/* Cover */}
      <div className="relative flex-shrink-0">
        <img
          src={imageError ? 'https://via.placeholder.com/48x72?text=?' : book.coverUrl}
          alt={book.title}
          className="w-12 h-[72px] object-cover rounded-lg"
          onError={() => setImageError(true)}
        />
        <div className="absolute -top-1 -left-1 text-sm">
          {statusConfig.emoji}
        </div>
      </div>

      {/* Book Info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{book.title}</h3>
          {book.favorite && <span className="text-sm flex-shrink-0">❤️</span>}
        </div>
        <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{book.authors.join(', ')}</p>

        <div className="flex items-center gap-3 mt-1">
          {book.rating ? (
            <span className="text-xs text-yellow-500">
              {'⭐'.repeat(book.rating)}
            </span>
          ) : (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No rating</span>
          )}
          {book.genre.length > 0 && (
            <span className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
              {book.genre[0]}
            </span>
          )}
        </div>
      </div>

      {/* Favorite Toggle */}
      <button
        onClick={handleFavoriteClick}
        className="p-2 text-lg flex-shrink-0 hover:scale-110 transition-transform"
      >
        {book.favorite ? '❤️' : '🤍'}
      </button>
    </div>
  );
};

export default BookListItem;
