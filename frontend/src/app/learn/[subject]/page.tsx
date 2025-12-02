'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import {
    LoadingSpinner,
    ApiErrorDisplay,
    ApiFallback,
    CozySuccessModal,
    QuestionHeader,
    ModeToggle,
    NormalMode,
    AssistMode,
    BackgroundBlobs
} from '../../../components';
import { useLearnPage } from '../../../hooks/useLearnPage';
import { useAuth } from '../../../hooks/useAuth';

function LearnPageContent() {
    const params = useParams();
    const router = useRouter();
    const rawSubject = params.subject;
    const subjectId = Array.isArray(rawSubject) ? rawSubject[0] : rawSubject;
    
    const { isLoading: isAuthLoading, isAuthenticated } = useAuth({ requireAuth: true, redirectTo: '/auth' });

    const {
        session,
        isLoading,
        error,
        currentLevel,
        currentStep,
        completedSteps,
        showSuccessModal,
        isInitializing,
        isLoadingNewQuestion,
        insight,
        currentScore,
        mode,
        handleAnswerSubmit,
        handleNormalModeSubmit,
        handleNextChallenge,
        handleModeToggle,
        handleRetryConnection,
        clearError
    } = useLearnPage(subjectId!);

    useEffect(() => {
        if (!subjectId) {
            router.push('/subjects');
        }
    }, [subjectId, router]);

    // Don't render if not authenticated (will redirect)
    if (!isAuthenticated && !isAuthLoading) {
        return null;
    }

    if (!subjectId) {
        return null;
    }

    if (error && isInitializing) {
        return (
            <ApiFallback
                onRetry={handleRetryConnection}
                onGoHome={() => router.push('/subjects')}
                showMockOption={false}
                message="We're having trouble connecting to our AI tutoring service. Please try again."
            />
        );
    }

    if (isInitializing || isLoadingNewQuestion) {
        return (
            <div className="min-h-screen flex flex-col bg-background-cream">
                <div className="flex-1 flex items-center justify-center">
                    <LoadingSpinner
                        size="lg"
                        message="Preparing your challenge..."
                        className="text-center"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col relative overflow-x-hidden" style={{ backgroundColor: '#FFF8F3' }}>
            <BackgroundBlobs />

            {error && !isInitializing && (
                <div className="w-full px-4 py-2 relative z-10">
                    <div className="max-w-2xl mx-auto">
                        <ApiErrorDisplay
                            error={error}
                            onRetry={handleRetryConnection}
                            onDismiss={clearError}
                            showRetry={true}
                        />
                    </div>
                </div>
            )}

            <div className="w-full py-6 text-center relative z-10 px-4">
                <div className="max-w-3xl mx-auto">
                    <QuestionHeader
                        question={session.currentQuestion}
                        currentLevel={currentLevel}
                        isLoading={isInitializing || isLoadingNewQuestion}
                    />

                    {session.currentQuestion && !isInitializing && !isLoadingNewQuestion && (
                        <ModeToggle mode={mode} onToggle={handleModeToggle} />
                    )}

                    {((completedSteps.length > 0 || currentStep || isLoading || mode === 'normal') && 
                      !isInitializing && !isLoadingNewQuestion && session.currentQuestion) && (
                        <div className="connector-line" />
                    )}
                </div>
            </div>

            <div className="flex-1 w-full relative z-10 overflow-y-auto">
                {mode === 'normal' ? (
                    <NormalMode 
                        onSubmit={handleNormalModeSubmit}
                        disabled={showSuccessModal}
                    />
                ) : (
                    <AssistMode
                        currentStep={currentStep}
                        completedSteps={completedSteps}
                        onAnswerSubmit={handleAnswerSubmit}
                        isLoading={isLoading}
                    />
                )}
            </div>

            <CozySuccessModal
                isOpen={showSuccessModal}
                onNextChallenge={handleNextChallenge}
                score={currentScore}
                insight={insight}
            />

            <style jsx>{`
                .connector-line {
                    width: 4px;
                    background-color: #E5E5E0;
                    margin: 0 auto;
                    height: 40px;
                    border-radius: 4px;
                    opacity: 0;
                    animation: growLine 0.4s ease forwards;
                }

                @keyframes growLine {
                    from {
                        height: 0;
                        opacity: 0;
                    }
                    to {
                        height: 40px;
                        opacity: 1;
                    }
                }

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
        </div>
    );
}

export default function LearnPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background-cream">
                <LoadingSpinner size="lg" message="Loading..." />
            </div>
        }>
            <LearnPageContent />
        </Suspense>
    );
}
