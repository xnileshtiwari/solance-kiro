"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Label } from "@/components/ui/label";
import { Sparkle, ArrowLeft } from '@phosphor-icons/react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setIsSending(true);
    try {
      const redirectTo = `${window.location.origin}/update-password`;
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      if (resetErr) {
        setError(resetErr.message || "Failed to send reset email.");
      } else {
        setMessage("If an account exists with that email, you'll receive a reset link shortly. Check your inbox (and spam).");
      }
    } catch (err) {
      console.error("reset request error:", err);
      setError("Unexpected error. Try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-start justify-center px-4 pt-8 md:pt-16">
        <div className="w-full max-w-md">
          {/* Back link */}
          <Link href="/auth" className="inline-flex items-center gap-2 text-stone-500 hover:text-accent-coral font-medium mb-6 transition-colors">
            <ArrowLeft size={18} weight="bold" />
            Back to sign in
          </Link>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm text-text-coffee px-4 py-2 rounded-full text-sm font-bold mb-6 border border-white/80">
            <Sparkle size={16} weight="fill" className="text-accent-sun" />
            Password Reset
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black text-text-coffee mb-2">
            Forgot your password?
          </h1>
          <p className="text-stone-500 mb-8">
            No worries, we'll send you a reset link.
          </p>

          {/* Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border-2 border-white/80 shadow-lg p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

              {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
              {message && <p className="text-green-600 text-sm font-semibold">{message}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-900 transition-colors disabled:opacity-50 shadow-md"
                disabled={isSending}
              >
                {isSending ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-stone-400 text-sm font-medium">
        Built for the future of learning.
      </footer>
    </div>
  );
}
