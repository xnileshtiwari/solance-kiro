'use client';

import React, { useEffect, useState } from 'react';
import { X, Trophy, Star, ArrowRight } from '@phosphor-icons/react';

interface PerformanceInsight {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextChallenge: () => void;
  completionTime?: number; // in seconds
  mistakeCount?: number;
  score?: number; // marks out of 10
  insights?: PerformanceInsight[];
  className?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  onNextChallenge,
  completionTime = 0,
  mistakeCount = 0,
  score = 0,
  insights = [],
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle modal visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 50);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  // Default insights if none provided
  const defaultInsights: PerformanceInsight[] = [
    {
      title: "Great Problem Solving!",
      description: "You worked through each step methodically and arrived at the correct answer.",
      icon: <Trophy size={24} className="text-accent-sun" />
    },
    {
      title: "Keep Practicing",
      description: "Regular practice with algebra problems will help build your confidence and speed.",
      icon: <Star size={24} className="text-accent-coral" />
    }
  ];

  const displayInsights = insights.length > 0 ? insights : defaultInsights;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleNextChallenge = () => {
    onNextChallenge();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${isAnimating
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 translate-y-4'
          }`}
      >
        {/* Header */}
        <div className="relative p-8 pb-6">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-text-coffee" />
          </button>

          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-sage rounded-full mb-4">
              <Trophy size={40} className="text-white" weight="fill" />
            </div>
            <h2 className="text-3xl font-bold text-text-coffee mb-2">
              Excellent Work!
            </h2>
            <p className="text-text-coffee/70 text-lg">
              You've successfully completed this algebra problem
            </p>
          </div>
        </div>

        {/* Score Display */}
        <div className="px-8 pb-6">
          <div className="bg-gradient-to-br from-accent-sage to-green-600 rounded-3xl p-6 text-center text-white shadow-lg">
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
        </div>

        {/* Performance Stats */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-bg-warm rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-text-coffee mb-1">
                {formatTime(completionTime)}
              </div>
              <div className="text-sm text-text-coffee/60">
                Completion Time
              </div>
            </div>
            <div className="bg-bg-warm rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-text-coffee mb-1">
                {mistakeCount}
              </div>
              <div className="text-sm text-text-coffee/60">
                {mistakeCount === 1 ? 'Mistake' : 'Mistakes'}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="px-8 pb-6">
          <h3 className="text-lg font-bold text-text-coffee mb-4">
            Performance Insights
          </h3>
          <div className="space-y-3">
            {displayInsights.map((insight, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-bg-warm rounded-2xl"
              >
                <div className="flex-shrink-0 mt-1">
                  {insight.icon}
                </div>
                <div>
                  <div className="font-semibold text-text-coffee mb-1">
                    {insight.title}
                  </div>
                  <div className="text-sm text-text-coffee/70">
                    {insight.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-8 pt-0">
          <button
            onClick={handleNextChallenge}
            className="w-full bg-accent-sage hover:bg-accent-sage/90 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
          >
            Next Challenge
            <ArrowRight size={20} weight="bold" />
          </button>

          <button
            onClick={onClose}
            className="w-full mt-3 text-text-coffee/60 hover:text-text-coffee font-semibold py-2 transition-colors"
          >
            Take a Break
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
export type { PerformanceInsight };