'use client';

import React from 'react';

interface ApiFallbackProps {
  onRetry?: () => void;
  onGoHome?: () => void;
  showMockOption?: boolean;
  message?: string;
}

export function ApiFallback({ 
  onRetry, 
  onGoHome, 
  showMockOption = false, 
  message = "We're having trouble connecting to our service. Please try again." 
}: ApiFallbackProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-cream p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex flex-col gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full py-3 px-4 bg-primary-coral text-white rounded-lg font-medium hover:bg-primary-coral/90 transition-colors"
            >
              Try Again
            </button>
          )}
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Go Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApiFallback;
