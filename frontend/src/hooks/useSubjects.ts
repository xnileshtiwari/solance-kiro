'use client';

import { useState, useEffect } from 'react';
import { Subject } from '../types';
import { apiService } from '../services/apiService';

interface UseSubjectsReturn {
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSubjects(): UseSubjectsReturn {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getSubjects();
      setSubjects(data);
    } catch (err: any) {
      console.error('Failed to fetch subjects:', err);
      setError(err?.message || 'Failed to load subjects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return {
    subjects,
    isLoading,
    error,
    refetch: fetchSubjects,
  };
}
