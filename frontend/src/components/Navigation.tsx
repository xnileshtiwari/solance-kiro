'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Sparkle, User, SignOut } from '@phosphor-icons/react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function Navigation() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't close if clicking the sign out button
      if (target.closest('[data-signout-button]')) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    console.log('Sign out clicked');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        return;
      }
      console.log('Sign out successful');
      setIsDropdownOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out exception:', error);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  return (
    <nav className="w-full px-6 py-6 flex items-center justify-between relative z-50">
      {/* Empty div for spacing */}
      <div className="w-10" />

      {/* Logo/Brand - Centered and Clickable */}
      <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-stone-800 hover:text-stone-700 transition-colors cursor-pointer">
        <Sparkle size={32} weight="fill" className="text-stone-800" />
        Solance
      </Link>

      {/* Profile Section */}
      <div className="relative" ref={dropdownRef}>
        {isLoading ? (
          <div className="w-10 h-10" />
        ) : user ? (
          <>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-stone-700 transition-colors cursor-pointer"
              aria-label="Profile menu"
            >
              <User className="text-white" size={20} weight="bold" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_#000] py-2 z-50">
                <div className="px-4 py-3 border-b-2 border-black">
                  <p className="font-bold text-stone-800 truncate">{getUserDisplayName()}</p>
                  <p className="text-sm text-stone-500 truncate">{user.email}</p>
                </div>
                <button
                  type="button"
                  data-signout-button
                  onClick={handleSignOut}
                  className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-red-50 hover:text-red-600 transition-colors text-stone-700 font-medium cursor-pointer"
                >
                  <SignOut size={18} weight="bold" />
                  Sign out
                </button>
              </div>
            )}
          </>
        ) : (
          <Link
            href="/auth"
            className="px-6 py-2.5 bg-white text-stone-800 font-bold rounded-full border-2 border-stone-200 shadow-sm hover:shadow-md hover:border-orange-300 hover:text-orange-500 transition-all"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
