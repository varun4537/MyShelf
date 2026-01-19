import React, { useState, useMemo } from 'react';
import { Book, ReadingStatus } from '../types';
import { GridIcon } from './icons/GridIcon';
import { ListIcon } from './icons/ListIcon';
import { SearchIcon } from './icons/SearchIcon';
import { PlusIcon } from './icons/PlusIcon';
import BookCard from './BookCard';
import BookListItem from './BookListItem';
import BookDetailsModal from './BookDetailsModal';
import ManualEntryModal from './ManualEntryModal';

interface LibraryViewProps {
  books: Book[];
  onScanMore: () => void;
  onDeleteBook: (isbn: string) => void;
  onUpdateBook: (book: Book) => void;
  onOpenSettings: () => void;
  onAddBook: (book: Book) => void;
  onOpenStats: () => void;
}

type ViewMode = 'grid' | 'list';
type SortKey = 'dateAdded' | 'title' | 'author' | 'rating';

const FILTER_OPTIONS: { value: ReadingStatus | 'all' | 'favorites'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '📚' },
  { value: 'reading', label: 'Reading', emoji: '📖' },
  { value: 'unread', label: 'Unread', emoji: '📕' },
  { value: 'read', label: 'Read', emoji: '✅' },
  { value: 'favorites', label: 'Favorites', emoji: '❤️' },
];

