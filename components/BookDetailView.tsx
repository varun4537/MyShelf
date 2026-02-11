import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, BookOpen, Calendar, Heart, Share2 } from 'lucide-react';
import { Book } from '../types';

interface BookDetailViewProps {
    book: Book;
    allBooks?: Book[]; // Optional to support legacy usage
    onClose: () => void;
    onUpdate: (book: Book) => void;
    onSelectBook?: (book: Book) => void;
}

const BookDetailView: React.FC<BookDetailViewProps> = ({ book, allBooks = [], onClose, onUpdate, onSelectBook }) => {
    // Cross-reference suggestions: Same author
    const relatedBooks = React.useMemo(() => {
        if (!allBooks.length) return [];
        return allBooks.filter(b =>
            b.isbn !== book.isbn &&
            b.authors.some(author => book.authors.includes(author))
        );
    }, [book, allBooks]);

    const unreadRelated = relatedBooks.filter(b => b.readingStatus === 'unread').length;

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
                    {/* Series Badge */}
                    {book.series && (
                        <div className="inline-flex items-center gap-2 mb-3 bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full">
                            <BookOpen className="w-3 h-3 text-emerald-300" />
                            <span className="text-xs font-semibold tracking-wide text-white">
                                {book.series} {book.seriesOrder ? `#${book.seriesOrder}` : ''}
                            </span>
                        </div>
                    )}

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
                {/* Stats Row */}
                <div className="flex justify-between items-center mb-8 bg-gray-50 p-4 rounded-xl">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">PAGES</p>
                        <p className="font-semibold text-gray-900">{book.pageCount || '-'}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">RATING</p>
                        <div className="flex items-center gap-1 justify-center">
                            <span className="font-semibold text-gray-900">{book.rating || '-'}</span>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </div>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">PUBLISHED</p>
                        <p className="font-semibold text-gray-900">{book.publishYear || '-'}</p>
                    </div>
                </div>

                {/* Tags/Genres */}
                {book.genre && book.genre.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider opacity-70">Genres</h3>
                        <div className="flex flex-wrap gap-2">
                            {book.genre.map((g, i) => (
                                <span key={i} className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors cursor-default">
                                    {g}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Description */}
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">About the Book</h3>
                    <p className="text-gray-600 leading-relaxed text-[15px]">
                        {book.description || 'No description available.'}
                    </p>
                </div>

                {/* Cross-Reference: More by Author */}
                {relatedBooks.length > 0 && (
                    <div className="mb-8 p-5 bg-teal-50/50 rounded-2xl border border-teal-100">
                        <div className="flex justify-between items-baseline mb-4">
                            <h3 className="text-base font-bold text-teal-900">
                                More by {book.authors[0]}
                            </h3>
                            {unreadRelated > 0 && (
                                <span className="text-xs font-medium bg-teal-200/50 text-teal-800 px-2 py-0.5 rounded-full">
                                    {unreadRelated} unread
                                </span>
                            )}
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
                            {relatedBooks.map(relBook => (
                                <div
                                    key={relBook.isbn}
                                    onClick={() => onSelectBook?.(relBook)}
                                    className="flex-shrink-0 w-24 cursor-pointer group"
                                >
                                    <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-sm mb-2 group-hover:shadow-md transition-shadow">
                                        <img
                                            src={relBook.coverUrl}
                                            alt={relBook.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight group-hover:text-teal-700">
                                        {relBook.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
