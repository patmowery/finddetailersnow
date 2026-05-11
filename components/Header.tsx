'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-[#1e3a5f] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-[#ff6b35]">Find</span>
            <span>DetailersNow</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/states" className="hover:text-[#ff6b35] transition-colors">
              Browse States
            </Link>
            <Link href="/blog" className="hover:text-[#ff6b35] transition-colors">
              Blog
            </Link>
            <Link href="/about" className="hover:text-[#ff6b35] transition-colors">
              About
            </Link>
            <Link
              href="/claim"
              className="bg-[#ff6b35] hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              List Your Business
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-[#2a4d7a] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#2a4d7a] py-3 space-y-2">
            <Link href="/states" className="block px-2 py-2 hover:text-[#ff6b35] transition-colors">
              Browse States
            </Link>
            <Link href="/blog" className="block px-2 py-2 hover:text-[#ff6b35] transition-colors">
              Blog
            </Link>
            <Link href="/about" className="block px-2 py-2 hover:text-[#ff6b35] transition-colors">
              About
            </Link>
            <Link
              href="/claim"
              className="block mt-2 bg-[#ff6b35] hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-center font-semibold transition-colors"
            >
              List Your Business
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
