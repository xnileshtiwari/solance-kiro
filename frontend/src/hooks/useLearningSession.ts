'use client';

import { useState, useCallback } from 'react';
import { LearningSession, ConversationStep, PreviousQuestion } from '../types';

interface UseLearningSessionReturn {
  session: LearningSession;
  addConversationStep: (step: ConversationStep) => void;
  addQuestionToHistory: (question: PreviousQuestion) => void;
  resetConversationHistory: () => void;
  initializeSession: (question: string) => void;
  resetSession: () => void;
  markSessionComplete: () => void;
  updateCurrentStep: (stepNumber: number) => void;
}

const initialSession: LearningSession = {
  currentQuestion: '',
  currentStep: 0,
  conversationHistory: [],
  questionHistory: [],
  isComplete: false,
};

export function useLearningSession(): UseLearningSessionReturn {
  const [session, setSession] = useState<LearningSession>(initialSession);

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

  const initializeSession = useCallback((question: string) => {
    setSession(prev => ({
      ...prev,
      currentQuestion: question,
      currentStep: 1,
      conversationHistory: [],
      isComplete: false,
    }));
  }, []);

  const resetSession = useCallback(() => {
    setSession(initialSession);
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
    addConversationStep,
    addQuestionToHistory,
    resetConversationHistory,
    initializeSession,
    resetSession,
    markSessionComplete,
    updateCurrentStep,
  };
}