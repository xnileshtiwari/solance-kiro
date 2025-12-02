'use client';

import { useState } from 'react';

interface NormalModeProps {
    onSubmit: (answer: string) => Promise<void>;
    disabled?: boolean;
}

export function NormalMode({ onSubmit, disabled = false }: NormalModeProps) {
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!answer.trim() || isSubmitting || disabled) return;

        setIsSubmitting(true);
        try {
            await onSubmit(answer);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 pb-8">
            <div 
                className="rounded-[24px] p-8 border border-white/30 relative overflow-hidden"
                style={{
                    background: 'rgba(255, 255, 255, 0.35)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(74, 64, 54, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                }}
            >
                <div className="mb-4">
                    <label 
                        className="block text-sm font-medium text-stone-700 mb-3" 
                        style={{ letterSpacing: '0.01em' }}
                    >
                        Your Answer
                    </label>
                    <div className="relative">
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Type your answer here..."
                            disabled={isSubmitting || disabled}
                            className="w-full px-5 py-4 rounded-2xl focus:outline-none transition-all duration-300 resize-none text-stone-900 placeholder-stone-400 disabled:cursor-not-allowed text-base leading-relaxed"
                            style={{
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                fontSize: '16px',
                                lineHeight: '1.6',
                                background: 'rgba(255, 255, 255, 0.5)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                border: '1.5px solid rgba(255, 255, 255, 0.6)',
                                boxShadow: '0 4px 16px rgba(74, 64, 54, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                            }}
                            rows={4}
                            onFocus={(e) => {
                                e.target.style.border = '1.5px solid rgba(16, 185, 129, 0.4)';
                                e.target.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 0 0 3px rgba(16, 185, 129, 0.08)';
                            }}
                            onBlur={(e) => {
                                e.target.style.border = '1.5px solid rgba(255, 255, 255, 0.6)';
                                e.target.style.boxShadow = '0 4px 16px rgba(74, 64, 54, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                            }}
                        />
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={!answer.trim() || isSubmitting || disabled}
                    className="w-full px-6 py-3.5 text-white font-semibold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(20, 184, 166, 0.95) 100%)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    }}
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Submitting...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Submit Answer
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
