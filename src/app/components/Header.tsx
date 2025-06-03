'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    checkUser();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('Error signing out: ' + error.message);
    } else {
      router.push('/');
    }
  };

  return (
    <header className="bg-whitechocolate shadow-md py-4 px-4 md:px-12 top-0 z-50 sticky w-full">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/">
          <span className="text-xl text-firered font-mono font-extrabold cursor-pointer">
            openprofile
          </span>
        </Link>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg className="w-6 h-6 text-firered" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Nav */}
        <ul className="hidden md:flex space-x-6 text-3C33AE font-medium">
          <li>
            <Link href="/results" className="text-firered hover:text-crowblack font-mono">
              Results
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-firered hover:text-crowblack font-mono">
              About
            </Link>
          </li>
          <li>
            {user ? (
              <button onClick={handleSignOut} className="text-firered hover:text-crowblack font-mono">
                Logout
              </button>
            ) : null}
          </li>
        </ul>
      </nav>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-whitechocolate shadow-md transition-all duration-300 z-40">
          <ul className="flex flex-col items-center space-y-4 py-4">
            <li>
              <Link href="/results" className="text-firered hover:text-crowblack font-mono" onClick={() => setMenuOpen(false)}>
                Results
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-firered hover:text-crowblack font-mono" onClick={() => setMenuOpen(false)}>
                About
              </Link>
            </li>
            <li>
              {user ? (
                <button onClick={handleSignOut} className="text-firered hover:text-crowblack font-mono">
                  Logout
                </button>
              ) : (
                <Link href="/login" className="text-firered hover:text-crowblack font-mono" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
