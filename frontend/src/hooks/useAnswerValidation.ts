'use client';

import { useState, useCallback } from 'react';

interface UseAnswerValidationReturn {
  isValidating: boolean;
  validationResult: ValidationResult | null;
  validateAnswer: (studentAnswer: string, correctAnswers: string[]) => ValidationResult;
  clearValidation: () => void;
}

export interface ValidationResult {
  isCorrect: boolean;
  normalizedAnswer: string;
  matchedAnswer?: string;
}

export function useAnswerValidation(): UseAnswerValidationReturn {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const normalizeAnswer = useCallback((answer: string): string => {
    return answer
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s\-+*/()=.]/g, '') // Keep only alphanumeric, spaces, and basic math symbols
      .replace(/\s*=\s*/g, '=') // Normalize equals signs
      .replace(/\s*\+\s*/g, '+') // Normalize plus signs
      .replace(/\s*-\s*/g, '-') // Normalize minus signs
      .replace(/\s*\*\s*/g, '*') // Normalize multiplication
      .replace(/\s*\/\s*/g, '/'); // Normalize division
  }, []);

  const validateAnswer = useCallback((studentAnswer: string, correctAnswers: string[]): ValidationResult => {
    setIsValidating(true);
    
    const normalizedStudentAnswer = normalizeAnswer(studentAnswer);
    
    // Check if the normalized student answer matches any of the correct answers
    for (const correctAnswer of correctAnswers) {
      const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);
      
      if (normalizedStudentAnswer === normalizedCorrectAnswer) {
        const result: ValidationResult = {
          isCorrect: true,
          normalizedAnswer: normalizedStudentAnswer,
          matchedAnswer: correctAnswer,
        };
        
        setValidationResult(result);
        setIsValidating(false);
        return result;
      }
    }
    
    // No match found
    const result: ValidationResult = {
      isCorrect: false,
      normalizedAnswer: normalizedStudentAnswer,
    };
    
    setValidationResult(result);
    setIsValidating(false);
    return result;
  }, [normalizeAnswer]);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
    setIsValidating(false);
  }, []);

  return {
    isValidating,
    validationResult,
    validateAnswer,
    clearValidation,
  };
}