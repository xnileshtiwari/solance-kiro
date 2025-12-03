'use client';

import React from 'react';

interface ApiErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetry?: boolean;
}

export function ApiErrorDisplay({ error, onRetry, onDismiss, showRetry = true }: ApiErrorDisplayProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <div className="flex-shrink-0">
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm text-red-700">{error}</p>
        <div className="mt-2 flex gap-2">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="text-sm font-medium text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApiErrorDisplay;
