import React from 'react';
import { motion } from 'framer-motion';
import { Book, ReadingStatus } from '../types';

interface BookCardProps {
  book: Book;
  onDelete: (isbn: string) => void;
  onUpdate: (book: Book) => void;
  onClick: () => void;
}

const STATUS_EMOJI: Record<ReadingStatus, string> = {
  unread: '📚',
  reading: '📖',
  read: '✅',
  wishlist: '🎁',
};

const BookCard: React.FC<BookCardProps> = ({ book, onDelete, onUpdate, onClick }) => {
  const [imageError, setImageError] = React.useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({ ...book, favorite: !book.favorite });
  };

  return (
    <motion.div
      className="group cursor-pointer"
      onClick={onClick}
      layoutId={`book-card-${book.isbn}`}
    >
      {/* Card Container with shadow */}
      <div
        className="relative aspect-[2/3] rounded-xl overflow-hidden transition-all duration-300 transform group-hover:-translate-y-1"
        style={{
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--color-border)'
        }}
      >
        {/* Cover Image */}
        <motion.div layoutId={`book-cover-${book.isbn}`} className="w-full h-full">
          <img
            src={imageError ? 'https://via.placeholder.com/200x300/1a1a1c/666?text=No+Cover' : book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </motion.div>

        {/* Status Badge - Top Left */}
        <div className="absolute top-2 left-2 glass px-2 py-1 rounded-lg text-sm">
          {STATUS_EMOJI[book.readingStatus]}
        </div>

        {/* Favorite Badge - Top Right */}
        {book.favorite && (
          <div className="absolute top-2 right-2 text-lg drop-shadow-lg">
            ❤️
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick Favorite Button on Hover */}
        <button
          onClick={handleFavoriteClick}
          className="absolute bottom-3 right-3 w-8 h-8 glass rounded-full flex items-center justify-center opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        >
          {book.favorite ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Book Info - Below card */}
      <div className="mt-3 px-1">
        {/* Rating Stars */}
        {book.rating ? (
          <div className="flex items-center gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} className="text-xs">
                {star <= book.rating! ? '⭐' : '☆'}
              </span>
            ))}
          </div>
        ) : (
          <div className="h-4 mb-1" />
        )}

        {/* Title */}
        <h3 className="font-semibold text-sm leading-tight line-clamp-2" style={{ color: 'var(--color-text)' }}>
          {book.title}
        </h3>

        {/* Author */}
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
          {book.authors.join(', ')}
        </p>
      </div>
    </motion.div>
  );
};

export default BookCard;
