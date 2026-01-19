import React, { useMemo } from 'react';
import { Book } from '../types';

interface StatsViewProps {
    books: Book[];
    onBack: () => void;
}

const StatsView: React.FC<StatsViewProps> = ({ books, onBack }) => {
    // Calculate stats
    const stats = useMemo(() => {
        const byStatus = {
            unread: books.filter(b => b.readingStatus === 'unread').length,
            reading: books.filter(b => b.readingStatus === 'reading').length,
            read: books.filter(b => b.readingStatus === 'read').length,
            wishlist: books.filter(b => b.readingStatus === 'wishlist').length,
        };

        // Genre breakdown
        const genreCounts: Record<string, number> = {};
        books.forEach(book => {
            book.genre.forEach(g => {
                genreCounts[g] = (genreCounts[g] || 0) + 1;
            });
        });
        const topGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

        // Author breakdown
        const authorCounts: Record<string, number> = {};
        books.forEach(book => {
            book.authors.forEach(a => {
                authorCounts[a] = (authorCounts[a] || 0) + 1;
            });
        });
        const topAuthors = Object.entries(authorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Rating distribution
        const ratingCounts = [0, 0, 0, 0, 0];
        books.forEach(book => {
            if (book.rating) ratingCounts[book.rating - 1]++;
        });

        // Monthly activity
        const monthlyActivity: Record<string, number> = {};
        books.forEach(book => {
            const month = new Date(book.dateAdded).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            monthlyActivity[month] = (monthlyActivity[month] || 0) + 1;
        });

        return { byStatus, topGenres, topAuthors, ratingCounts, monthlyActivity };
    }, [books]);

    const maxGenreCount = Math.max(...stats.topGenres.map(g => g[1]), 1);
    const totalBooks = books.length;
    const readPercent = totalBooks ? Math.round((stats.byStatus.read / totalBooks) * 100) : 0;

    return (
        <div className="min-h-screen p-6" style={{ background: 'var(--color-bg)' }}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="w-10 h-10 glass-button rounded-full flex items-center justify-center"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-text)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Statistics</h1>
            </div>

            {books.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📊</div>
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>No Data Yet</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                        Add some books to see your reading statistics
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Reading Progress */}
                    <section className="surface rounded-2xl p-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>
                            Reading Progress
                        </h2>
                        <div className="flex items-center gap-6">
                            {/* Circular Progress */}
                            <div className="relative w-24 h-24 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="48" cy="48" r="40"
                                        fill="none"
                                        stroke="var(--color-border)"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="48" cy="48" r="40"
                                        fill="none"
                                        stroke="var(--color-primary)"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${readPercent * 2.51} 251`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{readPercent}%</span>
                                </div>
                            </div>

                            {/* Status Breakdown */}
                            <div className="flex-grow space-y-2">
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--color-text-secondary)' }}>📚 Unread</span>
                                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>{stats.byStatus.unread}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--color-text-secondary)' }}>📖 Reading</span>
                                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>{stats.byStatus.reading}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--color-text-secondary)' }}>✅ Read</span>
                                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>{stats.byStatus.read}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--color-text-secondary)' }}>🎁 Wishlist</span>
                                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>{stats.byStatus.wishlist}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Genre Breakdown */}
                    {stats.topGenres.length > 0 && (
                        <section className="surface rounded-2xl p-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>
                                By Genre
                            </h2>
                            <div className="space-y-3">
                                {stats.topGenres.map(([genre, count]) => (
                                    <div key={genre}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span style={{ color: 'var(--color-text)' }}>{genre}</span>
                                            <span style={{ color: 'var(--color-text-secondary)' }}>{count}</span>
                                        </div>
                                        <div className="h-2 rounded-full" style={{ background: 'var(--color-border)' }}>
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${(count / maxGenreCount) * 100}%`,
                                                    background: 'var(--color-primary)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Top Authors */}
                    {stats.topAuthors.length > 0 && (
                        <section className="surface rounded-2xl p-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>
                                Top Authors
                            </h2>
                            <div className="space-y-3">
                                {stats.topAuthors.map(([author, count], i) => (
                                    <div key={author} className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--color-primary)', color: 'white' }}>
                                            {i + 1}
                                        </span>
                                        <span className="flex-grow truncate" style={{ color: 'var(--color-text)' }}>{author}</span>
                                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{count} books</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Rating Distribution */}
                    <section className="surface rounded-2xl p-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>
                            Your Ratings
                        </h2>
                        <div className="flex justify-between items-end h-20 gap-2">
                            {[5, 4, 3, 2, 1].map((star, i) => {
                                const count = stats.ratingCounts[star - 1];
                                const maxRating = Math.max(...stats.ratingCounts, 1);
                                return (
                                    <div key={star} className="flex-1 flex flex-col items-center gap-1">
                                        <div
                                            className="w-full rounded-t transition-all"
                                            style={{
                                                height: `${(count / maxRating) * 100}%`,
                                                minHeight: count > 0 ? '8px' : '2px',
                                                background: count > 0 ? 'var(--color-primary)' : 'var(--color-border)'
                                            }}
                                        />
                                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{'⭐'.repeat(star)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Library Summary */}
                    <section className="surface rounded-2xl p-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>
                            Library Summary
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{totalBooks}</div>
                                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Books</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{books.filter(b => b.favorite).length}</div>
                                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Favorites</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{stats.topGenres.length}</div>
                                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Genres</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{stats.topAuthors.length}</div>
                                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Authors</div>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default StatsView;
