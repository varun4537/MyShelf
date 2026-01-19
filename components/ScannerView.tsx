import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { fetchBookByISBN } from '../services/geminiService';
import { Book } from '../types';
import { isValidISBN } from '../utils/isbn';
import '../scanner.css';

interface ScannerViewProps {
  onStop: () => void;
  onAddBook: (book: Book) => void;
  existingISBNs: string[];
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'loading';
}

/**
 * ScannerView Component
 * 
 * Uses html5-qrcode library for reliable barcode scanning.
 * Supports continuous scanning - add a book, immediately scan next.
 */
const ScannerView: React.FC<ScannerViewProps> = ({ onStop, onAddBook, existingISBNs }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const lastScannedRef = useRef<string>('');
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts(prev => [{ id, message, type }, ...prev].slice(0, 5));
    if (type !== 'loading') {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 2000); // Shorter duration for faster scanning
    }
    return id;
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const processBarcode = useCallback(async (isbn: string) => {
    // Prevent duplicate processing
    if (isProcessingRef.current || lastScannedRef.current === isbn) {
      return;
    }

    // Check if already in library
    if (existingISBNs.includes(isbn)) {
      addToast(`📚 Already in your shelf`, 'error');
      lastScannedRef.current = isbn;
      // Reset after cooldown
      cooldownTimeoutRef.current = setTimeout(() => {
        lastScannedRef.current = '';
      }, 3000);
      return;
    }

    // Validate ISBN
    if (!isValidISBN(isbn)) {
      return; // Silently ignore invalid ISBNs
    }

    isProcessingRef.current = true;
    lastScannedRef.current = isbn;
    const loadingToastId = addToast(`🔍 Looking up ISBN: ${isbn}`, 'loading');

    try {
      const book = await fetchBookByISBN(isbn);
      removeToast(loadingToastId);

      if (book) {
        onAddBook(book);
        addToast(`✅ Added: ${book.title}`, 'success');
        // Haptic feedback for mobile
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
      } else {
        addToast(`❌ Could not find book for ISBN: ${isbn}`, 'error');
      }
    } catch (error) {
      removeToast(loadingToastId);
      console.error('Error processing barcode:', error);
      addToast(`❌ Error looking up book`, 'error');
    } finally {
      // Quick cooldown for batch scanning
      cooldownTimeoutRef.current = setTimeout(() => {
        isProcessingRef.current = false;
        lastScannedRef.current = '';
      }, 1000); // Reduced from 2s
    }
  }, [existingISBNs, onAddBook, addToast, removeToast]);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode('reader');
        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 350, height: 200 },
          aspectRatio: 1.5,
          formatsToSupport: [0], // 0 = EAN_13 format
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            processBarcode(decodedText);
          },
          () => {
            // QR Code scanning failure - ignore silently
          }
        );

        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to start scanner:', err);
        let message = 'Could not start camera';
        if (err instanceof Error) {
          if (err.message.includes('Permission')) {
            message = 'Camera permission denied. Please allow access.';
          } else if (err.message.includes('NotFoundError')) {
            message = 'No camera found on this device.';
          }
        }
        addToast(message, 'error');
      }
    };

    startScanner();

    return () => {
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
      }
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [processBarcode, addToast]);

  const handleStop = useCallback(() => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        onStop();
      }).catch((err) => {
        console.error('Error stopping scanner:', err);
        onStop();
      });
    } else {
      onStop();
    }
  }, [onStop]);

  return (
    <div className="min-h-screen w-full bg-[#0D0D0F] flex flex-col">
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'loading' && <div className="spinner" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold text-white">Scan Books</h1>
        <p className="text-gray-400 text-sm mt-1">Point at ISBN barcode</p>
      </div>

      {/* Scanner Container */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div
            id="reader"
            className="rounded-2xl overflow-hidden bg-black/50"
            style={{ minHeight: '300px' }}
          />
          {!isInitialized && (
            <div className="flex items-center justify-center mt-4">
              <div className="spinner" />
              <span className="ml-3 text-gray-400">Starting camera...</span>
            </div>
          )}
        </div>
      </div>

      {/* Book count indicator */}
      <div className="text-center py-2">
        <span className="text-gray-400 text-sm">
          {existingISBNs.length} book{existingISBNs.length !== 1 ? 's' : ''} in library
        </span>
      </div>

      {/* Stop Button */}
      <div className="p-6 pb-10">
        <button
          onClick={handleStop}
          className="w-full py-4 bg-[#E8A04C] text-[#0D0D0F] font-semibold rounded-full text-lg shadow-lg transition-all duration-300 hover:bg-amber-400 active:scale-98"
          style={{ boxShadow: '0 4px 20px rgba(232, 160, 76, 0.3)' }}
        >
          View Library ({existingISBNs.length})
        </button>
      </div>
    </div>
  );
};

export default ScannerView;