'use client';

import { Subject } from '../types';
import { BookOpen, Atom, Flask, Calculator, Code, ArrowRight } from '@phosphor-icons/react';

interface SubjectCardProps {
  subject: Subject;
  onClick: (subjectId: string) => void;
}

const subjectIcons: Record<string, React.ReactNode> = {
  chemistry: <Flask weight="fill" className="w-7 h-7" />,
  physics: <Atom weight="fill" className="w-7 h-7" />,
  math: <Calculator weight="fill" className="w-7 h-7" />,
  algebra: <Calculator weight="fill" className="w-7 h-7" />,
  programming: <Code weight="fill" className="w-7 h-7" />,
  default: <BookOpen weight="fill" className="w-7 h-7" />,
};

export default function SubjectCard({ subject, onClick }: SubjectCardProps) {
  const icon = subjectIcons[subject.subject.toLowerCase()] || subjectIcons.default;

  return (
    <button
      onClick={() => onClick(subject.subject_id)}
      className="subject-card group"
    >
      <div className="flex items-start gap-5 flex-1 min-w-0">
        <div className="subject-icon">
          {icon}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <h3 className="font-bold text-[var(--text-coffee)] text-xl mb-1">
            {subject.display_name}
          </h3>
          <p className="text-sm text-[var(--text-coffee)] opacity-60 mb-4">
            {subject.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {subject.curriculum_concepts.map((concept, idx) => (
              <span
                key={idx}
                className="concept-tag"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="subject-go-btn">
        <ArrowRight size={24} weight="bold" />
      </div>
    </button>
  );
}

export function SubjectCardSkeleton() {
  return (
    <div className="subject-card-skeleton">
      <div className="flex items-start gap-5 flex-1">
        <div className="w-14 h-14 rounded-2xl bg-white/50 animate-pulse" />
        <div className="flex-1">
          <div className="h-6 w-3/4 bg-white/50 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-full bg-white/50 rounded-lg animate-pulse mb-4" />
          <div className="flex flex-wrap gap-2">
            <div className="h-7 w-20 bg-white/50 rounded-full animate-pulse" />
            <div className="h-7 w-24 bg-white/50 rounded-full animate-pulse" />
            <div className="h-7 w-16 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      <div className="w-14 h-14 rounded-full bg-white/50 animate-pulse self-center" />
    </div>
  );
}
