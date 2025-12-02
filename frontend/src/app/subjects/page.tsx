'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Book, MathOperations, Atom, Globe, ChartLine, Palette, ArrowRight, Sparkle } from '@phosphor-icons/react';
import { apiService } from '../../services/apiService';
import { Subject } from '../../types';
import { ApiErrorDisplay } from '../../components';
import { useAuth } from '../../hooks/useAuth';

// Subject icon mapping
const subjectIcons: { [key: string]: any } = {
    'algebra': MathOperations,
    'mathematics': MathOperations,
    'math': MathOperations,
    'science': Atom,
    'physics': Atom,
    'chemistry': Atom,
    'biology': Atom,
    'history': Globe,
    'geography': Globe,
    'economics': ChartLine,
    'business': ChartLine,
    'art': Palette,
    'default': Book
};

// Color schemes for different subjects
const subjectColors: { [key: string]: { bg: string; iconBg: string; accent: string } } = {
    'algebra': { bg: 'from-amber-50 to-orange-50', iconBg: 'bg-amber-100', accent: 'text-amber-600' },
    'mathematics': { bg: 'from-blue-50 to-indigo-50', iconBg: 'bg-blue-100', accent: 'text-blue-600' },
    'science': { bg: 'from-purple-50 to-pink-50', iconBg: 'bg-purple-100', accent: 'text-purple-600' },
    'history': { bg: 'from-orange-50 to-red-50', iconBg: 'bg-orange-100', accent: 'text-orange-600' },
    'default': { bg: 'from-rose-50 to-pink-50', iconBg: 'bg-rose-100', accent: 'text-rose-600' }
};

const getSubjectIcon = (subjectName: string) => {
    const key = subjectName.toLowerCase();
    for (const [keyword, Icon] of Object.entries(subjectIcons)) {
        if (key.includes(keyword)) return Icon;
    }
    return subjectIcons.default;
};

const getSubjectColors = (subjectName: string) => {
    const key = subjectName.toLowerCase();
    for (const [keyword, colors] of Object.entries(subjectColors)) {
        if (key.includes(keyword)) return colors;
    }
    return subjectColors.default;
};

// Skeleton loader for subject cards
const SubjectCardSkeleton = () => (
    <div className="subject-card-skeleton">
        <div className="flex flex-col h-full">
            <div className="w-14 h-14 rounded-2xl bg-stone-200/60 animate-pulse mb-4" />
            <div className="h-7 w-3/4 bg-stone-200/60 rounded-lg animate-pulse mb-3" />
            <div className="space-y-2 mb-4 flex-grow">
                <div className="h-4 bg-stone-200/60 rounded animate-pulse w-full" />
                <div className="h-4 bg-stone-200/60 rounded animate-pulse w-4/5" />
            </div>
            <div className="flex flex-wrap gap-2">
                <div className="h-7 w-16 bg-stone-200/60 rounded-full animate-pulse" />
                <div className="h-7 w-20 bg-stone-200/60 rounded-full animate-pulse" />
            </div>
        </div>
    </div>
);


// Subject card component
const SubjectCard = ({ subject }: { subject: Subject }) => {
    const [showAllTags, setShowAllTags] = useState(false);
    const Icon = getSubjectIcon(subject.subject);
    const colors = getSubjectColors(subject.subject);

    const visibleTags = showAllTags
        ? subject.curriculum_concepts
        : subject.curriculum_concepts.slice(0, 3);

    return (
        <Link href={`/learn/${subject.subject_id}`} className="group block">
            <div className={`subject-card h-full bg-gradient-to-br ${colors.bg} !border-transparent hover:!border-accent-coral`}>
                <div className="flex flex-col h-full">
                    {/* Icon */}
                    <div className={`subject-icon ${colors.iconBg} ${colors.accent}`}>
                        <Icon size={28} weight="fill" />
                    </div>

                    {/* Content */}
                    <div className="flex-grow mt-4">
                        <h3 className="text-xl font-bold text-text-coffee mb-2 group-hover:text-accent-coral transition-colors">
                            {subject.display_name}
                        </h3>
                        <p className="text-sm text-stone-500 leading-relaxed line-clamp-2">
                            {subject.description}
                        </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {visibleTags.map((concept, index) => (
                            <span key={index} className="concept-tag">
                                {concept}
                            </span>
                        ))}
                        {subject.curriculum_concepts.length > 3 && !showAllTags && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowAllTags(true);
                                }}
                                className="concept-tag hover:bg-accent-coral/20 hover:border-accent-coral/40"
                            >
                                +{subject.curriculum_concepts.length - 3}
                            </button>
                        )}
                    </div>

                    {/* Action */}
                    <div className="flex items-center gap-2 mt-6 text-text-coffee font-bold text-sm group-hover:text-accent-coral transition-colors">
                        <span>Start Learning</span>
                        <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default function SubjectsPage() {
    const { isLoading: isAuthLoading, isAuthenticated } = useAuth({ requireAuth: true, redirectTo: '/auth' });
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const data = await apiService.getSubjects();
                setSubjects(data);
            } catch (err) {
                console.error('Failed to fetch subjects:', err);
                setError('Failed to load subjects. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchSubjects();
        }
    }, [isAuthenticated]);

    const handleRetry = () => {
        setIsLoading(true);
        setError(null);
        apiService.getSubjects()
            .then(data => {
                setSubjects(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch subjects:', err);
                setError('Failed to load subjects. Please try again later.');
                setIsLoading(false);
            });
    };

    // Don't render anything if not authenticated (will redirect)
    if (!isAuthenticated && !isAuthLoading) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col">

            <main className="flex-grow px-4 md:px-8 py-12 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm text-text-coffee px-4 py-2 rounded-full text-sm font-bold mb-6 border border-white/80">
                        <Sparkle size={16} weight="fill" className="text-accent-sun" />
                        Choose Your Path
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-8">
                        <ApiErrorDisplay error={error} onRetry={handleRetry} showRetry={true} />
                    </div>
                )}

                {/* Subjects Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {isLoading || isAuthLoading ? (
                        <>
                            <SubjectCardSkeleton />
                            <SubjectCardSkeleton />
                            <SubjectCardSkeleton />
                            <SubjectCardSkeleton />
                            <SubjectCardSkeleton />
                            <SubjectCardSkeleton />
                        </>
                    ) : (
                        subjects.map((subject) => (
                            <SubjectCard key={subject.subject_id} subject={subject} />
                        ))
                    )}
                </div>

                {/* Empty State */}
                {!isLoading && !isAuthLoading && subjects.length === 0 && !error && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 rounded-3xl bg-stone-100 flex items-center justify-center mx-auto mb-6">
                            <Book size={40} className="text-stone-400" />
                        </div>
                        <h3 className="text-xl font-bold text-text-coffee mb-2">No subjects yet</h3>
                        <p className="text-stone-500">Check back soon for new learning paths.</p>
                    </div>
                )}
            </main>

            <footer className="py-8 text-center text-stone-400 text-sm font-medium">
                Built for the future of learning.
            </footer>
        </div>
    );
}
