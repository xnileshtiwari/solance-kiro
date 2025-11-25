'use client';

import { useState } from 'react';
import { ApiError, NetworkError } from '../services';

interface ApiErrorDisplayProps {
  error: string | Error | null;
  onRetry?: () => void;
  onFallback?: () => void;
  onDismiss?: () => void;
  showRetry?: boolean;
  className?: string;
}

export function ApiErrorDisplay({ 
  error, 
  onRetry, 
  onFallback, 
  onDismiss,
  showRetry = true,
  className = '' 
}: ApiErrorDisplayProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  if (!error) return null;

  const getErrorMessage = (error: string | Error): string => {
    if (typeof error === 'string') return error;
    if (error instanceof NetworkError) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    if (error instanceof ApiError) {
      if (error.status === 503) {
        return 'The service is temporarily unavailable. Please try again in a few moments.';
      }
      if (error.status === 429) {
        return 'Too many requests. Please wait a moment before trying again.';
      }
      return error.message || 'An error occurred while communicating with the server.';
    }
    return error.message || 'An unexpected error occurred.';
  };

  const getErrorIcon = (error: string | Error): string => {
    if (typeof error === 'string') return '⚠️';
    if (error instanceof NetworkError) return '🌐';
    if (error instanceof ApiError) {
      if (error.status === 503) return '🔧';
      if (error.status === 429) return '⏱️';
    }
    return '❌';
  };

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className={`bg-red-50 border border-red-200 rounded-2xl p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="text-2xl">{getErrorIcon(error)}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Something went wrong
          </h3>
          <p className="text-red-700 mb-4">
            {getErrorMessage(error)}
          </p>
          <div className="flex space-x-3">
            {onRetry && showRetry && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-xl transition-colors duration-200"
              >
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </button>
            )}
            {onFallback && (
              <button
                onClick={onFallback}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-xl transition-colors duration-200"
              >
                Use Offline Mode
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-xl transition-colors duration-200"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}