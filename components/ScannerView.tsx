import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { fetchBookByISBN } from '../services/geminiService';
import { Book } from '../types';
import { isValidISBN } from '../utils/isbn';
import { CheckCircle, ArrowLeft } from 'lucide-react';
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

// Ignore repeat decodes of the same barcode within this window
const RESCAN_COOLDOWN_MS = 4000;

/**
 * ScannerView Component
 *
 * Continuous barcode scanner: the camera never pauses between books.
 * Lookups run in the background while the user moves to the next barcode.
 */
const ScannerView: React.FC<ScannerViewProps> = ({ onStop, onAddBook, existingISBNs }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastScannedBook, setLastScannedBook] = useState<Book | null>(null);
  const [justDetected, setJustDetected] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const toastIdRef = useRef(0);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Per-ISBN dedup: timestamp of last handling, plus in-flight lookups
  const recentScansRef = useRef<Map<string, number>>(new Map());
  const inFlightRef = useRef<Set<string>>(new Set());

  // LIVE REFERENCES to props to keep processBarcode stable across renders
  const existingISBNsRef = useRef(existingISBNs);
  useEffect(() => {
    existingISBNsRef.current = existingISBNs;
  }, [existingISBNs]);

  const onAddBookRef = useRef(onAddBook);
  useEffect(() => { onAddBookRef.current = onAddBook; }, [onAddBook]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [{ id, message, type }, ...prev].slice(0, 3));
    if (type !== 'loading') {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 2500);
    }
    return id;
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Brief green flash of the scan frame to confirm a detection
  const flashFrame = useCallback(() => {
    setJustDetected(true);
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => setJustDetected(false), 600);
  }, []);

  const processBarcode = useCallback(async (decoded: string) => {
    const isbn = decoded.trim();
    if (!isValidISBN(isbn)) return;

    // Throttle repeat decodes of the same code (camera fires ~15 decodes/sec)
    const now = Date.now();
    const lastSeen = recentScansRef.current.get(isbn);
    if (lastSeen && now - lastSeen < RESCAN_COOLDOWN_MS) return;
    recentScansRef.current.set(isbn, now);

    // Instant feedback: the barcode was captured
    if (navigator.vibrate) navigator.vibrate(50);
    flashFrame();

    if (existingISBNsRef.current.includes(isbn)) {
      addToast('📚 Already in your shelf', 'error');
      return;
    }

    if (inFlightRef.current.has(isbn)) return;
    inFlightRef.current.add(isbn);

    // Lookup runs in the background — scanning continues uninterrupted
    const loadingToastId = addToast(`🔍 Finding: ${isbn}`, 'loading');
    try {
      const book = await fetchBookByISBN(isbn);
      removeToast(loadingToastId);

      if (book) {
        onAddBookRef.current(book);
        setLastScannedBook(book);
        addToast(`✅ Added: ${book.title}`, 'success');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      } else {
        addToast('❌ Book not found', 'error');
        recentScansRef.current.delete(isbn); // allow immediate retry
      }
    } catch (error) {
      removeToast(loadingToastId);
      console.error('Error processing barcode:', error);
      addToast('❌ Error looking up book', 'error');
      recentScansRef.current.delete(isbn); // allow immediate retry
    } finally {
      inFlightRef.current.delete(isbn);
    }
  }, [addToast, removeToast, flashFrame]);

  useEffect(() => {
    let cancelled = false;

    // Books use EAN-13 (Bookland) barcodes exclusively. Restricting formats
    // here (constructor config — start() ignores it) makes decoding faster
    // and eliminates misreads from the 16 other symbologies.
    const scanner = new Html5Qrcode('reader', {
      formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13],
      useBarCodeDetectorIfSupported: true,
      verbose: false,
    });
    scannerRef.current = scanner;

    const startPromise = scanner.start(
      { facingMode: 'environment' },
      {
        fps: 15,
        // Large square detection zone — barcode can sit anywhere inside,
        // no precise alignment needed
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const size = Math.min(viewfinderWidth * 0.92, viewfinderHeight * 0.65, 640);
          return { width: size, height: size };
        },
        // Higher resolution feed makes small/curved barcodes legible
        videoConstraints: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      },
      (decodedText) => processBarcode(decodedText),
      () => { }
    );

    startPromise
      .then(() => {
        if (!cancelled) setIsInitialized(true);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to start scanner:', err);
          addToast('⚠️ Camera access required', 'error');
        }
      });

    return () => {
      cancelled = true;
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      // Chain on the start promise so cleanup works even if start() is
      // still pending (e.g. StrictMode's immediate unmount in dev)
      startPromise
        .then(() => scanner.stop())
        .catch(() => { /* start failed or already stopped — nothing to clean up */ });
    };
  }, [processBarcode, addToast]); // both stable — effect runs once per mount

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
            {/* Large square scan frame matching the qrbox */}
            <div
              className={`w-[92%] max-w-[640px] max-h-[65vh] aspect-square border-2 rounded-3xl transition-colors duration-300 relative ${justDetected ? 'border-emerald-500/90' : 'border-white/50'
                }`}
            >
              {/* Corner Markers */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl -mt-[2px] -ml-[2px]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl -mt-[2px] -mr-[2px]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl -mb-[2px] -ml-[2px]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl -mb-[2px] -mr-[2px]" />

              {/* Pulse Scanner Line */}
              <div className="absolute left-0 right-0 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-scan-line top-1/2" />
            </div>

            <p className="mt-8 text-white/80 text-sm font-medium tracking-wide">
              {justDetected ? 'Captured!' : 'Align barcode within frame'}
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
