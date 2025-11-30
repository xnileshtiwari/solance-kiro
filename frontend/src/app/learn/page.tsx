'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import {
  Navigation,
  LoadingSpinner,
  ApiErrorDisplay,
  ApiFallback,
  BlockInterface,
  CozySuccessModal,
  type BlockStep
} from '../../components';
import { useApiLearningSession } from '../../hooks';
import { ConversationStep, PreviousQuestion } from '../../types';
import { apiService } from '../../services/apiService';

export default function LearnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topic = searchParams.get('topic');

  const {
    session,
    isLoading,
    error,
    generateNewQuestion,
    getNextStep,
    addConversationStep,
    addQuestionToHistory,
    markSessionComplete,
    clearError
  } = useApiLearningSession();

  const [currentStep, setCurrentStep] = useState<BlockStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Array<{ id: number; prompt: string; answer: string }>>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingNewQuestion, setIsLoadingNewQuestion] = useState(false);
  const [insight, setInsight] = useState<{ title: string; description: string } | undefined>();
  const [currentScore, setCurrentScore] = useState<number>(0);
  
  // Mode state: 'normal' or 'assist'
  const [mode, setMode] = useState<'normal' | 'assist'>('normal');
  const [normalModeAnswer, setNormalModeAnswer] = useState('');
  const [isSubmittingNormalAnswer, setIsSubmittingNormalAnswer] = useState(false);

  // Refs to prevent double calls
  const questionInitialized = useRef(false);
  const stepInitialized = useRef(false);
  // Helper function to handle session completion
  const handleSessionComplete = (marks: number, remarks: string[], tip?: string) => {
    markSessionComplete();

    // Store the score
    setCurrentScore(marks);

    // Add question to history with performance data
    const questionHistory: PreviousQuestion = {
      question: session.currentQuestion,
      score: marks,
      remarks: remarks,
    };
    addQuestionToHistory(questionHistory);

    // Set insight with tip from backend
    if (tip) {
      setInsight({
        title: "",
        description: tip
      });
    }

    setShowSuccessModal(true);
  };

  // Initialize session - generate question
  useEffect(() => {
    if (topic && !session.currentQuestion && !questionInitialized.current) {
      questionInitialized.current = true;
      setIsInitializing(true);
      clearError();

      generateNewQuestion().then(() => {
        setIsInitializing(false);
      }).catch((err) => {
        console.error('Failed to initialize with API:', err);
        setIsInitializing(false);
        questionInitialized.current = false; // Reset on error so user can retry
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  // Get first step when question is available (only in assist mode)
  useEffect(() => {
    const fetchFirstStep = async () => {
      const stepResponse = await getNextStep();
      if (stepResponse) {
        // Check if this is the final answer
        if (stepResponse.step_number === -1) {
          // Session complete
          handleSessionComplete(stepResponse.marks || 0, stepResponse.remarks || [], stepResponse.tip);
        } else {
          // Set current step
          setCurrentStep({
            id: stepResponse.step_number,
            prompt: stepResponse.prompt
          });
        }
      }
    };

    if (mode === 'assist' && session.currentQuestion && !currentStep && completedSteps.length === 0 && !stepInitialized.current) {
      stepInitialized.current = true;
      fetchFirstStep().catch(() => {
        stepInitialized.current = false; // Reset on error so user can retry
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.currentQuestion, mode]);

  // Redirect to homepage if no topic is provided
  useEffect(() => {
    if (!topic) {
      router.push('/');
    }
  }, [topic, router]);

  const handleAnswerSubmit = async (answer: string): Promise<{ isCorrect: boolean; feedback?: string }> => {
    if (!currentStep) {
      return { isCorrect: false, feedback: 'No current step available' };
    }

    // Add conversation step
    const conversationStep: ConversationStep = {
      step: currentStep.id,
      your_prompt: currentStep.prompt,
      student_answer: answer
    };
    addConversationStep(conversationStep);

    // Move current step to completed
    setCompletedSteps(prev => [
      ...prev,
      {
        id: currentStep.id,
        prompt: currentStep.prompt,
        answer: answer
      }
    ]);

    // Clear current step immediately to prevent duplication while loading next step
    setCurrentStep(null);

    // Get next step from API with updated history
    const updatedHistory = [...session.conversationHistory, conversationStep];
    const stepResponse = await getNextStep(updatedHistory);

    if (stepResponse) {
      if (stepResponse.step_number === -1) {
        // Session complete - clear current step
        setCurrentStep(null);
        handleSessionComplete(stepResponse.marks || 0, stepResponse.remarks || [], stepResponse.tip);
        return { isCorrect: true };
      } else {
        // Always move to next step (whether answer was correct or incorrect)
        setCurrentStep({
          id: stepResponse.step_number,
          prompt: stepResponse.prompt
        });
        return { isCorrect: true };
      }
    }

    return { isCorrect: false, feedback: 'Failed to get next step' };
  };

  const handleNormalModeSubmit = async () => {
    if (!normalModeAnswer.trim() || isSubmittingNormalAnswer) return;

    setIsSubmittingNormalAnswer(true);
    clearError();

    try {
      // Call the step generator API with question and student_answer (normal mode)
      const response = await apiService.generateSteps({
        model_name: 'gemini-2.5-flash',
        question: session.currentQuestion,
        student_answer: normalModeAnswer
      });

      // Check if we got the final answer
      if (response.step_number === -1) {
        handleSessionComplete(response.marks || 0, response.remarks || [], response.tip);
      }
    } catch (err) {
      console.error('Failed to submit normal mode answer:', err);
    } finally {
      setIsSubmittingNormalAnswer(false);
    }
  };

  const handleNextChallenge = async () => {
    setShowSuccessModal(false);
    setCurrentStep(null);
    setCompletedSteps([]);
    setNormalModeAnswer('');

    // Reset initialization flags for new question
    questionInitialized.current = false;
    stepInitialized.current = false;

    // Show skeleton immediately
    setIsLoadingNewQuestion(true);

    // Generate new question via API
    try {
      await generateNewQuestion();
    } finally {
      setIsLoadingNewQuestion(false);
    }
  };

  const handleModeToggle = () => {
    const newMode = mode === 'normal' ? 'assist' : 'normal';
    setMode(newMode);
    
    // Reset state when switching modes
    setCurrentStep(null);
    setCompletedSteps([]);
    setNormalModeAnswer('');
    stepInitialized.current = false;
    
    // If switching to assist mode and we have a question, initialize first step
    if (newMode === 'assist' && session.currentQuestion) {
      stepInitialized.current = false;
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleRetryConnection = () => {
    // Reset initialization flags to allow retry
    questionInitialized.current = false;
    stepInitialized.current = false;

    clearError();
    setIsInitializing(true);

    generateNewQuestion().then(() => {
      setIsInitializing(false);
    }).catch(() => {
      setIsInitializing(false);
    });
  };

  if (!topic) {
    return null; // Will redirect to homepage
  }

  // Show API fallback if there's a connection error during initialization
  if (error && isInitializing) {
    return (
      <ApiFallback
        onRetry={handleRetryConnection}
        onGoHome={handleBackToHome}
        showMockOption={false}
        message="We're having trouble connecting to our AI tutoring service. Please try again."
      />
    );
  }

  // Show loading state during initialization or when loading new question
  if (isInitializing || isLoadingNewQuestion) {
    return (
      <div className="min-h-screen flex flex-col bg-background-cream">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner
            size="lg"
            message="Preparing your algebra challenge..."
            className="text-center"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden" style={{ backgroundColor: '#FFF8F3' }}>
      {/* Cozy Background Blobs */}
      <div className="blob-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Navigation */}
      <Navigation />

      {/* API Error Display */}
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

      {/* Problem Header */}
      <div className="w-full py-6 text-center relative z-10 px-4" id="problem-header">
        <div className="max-w-3xl mx-auto">
          {(!session.currentQuestion || isInitializing || isLoadingNewQuestion) ? (
            // Question Skeleton
            <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgba(74,64,54,0.06)] p-8 border border-white/60 backdrop-blur-sm">
              <div className="h-6 w-24 bg-stone-200 rounded-full mx-auto mb-6 shimmer" />
              <div className="h-12 w-3/4 bg-stone-200 rounded mx-auto mb-2 shimmer" />
              <div className="h-12 w-1/2 bg-stone-200 rounded mx-auto shimmer" />
            </div>
          ) : (
            // Question Block
            <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgba(74,64,54,0.06)] p-8 border border-white/60 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_12px_40px_rgba(74,64,54,0.1)]">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-stone-50 rounded-full text-xs font-bold text-stone-500 mb-6 tracking-wider uppercase border border-stone-100">
                <svg className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 21C5 21.5523 4.55228 22 4 22C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2C4.55228 2 5 2.44772 5 3V21ZM5.82918 13.6162C6.98064 14.7073 8.44497 15.2289 9.94858 15.0635C11.4522 14.8981 12.8716 14.0592 14 13C15.1284 11.9408 16.5478 11.1019 18.0514 10.9365C19.555 10.7711 21.0194 11.2927 22.1708 12.3838C22.6924 12.878 23.5134 12.4565 23.4268 11.7455L22.8171 6.74551C22.759 6.26938 22.4518 5.86248 22.0094 5.66908C20.8039 5.14197 19.4632 4.96699 18.1606 5.11029C16.657 5.27568 15.2376 6.11457 14.1092 7.17346C12.9808 8.23235 11.5614 9.07124 10.0578 9.23663C8.55421 9.40202 7.08988 8.88043 5.93842 7.78932C5.41683 7.29513 4.59583 7.71663 4.68242 8.42764L5.29212 13.4276C5.35018 13.9038 5.65738 14.3107 6.09982 14.5041L5.82918 13.6162Z" />
                </svg>
                Mission
              </div>
              <h1
                className={`font-bold text-stone-800 leading-tight font-serif ${(session.currentQuestion?.length || 0) > 100 ? 'text-xl md:text-2xl' :
                  (session.currentQuestion?.length || 0) > 50 ? 'text-2xl md:text-3xl' :
                    'text-3xl md:text-5xl'
                  }`}
                style={{ fontFamily: 'var(--font-lora), serif' }}
              >
                {session.currentQuestion}
              </h1>
            </div>
          )}

          {/* Mode Toggle Button */}
          {session.currentQuestion && !isInitializing && !isLoadingNewQuestion && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleModeToggle}
                className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-[0_4px_20px_rgba(74,64,54,0.08)] border border-stone-200 hover:shadow-[0_6px_25px_rgba(74,64,54,0.12)] transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  {mode === 'normal' ? (
                    <>
                      <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span className="text-sm font-semibold text-stone-700">Normal Mode</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-sm font-semibold text-emerald-700">Assist Mode</span>
                    </>
                  )}
                </div>
                <div className="w-px h-5 bg-stone-200" />
                <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>
          )}

          {/* Connector Line from Question to First Step */}
          {((completedSteps.length > 0 || currentStep || isLoading || mode === 'normal') && !isInitializing && !isLoadingNewQuestion && session.currentQuestion) && (
            <div className="connector-line" />
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full relative z-10 overflow-y-auto">
        {mode === 'normal' ? (
          // Normal Mode: Direct Answer Input
          <div className="max-w-2xl mx-auto px-4 pb-8">
            <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgba(74,64,54,0.06)] p-8 border border-white/60 backdrop-blur-sm">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-stone-700 mb-3">
                  Your Answer
                </label>
                <textarea
                  value={normalModeAnswer}
                  onChange={(e) => setNormalModeAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  disabled={isSubmittingNormalAnswer || showSuccessModal}
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all duration-200 resize-none text-stone-800 placeholder-stone-400 disabled:bg-stone-50 disabled:cursor-not-allowed"
                  rows={4}
                />
              </div>
              <button
                onClick={handleNormalModeSubmit}
                disabled={!normalModeAnswer.trim() || isSubmittingNormalAnswer || showSuccessModal}
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isSubmittingNormalAnswer ? (
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
        ) : (
          // Assist Mode: Step-by-Step Block Interface
          <BlockInterface
            currentStep={currentStep}
            completedSteps={completedSteps}
            onAnswerSubmit={handleAnswerSubmit}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Success Modal */}
      <CozySuccessModal
        isOpen={showSuccessModal}
        onNextChallenge={handleNextChallenge}
        score={currentScore}
        insight={insight}
      />

      <style jsx>{`
        .blob-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
          filter: blur(60px);
          opacity: 0.6;
          animation: float 20s infinite alternate;
        }

        @keyframes float {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          100% {
            transform: translate(50px, 50px) rotate(10deg);
          }
        }

        .blob-1 {
          width: 500px;
          height: 500px;
          background: #FFE4D6;
          top: -10%;
          left: -10%;
          animation-delay: 0s;
        }

        .blob-2 {
          width: 400px;
          height: 400px;
          background: #E0F2E9;
          bottom: -5%;
          right: -5%;
          animation-delay: -5s;
        }

        .blob-3 {
          width: 300px;
          height: 300px;
          background: #FFF4D6;
          top: 40%;
          left: 40%;
          opacity: 0.5;
          animation-delay: -10s;
        }

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