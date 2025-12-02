'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import {
  ProblemHeader,
  ChatInterface,
  InputArea,
  SuccessModal,
  LoadingSpinner,
  ApiErrorDisplay,
  ApiFallback,
  type Message,
  type PerformanceInsight
} from '../../components';
import { useApiLearningSession, useAnswerValidation } from '../../hooks';
import { ConversationStep, PreviousQuestion } from '../../types';

export default function ApiLearnPage() {
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
    resetSession,
    markSessionComplete,
    clearError,
    currentLevel
  } = useApiLearningSession();

  const { validateAnswer } = useAnswerValidation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isAnswerIncorrect, setIsAnswerIncorrect] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingNewQuestion, setIsLoadingNewQuestion] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [currentStepResponse, setCurrentStepResponse] = useState<any>(null);
  const [currentMarks, setCurrentMarks] = useState<number>(0);
  const [currentRemarks, setCurrentRemarks] = useState<string[]>([]);

  // Refs to prevent double calls
  const questionInitialized = useRef(false);
  const stepInitialized = useRef(false);

  // Initialize session when component mounts
  useEffect(() => {
    if (topic && !session.currentQuestion && !questionInitialized.current) {
      questionInitialized.current = true;
      setIsInitializing(true);
      clearError();

      // Try to generate a question via API
      generateNewQuestion(topic).then(() => {
        setIsInitializing(false);
      }).catch(() => {
        setIsInitializing(false);
        questionInitialized.current = false; // Reset on error so user can retry
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  // Get initial step when question is available
  useEffect(() => {
    if (session.currentQuestion && messages.length === 0 && !stepInitialized.current) {
      stepInitialized.current = true;
      getNextStep().then((stepResponse) => {
        if (stepResponse) {
          setCurrentStepResponse(stepResponse);
          const initialMessage: Message = {
            id: `initial-${Date.now()}`,
            type: 'tutor',
            content: stepResponse.prompt,
            timestamp: new Date()
          };
          setMessages([initialMessage]);
        }
      }).catch(() => {
        stepInitialized.current = false; // Reset on error so user can retry
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.currentQuestion]);

  // Redirect to homepage if no topic is provided
  useEffect(() => {
    if (!topic) {
      router.push('/');
    }
  }, [topic, router]);

  const handleAnswerSubmit = async (answer: string) => {
    if (!answer.trim() || isSubmittingAnswer || !currentStepResponse) return;

    setIsSubmittingAnswer(true);
    setIsAnswerIncorrect(false);
    setFeedbackMessage('');

    try {
      // Add student message to chat
      const studentMessage: Message = {
        id: Date.now().toString(),
        type: 'student',
        content: answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, studentMessage]);

      // Create conversation step for API
      const conversationStep: ConversationStep = {
        step: currentStepResponse.step_number,
        your_prompt: currentStepResponse.prompt,
        student_answer: answer,
      };

      // Add to conversation history
      addConversationStep(conversationStep);

      // Get updated history including the new step
      const updatedHistory = [...session.conversationHistory, conversationStep];

      // Get next step from API with updated history
      const nextStepResponse = await getNextStep(updatedHistory);

      if (nextStepResponse) {
        if (nextStepResponse.step_number === -1) {
          // Session complete
          markSessionComplete();

          // Store marks and remarks from API
          setCurrentMarks(nextStepResponse.marks || 0);
          setCurrentRemarks(nextStepResponse.remarks || []);

          // Add question to history with performance data
          const questionHistory: PreviousQuestion = {
            question: session.currentQuestion,
            score: nextStepResponse.marks || 0,
            remarks: nextStepResponse.remarks || [],
          };
          addQuestionToHistory(questionHistory);

          setShowSuccessModal(true);
        } else {
          // Continue with next step
          setCurrentStepResponse(nextStepResponse);
          const nextMessage: Message = {
            id: `tutor-${Date.now()}`,
            type: 'tutor',
            content: nextStepResponse.prompt,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, nextMessage]);
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setFeedbackMessage('Failed to submit answer. Please try again.');
      setIsAnswerIncorrect(true);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleNextChallenge = async () => {
    setShowSuccessModal(false);
    setMessages([]);
    setCurrentStepResponse(null);

    // Reset initialization flags for new question
    questionInitialized.current = false;
    stepInitialized.current = false;

    // Show loading screen
    setIsLoadingNewQuestion(true);

    // Generate new question
    try {
      await generateNewQuestion(topic!);
    } finally {
      setIsLoadingNewQuestion(false);
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
    generateNewQuestion(topic!).then(() => {
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

  const mockPerformanceInsights: PerformanceInsight[] = [
    {
      title: "Strong Foundation",
      description: "You're showing great understanding of basic algebraic operations.",
      icon: <span>💪</span>
    },
    {
      title: "Practice Tip",
      description: "Try working through the steps out loud to reinforce your thinking process.",
      icon: <span>💡</span>
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background-cream">
      {/* Navigation */}

      {/* API Error Display */}
      {error && !isInitializing && (
        <div className="w-full px-4 py-2">
          <ApiErrorDisplay
            error={error}
            onRetry={handleRetryConnection}
            onDismiss={clearError}
            showRetry={true}
          />
        </div>
      )}

      {/* Problem Header */}
      <div className="w-full px-4 py-6">
        <ProblemHeader
          question={session.currentQuestion || "Loading question..."}
          missionNumber={currentLevel}
          missionLabel="Level"
        />


      </div>

      {/* Chat Interface */}
      <div className="flex-1 px-4 pb-6">
        <ChatInterface messages={messages} />
      </div>

      {/* Input Area */}
      <div className="w-full px-4 pb-6">
        <InputArea
          onSubmit={handleAnswerSubmit}
          placeholder={isSubmittingAnswer ? "Processing your answer..." : "Type your answer here..."}
          feedbackMessage={feedbackMessage}
          feedbackType={isAnswerIncorrect ? 'error' : null}
          disabled={isSubmittingAnswer || isLoading}
        />
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          onNextChallenge={handleNextChallenge}
          insights={mockPerformanceInsights}
          completionTime={120}
          mistakeCount={currentRemarks.length}
          score={currentMarks}
        />
      )}
    </div>
  );
}