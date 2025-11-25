'use client';

import { useState } from 'react';
import { User, SignIn, Plant, ArrowLeft } from '@phosphor-icons/react';

interface NavigationProps {
  isAppView?: boolean;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export default function Navigation({ 
  isAppView = false, 
  showBackButton = false, 
  onBackClick 
}: NavigationProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <nav className="w-full px-6 py-6 flex items-center justify-between relative z-10">
      {/* Logo/Brand */}
      <div className="flex items-center gap-4">
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        )}
        
        <div className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-stone-800 cursor-pointer">
          <Plant className="text-green-500" weight="fill" />
          Solance.
        </div>
        
        {isAppView && (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
            Learning
          </span>
        )}
      </div>

      {/* Navigation Content */}
      <div className="flex items-center gap-4">
        {/* Login Button */}
        <a href="#" className="text-stone-600 font-bold hover:text-stone-900 transition">
          Log In
        </a>
      </div>

      {/* Mobile Menu Button (for future mobile implementation) */}
      <div className="md:hidden">
        {/* Placeholder for mobile menu toggle */}
      </div>
    </nav>
  );
}