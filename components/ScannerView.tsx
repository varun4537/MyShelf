import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
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

const ScannerView: React.FC<ScannerViewProps> = ({ onStop, onAddBook, existingISBNs }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastScannedBook, setLastScannedBook] = useState<Book | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const lastScannedRef = useRef<string>('');
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts(prev => [{ id, message, type }, ...prev].slice(0, 3)); // Reduce stack to 3
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
    // Prevent duplicate processing or processing while active
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
      }, 2000);
      return;
    }

    // Validate ISBN
    if (!isValidISBN(isbn)) {
      return;
    }

    isProcessingRef.current = true;
    setIsScanningActive(false); // Visual feedback: pause pulse
    lastScannedRef.current = isbn;
    const loadingToastId = addToast(`🔍 Found ISBN... looking up details`, 'loading');

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);

    try {
      const book = await fetchBookByISBN(isbn);
      removeToast(loadingToastId);

      if (book) {
        onAddBook(book);
        setLastScannedBook(book);
        addToast(`✅ Added to library`, 'success');

        // Success haptic
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      } else {
        addToast(`❌ Could not find book info`, 'error');
      }
    } catch (error) {
      removeToast(loadingToastId);
      console.error('Error processing barcode:', error);
      addToast(`❌ Error looking up book`, 'error');
    } finally {
      // Cooldown before next scan
      cooldownTimeoutRef.current = setTimeout(() => {
        isProcessingRef.current = false;
        setIsScanningActive(true); // Resume pulse
      }, 1500);
    }
  }, [existingISBNs, onAddBook, addToast, removeToast]);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode('reader');
        scannerRef.current = html5QrCode;

        // Larger scanning area
        const qrBoxSize = Math.min(window.innerWidth * 0.8, 300);

        const config = {
          fps: 15,
          qrbox: { width: qrBoxSize, height: qrBoxSize },
          aspectRatio: window.innerWidth / window.innerHeight,
          formatsToSupport: [0], // EAN_13
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            processBarcode(decodedText);
          },
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
        <div className="w-10" /> {/* Spacer */}
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
            {/* Scan Frame */}
            <div className={`w-[70%] aspect-[1/1] border-2 rounded-3xl transition-colors duration-300 relative ${isScanningActive ? 'border-white/50' : 'border-emerald-500/80'
              }`}>
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

      {/* Bottom Sheet - Last Scanned / Controls */}
      <div className="bg-white rounded-t-3xl p-6 pb-8 min-h-[180px] shadow-[0_-4px_20px_rgba(0,0,0,0.2)] z-20">
        {lastScannedBook ? (
          <div className="animate-slide-up">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Added to Library</span>
            </div>
            <div className="flex gap-4">
              <img
                src={lastScannedBook.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200'}
                alt={lastScannedBook.title}
                className="w-16 h-24 object-cover rounded-md shadow-sm bg-gray-100"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 leading-tight truncate">{lastScannedBook.title}</h3>
                <p className="text-gray-500 text-sm truncate">{lastScannedBook.authors.join(', ')}</p>
                <div className="mt-3 flex gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 font-medium">
                    Ready for next book...
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-4 space-y-3">
            <p className="text-gray-400 text-sm text-center">
              Scan your books one by one.<br />They will be added automatically.
            </p>
            <div className="animate-pulse bg-gray-200 h-12 w-12 rounded-full" />
          </div>
        )}

        <button
          onClick={handleStop}
          className="w-full mt-6 py-3 bg-gray-900 text-white rounded-xl font-semibold shadow-lg active:scale-98 transition-transform"
        >
          Done ({existingISBNs.length} books)
        </button>
      </div>

      {/* Toast Overlay */}
      <div className="fixed top-20 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`p-4 rounded-xl shadow-xl flex items-center justify-center backdrop-blur-md animate-slide-down ${toast.type === 'error' ? 'bg-red-500/90 text-white' :
              toast.type === 'success' ? 'bg-emerald-500/90 text-white' :
                'bg-black/80 text-white'
            }`}>
            <span className="font-medium text-center">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScannerView;