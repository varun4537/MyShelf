
import React, { useState, useCallback } from 'react';
import { Book } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import SplashScreen from './components/SplashScreen';
import ScannerView from './components/ScannerView';
import LibraryView from './components/LibraryView';
import SettingsView from './components/SettingsView';
import StatsView from './components/StatsView';

type View = 'splash' | 'scanner' | 'library' | 'settings' | 'stats';

/**
 * Main Application Component
 * 
 * Orchestrates the primary view navigation and manages the global state
 * of the book collection using LocalStorage.
 */
const App: React.FC = () => {
  const [view, setView] = useState<View>('splash');
  const [books, setBooks] = useLocalStorage<Book[]>('my-shelf-books', []);

  const addBook = useCallback((newBook: Book) => {
    setBooks(prevBooks => {
      if (prevBooks.some(book => book.isbn === newBook.isbn)) {
        return prevBooks;
      }
      return [newBook, ...prevBooks];
    });
  }, [setBooks]);

  const deleteBook = useCallback((isbn: string) => {
    setBooks(prevBooks => prevBooks.filter(book => book.isbn !== isbn));
  }, [setBooks]);

  const updateBook = useCallback((updatedBook: Book) => {
    setBooks(prevBooks => prevBooks.map(book => book.isbn === updatedBook.isbn ? updatedBook : book));
  }, [setBooks]);

  const clearAllData = useCallback(() => {
    setBooks([]);
    setView('library');
  }, [setBooks]);

  const renderView = () => {
    switch (view) {
      case 'splash':
        return <SplashScreen onStart={() => setView('scanner')} />;
      case 'scanner':
        return (
          <ScannerView
            onStop={() => setView('library')}
            onAddBook={addBook}
            existingISBNs={books.map(b => b.isbn)}
          />
        );
      case 'library':
        return (
          <LibraryView
            books={books}
            onScanMore={() => setView('scanner')}
            onDeleteBook={deleteBook}
            onUpdateBook={updateBook}
            onOpenSettings={() => setView('settings')}
            onAddBook={addBook}
            onOpenStats={() => setView('stats')}
          />
        );
      case 'settings':
        return (
          <SettingsView
            books={books}
            onBack={() => setView('library')}
            onClearData={clearAllData}
          />
        );
      case 'stats':
        return (
          <StatsView
            books={books}
            onBack={() => setView('library')}
          />
        );
      default:
        return <SplashScreen onStart={() => setView('scanner')} />;
    }
  };

  return (
    <div className="min-h-screen w-full" style={{ background: 'var(--color-bg)' }}>
      {renderView()}
    </div>
  );
};

export default App;