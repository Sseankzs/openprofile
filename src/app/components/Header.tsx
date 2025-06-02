// src/components/Header.tsx
'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
export default function Header() {
  return (
    <header className="bg-whitechocolate shadow-md py-4 px-12 top-0 z-50">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/">
          <span className="text-xl text-firered font-mono font-extrabold">openprofile</span>
        </Link>

        {/* Navigation Links */}
        <ul className="flex space-x-6 text-3C33AE font-medium">
          <li>
            <Link href="/results" className=" text-firered hover:text-crowblack font-mono">
              Results
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-firered hover:text-crowblack font-mono">
              About
            </Link>
          </li>
          <li>
            <Link href="/login" className="text-firered hover:text-crowblack font-mono">
              Login
            </Link>
          </li>
          {/* Dark mode toggle button */}      
        </ul>
      </nav>
    </header>
  );
}
