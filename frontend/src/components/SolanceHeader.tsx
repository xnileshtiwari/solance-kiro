'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lightning, Star, User, SignOut } from '@phosphor-icons/react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useModelMode, ModelMode } from '@/contexts';

export default function SolanceHeader() {
  const { mode, setMode } = useModelMode();
  const pathname = usePathname();
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('[data-signout-button]')) return;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        return;
      }
      setIsDropdownOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out exception:', error);
    }
  };

  const handleModeChange = (newMode: ModelMode) => {
    setMode(newMode);
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="solance-header">
      {/* Logo */}
      <Link href="/" className="logo-area">
        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"></path>
        </svg>
        Solance
      </Link>

      {/* Navigation */}
      <nav className="nav-links">
        <Link href="/" className={`nav-item ${isActive('/') && pathname === '/' ? 'active' : ''}`}>
          Home
        </Link>
        {user && (
          <>
            <Link href="/subjects" className={`nav-item ${isActive('/subjects') || isActive('/learn') ? 'active' : ''}`}>
              Subjects
            </Link>
            <Link href="/studio" className={`nav-item ${isActive('/studio') ? 'active' : ''}`}>
              Studio
            </Link>
          </>
        )}
      </nav>

      {/* Controls */}
      <div className="controls-area">
        {/* Model Toggle - Only show when authenticated */}
        {user && (
          <div className="model-toggle">
            <div
              className={`toggle-option fast-mode ${mode === 'turbo' ? 'active' : ''}`}
              onClick={() => handleModeChange('turbo')}
            >
              <Lightning weight="bold" size={14} />
              <span className="toggle-text">Turbo</span>
            </div>
            <div
              className={`toggle-option ${mode === 'deep' ? 'active' : ''}`}
              onClick={() => handleModeChange('deep')}
            >
              <Star weight="fill" size={14} />
              <span className="toggle-text">Deep</span>
            </div>
          </div>
        )}

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          {isLoading ? (
            <div className="w-10 h-10" />
          ) : user ? (
            <>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="profile-btn"
                aria-label="Profile menu"
              >
                <User size={20} weight="bold" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-stone-800 truncate">
                      {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                    </p>
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
              className="profile-btn"
              aria-label="Sign in"
            >
              <User size={20} weight="bold" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
