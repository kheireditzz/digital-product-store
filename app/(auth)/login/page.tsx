'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 800)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-3">
            <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
              Kheireditz Store
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white">Masuk ke Akun Anda</h1>
          <p className="text-xs text-slate-400 mt-1">Akses produk yang telah Anda beli dan area member</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="email@anda.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-medium">Password</label>
              <Link href="/forgot-password" className="text-cyan-400 hover:underline text-[11px]">
                Lupa Password?
              </Link>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-600/30 transition transform active:scale-95 text-xs"
          >
            {loading ? 'Memproses Masuk...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Belum punya akun?{' '}
          <Link href="/register" className="text-cyan-400 hover:underline font-semibold">
            Daftar Gratis
          </Link>
        </div>
      </div>
    </div>
  )
}
