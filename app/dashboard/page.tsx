'use client'

import React from 'react'
import Navbar from '@/components/marketing/navbar'
import Footer from '@/components/marketing/footer'
import Link from 'next/link'

export default function UserDashboardPage() {
  const myPurchases = [
    {
      id: 'ORD-9821',
      name: 'SaaS Multi-Tenant Boilerplate Next.js 14 & Supabase',
      category: 'Source Code',
      fileSize: '45.2 MB',
      purchasedAt: '1 September 2026',
      downloadUrl: '/api/download/ORD-9821'
    },
    {
      id: 'ORD-9750',
      name: '150+ Pack Template Video Promosi CapCut & TikTok Affiliate',
      category: 'Video Template',
      fileSize: '1.2 GB',
      purchasedAt: '28 Agustus 2026',
      downloadUrl: '/api/download/ORD-9750'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* User Greeting */}
        <div className="border-b border-slate-800 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Dashboard Member</h1>
            <p className="text-xs text-slate-400">Kelola lisensi produk digital dan akses unduhan instan Anda</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/affiliate-saya"
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-indigo-500 text-xs font-semibold rounded-lg transition"
            >
              🤝 Area Affiliate
            </Link>
          </div>
        </div>

        {/* Downloads Grid */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white">Produk Digital Saya ({myPurchases.length})</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myPurchases.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-cyan-400 font-medium">
                      {item.category}
                    </span>
                    <span>Beli: {item.purchasedAt}</span>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">{item.name}</h3>
                  <div className="text-xs text-slate-400 mb-6">Ukuran File: {item.fileSize}</div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-medium">✓ Akses Aktif Selamanya</span>
                  <a
                    href={item.downloadUrl}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-600/20 transition active:scale-95 flex items-center gap-1.5"
                  >
                    ⬇ Unduh File
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
