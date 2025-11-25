'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Warning, ArrowClockwise, House } from '@phosphor-icons/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background-cream p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-3xl shadow-lg p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Warning size={32} className="text-red-500" />
                </div>
              </div>

              {/* Error Message */}
              <h2 className="text-2xl font-bold text-stone-800 mb-4">
                Oops! Something went wrong
              </h2>
              <p className="text-stone-600 mb-6 leading-relaxed">
                We encountered an unexpected error. Don't worry, this happens sometimes. 
                You can try refreshing the page or go back to the homepage.
              </p>

              {/* Error Details (in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-left">
                  <p className="text-sm font-semibold text-red-800 mb-2">
                    Error Details:
                  </p>
                  <p className="text-xs text-red-700 font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <ArrowClockwise size={20} />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-3 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <House size={20} />
                  Go to Homepage
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;