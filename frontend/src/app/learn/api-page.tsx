'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  ProblemHeader, 
  ChatInterface, 
  InputArea, 
  SuccessModal,
  Navigation,
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
    clearError 
  } = useApiLearningSession();
  
  const { validateAnswer } = useAnswerValidation();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isAnswerIncorrect, setIsAnswerIncorrect] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [currentStepResponse, setCurrentStepResponse] = useState<any>(null);
  const [useMockMode, setUseMockMode] = useState(false);

  // Initialize session when component mounts
  useEffect(() => {
    if (topic && !session.currentQuestion && !useMockMode) {
      setIsInitializing(true);
      clearError();
      
      // Try to generate a question via API
      generateNewQuestion().then(() => {
        setIsInitializing(false);
      }).catch(() => {
        setIsInitializing(false);
      });
    }
  }, [topic, session.currentQuestion, generateNewQuestion, clearError, useMockMode]);

  // Get initial step when question is available
  useEffect(() => {
    if (session.currentQuestion && !useMockMode && messages.length === 0) {
      getNextStep().then((stepResponse) => {
        if (stepResponse) {
          setCurrentStepResponse(stepResponse);
          const initialMessage: Message = {
            id: '1',
            type: 'tutor',
            content: stepResponse.prompt,
            timestamp: new Date()
          };
          setMessages([initialMessage]);
        }
      });
    }
  }, [session.currentQuestion, getNextStep, messages.length, useMockMode]);

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

      // Get next step from API
      const nextStepResponse = await getNextStep();
      
      if (nextStepResponse) {
        if (nextStepResponse.step_number === -1) {
          // Session complete
          markSessionComplete();
          
          // Add question to history with mock performance data
          const questionHistory: PreviousQuestion = {
            question: session.currentQuestion,
            score: nextStepResponse.marks || 85,
            mistakes: nextStepResponse.mistakes || [],
          };
          addQuestionToHistory(questionHistory);
          
          setShowSuccessModal(true);
        } else {
          // Continue with next step
          setCurrentStepResponse(nextStepResponse);
          const nextMessage: Message = {
            id: (Date.now() + 1).toString(),
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
    
    // Generate new question
    await generateNewQuestion();
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleRetryConnection = () => {
    clearError();
    setIsInitializing(true);
    generateNewQuestion().then(() => {
      setIsInitializing(false);
    }).catch(() => {
      setIsInitializing(false);
    });
  };

  const handleUseMockMode = () => {
    setUseMockMode(true);
    clearError();
    
    // Initialize with mock data
    const mockQuestion = "Solve for x: 2x + 5 = 13";
    const initialMessage: Message = {
      id: '1',
      type: 'tutor',
      content: "Let's work through this step by step. What's the first thing you'd do to solve this equation?",
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
    setIsInitializing(false);
    
    // Mock step response
    setCurrentStepResponse({
      step_number: 1,
      prompt: "Let's work through this step by step. What's the first thing you'd do to solve this equation?"
    });
  };

  if (!topic) {
    return null; // Will redirect to homepage
  }

  // Show API fallback if there's a connection error during initialization
  if (error && isInitializing && !useMockMode) {
    return (
      <ApiFallback
        onRetry={handleRetryConnection}
        onGoHome={handleBackToHome}
        showMockOption={true}
        onUseMock={handleUseMockMode}
        message="We're having trouble connecting to our AI tutoring service. You can try again or continue with demo mode."
      />
    );
  }

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col bg-background-cream">
        <Navigation showBackButton onBackClick={handleBackToHome} />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner 
            size="lg" 
            message={useMockMode ? "Setting up demo mode..." : "Preparing your algebra challenge..."}
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
      <Navigation showBackButton onBackClick={handleBackToHome} />
      
      {/* API Error Display */}
      {error && !isInitializing && (
        <div className="w-full px-4 py-2">
          <ApiErrorDisplay
            error={error}
            onRetry={handleRetryConnection}
            onDismiss={clearError}
            showRetry={!useMockMode}
          />
        </div>
      )}
      
      {/* Problem Header */}
      <div className="w-full px-4 py-6">
        <ProblemHeader 
          question={session.currentQuestion || "Loading question..."}
          missionNumber={1}
        />
        
        {/* Mock Mode Indicator */}
        {useMockMode && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-2xl">
            <p className="text-sm text-blue-800 text-center">
              🎭 Demo Mode - Using sample content
            </p>
          </div>
        )}
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
          mistakeCount={1}
        />
      )}
    </div>
  );
}