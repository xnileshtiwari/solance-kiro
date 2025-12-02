'use client';

import React from 'react';

interface ProblemHeaderProps {
  question: string;
  missionNumber?: number;
  missionLabel?: string;
}

const ProblemHeader: React.FC<ProblemHeaderProps> = ({ 
  question, 
  missionNumber = 1,
  missionLabel = 'Mission'
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Mission Badge */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-white rounded-full px-6 py-2.5 shadow-md">
          <div className="w-2.5 h-2.5 bg-accent-coral rounded-full animate-pulse"></div>
          <span className="font-bold text-text-coffee text-xs tracking-wider uppercase">
            {missionLabel} {missionNumber}
          </span>
        </div>
      </div>

      {/* Problem Display */}
      <div className="hero-card p-10 md:p-12 text-center">
        <h1 className="math-font text-2xl md:text-3xl lg:text-4xl font-bold text-text-coffee leading-relaxed">
          {question || "Loading your algebra challenge..."}
        </h1>
      </div>
    </div>
  );
};

export default ProblemHeader;