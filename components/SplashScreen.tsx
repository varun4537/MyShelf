
import React from 'react';
import { BookIcon } from './icons/BookIcon';

interface SplashScreenProps {
  onStart: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center" style={{ background: 'var(--color-bg)' }}>
      <div className="mb-8">
        <BookIcon className="w-24 h-24" style={{ color: 'var(--color-primary)' }} />
      </div>
      <h1 className="text-5xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>MyShelf</h1>
      <p className="text-lg mb-12 max-w-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Build a digital replica of your physical book collection, one scan at a time.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-4 btn-primary font-semibold rounded-full text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
      >
        Start Scanning
      </button>
    </div>
  );
};

export default SplashScreen;
