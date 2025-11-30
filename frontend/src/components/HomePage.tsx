'use client';

import { Lightbulb, Target, Trophy } from '@phosphor-icons/react';
import Navigation from './Navigation';
import TopicInput from './TopicInput';
import TopicTags from './TopicTags';
import { useTopicNavigation } from '../hooks/useTopicNavigation';

export default function HomePage() {
  const { isTransitioning, errorMessage, handleTopicSubmit, clearError } = useTopicNavigation();

  const handleTagClick = (topic: string) => {
    handleTopicSubmit(topic);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 relative z-10 mt-8 md:mt-0">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white text-stone-600 px-4 py-1.5 rounded-full text-sm font-bold mb-8 shadow-sm border border-stone-100">
          <span className="text-yellow-400">✨</span> The Hyper-Personalized Learning Engine
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black text-stone-800 mb-6 leading-[1.1]">
          Master anything, <br />
          <span className="serif-font italic text-orange-500 relative inline-block">
            at your own rhythm.
            <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.00026 6.99997C58.4355 1.8526 135.645 1.8526 198.001 6.99997" stroke="#FF9B85" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-stone-500 max-w-2xl mb-12 font-medium leading-relaxed">
          Solance smooths out the learning curve with an adaptive path that evolves with you.
        </p>

        {/* Topic Input Section */}
        <div className="w-full flex flex-col items-center mb-8">
          <div className="w-full max-w-xl mx-auto">
            <TopicInput 
              onSubmit={handleTopicSubmit}
              placeholder={isTransitioning ? "Starting your learning journey..." : "e.g., Linear Equations, Polynomials, Factoring..."}
            />
          </div>
          
          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-2xl text-orange-800 text-sm max-w-xl">
              {errorMessage}
              <button 
                onClick={clearError}
                className="ml-2 text-orange-600 hover:text-orange-800 font-semibold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Transition Loading State */}
          {isTransitioning && (
            <div className="mt-4 text-stone-500 text-sm">
              <div className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
                Preparing your personalized learning experience...
              </div>
            </div>
          )}
        </div>

        {/* Available Topics Section */}
        {!isTransitioning && (
          <div className="mb-16 w-full flex flex-col items-center">
            {/* Current Support - Highlighted */}
            <div className="mb-6 text-center">
              <p className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
                Start Learning Now
              </p>
              <button
                onClick={() => handleTagClick('Algebra')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <span>📐</span>
                Algebra
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Available Now</span>
              </button>
            </div>

            {/* Coming Soon Topics */}
            <div className="flex flex-col items-center gap-3 mt-8">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                Coming Soon
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {['Calculus', 'Physics', 'Chemistry', 'Programming'].map((topic, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-stone-100 text-stone-400 rounded-xl text-sm font-medium cursor-not-allowed"
                    title="Coming soon!"
                  >
                    {topic}
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-2">
                More subjects on the way! 🚀
              </p>
            </div>
          </div>
        )}

        {/* Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mb-16">
          {/* Step 1 */}
          <div className="hero-card p-8 text-center step-item">
            <div className="step-icon bg-yellow-100 text-yellow-500 mx-auto">
              <Lightbulb weight="fill" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-3">
              1. Pick Any Topic
            </h3>
            <p className="text-stone-600 leading-relaxed">
              Type what you're curious about. We generate a custom micro-path instantly.
            </p>
          </div>

          {/* Step 2 */}
          <div className="hero-card p-8 text-center step-item">
            <div className="step-icon bg-purple-100 text-purple-500 mx-auto">
              <Target weight="fill" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-3">
              2. Live Adaptation
            </h3>
            <p className="text-stone-600 leading-relaxed">
              Struggling? We break it down. Breezing through? We ramp it up. Real-time.
            </p>
          </div>

          {/* Step 3 */}
          <div className="hero-card p-8 text-center step-item">
            <div className="step-icon bg-pink-100 text-pink-500 mx-auto">
              <Trophy weight="fill" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-3">
              3. Fun & Fluid
            </h3>
            <p className="text-stone-600 leading-relaxed">
              Learning shouldn't feel like work. We make the hard stuff feel cozy and doable.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-stone-400 text-sm font-medium">
        Built for the future of learning.
      </footer>
    </div>
  );
}