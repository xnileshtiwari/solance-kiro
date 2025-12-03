'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseTopicNavigationReturn {
  isTransitioning: boolean;
  errorMessage: string | null;
  handleTopicSubmit: (topic: string) => void;
  clearError: () => void;
}

export function useTopicNavigation(): UseTopicNavigationReturn {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleTopicSubmit = useCallback((topic: string) => {
    setErrorMessage(null);

    if (!topic.trim()) {
      setErrorMessage('Please enter a topic to get started.');
      return;
    }


    // Navigate instantly without delay
    try {
      router.push(`/learn?topic=${encodeURIComponent(topic)}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setErrorMessage('Failed to navigate to learning interface. Please try again.');
    }
  }, [router]);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    isTransitioning,
    errorMessage,
    handleTopicSubmit,
    clearError
  };
}