const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  onScanMore,
  onDeleteBook,
  onUpdateBook,
  onOpenSettings,
  onAddBook,
  onOpenStats
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('dateAdded');
  const [sortAsc, setSortAsc] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | 'all' | 'favorites'>('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Stats
  const stats = useMemo(() => ({
    total: books.length,
    reading: books.filter(b => b.readingStatus === 'reading').length,
    read: books.filter(b => b.readingStatus === 'read').length,
  }), [books]);

  // Get filter counts
  const filterCounts = useMemo(() => ({
    all: books.length,
    reading: books.filter(b => b.readingStatus === 'reading').length,
    unread: books.filter(b => b.readingStatus === 'unread').length,
    read: books.filter(b => b.readingStatus === 'read').length,
    favorites: books.filter(b => b.favorite).length,
  }), [books]);

  // Filtered and sorted books
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books;

    if (statusFilter === 'favorites') {
      filtered = filtered.filter(book => book.favorite);
    } else if (statusFilter !== 'all') {
      filtered = filtered.filter(book => book.readingStatus === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(term) ||
        book.authors.some(author => author.toLowerCase().includes(term))
      );
    }

    return filtered.sort((a, b) => {
      let compareA: string | number;
      let compareB: string | number;

      switch (sortKey) {
        case 'author':
          compareA = a.authors[0] || '';
          compareB = b.authors[0] || '';
          break;
        case 'title':
          compareA = a.title;
          compareB = b.title;
          break;
        case 'rating':
          compareA = a.rating || 0;
          compareB = b.rating || 0;
          break;
        default:
          compareA = new Date(a.dateAdded).getTime();
          compareB = new Date(b.dateAdded).getTime();
      }

      if (compareA < compareB) return sortAsc ? -1 : 1;
      if (compareA > compareB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [books, searchTerm, sortKey, sortAsc, statusFilter]);

  const handleSortChange = (key: SortKey) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'title' || key === 'author');
    }
  };

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--color-bg)' }}>
      {/* Compact Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl border-b"
        style={{
          background: 'var(--color-bg)',
          borderColor: 'var(--color-border)'
        }}>
        <div className="px-4 pt-6 pb-4">
          {/* Title & Stats Row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>MyShelf</h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {stats.total} books • {stats.read} read • {stats.reading} reading
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Stats */}
              <button
                onClick={onOpenStats}
                className="w-10 h-10 glass-button rounded-full flex items-center justify-center"
              >
                <span className="text-lg">📊</span>
              </button>
              {/* Settings */}
              <button
                onClick={onOpenSettings}
                className="w-10 h-10 glass-button rounded-full flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-text-secondary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              {/* Search Toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showSearch ? 'btn-primary' : 'glass-button'
                  }`}
              >
                <SearchIcon className="w-5 h-5" style={{ color: showSearch ? 'white' : 'var(--color-text-secondary)' }} />
              </button>
              {/* View Toggle */}
              <div className="flex items-center glass rounded-full p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-full transition ${viewMode === 'grid' ? 'btn-primary' : ''}`}
                >
                  <GridIcon className="w-4 h-4" style={{ color: viewMode === 'grid' ? 'white' : 'var(--color-text-secondary)' }} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-full transition ${viewMode === 'list' ? 'btn-primary' : ''}`}
                >
                  <ListIcon className="w-4 h-4" style={{ color: viewMode === 'list' ? 'white' : 'var(--color-text-secondary)' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar - Collapsible */}
          {showSearch && (
            <div className="mb-4 animate-slide-down">
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full glass rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                style={{ color: 'var(--color-text)' }}
              />
            </div>
          )}

          {/* Filter Pills - Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
            {FILTER_OPTIONS.map(opt => {
              const count = filterCounts[opt.value as keyof typeof filterCounts] || 0;
              const isActive = statusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${isActive ? 'btn-primary' : 'glass-button'
                    }`}
                  style={{ color: isActive ? 'white' : 'var(--color-text)' }}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                  <span style={{ opacity: 0.7 }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Sort Pills */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>Sort:</span>
            {(['dateAdded', 'title', 'author', 'rating'] as SortKey[]).map(key => (
              <button
                key={key}
                onClick={() => handleSortChange(key)}
                className={`px-3 py-1 text-xs rounded-full transition whitespace-nowrap ${sortKey === key ? 'glass' : ''
                  }`}
                style={{
                  color: sortKey === key ? 'var(--color-text)' : 'var(--color-text-muted)'
                }}
              >
                {key === 'dateAdded' ? 'Recent' : key.charAt(0).toUpperCase() + key.slice(1)}
                {sortKey === key && (sortAsc ? ' ↑' : ' ↓')}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Book Grid/List */}
      <main className="px-4 pt-6">
        {filteredAndSortedBooks.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredAndSortedBooks.map(book => (
                <BookCard
                  key={book.isbn}
                  book={book}
                  onDelete={onDeleteBook}
                  onUpdate={onUpdateBook}
                  onClick={() => setSelectedBook(book)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedBooks.map(book => (
                <BookListItem
                  key={book.isbn}
                  book={book}
                  onDelete={onDeleteBook}
                  onUpdate={onUpdateBook}
                  onClick={() => setSelectedBook(book)}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
              {books.length === 0 ? 'Your Shelf is Empty' : 'No Books Found'}
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {books.length === 0
                ? 'Scan a barcode or add books manually'
                : 'Try adjusting your filters'}
            </p>
            {books.length === 0 && (
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={onScanMore}
                  className="px-6 py-3 btn-primary rounded-full font-semibold"
                >
                  📷 Scan Barcode
                </button>
                <button
                  onClick={() => setShowManualEntry(true)}
                  className="px-6 py-3 glass-button rounded-full font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  ✏️ Add Manually
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FAB with Menu */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3">
        {/* FAB Menu */}
        {showFabMenu && (
          <div className="flex flex-col gap-2 mb-2 animate-slide-up">
            <button
              onClick={() => { setShowManualEntry(true); setShowFabMenu(false); }}
              className="flex items-center gap-3 px-4 py-3 glass rounded-full shadow-lg"
              style={{ color: 'var(--color-text)' }}
            >
              <span>✏️</span>
              <span className="text-sm font-medium">Add Manually</span>
            </button>
            <button
              onClick={() => { onScanMore(); setShowFabMenu(false); }}
              className="flex items-center gap-3 px-4 py-3 glass rounded-full shadow-lg"
              style={{ color: 'var(--color-text)' }}
            >
              <span>📷</span>
              <span className="text-sm font-medium">Scan Barcode</span>
            </button>
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setShowFabMenu(!showFabMenu)}
          className={`w-14 h-14 btn-primary rounded-full flex items-center justify-center transition-all ${showFabMenu ? 'rotate-45' : ''
            }`}
          aria-label="Add book"
        >
          <PlusIcon className="w-7 h-7" />
        </button>
      </div>

      {/* Backdrop when FAB menu is open */}
      {showFabMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowFabMenu(false)}
        />
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
          onUpdate={(updated) => {
            onUpdateBook(updated);
            setSelectedBook(updated);
          }}
          onDelete={onDeleteBook}
        />
      )}

      {/* Manual Entry Modal */}
      <ManualEntryModal
        isOpen={showManualEntry}
        onClose={() => setShowManualEntry(false)}
        onAddBook={onAddBook}
        existingISBNs={books.map(b => b.isbn)}
      />
    </div>
  );
};

export default LibraryView;