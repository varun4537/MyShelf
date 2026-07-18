import React from 'react';
import { Heart } from 'lucide-react';
import { Book } from '../types';
import { StatusIcon, RatingStars } from './StatusIcon';

interface BookListItemProps {
  book: Book;
  onDelete: (isbn: string) => void;
  onUpdate: (book: Book) => void;
  onClick: () => void;
}

const BookListItem: React.FC<BookListItemProps> = ({ book, onDelete, onUpdate, onClick }) => {
  const [imageError, setImageError] = React.useState(false);

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
        <div className="absolute -top-1.5 -left-1.5 bg-black/60 backdrop-blur-md rounded-full p-1 border border-white/10 flex items-center justify-center">
          <StatusIcon status={book.readingStatus} className="w-3 h-3" />
        </div>
      </div>

      {/* Book Info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{book.title}</h3>
          {book.favorite && (
            <Heart className="w-3.5 h-3.5 flex-shrink-0 text-red-500" fill="currentColor" />
          )}
        </div>
        <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{book.authors.join(', ')}</p>

        <div className="flex items-center gap-3 mt-1">
          {book.rating ? (
            <RatingStars rating={book.rating} className="w-3 h-3" />
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
        className="p-2 flex-shrink-0 hover:scale-110 transition-transform"
      >
        <Heart
          className={`w-5 h-5 ${book.favorite ? 'text-red-500' : ''}`}
          fill={book.favorite ? 'currentColor' : 'none'}
          style={book.favorite ? undefined : { color: 'var(--color-text-muted)' }}
          strokeWidth={2}
        />
      </button>
    </div>
  );
};

export default BookListItem;
