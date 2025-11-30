'use client';

import { useState, useEffect, useRef } from 'react';
import { MathRenderer } from './MathRenderer';

export interface BlockStep {
  id: number;
  prompt: string;
}

interface BlockInterfaceProps {
  currentStep: BlockStep | null;
  completedSteps: Array<{ id: number; prompt: string; answer: string }>;
  onAnswerSubmit: (answer: string) => Promise<{ isCorrect: boolean; feedback?: string }>;
  isLoading?: boolean;
}

export function BlockInterface({ currentStep, completedSteps, onAnswerSubmit, isLoading }: BlockInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus input when new block appears
    if (inputRef.current && currentStep) {
      inputRef.current.focus();
    }
  }, [currentStep]);

  useEffect(() => {
    // Scroll to bottom when new block is added
    if (containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [completedSteps, currentStep]);

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting || !currentStep) return;

    setIsSubmitting(true);
    setErrorMessage('');
    const trimmedAnswer = inputValue.trim();

    try {
      const result = await onAnswerSubmit(trimmedAnswer);

      if (result.isCorrect) {
        // Clear input on success
        setInputValue('');
      } else {
        // Show error feedback
        setErrorMessage(result.feedback || 'Not quite! Try again.');
        setInputValue('');

        // Clear error after animation
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setErrorMessage('Failed to submit answer. Please try again.');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Enhanced Skeleton Block Component
  const SkeletonBlock = () => (
    <div className="logic-block skeleton-block">
      <div className="relative overflow-hidden">
        {/* Floating math symbols */}
        <div className="absolute top-2 right-4 text-2xl text-orange-200 animate-float-mini opacity-60">
          ÷
        </div>
        <div className="absolute bottom-4 right-8 text-xl text-yellow-200 animate-float-mini-delayed opacity-60">
          ×
        </div>
        
        <div className="flex items-start gap-3 mb-2">
          {/* Animated step number */}
          <div className="mt-1 w-6 h-6 rounded-full bg-gradient-to-br from-orange-200 to-yellow-200 shrink-0 animate-pulse-soft flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          </div>
          
          {/* Animated text lines */}
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 rounded-lg w-3/4 shimmer-enhanced" />
            <div className="h-4 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 rounded-lg w-1/2 shimmer-enhanced" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
        
        {/* Animated input area */}
        <div className="block-input-wrapper mt-4 bg-gradient-to-r from-stone-50 to-stone-100 border-2 border-stone-200 relative overflow-hidden rounded-2xl">
          <div className="h-10 w-full flex items-center px-4">
            <div className="flex gap-2 items-center">
              <div className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
          {/* Shimmer overlay */}
          <div className="absolute inset-0 shimmer-overlay" />
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto px-4 pb-24">
      {/* Completed Blocks */}
      {completedSteps.map((block, index) => (
        <div key={block.id}>
          <div className="logic-block completed mb-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="mt-1 w-6 h-6 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center text-xs font-bold shrink-0">
                {index + 1}
              </div>
              <MathRenderer 
                content={block.prompt}
                className="text-lg font-medium text-stone-700 leading-relaxed flex-1"
              />
            </div>

            {/* Completed Answer Display */}
            <div className="flex items-start gap-2 mt-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <MathRenderer 
                content={block.answer}
                className="text-xl font-bold text-stone-800 font-serif flex-1"
              />
            </div>
          </div>

          {/* Connector Line */}
          {(index < completedSteps.length - 1 || currentStep || isLoading) && (
            <div className="connector-line" />
          )}
        </div>
      ))}

      {/* Current Active Block */}
      {currentStep && !isLoading && (
        <div className="logic-block active">
          <div className="flex items-start gap-3 mb-2">
            <div className="mt-1 w-6 h-6 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center text-xs font-bold shrink-0">
              {completedSteps.length + 1}
            </div>
            <MathRenderer 
              content={currentStep.prompt}
              className="text-lg font-medium text-stone-700 leading-relaxed flex-1"
            />
          </div>

          {/* Input Area */}
          <div className={`block-input-wrapper ${errorMessage ? 'error' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="block-input"
              placeholder="Type answer..."
              disabled={isSubmitting}
              autoComplete="off"
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !inputValue.trim()}
              className={`status-icon ${errorMessage ? 'status-error' : 'status-neutral'}`}
            >
              {errorMessage ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="text-rose-500 text-sm font-bold mt-2 flex items-center gap-1 animate-shake">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && <SkeletonBlock />}

      <style jsx>{`
        .logic-block {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(74, 64, 54, 0.06);
          padding: 24px;
          border: 2px solid white;
          width: 100%;
          position: relative;
          transition: all 0.3s ease;
          animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logic-block.active {
          border-color: #88B795;
          box-shadow: 0 12px 40px rgba(136, 183, 149, 0.2);
          transform: scale(1.01);
          opacity: 1;
        }

        .logic-block.completed {
          background: #F8FAF8;
          border-color: #E0EAE2;
          opacity: 0.8;
        }

        .connector-line {
          width: 4px;
          background-color: #E5E5E0;
          margin: 0 auto;
          height: 40px;
          border-radius: 4px;
          opacity: 0;
          animation: growLine 0.4s ease forwards;
        }

        @keyframes growLine {
          from {
            height: 0;
            opacity: 0;
          }
          to {
            height: 40px;
            opacity: 1;
          }
        }

        .block-input-wrapper {
          margin-top: 16px;
          background: #F3F3F1;
          border-radius: 16px;
          padding: 6px;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .block-input-wrapper:focus-within {
          background: white;
          border-color: #88B795;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .block-input-wrapper.error {
          animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        .block-input {
          flex-grow: 1;
          background: transparent;
          border: none;
          padding: 8px 16px;
          font-family: 'Nunito', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #4A4036;
          outline: none;
        }

        .block-input::placeholder {
          color: #8C7E72;
          font-weight: 400;
        }

        .status-icon {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 4px;
          transition: all 0.3s;
          cursor: pointer;
          flex-shrink: 0;
        }

        .status-neutral {
          background: #E5E5E0;
          color: #999;
        }

        .status-neutral:hover:not(:disabled) {
          background: #88B795;
          color: white;
        }

        .status-neutral:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .status-error {
          background: #FFE4E6;
          color: #E11D48;
        }

        @keyframes shake {
          10%, 90% {
            transform: translate3d(-2px, 0, 0);
          }
          20%, 80% {
            transform: translate3d(4px, 0, 0);
          }
          30%, 50%, 70% {
            transform: translate3d(-4px, 0, 0);
          }
          40%, 60% {
            transform: translate3d(4px, 0, 0);
          }
        }

        .animate-shake {
          animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        .shimmer {
          background: linear-gradient(90deg, #E7E5E4 0%, #F5F5F4 50%, #E7E5E4 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .shimmer-enhanced {
          background: linear-gradient(90deg, #E7E5E4 0%, #F5F5F4 30%, #FAFAFA 50%, #F5F5F4 70%, #E7E5E4 100%);
          background-size: 200% 100%;
          animation: shimmer-enhanced 2s infinite ease-in-out;
        }

        @keyframes shimmer-enhanced {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .shimmer-overlay {
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer-overlay 2s infinite ease-in-out;
          pointer-events: none;
        }

        @keyframes shimmer-overlay {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .animate-pulse-soft {
          animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse-soft {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-float-mini {
          animation: float-mini 2.5s ease-in-out infinite;
        }

        @keyframes float-mini {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }

        .animate-float-mini-delayed {
          animation: float-mini-delayed 3s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        @keyframes float-mini-delayed {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(-5deg);
          }
        }

        .skeleton-block {
          border-color: #FFE4D6;
          background: linear-gradient(135deg, #FFFBF8 0%, #FFF8F3 100%);
          box-shadow: 0 8px 30px rgba(255, 155, 133, 0.1);
        }
      `}</style>
    </div>
  );
}
