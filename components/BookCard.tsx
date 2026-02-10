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
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Card Container with enhanced shadow */}
      <div
        className="relative aspect-[2/3] rounded-xl overflow-hidden transition-all duration-300"
        style={{
          boxShadow: 'var(--shadow-lg)', // Base shadow increased
          backgroundColor: 'var(--color-surface)',
        }}
      >
        {/* Cover Image */}
        <motion.div layoutId={`book-cover-${book.isbn}`} className="w-full h-full">
          <img
            src={imageError ? 'https://via.placeholder.com/200x300/1a1a1c/666?text=No+Cover' : book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        </motion.div>

        {/* Hover Shadow Overlay - creates depth on hover */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)' }}
        />

        {/* Favorite Badge - Top Right */}

        {/* Favorite Badge - Top Right */}
        {book.favorite && (
          <div className="absolute top-2 right-2 text-lg drop-shadow-md animate-pulse-slow">
            ❤️
          </div>
        )}

        {/* Gradient Overlay - Smooth readability gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick Favorite Button on Hover */}
        <button
          onClick={handleFavoriteClick}
          className="absolute bottom-3 right-3 w-8 h-8 glass rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
          style={{ backdropFilter: 'blur(4px)' }}
        >
          {book.favorite ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Book Info - Improved Typography Hierarchy */}
      <div className="mt-3 px-1">
        {/* Rating Stars */}
        {book.rating ? (
          <div className="flex items-center gap-0.5 mb-1.5">
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} className="text-xs">
                {star <= book.rating! ? '⭐' : '☆'}
              </span>
            ))}
          </div>
        ) : (
          <div className="h-4 mb-1.5" />
        )}

        {/* Title - Bolder and Clearer */}
        <h3
          className="font-bold text-sm leading-tight line-clamp-2 mb-1"
          style={{ color: 'var(--color-text)' }}
          title={book.title}
        >
          {book.title}
        </h3>

        {/* Author - Muted and Distinct */}
        <p
          className="text-xs font-medium truncate"
          style={{ color: 'var(--color-text-secondary)', opacity: 0.9 }}
        >
          {book.authors.join(', ')}
        </p>
      </div>
    </motion.div>
  );
};

export default BookCard;
