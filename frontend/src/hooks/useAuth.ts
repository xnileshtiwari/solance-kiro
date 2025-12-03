'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UseAuthOptions {
    redirectTo?: string;
    requireAuth?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
    const { redirectTo = '/auth', requireAuth = true } = options;
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);

                if (requireAuth && !session?.user) {
                    router.push(redirectTo);
                    return; // Don't set loading to false, let the redirect happen
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Auth check failed:', error);
                if (requireAuth) {
                    router.push(redirectTo);
                    return;
                }
                setIsLoading(false);
            }
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);

                if (requireAuth && !session?.user) {
                    router.push(redirectTo);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [requireAuth, redirectTo, router, supabase.auth]);

    return { user, isLoading, isAuthenticated: !!user };
}
