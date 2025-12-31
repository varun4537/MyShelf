
import React, { useState, useMemo } from 'react';
import { Book } from '../types';
import { exportToCSV, exportToJSON } from '../utils/export';
import { GridIcon } from './icons/GridIcon';
import { ListIcon } from './icons/ListIcon';
import { SearchIcon } from './icons/SearchIcon';
import { PlusIcon } from './icons/PlusIcon';
import BookCard from './BookCard';
import BookListItem from './BookListItem';
import { SortIcon } from './icons/SortIcon';

interface LibraryViewProps {
  books: Book[];
  onScanMore: () => void;
  onDeleteBook: (isbn: string) => void;
  onUpdateBook: (book: Book) => void;
}

type ViewMode = 'grid' | 'list';
type SortKey = 'dateAdded' | 'title' | 'author';

/**
 * LibraryView Component
 * Displays the collection of books with options to search, sort, and switch view modes.
 */
const LibraryView: React.FC<LibraryViewProps> = ({ books, onScanMore, onDeleteBook, onUpdateBook }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('dateAdded');
  const [sortAsc, setSortAsc] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  /**
   * Memosized filtered and sorted list of books.
   * Handles text search against Title and Authors.
   * Handles sorting by Date, Title, or Author.
   */
  const filteredAndSortedBooks = useMemo(() => {
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return filtered.sort((a, b) => {
      let compareA: string | number;
      let compareB: string | number;

      if (sortKey === 'author') {
        compareA = a.authors[0] || '';
        compareB = b.authors[0] || '';
      } else if (sortKey === 'title') {
        compareA = a.title;
        compareB = b.title;
      } else { // dateAdded
        compareA = new Date(a.dateAdded).getTime();
        compareB = new Date(b.dateAdded).getTime();
      }
      
      if (compareA < compareB) return sortAsc ? -1 : 1;
      if (compareA > compareB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [books, searchTerm, sortKey, sortAsc]);
  
  const handleSortChange = (key: SortKey) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'title' || key === 'author'); // Default ASC for text, DESC for date
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <header className="sticky top-4 z-10 bg-[#0d0d0f]/50 backdrop-blur-xl p-4 rounded-2xl border border-white/10 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">MyShelf</h1>
          <div className="relative w-full sm:w-auto">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search title or author..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/15 rounded-full py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#E8A04C]"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 gap-4">
            <div className="flex items-center gap-2">
                <button onClick={() => handleSortChange('dateAdded')} className={`px-3 py-1 text-sm rounded-full transition ${sortKey === 'dateAdded' ? 'bg-[#E8A04C] text-black' : 'bg-white/10'}`}><SortIcon className="inline w-4 h-4 mr-1"/> Date</button>
                <button onClick={() => handleSortChange('title')} className={`px-3 py-1 text-sm rounded-full transition ${sortKey === 'title' ? 'bg-[#E8A04C] text-black' : 'bg-white/10'}`}><SortIcon className="inline w-4 h-4 mr-1"/> Title</button>
                <button onClick={() => handleSortChange('author')} className={`px-3 py-1 text-sm rounded-full transition ${sortKey === 'author' ? 'bg-[#E8A04C] text-black' : 'bg-white/10'}`}><SortIcon className="inline w-4 h-4 mr-1"/> Author</button>
            </div>
            <div className="flex items-center bg-white/10 rounded-full p-1">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-full ${viewMode === 'grid' ? 'bg-[#E8A04C]' : ''}`}>
                    <GridIcon className={`w-5 h-5 ${viewMode === 'grid' ? 'text-black' : 'text-gray-300'}`} />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-full ${viewMode === 'list' ? 'bg-[#E8A04C]' : ''}`}>
                    <ListIcon className={`w-5 h-5 ${viewMode === 'list' ? 'text-black' : 'text-gray-300'}`} />
                </button>
            </div>
        </div>
      </header>
      
      {filteredAndSortedBooks.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredAndSortedBooks.map(book => <BookCard key={book.isbn} book={book} onDelete={onDeleteBook} onUpdate={onUpdateBook} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedBooks.map(book => <BookListItem key={book.isbn} book={book} onDelete={onDeleteBook} onUpdate={onUpdateBook} />)}
          </div>
        )
      ) : (
         <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-white">Your Shelf is Empty</h2>
            <p className="text-gray-400 mt-2">Start scanning books to build your digital library.</p>
         </div>
      )}

      {/* FABs */}
      <div className="fixed bottom-6 right-6 flex flex-col items-center gap-4">
         <div className="relative">
             <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="w-14 h-14 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-white/20 transition"
                aria-label="Export options"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
             </button>
             {isExportMenuOpen && (
                <div className="absolute bottom-16 right-0 w-32 bg-[#1a1a1c] border border-white/20 rounded-lg shadow-xl py-1 animate-fade-in-up-fast">
                    <button onClick={() => { exportToJSON(books); setIsExportMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#E8A04C]/20">Export JSON</button>
                    <button onClick={() => { exportToCSV(books); setIsExportMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#E8A04C]/20">Export CSV</button>
                </div>
             )}
         </div>
         <button
            onClick={onScanMore}
            className="w-16 h-16 bg-[#E8A04C] text-[#0D0D0F] rounded-full flex items-center justify-center shadow-lg shadow-[#E8A04C]/30 hover:scale-105 transition transform"
            aria-label="Scan more books"
         >
            <PlusIcon className="w-8 h-8" />
         </button>
      </div>

    </div>
  );
};

export default LibraryView;