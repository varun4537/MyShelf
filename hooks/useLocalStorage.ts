
import React, { useState, useEffect } from 'react';
import { migrateBook, Book } from '../types';

/**
 * A custom hook for persistent state using localStorage.
 * 
 * Includes listener logic to sync state across different browser tabs/windows.
 * For Book arrays, automatically migrates old data to V2 format.
 */
function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      let parsed = JSON.parse(item);

      // Auto-migrate books to V2 format if this is the books array
      if (key === 'my-shelf-books' && Array.isArray(parsed)) {
        parsed = parsed.map(migrateBook);
        // Save migrated data back
        window.localStorage.setItem(key, JSON.stringify(parsed));
      }

      return parsed;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  // This effect ensures that if localStorage is updated in another tab,
  // this hook's state reflects that change.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          let parsed = e.newValue ? JSON.parse(e.newValue) : initialValue;
          // Auto-migrate if books
          if (key === 'my-shelf-books' && Array.isArray(parsed)) {
            parsed = parsed.map(migrateBook);
          }
          setStoredValue(parsed);
        } catch (error) {
          console.error(error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;