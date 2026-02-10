import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, BookOpen, Calendar, Heart, Share2 } from 'lucide-react';
import { Book } from '../types';

interface BookDetailViewProps {
    book: Book;
    onClose: () => void;
    onUpdate: (book: Book) => void;
}

const BookDetailView: React.FC<BookDetailViewProps> = ({ book, onClose, onUpdate }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 bg-white overflow-y-auto"
        >
            {/* Header Image Section */}
            <div className="relative h-[45vh] w-full">
                {/* Navigation Bar */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
                    <button
                        onClick={onClose}
                        className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/30 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex gap-3">
                        <button
                            className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/30 transition-colors"
                            onClick={() => onUpdate({ ...book, favorite: !book.favorite })}
                        >
                            <Heart className={`w-6 h-6 ${book.favorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                        <button className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/30 transition-colors">
                            <Share2 className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Hero Image with Shared Layout ID */}
                <motion.div
                    layoutId={`book-cover-${book.isbn}`}
                    className="absolute inset-0 w-full h-full"
                >
                    <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                </motion.div>

                {/* Title Overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold mb-2 shadow-sm leading-tight"
                    >
                        {book.title}
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg text-white/90 font-medium"
                    >
                        {book.authors.join(', ')}
                    </motion.p>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-6 py-8 pb-32">
                {/* Tags/Genres - Moved to Top */}
                {book.genre && book.genre.length > 0 && (
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                            {book.genre.map((g, i) => (
                                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium uppercase tracking-wide">
                                    {g}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Description */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">About the Book</h3>
                    <p className="text-gray-600 leading-relaxed text-[15px]">
                        {book.description || 'No description available.'}
                    </p>
                </div>
            </div>

            {/* Bottom Action Bar - Status Buttons */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-2 pb-8 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button
                    onClick={() => onUpdate({ ...book, readingStatus: 'unread' })}
                    className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${book.readingStatus === 'unread' || book.readingStatus === 'wishlist'
                            ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 scale-[1.02]'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    To Read
                </button>
                <button
                    onClick={() => onUpdate({ ...book, readingStatus: 'reading' })}
                    className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${book.readingStatus === 'reading'
                            ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 scale-[1.02]'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Reading
                </button>
                <button
                    onClick={() => onUpdate({ ...book, readingStatus: 'read' })}
                    className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${book.readingStatus === 'read'
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-[1.02]'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Read
                </button>
            </div>
        </motion.div>
    );
};

export default BookDetailView;
