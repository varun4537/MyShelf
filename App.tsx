
import React, { useState, useCallback, useEffect } from 'react';
import { Book } from './types';
import SplashScreen from './components/SplashScreen';
import ScannerView from './components/ScannerView';
import LibraryView from './components/LibraryView';
import SettingsView from './components/SettingsView';
import StatsView from './components/StatsView';
import LoginView from './components/LoginView';
import {
  addBookRemote,
  deleteAllBooksRemote,
  deleteBookRemote,
  fetchBooks,
  updateBookRemote
} from './services/libraryService';
import { clearAuthToken, getAuthToken, login } from './services/authService';

type View = 'login' | 'splash' | 'scanner' | 'library' | 'settings' | 'stats';

/**
 * Main Application Component
 * 
 * Orchestrates the primary view navigation and manages the global state
 * of the book collection using LocalStorage.
 */
const App: React.FC = () => {
  const [authToken, setAuthToken] = useState<string | null>(getAuthToken());
  const [view, setView] = useState<View>('login');
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!authToken) {
      setBooks([]);
      setView('login');
      return;
    }

    setIsLoading(true);
    fetchBooks()
      .then((data) => {
        setBooks(data);
        setView('scanner');
      })
      .catch((error) => {
        if (error instanceof Error && error.message === 'Unauthorized') {
          clearAuthToken();
          setAuthToken(null);
          setView('login');
        } else {
          console.error('Failed to load books:', error);
        }
      })
      .finally(() => setIsLoading(false));
  }, [authToken]);

  const handleLogin = useCallback(async (username: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const token = await login(username, password);
      setAuthToken(token);
      setView('scanner');
    } catch (error) {
      console.error('Login failed:', error);
      setLoginError('Invalid credentials. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const addBook = useCallback((newBook: Book) => {
    setBooks(prevBooks => {
      if (prevBooks.some(book => book.isbn === newBook.isbn)) {
        return prevBooks;
      }
      return [newBook, ...prevBooks];
    });
    addBookRemote(newBook).catch((error) => {
      if (error instanceof Error && error.message === 'Unauthorized') {
        clearAuthToken();
        setAuthToken(null);
      }
      console.error('Failed to sync new book:', error);
    });
  }, []);

  const deleteBook = useCallback((isbn: string) => {
    setBooks(prevBooks => prevBooks.filter(book => book.isbn !== isbn));
    deleteBookRemote(isbn).catch((error) => {
      if (error instanceof Error && error.message === 'Unauthorized') {
        clearAuthToken();
        setAuthToken(null);
      }
      console.error('Failed to delete book:', error);
    });
  }, []);

  const updateBook = useCallback((updatedBook: Book) => {
    setBooks(prevBooks => prevBooks.map(book => book.isbn === updatedBook.isbn ? updatedBook : book));
    updateBookRemote(updatedBook).catch((error) => {
      if (error instanceof Error && error.message === 'Unauthorized') {
        clearAuthToken();
        setAuthToken(null);
      }
      console.error('Failed to update book:', error);
    });
  }, []);

  const clearAllData = useCallback(() => {
    setBooks([]);
    setView('library');
    deleteAllBooksRemote().catch((error) => {
      if (error instanceof Error && error.message === 'Unauthorized') {
        clearAuthToken();
        setAuthToken(null);
      }
      console.error('Failed to clear library:', error);
    });
  }, []);

  const renderView = () => {
    if (!authToken) {
      return (
        <LoginView
          onLogin={handleLogin}
          isLoading={isLoggingIn}
          errorMessage={loginError}
        />
      );
    }

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
      {authToken && isLoading && books.length === 0 && view !== 'login' ? (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3">
          <div className="spinner" />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading shared library...</p>
        </div>
      ) : (
        renderView()
      )}
    </div>
  );
};

export default App;