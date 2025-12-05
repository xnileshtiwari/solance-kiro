'use client';

import { useState, useCallback } from 'react';
import {
  LearningSession,
  ConversationStep,
  PreviousQuestion,
  QuestionRequest,
  StepsRequest,
  StepsResponse
} from '../types';
import { apiService, ApiError, NetworkError } from '../services';

import { useAuth } from './useAuth';

interface UseApiLearningSessionOptions {
  modelName?: string;
}

interface UseApiLearningSessionReturn {
  session: LearningSession;
  isLoading: boolean;
  error: string | null;
  generateNewQuestion: (subjectId: string) => Promise<void>;
  getNextStep: (conversationHistoryOverride?: ConversationStep[]) => Promise<StepsResponse | null>;
  addConversationStep: (step: ConversationStep) => void;
  addQuestionToHistory: (question: PreviousQuestion) => void;
  resetConversationHistory: () => void;
  initializeSession: (question?: string) => void;
  resetSession: () => void;
  markSessionComplete: () => void;
  updateCurrentStep: (stepNumber: number) => void;
  clearError: () => void;
  currentLevel: number;
}

const initialSession: LearningSession = {
  currentQuestion: '',
  currentStep: 0,
  conversationHistory: [],
  questionHistory: [],
  isComplete: false,
};

const DEFAULT_MODEL = 'gemini-2.5-flash';

export function useApiLearningSession(options: UseApiLearningSessionOptions = {}): UseApiLearningSessionReturn {
  const { modelName = DEFAULT_MODEL } = options;
  const [session, setSession] = useState<LearningSession>(initialSession);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(1);

  // Get authenticated user
  const { user } = useAuth({ requireAuth: false });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generateNewQuestion = useCallback(async (subjectId: string) => {
    if (!user?.id) {
      setError('User not authenticated. Please sign in.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Only send the last previous question (if any)
      const lastQuestion = session.questionHistory.length > 0
        ? [session.questionHistory[session.questionHistory.length - 1]]
        : [];

      const request: QuestionRequest = {
        model_name: modelName,
        user_id: user.id,
        subject_id: subjectId,
        previous_questions: lastQuestion,
      };

      const response = await apiService.generateQuestion(request);

      setCurrentLevel(response.level || 1);
      setSession(prev => ({
        ...prev,
        currentQuestion: response.question,
        currentStep: 1,
        conversationHistory: [],
        isComplete: false,
      }));
    } catch (err) {
      console.error('Failed to generate question:', err);

      if (err instanceof NetworkError) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (err instanceof ApiError) {
        if (err.status === 503) {
          setError('The service is temporarily unavailable. Please try again in a few moments.');
        } else if (err.status === 429) {
          setError('Too many requests. Please wait a moment before trying again.');
        } else {
          setError('Failed to generate a new question. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [session.questionHistory, modelName, user?.id]);

  const getNextStep = useCallback(async (conversationHistoryOverride?: ConversationStep[]): Promise<StepsResponse | null> => {
    if (!session.currentQuestion) {
      setError('No question available. Please generate a question first.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    // Use override if provided, otherwise use session state
    const historyToUse = conversationHistoryOverride || session.conversationHistory;

    try {
      const request: StepsRequest = {
        model_name: modelName,
        question: session.currentQuestion,
        conversation_history: historyToUse.length > 0 ? historyToUse : undefined,
      };

      const response = await apiService.generateSteps(request);
      return response;
    } catch (err) {
      console.error('Failed to get next step:', err);

      if (err instanceof NetworkError) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (err instanceof ApiError) {
        if (err.status === 503) {
          setError('The service is temporarily unavailable. Please try again in a few moments.');
        } else if (err.status === 429) {
          setError('Too many requests. Please wait a moment before trying again.');
        } else {
          setError('Failed to get guidance for this step. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session.currentQuestion, session.conversationHistory, modelName]);

  const addConversationStep = useCallback((step: ConversationStep) => {
    setSession(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, step],
    }));
  }, []);

  const addQuestionToHistory = useCallback((question: PreviousQuestion) => {
    setSession(prev => ({
      ...prev,
      questionHistory: [...prev.questionHistory, question],
    }));
  }, []);

  const resetConversationHistory = useCallback(() => {
    setSession(prev => ({
      ...prev,
      conversationHistory: [],
      currentStep: 0,
    }));
  }, []);

  const initializeSession = useCallback((question?: string) => {
    if (question) {
      // Initialize with provided question (for testing/fallback)
      setSession(prev => ({
        ...prev,
        currentQuestion: question,
        currentStep: 1,
        conversationHistory: [],
        isComplete: false,
      }));
    } else {
      // Generate new question via API
      generateNewQuestion('default-subject');
    }
  }, [generateNewQuestion]);

  const resetSession = useCallback(() => {
    setSession(initialSession);
    setError(null);
  }, []);

  const markSessionComplete = useCallback(() => {
    setSession(prev => ({
      ...prev,
      isComplete: true,
    }));
  }, []);

  const updateCurrentStep = useCallback((stepNumber: number) => {
    setSession(prev => ({
      ...prev,
      currentStep: stepNumber,
    }));
  }, []);

  return {
    session,
    isLoading,
    error,
    generateNewQuestion,
    getNextStep,
    addConversationStep,
    addQuestionToHistory,
    resetConversationHistory,
    initializeSession,
    resetSession,
    markSessionComplete,
    updateCurrentStep,
    clearError,
    currentLevel,
  };
}