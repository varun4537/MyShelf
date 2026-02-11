import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { fetchBookByISBN } from '../services/geminiService';
import { Book } from '../types';
import { isValidISBN } from '../utils/isbn';
import { CheckCircle, X } from 'lucide-react';
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
  const [isScanningActive, setIsScanningActive] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const lastScannedRef = useRef<string>('');
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (isProcessingRef.current || lastScannedRef.current === isbn) return;

    if (existingISBNs.includes(isbn)) {
      addToast(`📚 Already in your shelf`, 'error');
      lastScannedRef.current = isbn;
      cooldownTimeoutRef.current = setTimeout(() => { lastScannedRef.current = ''; }, 2000);
      return;
    }

    if (!isValidISBN(isbn)) return;

    isProcessingRef.current = true;
    setIsScanningActive(false);
    lastScannedRef.current = isbn;
    const loadingToastId = addToast(`🔍 Finding book...`, 'loading');

    if (navigator.vibrate) navigator.vibrate(50);

    try {
      const book = await fetchBookByISBN(isbn);
      removeToast(loadingToastId);

      if (book) {
        onAddBook(book);
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
      cooldownTimeoutRef.current = setTimeout(() => {
        isProcessingRef.current = false;
        setIsScanningActive(true);
      }, 1500);
    }
  }, [existingISBNs, onAddBook, addToast, removeToast]);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode('reader');
        scannerRef.current = html5QrCode;

        // Use a square box relative to screen width
        const qrBoxSize = Math.min(window.innerWidth * 0.7, 280);

        const config = {
          fps: 15,
          qrbox: { width: qrBoxSize, height: qrBoxSize },
          aspectRatio: window.innerHeight / window.innerWidth, // Important for full height
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
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [processBarcode, addToast]);

  const handleStop = useCallback(() => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().catch(console.error).finally(onStop);
    } else {
      onStop();
    }
  }, [onStop]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top Bar - Minimal */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
        <button
          onClick={handleStop}
          className="pointer-events-auto p-3 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full">
          <span className="text-white/90 text-sm font-medium tracking-wide">Scan ISBN</span>
        </div>
        <div className="w-12" /> {/* Balance spacer */}
      </div>

      {/* Main Scanner Viewport */}
      <div className="relative flex-1 bg-black overflow-hidden">
        <div
          id="reader"
          className="w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full"
        />

        {/* Visual Overlay */}
        {isInitialized && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            {/* Scan Frame */}
            <div className={`w-[70%] aspect-[1/1] border-2 rounded-3xl transition-all duration-300 relative ${isScanningActive ? 'border-white/40 scale-100' : 'border-emerald-500 scale-105 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
              }`}>
              {/* Corners */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-2xl -mt-1 -ml-1" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-2xl -mt-1 -mr-1" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-2xl -mb-1 -ml-1" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-2xl -mb-1 -mr-1" />

              {/* Laser Line */}
              {isScanningActive && (
                <div className="absolute left-2 right-2 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-scan-line" />
              )}
            </div>

            <p className="mt-8 text-white/70 text-sm font-medium tracking-wider uppercase">
              {isScanningActive ? 'Align Barcode' : 'Processing...'}
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