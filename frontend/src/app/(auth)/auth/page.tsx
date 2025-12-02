"use client";

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Label } from "@/components/ui/label";
import { Sparkle } from '@phosphor-icons/react';
import Link from 'next/link';

// A simple SVG icon for Google
const GoogleIcon = () => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
  >
    <title>Google</title>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    let oauthSubscription: any = null;
    let timeoutId: any = null;

    const handleAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hasCode = urlParams.has('code');
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        window.location.href = '/learn?topic=algebra';
        return;
      }

      if (hasCode) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            window.location.href = '/learn?topic=algebra';
          }
        });
        oauthSubscription = subscription;
        timeoutId = setTimeout(() => subscription.unsubscribe(), 5000);
      }
    };

    handleAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.location.href = '/learn?topic=algebra';
      }
    });

    return () => {
      subscription.unsubscribe();
      if (oauthSubscription) oauthSubscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [supabase]);


  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Sign up successful! Please check your email to confirm your account.');
        setFullName('');
        setEmail('');
        setPassword('');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }

    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/learn?topic=algebra` }
      });
      if (error) {
        setError(error.message);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google sign in');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-start justify-center px-4 pt-8 md:pt-16">
        <div className="w-full max-w-md">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm text-text-coffee px-4 py-2 rounded-full text-sm font-bold mb-6 border border-white/80">
            <Sparkle size={16} weight="fill" className="text-accent-sun" />
            {isSignUp ? 'Join the Journey' : 'Welcome Back'}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black text-text-coffee mb-2">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h1>
          <p className="text-stone-500 mb-8">
            {isSignUp ? 'Start your personalized learning journey' : 'Continue where you left off'}
          </p>

          {/* Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border-2 border-white/80 shadow-lg p-8">
            <form onSubmit={handleAuthAction} className="flex flex-col gap-5">
              {isSignUp && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="full-name" className="font-bold text-text-coffee">Full Name</Label>
                  <input
                    id="full-name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-accent-coral focus:outline-none bg-white/50 text-text-coffee placeholder:text-stone-400"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="font-bold text-text-coffee">Email</Label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-accent-coral focus:outline-none bg-white/50 text-text-coffee placeholder:text-stone-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-bold text-text-coffee">Password</Label>
                  {!isSignUp && (
                    <Link href="/forgot" className="text-sm text-accent-coral font-medium hover:underline">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-accent-coral focus:outline-none bg-white/50 text-text-coffee placeholder:text-stone-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
              {message && <p className="text-green-600 text-sm font-semibold">{message}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-900 transition-colors disabled:opacity-50 shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/70 text-stone-400 font-medium">or continue with</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 bg-white text-stone-800 font-bold rounded-xl border-2 border-stone-300 hover:border-stone-400 hover:bg-stone-50 transition-all flex items-center justify-center disabled:opacity-50 shadow-sm"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <GoogleIcon />
              Google
            </button>
          </div>

          {/* Toggle */}
          <p className="mt-6 text-center text-stone-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(''); }}
              className="ml-2 text-accent-coral font-bold hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </main>

      <footer className="py-8 text-center text-stone-400 text-sm font-medium">
        Built for the future of learning.
      </footer>
    </div>
  );
}
