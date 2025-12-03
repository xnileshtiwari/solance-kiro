'use client';

import React, { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  message 
}) => {
  const [loadingText, setLoadingText] = useState('');
  const [dotCount, setDotCount] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  // Animated loading messages for large spinner
  const loadingMessages = [
    'Crafting your personalized challenge',
    'Analyzing your learning path',
    'Preparing adaptive questions',
    'Setting up your journey'
  ];

  useEffect(() => {
    if (size === 'lg' && message) {
      let messageIndex = 0;
      const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingText(loadingMessages[messageIndex]);
      }, 2500);

      setLoadingText(loadingMessages[0]);

      return () => clearInterval(messageInterval);
    }
  }, [size, message]);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 400);

    return () => clearInterval(dotInterval);
  }, []);

  // Enhanced loading screen for 'lg' size
  if (size === 'lg') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        {/* Animated equation background */}
        <div className="relative mb-12">
          {/* Floating math symbols */}
          <div className="absolute -top-8 -left-12 text-4xl text-orange-200 animate-float-slow">
            x
          </div>
          <div className="absolute -top-4 -right-16 text-3xl text-yellow-200 animate-float-delayed">
            +
          </div>
          <div className="absolute -bottom-6 -left-8 text-3xl text-purple-200 animate-float">
            =
          </div>
          <div className="absolute -bottom-8 -right-12 text-2xl text-pink-200 animate-float-slow">
            ²
          </div>

          {/* Main spinner with gradient ring */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 animate-spin-slow opacity-20 blur-sm" />
            <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-orange-500 border-r-yellow-500 animate-spin" />
            <div className="absolute inset-3 w-18 h-18 rounded-full border-4 border-transparent border-b-purple-400 border-l-pink-400 animate-spin-reverse" />
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl animate-pulse">📐</span>
            </div>
          </div>
        </div>

        {/* Animated text */}
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-stone-800 mb-3">
            {loadingText || message}
            <span className="inline-block w-8 text-left">
              {'.'.repeat(dotCount)}
            </span>
          </h2>
          <p className="text-stone-500 text-sm">
            This will only take a moment
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-64 h-1.5 bg-stone-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 animate-progress" />
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(5deg);
            }
          }

          @keyframes float-slow {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-15px) rotate(-5deg);
            }
          }

          @keyframes float-delayed {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-25px) rotate(10deg);
            }
          }

          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes spin-reverse {
            from {
              transform: rotate(360deg);
            }
            to {
              transform: rotate(0deg);
            }
          }

          @keyframes progress {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          .animate-float-slow {
            animation: float-slow 4s ease-in-out infinite;
          }

          .animate-float-delayed {
            animation: float-delayed 3.5s ease-in-out infinite;
            animation-delay: 0.5s;
          }

          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }

          .animate-spin-reverse {
            animation: spin-reverse 2s linear infinite;
          }

          .animate-progress {
            animation: progress 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // Simple spinner for 'sm' and 'md' sizes
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin`}
      />
      {message && (
        <p className="mt-3 text-stone-600 text-sm font-medium">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;