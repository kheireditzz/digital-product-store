'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Kheireditz Store
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link href="/produk" className="hover:text-cyan-400 transition-colors">
            Semua Produk
          </Link>
          <Link href="/affiliate" className="hover:text-cyan-400 transition-colors">
            Program Affiliate
          </Link>
          <Link href="/blog" className="hover:text-cyan-400 transition-colors">
            Blog & Tutorial
          </Link>
          <Link href="/tentang" className="hover:text-cyan-400 transition-colors">
            Tentang Kami
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition"
          >
            Masuk
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2 rounded-lg shadow-lg shadow-indigo-500/20 transition transform active:scale-95"
          >
            Dashboard Member
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <Link href="/produk" className="block text-slate-300 hover:text-cyan-400 py-2">
            Semua Produk
          </Link>
          <Link href="/affiliate" className="block text-slate-300 hover:text-cyan-400 py-2">
            Program Affiliate
          </Link>
          <Link href="/blog" className="block text-slate-300 hover:text-cyan-400 py-2">
            Blog & Tutorial
          </Link>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full text-center py-2 text-sm text-slate-200 bg-slate-800 rounded-lg"
            >
              Masuk
            </Link>
            <Link
              href="/dashboard"
              className="w-full text-center py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg"
            >
              Dashboard Member
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
