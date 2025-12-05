'use client';

import { useState, useEffect, useCallback } from 'react';
import { Subject } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from './useAuth';

interface UseSubjectsReturn {
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSubjects(): UseSubjectsReturn {
  const { user, isLoading: isAuthLoading } = useAuth({ requireAuth: false });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    if (isAuthLoading) return;

    if (!user?.id) {
      setSubjects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiService.getSubjects(user.id);
      setSubjects(data);
    } catch (err: any) {
      console.error('Failed to fetch subjects:', err);
      setError(err?.message || 'Failed to load subjects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return {
    subjects,
    isLoading,
    error,
    refetch: fetchSubjects,
  };
}
