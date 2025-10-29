
import React from 'react';
import { BookIcon } from './icons/BookIcon';

interface SplashScreenProps {
  onStart: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="mb-8">
        <BookIcon className="w-24 h-24 text-[#E8A04C]" />
      </div>
      <h1 className="text-5xl font-bold text-white mb-2">MyShelf</h1>
      <p className="text-lg text-gray-400 mb-12 max-w-sm">
        Build a digital replica of your physical book collection, one scan at a time.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-4 bg-[#E8A04C] text-[#0D0D0F] font-semibold rounded-full text-lg shadow-lg shadow-[#E8A04C]/20 transition-all duration-300 ease-in-out hover:bg-amber-400 hover:shadow-xl hover:shadow-[#E8A04C]/40 transform hover:-translate-y-1"
      >
        Start Scanning
      </button>
    </div>
  );
};

export default SplashScreen;
