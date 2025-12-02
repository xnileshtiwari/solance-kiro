'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '../../components';

export default function LearnPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/subjects');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-cream">
      <LoadingSpinner size="lg" message="Redirecting..." />
    </div>
  );
}