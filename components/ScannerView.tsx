import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { fetchBookByISBN } from '../services/geminiService';
import { Book } from '../types';
import { isValidISBN } from '../utils/isbn';
import { CheckCircle, X, ArrowLeft } from 'lucide-react';
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
 * Minimalist UI: Full screen camera, transient toasts, shutter-style "Done" button.
 */
const ScannerView: React.FC<ScannerViewProps> = ({ onStop, onAddBook, existingISBNs }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastScannedBook, setLastScannedBook] = useState<Book | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const lastScannedRef = useRef<string>('');
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // LIVE REFERENCE to books to prevent effect re-runs
  const existingISBNsRef = useRef(existingISBNs);

  // Keep ref in sync with prop
  useEffect(() => {
    existingISBNsRef.current = existingISBNs;
  }, [existingISBNs]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts(prev => [{ id, message, type }, ...prev].slice(0, 3));
    if (type !== 'loading') {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
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

    // Check against REF instead of prop to avoid dependency changes
    if (existingISBNsRef.current.includes(isbn)) {
      addToast(`📚 Already in your shelf`, 'error');
      lastScannedRef.current = isbn;
      cooldownTimeoutRef.current = setTimeout(() => {
        lastScannedRef.current = '';
      }, 2000);
      return;
    }

    if (!isValidISBN(isbn)) return;

    // Pause the scanner while processing
    try {
      await scannerRef.current?.pause();
    } catch (err) {
      console.error('Failed to pause scanner:', err);
    }

    isProcessingRef.current = true;
    setIsScanningActive(false);
    lastScannedRef.current = isbn;
    const loadingToastId = addToast(`🔍 Finding: ${isbn}`, 'loading'); // Show ISBN for feedback

    if (navigator.vibrate) navigator.vibrate(50);

    try {
      const book = await fetchBookByISBN(isbn);
      removeToast(loadingToastId);

      if (book) {
        onAddBook(book);
        setLastScannedBook(book);
        addToast(`✅ Added: ${book.title}`, 'success');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      } else {
        addToast(`❌ Book not found`, 'error');
      }
    } catch (error) {
      removeToast(loadingToastId);
      console.error('Error processing barcode:', error);
      addToast(`❌ Error looking up book`, 'error');
    } finally {
      // Resume the scanner after processing
      try {
        await scannerRef.current?.resume();
      } catch (err) {
        console.error('Failed to resume scanner:', err);
      }

      // Shorter cooldown for snappier feel
      cooldownTimeoutRef.current = setTimeout(() => {
        isProcessingRef.current = false;
        setIsScanningActive(true);
        lastScannedRef.current = '';
      }, 1000);
    }
  }, [onAddBook, addToast, removeToast]); // Removed existingISBNs dependency

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    const qrBoxSize = Math.min(window.innerWidth * 0.7, 280);

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode('reader');
        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: qrBoxSize, height: qrBoxSize },
          aspectRatio: window.innerWidth / window.innerHeight,
          formatsToSupport: [0], // EAN_13
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => processBarcode(decodedText),
          () => { }
        );

        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to start scanner:', err);
        addToast('⚠️ Camera access required', 'error');
      }
    };

    startScanner();

    return () => {
      if (cooldownTimeoutRef.current) clearTimeout(cooldownTimeoutRef.current);
      if (html5QrCode && html5QrCode.isScanning) {
        // Only stop if we are actually unmounting the component
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [processBarcode, addToast]); // processBarcode is now stable!

  const handleStop = useCallback(() => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().catch(console.error).finally(onStop);
    } else {
      onStop();
    }
  }, [onStop]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={handleStop}
          className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="px-4 py-1 rounded-full bg-black/40 backdrop-blur-md">
          <span className="text-white text-sm font-medium">Scan Barcode</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Main Scanner Area */}
      <div className="relative flex-1 bg-black">
        <div
          id="reader"
          className="w-full h-full [&>video]:object-cover"
        />

        {/* Visual Guides */}
        {isInitialized && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            {/* Scan Frame with Fixed Max Width to match Scanner Config */}
            <div
              className={`w-[70%] max-w-[280px] aspect-[1/1] border-2 rounded-3xl transition-colors duration-300 relative ${isScanningActive ? 'border-white/50' : 'border-emerald-500/80'
                }`}
            >
              {/* Corner Markers */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl -mt-[2px] -ml-[2px]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl -mt-[2px] -mr-[2px]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl -mb-[2px] -ml-[2px]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl -mb-[2px] -mr-[2px]" />

              {/* Pulse Scanner Line */}
              {isScanningActive && (
                <div className="absolute left-0 right-0 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-scan-line top-1/2" />
              )}
            </div>

            <p className="mt-8 text-white/80 text-sm font-medium tracking-wide">
              {isScanningActive ? 'Align barcode within frame' : 'Processing...'}
            </p>
          </div>
        )}
      </div>

      {/* Manual Shutter / Done Button (Bottom Center) */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center z-20 pointer-events-none">
        <button
          onClick={handleStop}
          className="pointer-events-auto group relative flex items-center justify-center"
          aria-label="Finish Scanning"
        >
          {/* Outer Ring */}
          <div className="w-20 h-20 rounded-full border-4 border-white/30 group-active:scale-95 transition-transform" />
          {/* Inner Circle (Shutter) */}
          <div className="absolute w-16 h-16 rounded-full bg-white shadow-lg group-active:scale-90 transition-transform flex items-center justify-center">
            <span className="text-black font-bold text-xs">DONE</span>
          </div>
        </button>
      </div>

      {/* Toast Overlay (Top Center) */}
      <div className="fixed top-24 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map(toast => (
          <div key={toast.id} className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-slide-down ${toast.type === 'error' ? 'bg-red-500/90 text-white' :
            toast.type === 'success' ? 'bg-emerald-500/90 text-white' :
              'bg-zinc-800/90 text-white'
            }`}>
            {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScannerView;