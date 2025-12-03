'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Warning, Code, Sparkle, FloppyDisk, Plus, Trash, CaretDown, CaretUp } from '@phosphor-icons/react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/apiService';

// Types for the form state
interface CurriculumLevel {
    level: number;
    name: string;
    concepts: string[];
    question_style: string;
}

interface SubjectForm {
    display_name: string;
    subject: string;
    description: string;
    public: boolean;
    curriculum: CurriculumLevel[];
}

const DEFAULT_FORM_STATE: SubjectForm = {
    display_name: '',
    subject: '',
    description: '',
    public: false,
    curriculum: [
        {
            level: 1,
            name: '',
            concepts: [''],
            question_style: ''
        }
    ]
};

export default function StudioPage() {
    const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth({ requireAuth: true, redirectTo: '/auth' });
    const router = useRouter();

    // Form State
    const [formData, setFormData] = useState<SubjectForm>(DEFAULT_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // UI State
    const [expandedLevel, setExpandedLevel] = useState<number | null>(1);

    const handleInputChange = (field: keyof SubjectForm, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLevelChange = (index: number, field: keyof CurriculumLevel, value: any) => {
        const newCurriculum = [...formData.curriculum];
        newCurriculum[index] = { ...newCurriculum[index], [field]: value };
        setFormData(prev => ({ ...prev, curriculum: newCurriculum }));
    };

    const handleConceptChange = (levelIndex: number, conceptIndex: number, value: string) => {
        const newCurriculum = [...formData.curriculum];
        const newConcepts = [...newCurriculum[levelIndex].concepts];
        newConcepts[conceptIndex] = value;
        newCurriculum[levelIndex].concepts = newConcepts;
        setFormData(prev => ({ ...prev, curriculum: newCurriculum }));
    };

    const addConcept = (levelIndex: number) => {
        const newCurriculum = [...formData.curriculum];
        newCurriculum[levelIndex].concepts.push('');
        setFormData(prev => ({ ...prev, curriculum: newCurriculum }));
    };

    const removeConcept = (levelIndex: number, conceptIndex: number) => {
        const newCurriculum = [...formData.curriculum];
        newCurriculum[levelIndex].concepts = newCurriculum[levelIndex].concepts.filter((_, i) => i !== conceptIndex);
        setFormData(prev => ({ ...prev, curriculum: newCurriculum }));
    };

    const addLevel = () => {
        const newLevelNumber = formData.curriculum.length + 1;
        setFormData(prev => ({
            ...prev,
            curriculum: [
                ...prev.curriculum,
                {
                    level: newLevelNumber,
                    name: '',
                    concepts: [''],
                    question_style: 'Conceptual/Numerical'
                }
            ]
        }));
        setExpandedLevel(newLevelNumber);
    };

    const removeLevel = (index: number) => {
        if (formData.curriculum.length <= 1) return;
        const newCurriculum = formData.curriculum.filter((_, i) => i !== index).map((level, i) => ({
            ...level,
            level: i + 1
        }));
        setFormData(prev => ({ ...prev, curriculum: newCurriculum }));
    };

    const handleSubmit = async () => {
        setError(null);
        setIsSubmitting(true);

        try {
            // Validation
            if (!formData.display_name) throw new Error("Please enter a display name");
            if (!formData.description) throw new Error("Please enter a description");

            // Construct JSON payload
            const payload = {
                meta: {
                    display_name: formData.display_name,
                    subject: formData.subject,
                    description: formData.description,
                    created_by: user?.id,
                    public: formData.public
                },
                curriculum: formData.curriculum.map(c => ({
                    ...c,
                    concepts: c.concepts.filter(concept => concept.trim() !== '')
                }))
            };

            await apiService.createSubject(payload);
            setSuccess(true);
        } catch (err: any) {
            console.error("Submission error:", err);
            setError(err.message || "Failed to create subject");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated && !isAuthLoading) {
        return null;
    }

    if (success) {
        return (
            <div className="flex items-center justify-center py-20 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-stone-100 relative z-10">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} weight="fill" className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-coffee mb-2">Subject Created!</h2>
                    <p className="text-stone-500 mb-8">
                        Your new subject has been successfully added to the curriculum.
                    </p>
                    <button
                        onClick={() => router.push('/subjects')}
                        className="w-full py-3 px-6 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <span>Start Learning</span>
                        <ArrowRight size={20} weight="bold" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-grow px-4 md:px-8 py-8 max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 text-accent-coral font-bold text-sm mb-1">
                            <Sparkle size={16} weight="fill" />
                            <span>Studio</span>
                        </div>
                        <h1 className="text-3xl font-bold text-text-coffee">Create New Subject</h1>
                        <p className="text-stone-500 mt-1">Design a custom learning path for your students.</p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-[#4A4036] text-white rounded-xl font-bold hover:bg-stone-800 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-stone-200"
                    >
                        {isSubmitting ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <FloppyDisk size={20} weight="bold" />
                        )}
                        <span>Save Subject</span>
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-start gap-3">
                        <Warning size={20} weight="fill" className="mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-bold">Error</p>
                            <p className="text-sm opacity-90">{error}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-8">
                    {/* Basic Info Section */}
                    <section className="hero-card p-8 !transform-none !transition-none hover:!transform-none">
                        <h2 className="text-xl font-bold text-text-coffee mb-6 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                <Code size={20} weight="bold" />
                            </div>
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-stone-700">Display Name</label>
                                <div className="cozy-input-container !transform-none !transition-none hover:!transform-none focus-within:!transform-none">
                                    <input
                                        type="text"
                                        value={formData.display_name}
                                        onChange={(e) => handleInputChange('display_name', e.target.value)}
                                        placeholder="e.g., Advanced Algebra"
                                        className="cozy-input w-full !text-left !pl-4"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-stone-700">Subject Category</label>
                                <div className="cozy-input-container !transform-none !transition-none hover:!transform-none focus-within:!transform-none">
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => handleInputChange('subject', e.target.value)}
                                        placeholder="e.g., Mathematics"
                                        className="cozy-input w-full !text-left !pl-4"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-stone-700">Visibility</label>
                                <div className="cozy-input-container !transform-none !transition-none hover:!transform-none focus-within:!transform-none flex items-center gap-3 !px-4">
                                    <input
                                        type="checkbox"
                                        checked={formData.public}
                                        onChange={(e) => handleInputChange('public', e.target.checked)}
                                        className="w-5 h-5 accent-accent-coral cursor-pointer"
                                        id="public-toggle"
                                    />
                                    <label htmlFor="public-toggle" className="text-stone-600 cursor-pointer select-none">
                                        Make this subject public
                                    </label>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-stone-700">Description</label>
                                <div className="cozy-input-container !rounded-3xl !transform-none !transition-none hover:!transform-none focus-within:!transform-none">
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="e.g., Advanced algebraic concepts including quadratic equations and polynomials"
                                        rows={3}
                                        className="cozy-input w-full !text-left !pl-4 !py-2 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Curriculum Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-bold text-text-coffee flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <Sparkle size={20} weight="bold" />
                                </div>
                                Curriculum Levels
                            </h2>
                            <button
                                onClick={addLevel}
                                className="text-sm font-bold text-accent-coral hover:text-orange-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                            >
                                <Plus size={16} weight="bold" />
                                Add Level
                            </button>
                        </div>

                        {formData.curriculum.map((level, index) => (
                            <div key={index} className="hero-card overflow-hidden !p-0 !transform-none !transition-none hover:!transform-none">
                                <div
                                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/40 transition-colors"
                                    onClick={() => setExpandedLevel(expandedLevel === level.level ? null : level.level)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/80 text-stone-600 flex items-center justify-center font-bold text-lg shadow-sm">
                                            {level.level}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-stone-800 text-lg">{level.name || `Level ${level.level}`}</h3>
                                            <p className="text-sm text-stone-500">{level.concepts.length} concepts</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeLevel(index);
                                            }}
                                            disabled={formData.curriculum.length === 1}
                                            className="p-2 text-stone-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
                                        >
                                            <Trash size={20} />
                                        </button>
                                        {expandedLevel === level.level ? (
                                            <CaretUp size={20} className="text-stone-400" />
                                        ) : (
                                            <CaretDown size={20} className="text-stone-400" />
                                        )}
                                    </div>
                                </div>

                                {expandedLevel === level.level && (
                                    <div className="p-6 border-t border-white/50 bg-white/20">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-stone-700">Level Name</label>
                                                <div className="cozy-input-container !transform-none !transition-none hover:!transform-none focus-within:!transform-none">
                                                    <input
                                                        type="text"
                                                        value={level.name}
                                                        onChange={(e) => handleLevelChange(index, 'name', e.target.value)}
                                                        placeholder="e.g., Basic Equations"
                                                        className="cozy-input w-full !text-left !pl-4"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-stone-700">Question Style</label>
                                                <div className="cozy-input-container !transform-none !transition-none hover:!transform-none focus-within:!transform-none">
                                                    <input
                                                        type="text"
                                                        value={level.question_style}
                                                        onChange={(e) => handleLevelChange(index, 'question_style', e.target.value)}
                                                        placeholder="e.g., Conceptual/Numerical"
                                                        className="cozy-input w-full !text-left !pl-4"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-stone-700 block">Concepts</label>
                                            {level.concepts.map((concept, cIndex) => (
                                                <div key={cIndex} className="flex gap-2">
                                                    <div className="cozy-input-container flex-grow !transform-none !transition-none hover:!transform-none focus-within:!transform-none">
                                                        <input
                                                            type="text"
                                                            value={concept}
                                                            onChange={(e) => handleConceptChange(index, cIndex, e.target.value)}
                                                            placeholder="e.g., Linear equations"
                                                            className="cozy-input w-full !text-left !pl-4"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => removeConcept(index, cIndex)}
                                                        className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                    >
                                                        <Trash size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addConcept(index)}
                                                className="text-sm font-bold text-accent-coral hover:text-orange-700 flex items-center gap-1 mt-2 ml-1"
                                            >
                                                <Plus size={14} weight="bold" />
                                                Add Concept
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </section>
                </div>
            </main>
        </div>
    );
}
