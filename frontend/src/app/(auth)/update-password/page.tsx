"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Label } from "@/components/ui/label";
import { Sparkle, CircleNotch } from '@phosphor-icons/react';
import Link from 'next/link';

export default function UpdatePasswordPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function verifyResetLink() {
      setError("");
      setMessage("");

      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user ?? null;

        if (user) {
          if (mounted) setIsSessionReady(true);
          return;
        }


        if (mounted) {
          setError("Reset link appears invalid or expired. Please request a new password reset.");
        }
      } catch (err) {
        console.error("Error verifying reset link:", err);
        if (mounted) setError("Failed to verify reset link. Try the reset flow again.");
      } finally {
        if (mounted) setIsVerifying(false);
      }
    }

    verifyResetLink();
    return () => { mounted = false; };
  }, [supabase]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password });

      if (updateErr) {
        setError(updateErr.message || "Failed to update password.");
        setIsSubmitting(false);
        return;
      }

      setMessage("Password updated successfully. Redirecting...");
      await supabase.auth.signOut();
      setTimeout(() => router.push("/auth"), 1400);
    } catch (err) {
      console.error("update password error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
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
            Set New Password
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black text-text-coffee mb-2">
            Create a new password
          </h1>
          <p className="text-stone-500 mb-8">
            Choose a strong password for your account.
          </p>

          {/* Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border-2 border-white/80 shadow-lg p-8">
            {isVerifying ? (
              <div className="text-center py-8">
                <CircleNotch size={40} className="animate-spin text-accent-coral mx-auto mb-4" />
                <p className="font-bold text-text-coffee">Verifying reset link...</p>
                <p className="text-sm text-stone-500 mt-2">Please wait a moment.</p>
              </div>
            ) : isSessionReady ? (
              <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="font-bold text-text-coffee">New Password</Label>
                  <input
                    id="password"
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-accent-coral focus:outline-none bg-white/50 text-text-coffee"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirm-password" className="font-bold text-text-coffee">Confirm Password</Label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-accent-coral focus:outline-none bg-white/50 text-text-coffee"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
                {message && <p className="text-green-600 text-sm font-semibold">{message}</p>}

                <button
                  type="submit"
                  className="w-full py-3 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-900 transition-colors disabled:opacity-50 shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="font-bold text-red-500 mb-2">Reset link not valid</p>
                <p className="text-sm text-stone-500 mb-6">
                  The password reset link looks invalid or expired.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => router.push("/forgot")}
                    className="py-3 px-6 bg-white text-stone-800 font-bold rounded-xl border-2 border-stone-300 hover:border-stone-400 transition-colors shadow-sm"
                  >
                    Request new link
                  </button>
                  <button
                    onClick={() => router.push("/auth")}
                    className="py-3 px-6 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-900 transition-colors shadow-md"
                  >
                    Back to sign in
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-stone-400 text-sm font-medium">
        Built for the future of learning.
      </footer>
    </div>
  );
}
