'use client';

import { MathRenderer } from './MathRenderer';

interface CozySuccessModalProps {
  isOpen: boolean;
  onNextChallenge: () => void;
  score?: number; // marks out of 10
  insight?: {
    title: string;
    description: string;
  };
}

export function CozySuccessModal({ isOpen, onNextChallenge, score, insight }: CozySuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/10 backdrop-blur-md z-50 flex items-center justify-center opacity-100 transition-all duration-500">
      <div className="bg-white w-full max-w-md rounded-[32px] p-8 transform scale-100 transition-all duration-500 shadow-2xl border-4 border-white relative overflow-hidden mx-4">
        {/* Confetti Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-9xl">
          🎉
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4 text-3xl shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-stone-800 mb-1">Nice Job!</h2>
          <p className="text-stone-500 font-semibold">You nailed it.</p>
        </div>

        {/* Score Display */}
        {score !== undefined && (
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 text-center text-white shadow-lg mb-6">
            <div className="text-sm font-semibold uppercase tracking-wide mb-2 opacity-90">
              Your Score
            </div>
            <div className="text-6xl font-bold mb-1">
              {score}
            </div>
            <div className="text-2xl font-semibold opacity-90">
              out of 10
            </div>
          </div>
        )}

        {/* Insight Card */}
        {insight && (
          <div className="bg-orange-50 rounded-2xl p-5 mb-8 border border-orange-100">
            <div className="flex items-center gap-2 mb-2 text-orange-600 font-bold text-sm uppercase tracking-wide">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              Quick Tip
            </div>
            <div className="text-stone-700 leading-relaxed text-sm md:text-base">
              {insight.title && <strong>{insight.title}: </strong>}
              <MathRenderer 
                content={insight.description}
                className="inline"
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onNextChallenge}
          className="w-full bg-stone-800 hover:bg-black text-white text-lg font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] shadow-xl flex items-center justify-center gap-2"
        >
          <span>Next Challenge</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
