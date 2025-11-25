'use client';

import { useState, useCallback } from 'react';
import { ConversationStep } from '../types';
import { ValidationResult } from './useAnswerValidation';

interface UseStepProgressionReturn {
  currentStepData: StepData | null;
  isStepComplete: boolean;
  totalSteps: number;
  handleAnswerSubmission: (
    studentAnswer: string,
    validationResult: ValidationResult,
    stepData: StepData
  ) => ConversationStep | null;
  setCurrentStepData: (stepData: StepData) => void;
  setTotalSteps: (total: number) => void;
  resetProgression: () => void;
  isSessionComplete: () => boolean;
}

export interface StepData {
  stepNumber: number;
  prompt: string;
  correctAnswers: string[];
  hintResponse: string;
  successMessage: string;
}

export function useStepProgression(): UseStepProgressionReturn {
  const [currentStepData, setCurrentStepDataState] = useState<StepData | null>(null);
  const [isStepComplete, setIsStepComplete] = useState(false);
  const [totalSteps, setTotalStepsState] = useState(0);

  const handleAnswerSubmission = useCallback((
    studentAnswer: string,
    validationResult: ValidationResult,
    stepData: StepData
  ): ConversationStep | null => {
    if (!validationResult.isCorrect) {
      // Answer is incorrect, don't advance step
      setIsStepComplete(false);
      return null;
    }

    // Answer is correct, create conversation step and mark as complete
    const conversationStep: ConversationStep = {
      step: stepData.stepNumber,
      your_prompt: stepData.prompt,
      student_answer: studentAnswer,
    };

    setIsStepComplete(true);
    return conversationStep;
  }, []);

  const setCurrentStepData = useCallback((stepData: StepData) => {
    setCurrentStepDataState(stepData);
    setIsStepComplete(false);
  }, []);

  const setTotalSteps = useCallback((total: number) => {
    setTotalStepsState(total);
  }, []);

  const resetProgression = useCallback(() => {
    setCurrentStepDataState(null);
    setIsStepComplete(false);
    setTotalStepsState(0);
  }, []);

  const isSessionComplete = useCallback((): boolean => {
    return currentStepData !== null && 
           isStepComplete && 
           currentStepData.stepNumber >= totalSteps;
  }, [currentStepData, isStepComplete, totalSteps]);

  return {
    currentStepData,
    isStepComplete,
    totalSteps,
    handleAnswerSubmission,
    setCurrentStepData,
    setTotalSteps,
    resetProgression,
    isSessionComplete,
  };
}