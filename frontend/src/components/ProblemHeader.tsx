'use client';

import React from 'react';

interface ProblemHeaderProps {
  question: string;
  missionNumber?: number;
}

const ProblemHeader: React.FC<ProblemHeaderProps> = ({ 
  question, 
  missionNumber = 1 
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Mission Badge */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border-2 border-white rounded-full px-6 py-3 shadow-lg">
          <div className="w-3 h-3 bg-accent-coral rounded-full animate-pulse"></div>
          <span className="font-bold text-text-coffee text-sm tracking-wide">
            MISSION {missionNumber}
          </span>
        </div>
      </div>

      {/* Problem Display */}
      <div className="hero-card p-8 text-center">
        <h1 className="math-font text-3xl md:text-4xl lg:text-5xl font-bold text-text-coffee leading-relaxed">
          {question || "Loading your algebra challenge..."}
        </h1>
      </div>
    </div>
  );
};

export default ProblemHeader;