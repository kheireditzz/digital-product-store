'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface-base/95 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25 border border-orange-400/30 font-bold text-sm">
              ✨
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base text-white tracking-tight">
                Kheireditz <span className="text-orange-500">Produk</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono -mt-0.5">OFFICIAL STORE</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
            <Link href="/produk" className="hover:text-orange-400 transition-colors">
              Semua Produk
            </Link>
            <Link href="/dashboard" className="hover:text-orange-400 transition-colors">
              Area Member
            </Link>
            <Link href="/admin" className="hover:text-orange-400 transition-colors text-slate-400">
              Panel Admin
            </Link>
          </nav>

          {/* Luxury Hamburger Menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-xl bg-surface-card border border-surface-border text-slate-200 hover:text-white hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 transition-all flex items-center justify-center gap-2 px-3.5 cursor-pointer shadow-sm text-xs font-semibold"
            >
              <span className="text-orange-400">☰</span>
              <span>Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Side Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-surface-base/80 backdrop-blur-md flex justify-end">
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-full max-w-xs sm:max-w-sm bg-surface-card border-l border-surface-border h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto z-10 space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-surface-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25 font-bold">
                    ✨
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm text-white leading-tight">
                      Kheireditz <span className="text-orange-500">Produk</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">PORTAL UTAMA</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2 text-xs font-semibold">
                <Link
                  href="/"
                  onClick={() => setIsDrawerOpen(false)}
                  className="block p-3 rounded-xl bg-surface-base border border-surface-border hover:border-orange-500/50 text-slate-200 hover:text-white transition"
                >
                  🏠 Beranda
                </Link>
                <Link
                  href="/produk"
                  onClick={() => setIsDrawerOpen(false)}
                  className="block p-3 rounded-xl bg-surface-base border border-surface-border hover:border-orange-500/50 text-slate-200 hover:text-white transition"
                >
                  📦 Katalog Produk
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsDrawerOpen(false)}
                  className="block p-3 rounded-xl bg-surface-base border border-surface-border hover:border-orange-500/50 text-slate-200 hover:text-white transition"
                >
                  👤 Dashboard Member
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setIsDrawerOpen(false)}
                  className="block p-3 rounded-xl bg-surface-base border border-surface-border hover:border-orange-500/50 text-slate-200 hover:text-white transition"
                >
                  ⚙️ Panel Admin
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsDrawerOpen(false)}
                  className="block p-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-center shadow-lg shadow-orange-500/25"
                >
                  🔑 Masuk / Daftar
                </Link>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 text-center border-t border-surface-border pt-4">
              © Kheireditz Store Official
            </div>
          </div>
        </div>
      )}
    </>
  )
}
