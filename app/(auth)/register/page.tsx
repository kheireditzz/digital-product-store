'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = (e: React.FormEvent) => {
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
          <h1 className="text-xl font-bold text-white">Buat Akun Member Baru</h1>
          <p className="text-xs text-slate-400 mt-1">Dapatkan akses instan ke seluruh produk digital & program affiliate</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              placeholder="Nama Lengkap Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Email Aktif</label>
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
            <label className="block text-slate-300 font-medium mb-1">Password</label>
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
            className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-600/30 transition transform active:scale-95 text-xs"
          >
            {loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-cyan-400 hover:underline font-semibold">
            Masuk di Sini
          </Link>
        </div>
      </div>
    </div>
  )
}
