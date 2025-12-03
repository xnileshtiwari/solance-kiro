'use client';

import { Lightbulb, Target, Trophy } from '@phosphor-icons/react';
import { useTopicNavigation } from '@/hooks/useTopicNavigation';

export default function HomePage() {
  const { isTransitioning, errorMessage, handleTopicSubmit, clearError } = useTopicNavigation();

  const handleTagClick = (topic: string) => {
    handleTopicSubmit(topic);
  };

  return (
    <div className="min-h-screen flex flex-col">

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-4 md:pt-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white text-stone-600 px-4 py-1.5 rounded-full text-sm font-bold mb-6 shadow-sm border border-stone-100">
          <span className="text-yellow-400">✨</span> The Hyper-Personalized Learning Engine
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black text-stone-800 mb-4 leading-[1.1]">
          Master anything, <br />
          <span className="serif-font italic text-orange-500 relative inline-block">
            at your own rhythm.
            <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.00026 6.99997C58.4355 1.8526 135.645 1.8526 198.001 6.99997" stroke="#FF9B85" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-stone-500 max-w-2xl mb-8 font-medium leading-relaxed">
          Solance smooths out the learning curve with an adaptive path that evolves with you.
        </p>

        {/* Start Learning Button */}
        <div className="mb-12 w-full flex flex-col items-center">
          <button
            onClick={() => handleTagClick('Algebra')}
            className="inline-flex items-center gap-3 px-12 py-4 bg-[#3D3D3D] hover:bg-orange-500 text-white font-bold text-xl rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_24px_rgba(205,127,110,0.3)] transition-all duration-300"
          >
            Start Your Journey
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-4 mb-12">
          {/* Step 1 */}
          <div className="hero-card p-6 text-center step-item">
            <div className="step-icon bg-yellow-100 text-yellow-500 mx-auto">
              <Lightbulb weight="fill" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">
              1. Pick Any Topic
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Type what you're curious about. We generate a custom micro-path instantly.
            </p>
          </div>

          {/* Step 2 */}
          <div className="hero-card p-6 text-center step-item">
            <div className="step-icon bg-purple-100 text-purple-500 mx-auto">
              <Target weight="fill" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">
              2. Live Adaptation
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Struggling? We break it down. Breezing through? We ramp it up. Real-time.
            </p>
          </div>

          {/* Step 3 */}
          <div className="hero-card p-6 text-center step-item">
            <div className="step-icon bg-pink-100 text-pink-500 mx-auto">
              <Trophy weight="fill" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">
              3. Fun & Fluid
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Learning shouldn't feel like work. We make the hard stuff feel cozy and doable.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-stone-400 text-sm font-medium">
        Built for the future of learning.
      </footer>
    </div>
  );
}