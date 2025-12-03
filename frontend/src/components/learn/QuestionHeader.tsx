'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface QuestionHeaderProps {
    question: string | null;
    currentLevel: number;
    isLoading: boolean;
}

export function QuestionHeader({ question, currentLevel, isLoading }: QuestionHeaderProps) {
    if (!question || isLoading) {
        return (
            <>
                <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgba(74,64,54,0.06)] p-8 border border-white/60 backdrop-blur-sm">
                    <div className="h-6 w-24 bg-stone-200 rounded-full mx-auto mb-6 shimmer" />
                    <div className="h-12 w-3/4 bg-stone-200 rounded mx-auto mb-2 shimmer" />
                    <div className="h-12 w-1/2 bg-stone-200 rounded mx-auto shimmer" />
                </div>
                <style jsx>{`
                    .shimmer {
                        background: linear-gradient(90deg, #E7E5E4 0%, #F5F5F4 50%, #E7E5E4 100%);
                        background-size: 200% 100%;
                        animation: shimmer 1.5s infinite linear;
                    }

                    @keyframes shimmer {
                        0% {
                            background-position: 200% 0;
                        }
                        100% {
                            background-position: -200% 0;
                        }
                    }
                `}</style>
            </>
        );
    }

    return (
        <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgba(74,64,54,0.06)] p-8 border border-white/60 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_12px_40px_rgba(74,64,54,0.1)]">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-stone-50 rounded-full text-xs font-bold text-stone-500 mb-6 tracking-wider uppercase border border-stone-100">
                <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                Level {currentLevel}
            </div>
            <div
                className={`font-semibold text-stone-900 leading-relaxed ${question.length > 100 ? 'text-xl md:text-2xl' :
                        question.length > 50 ? 'text-2xl md:text-3xl' :
                            'text-3xl md:text-4xl'
                    } [&>p]:inline [&>p]:m-0`}
                style={{
                    fontFamily: 'var(--font-ibm-plex-mono), monospace',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.5'
                }}
            >
                <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                        p: ({ node, ...props }) => <p style={{ display: 'inline' }} {...props} />
                    }}
                >
                    {question}
                </ReactMarkdown>
            </div>
        </div>
    );
}
