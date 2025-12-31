
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fetchBookByISBN } from '../services/geminiService';
import { Book } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CheckIcon } from './icons/CheckIcon';
import { isValidISBN } from '../utils/isbn';

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

// Extend Window interface for the experimental BarcodeDetector API
declare global {
  interface Window {
    BarcodeDetector: any;
  }
}
type Barcode = {
    rawValue: string;
    boundingBox: DOMRectReadOnly;
};

/**
 * ScannerView Component
 * 
 * Handles the camera feed, barcode detection, and UI feedback.
 * 1. Sets up the camera stream using navigator.mediaDevices.
 * 2. Uses BarcodeDetector to find ISBN-13 codes in the video stream.
 * 3. Draws bounding boxes on a canvas overlay.
 * 4. Triggers the Gemini API call when a valid, new ISBN is found.
 */
const ScannerView: React.FC<ScannerViewProps> = ({ onStop, onAddBook, existingISBNs }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const isProcessing = useRef(false); // Ref to prevent multiple API calls for the same detection frame
  const animationFrameId = useRef<number>();

  const addToast = (message: string, type: 'success' | 'error' | 'loading') => {
    const id = Date.now();
    setToasts(prev => [{ id, message, type }, ...prev].slice(0, 5));
    if (type !== 'loading') {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    }
  };
  
  const removeLoadingToast = () => {
    setToasts(prev => prev.filter(t => t.type !== 'loading'));
  };

  const processBarcode = useCallback(async (barcode: string) => {
    // Redundant checks here as a safeguard, but primary logic is in the detection loop.
    if (isProcessing.current || existingISBNs.includes(barcode)) {
      return;
    }

    isProcessing.current = true;
    addToast(`Scanning ISBN: ${barcode}`, 'loading');

    try {
      const book = await fetchBookByISBN(barcode);
      removeLoadingToast();
      if (book) {
        onAddBook(book);
        addToast(`✅ Added: ${book.title}`, 'success');
      } else {
        addToast(`Could not find book for ISBN: ${barcode}`, 'error');
      }
    } catch (error) {
      removeLoadingToast();
      console.error(error);
      addToast(`Error processing ISBN: ${barcode}`, 'error');
    } finally {
        // Add a cooldown to prevent immediate re-scanning
        setTimeout(() => {
            isProcessing.current = false;
        }, 2000); 
    }
  }, [existingISBNs, onAddBook]);
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    const barcodeDetector = 'BarcodeDetector' in window ? new window.BarcodeDetector({ formats: ['ean_13'] }) : null;

    /**
     * Main animation loop.
     * Detects barcodes in the video frame and draws them on the canvas.
     */
    const detectAndDraw = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState !== 4 || !barcodeDetector || !isScanning) {
            animationFrameId.current = requestAnimationFrame(detectAndDraw);
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Sync canvas size with video size
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;

        // Calculate scaling factors (video native res vs display size)
        const scaleX = canvas.width / video.videoWidth;
        const scaleY = canvas.height / video.videoHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        try {
            const barcodes: Barcode[] = await barcodeDetector.detect(video);
            
            for (const barcode of barcodes) {
                const { x, y, width, height } = barcode.boundingBox;
                const isKnown = existingISBNs.includes(barcode.rawValue);
                const isValid = isValidISBN(barcode.rawValue);
                
                // Visual Feedback: Green (Existing), Amber (New Valid), Red (Invalid)
                ctx.lineWidth = 4;
                ctx.strokeStyle = isValid ? (isKnown ? '#34D399' : '#E8A04C') : '#EF4444'; 
                ctx.strokeRect(x * scaleX, y * scaleY, width * scaleX, height * scaleY);

                if (isValid) {
                    ctx.font = 'bold 16px Inter, sans-serif';
                    ctx.fillStyle = ctx.strokeStyle;
                    ctx.fillText(isKnown ? 'Already in Shelf' : `ISBN: ${barcode.rawValue}`, x * scaleX, y * scaleY - 10);
                    
                    if (!isProcessing.current && !isKnown) {
                         processBarcode(barcode.rawValue);
                    }
                }
            }
        } catch (e) {
          console.error('Barcode detection failed:', e);
        }

        animationFrameId.current = requestAnimationFrame(detectAndDraw);
    };

    const setupCamera = async () => {
      if (!barcodeDetector) {
        addToast('Barcode detection not supported on this browser.', 'error');
        return;
      }
      
      if (!window.isSecureContext) {
        addToast('Camera access requires a secure connection (HTTPS).', 'error');
        return;
      }

      try {
        const constraints = {
          video: {
            facingMode: 'environment' // Prefer the rear camera for barcode scanning
          }
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error("Error playing video:", e));
          animationFrameId.current = requestAnimationFrame(detectAndDraw);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        let message = 'Could not access camera.';
        if (err instanceof TypeError) {
            message = 'Camera API is not supported on this browser.';
        } else if (err instanceof Error) {
            if (err.name === 'NotAllowedError') {
                message = 'Camera permission denied. Please enable it in settings.';
            } else if (err.name === 'NotFoundError') {
                message = 'No suitable camera found on this device.';
            }
        }
        addToast(message, 'error');
      }
    };
    
    setupCamera();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning, processBarcode, existingISBNs]);


  return (
    <div className="relative w-full h-screen bg-black">
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* Scanning Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pointer-events-none">
        <div className="w-[90vw] max-w-md aspect-[4/3] rounded-3xl border-4 border-dashed border-white/50"
             style={{ boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)' }}>
        </div>
        <p className="mt-6 text-white text-lg font-semibold bg-black/60 px-4 py-2 rounded-full">
            Point your camera at the barcode
        </p>
      </div>

      {/* Toasts */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-sm flex flex-col items-center gap-2 z-20">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold shadow-lg backdrop-blur-md border 
              ${toast.type === 'success' ? 'bg-green-500/80 border-green-400/50 text-white' : ''}
              ${toast.type === 'error' ? 'bg-red-500/80 border-red-400/50 text-white' : ''}
              ${toast.type === 'loading' ? 'bg-gray-800/80 border-white/20 text-white' : ''}
            `}
          >
            {toast.type === 'loading' && <SpinnerIcon className="w-5 h-5" />}
            {toast.type === 'success' && <CheckIcon className="w-5 h-5" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Stop Scanning Button */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={onStop}
          className="px-8 py-4 bg-[#E8A04C] text-[#0D0D0F] font-semibold rounded-full text-lg shadow-lg shadow-[#E8A04C]/20 transition-all duration-300 ease-in-out hover:bg-amber-400 hover:shadow-xl hover:shadow-[#E8A04C]/40 transform hover:-translate-y-1"
        >
          Stop Scanning
        </button>
      </div>
    </div>
  );
};

export default ScannerView;