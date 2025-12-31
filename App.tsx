
import React, { useState, useCallback } from 'react';
import { Book } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import SplashScreen from './components/SplashScreen';
import ScannerView from './components/ScannerView';
import LibraryView from './components/LibraryView';

type View = 'splash' | 'scanner' | 'library';

/**
 * Main Application Component
 * 
 * Orchestrates the primary view navigation (Splash -> Scanner -> Library) and
 * manages the global state of the book collection using LocalStorage.
 */
const App: React.FC = () => {
  const [view, setView] = useState<View>('splash');
  // Persist books to localStorage to maintain the library across sessions
  const [books, setBooks] = useLocalStorage<Book[]>('my-shelf-books', []);

  /**
   * Adds a new book to the collection.
   * Prevents duplicates based on ISBN.
   */
  const addBook = useCallback((newBook: Book) => {
    setBooks(prevBooks => {
      // Avoid duplicates
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


  const renderView = () => {
    switch (view) {
      case 'splash':
        return <SplashScreen onStart={() => setView('scanner')} />;
      case 'scanner':
        return <ScannerView onStop={() => setView('library')} onAddBook={addBook} existingISBNs={books.map(b => b.isbn)} />;
      case 'library':
        return <LibraryView 
                    books={books} 
                    onScanMore={() => setView('scanner')} 
                    onDeleteBook={deleteBook} 
                    onUpdateBook={updateBook}
                />;
      default:
        return <SplashScreen onStart={() => setView('scanner')} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0D0D0F]">
      {renderView()}
    </div>
  );
};

export default App;