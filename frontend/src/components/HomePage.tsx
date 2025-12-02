'use client';

import { Lightbulb, Target, Trophy, ArrowClockwise } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import Navigation from './Navigation';
import SubjectCard, { SubjectCardSkeleton } from './SubjectCard';
import { useSubjects } from '../hooks/useSubjects';

export default function HomePage() {
  const { subjects, isLoading, error: subjectsError, refetch } = useSubjects();
  const router = useRouter();

  const handleSubjectClick = (subjectId: string) => {
    router.push(`/learn/${subjectId}`);
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

        {/* Available Subjects Section */}
        <div className="mb-16 w-full max-w-2xl mx-auto">
          <div className="text-center mb-6">
          </div>

          {/* Subjects Grid */}
          <div className="space-y-3">
            {isLoading ? (
              <>
                <SubjectCardSkeleton />
                <SubjectCardSkeleton />
              </>
            ) : subjectsError ? (
              <div className="text-center p-6 bg-orange-50 border border-orange-200 rounded-2xl">
                <p className="text-orange-800 mb-3">{subjectsError}</p>
                <button
                  onClick={refetch}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                >
                  <ArrowClockwise weight="bold" className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center p-6 bg-stone-50 border border-stone-200 rounded-2xl">
                <p className="text-stone-500">No subjects available yet.</p>
                <p className="text-sm text-stone-400 mt-1">Check back soon!</p>
              </div>
            ) : (
              subjects.map((subject) => (
                <SubjectCard
                  key={subject.subject_id}
                  subject={subject}
                  onClick={handleSubjectClick}
                />
              ))
            )}
          </div>
        </div>

        {/* Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mb-16">
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
