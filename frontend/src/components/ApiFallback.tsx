'use client';

import { useState, useEffect } from 'react';
import { serviceSelector } from '../services';

interface ApiFallbackProps {
  children?: React.ReactNode;
  fallbackMessage?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  onUseMock?: () => void;
  showMockOption?: boolean;
  message?: string;
}

export function ApiFallback({ 
  children, 
  fallbackMessage = "Using offline mode due to connectivity issues",
  onRetry,
  onGoHome,
  onUseMock,
  showMockOption = false,
  message
}: ApiFallbackProps) {
  const [serviceType, setServiceType] = useState<'api' | 'mock'>('api');
  const [showFallbackNotice, setShowFallbackNotice] = useState(false);

  useEffect(() => {
    const checkServiceType = () => {
      const currentType = serviceSelector.getCurrentServiceType();
      if (currentType !== serviceType) {
        setServiceType(currentType);
        if (currentType === 'mock') {
          setShowFallbackNotice(true);
          // Auto-hide notice after 5 seconds
          setTimeout(() => setShowFallbackNotice(false), 5000);
        }
      }
    };

    // Check initially
    checkServiceType();

    // Set up periodic checks
    const interval = setInterval(checkServiceType, 5000);
    return () => clearInterval(interval);
  }, [serviceType]);

  // If this is being used as an error fallback page (no children)
  if (!children) {
    return (
      <div className="min-h-screen flex flex-col bg-background-cream">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌐</span>
              </div>
              <h2 className="text-2xl font-bold text-stone-800 mb-4">
                Connection Issue
              </h2>
              <p className="text-stone-600 mb-6">
                {message || fallbackMessage}
              </p>
              <div className="flex flex-col space-y-3">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 hover:scale-105"
                  >
                    Try Again
                  </button>
                )}
                {showMockOption && onUseMock && (
                  <button
                    onClick={onUseMock}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 hover:scale-105"
                  >
                    Continue with Demo
                  </button>
                )}
                {onGoHome && (
                  <button
                    onClick={onGoHome}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 hover:scale-105"
                  >
                    Back to Home
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showFallbackNotice && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-300 rounded-xl p-4 shadow-lg max-w-sm">
          <div className="flex items-start space-x-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-yellow-800">Offline Mode</h4>
              <p className="text-sm text-yellow-700">{fallbackMessage}</p>
            </div>
            <button
              onClick={() => setShowFallbackNotice(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {children}
    </>
  );
}