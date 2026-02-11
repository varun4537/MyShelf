import React from 'react';
import { BookIcon } from './icons/BookIcon';
import { Camera, Library } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
  onLibrary: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart, onLibrary }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center" style={{ background: 'var(--color-bg)' }}>
      <div className="mb-8">
        <BookIcon className="w-24 h-24" style={{ color: 'var(--color-primary)' }} />
      </div>
      <h1 className="text-5xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>MyShelf</h1>
      <p className="text-lg mb-12 max-w-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Build a digital replica of your physical book collection, one scan at a time.
      </p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {/* Primary CTA - Start Scanning */}
        <button
          onClick={onStart}
          className="px-8 py-4 btn-primary font-semibold rounded-full text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          <Camera className="w-5 h-5" />
          Start Scanning
        </button>
        {/* Secondary CTA - Go to Library */}
        <button
          onClick={onLibrary}
          className="px-8 py-4 glass-button font-semibold rounded-full text-lg transition-all duration-300 ease-in-out hover:bg-[var(--color-surface-hover)] flex items-center justify-center gap-2"
          style={{ color: 'var(--color-text)' }}
        >
          <Library className="w-5 h-5" />
          Go to Library
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;
