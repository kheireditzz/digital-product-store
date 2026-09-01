'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const metrics = [
    { title: 'Total Pendapatan', value: 'Rp 14.850.000', change: '+24% bln ini', color: 'text-emerald-400' },
    { title: 'Total Order Lunas', value: '184 Transaksi', change: '+12 order baru', color: 'text-cyan-400' },
    { title: 'Total Produk Aktif', value: '42 Item', change: '4 kategori', color: 'text-indigo-400' },
    { title: 'Affiliate Payout Pending', value: 'Rp 1.450.000', change: '3 permohonan', color: 'text-amber-400' }
  ]

  const recentOrders = [
    { id: 'ORD-9821', customer: 'Rian Pratama', item: 'SaaS Next.js Boilerplate', total: 'Rp 199.000', status: 'PAID', time: '10 mnt lalu' },
    { id: 'ORD-9820', customer: 'Dimas Setiawan', item: 'Template CapCut Affiliate', total: 'Rp 75.000', status: 'PAID', time: '45 mnt lalu' },
    { id: 'ORD-9819', customer: 'Budi Santoso', item: 'WA Bot Baileys Pro', total: 'Rp 149.000', status: 'PENDING', time: '1 jam lalu' },
    { id: 'ORD-9818', customer: 'Siti Aminah', item: 'UI/UX Design Kit', total: 'Rp 120.000', status: 'PAID', time: '3 jam lalu' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
              KHEIREDITZ ADMIN
            </span>
          </div>

          <nav className="space-y-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-3 py-2 rounded-lg transition ${
                activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              📊 Overview & Analytics
            </button>
            <Link
              href="/admin/produk"
              className="block px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              📦 Kelola Produk
            </Link>
            <Link
              href="/admin/orders"
              className="block px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              💳 Pesanan & Transaksi
            </Link>
            <Link
              href="/admin/kupon-diskon"
              className="block px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              🎟️ Kupon & Diskon
            </Link>
            <Link
              href="/admin/affiliate"
              className="block px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              🤝 Program Affiliate
            </Link>
            <Link
              href="/admin/pelanggan"
              className="block px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              👥 Data Pelanggan
            </Link>
            <Link
              href="/admin/pengaturan"
              className="block px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              ⚙️ Pengaturan Toko
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <Link
            href="/"
            className="block text-center py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 rounded-lg transition"
          >
            ← Kembali ke Toko
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
              <p className="text-xs text-slate-400">Ringkasan performa penjualan produk digital Anda</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/produk/baru"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition"
              >
                + Tambah Produk Baru
              </Link>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium">{m.title}</span>
                <div className={`text-xl font-black mt-2 ${m.color}`}>{m.value}</div>
                <div className="text-[11px] text-slate-500 mt-1">{m.change}</div>
              </div>
            ))}
          </div>

          {/* Recent Orders Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4">Transaksi Terakhir</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">Item Produk</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-cyan-400">{ord.id}</td>
                      <td className="py-3 px-4 font-medium text-white">{ord.customer}</td>
                      <td className="py-3 px-4">{ord.item}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">{ord.total}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{ord.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
