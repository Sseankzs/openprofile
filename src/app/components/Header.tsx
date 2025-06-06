'use client';

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { useRoleContext } from "@/app/components/role-context";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { role, setRole } = useRoleContext();
  const router = useRouter();

  const dropdownRef = useRef<HTMLLIElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    checkUser();

    const storedRole = localStorage.getItem("selectedRole") as "applicant" | "company" | null;
    setRole(storedRole);

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (dropdownOpen || menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen, menuOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("selectedRole");
    router.push('/');
  };

  const handleSwitchRole = () => {
    const newRole = role === "company" ? "applicant" : "company";
    localStorage.setItem("selectedRole", newRole);
    setRole(newRole);
    router.push(`/${newRole}/dashboard`);
  };

  return (
    <header className="bg-whitechocolate shadow-md py-4 px-4 md:px-12 top-0 z-50 sticky w-full">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/">
          <span className="text-xl text-firered font-mono font-extrabold cursor-pointer">
            openprofile
          </span>
        </Link>

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

        {/* Desktop Nav - only show if user is logged in */} {/* ⬅️ Added conditional */}
        {user && (
          <ul className="hidden md:flex space-x-6 text-3C33AE font-medium items-center">
            {role === "applicant" && (
              <>
                <li>
                  <Link href="/jobs" className="text-firered hover:text-crowblack font-mono">
                    Job Search
                  </Link>
                </li>
                <li>
                  <Link href="/applicant/documents" className="text-firered hover:text-crowblack font-mono">
                    Documents
                  </Link>
                </li>
              </>
            )}
            {role === "company" && (
              <li>
                <Link href="/post-job" className="text-firered hover:text-crowblack font-mono">
                  Post a Job
                </Link>
              </li>
            )}
            <li className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="text-firered hover:text-crowblack font-mono"
              >
                Menu ▾
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg w-48 z-50">
                  <button
                    onClick={() => {
                      handleSignOut();
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 font-mono text-crowblack"
                  >
                    Logout
                  </button>
                  <button
                    onClick={() => {
                      handleSwitchRole();
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 font-mono text-crowblack"
                  >
                    {role === "company" ? "Find a Job" : "Hire as a Company"}
                  </button>
                </div>
              )}
            </li>
          </ul>
        )}
      </nav>

      {/* Mobile Nav - only show if user is logged in */} {/* ⬅️ Added conditional */}
      {menuOpen && user && (
        <div
          ref={mobileMenuRef}
          className="md:hidden absolute top-full left-0 w-full bg-whitechocolate shadow-md transition-all duration-300 z-40"
        >
          <ul className="flex flex-col items-center space-y-4 py-4">
            {role === "applicant" && (
              <>
                <li>
                  <Link
                    href="/jobs"
                    className="text-firered hover:text-crowblack font-mono"
                    onClick={() => setMenuOpen(false)}
                  >
                    Job Search
                  </Link>
                </li>
                <li>
                  <Link
                    href="/documents"
                    className="text-firered hover:text-crowblack font-mono"
                    onClick={() => setMenuOpen(false)}
                  >
                    Documents
                  </Link>
                </li>
              </>
            )}
            {role === "company" && (
              <li>
                <Link
                  href="/post-job"
                  className="text-firered hover:text-crowblack font-mono"
                  onClick={() => setMenuOpen(false)}
                >
                  Post a Job
                </Link>
              </li>
            )}
            <li>
              <div className="text-center">
                <button
                  onClick={() => {
                    handleSignOut();
                    setMenuOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-firered hover:text-crowblack font-mono"
                >
                  Logout
                </button>
                <button
                  onClick={() => {
                    handleSwitchRole();
                    setMenuOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-firered hover:text-crowblack font-mono"
                >
                  {role === "company" ? "Find a Job" : "Hire as a Company"}
                </button>
              </div>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
