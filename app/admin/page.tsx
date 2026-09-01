'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatRupiah, formatDate } from '@/lib/utils'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'coupons'>('overview')
  const [loading, setLoading] = useState(true)

  // Data States
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidOrdersCount: 0,
    pendingOrdersCount: 0,
    productCount: 0,
    pendingPayoutTotal: 0,
    subscriberCount: 0
  })
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [coupons, setCoupons] = useState<any[]>([])

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Forms
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    price: '',
    discount_price: '',
    description: '',
    file_url: '',
    file_size: ''
  })
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percent',
    value: '',
    max_usage: '100',
    min_purchase: '0'
  })

  // Load All Data from Supabase
  const loadData = async () => {
    setLoading(true)
    try {
      const [resStats, resProds, resOrds, resCoups] = await Promise.all([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch('/api/admin/products').then(r => r.json()),
        fetch('/api/admin/orders').then(r => r.json()),
        fetch('/api/admin/coupons').then(r => r.json()),
      ])

      if (resStats.success) setStats(resStats.data)
      if (resProds.success) setProducts(resProds.data)
      if (resOrds.success) setOrders(resOrds.data)
      if (resCoups.success) setCoupons(resCoups.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // 1. TAMBAH PRODUK
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      })
      const json = await res.json()
      if (json.success) {
        setIsProductModalOpen(false)
        setProductForm({ name: '', slug: '', price: '', discount_price: '', description: '', file_url: '', file_size: '' })
        loadData()
        alert('Produk berhasil ditambahkan ke Supabase!')
      } else {
        alert('Error: ' + json.error)
      }
    } catch (err: any) {
      alert('Gagal: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 2. HAPUS PRODUK
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}" dari database?`)) return
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        loadData()
      } else {
        alert(json.error)
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  // 3. TAMBAH KUPON
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponForm)
      })
      const json = await res.json()
      if (json.success) {
        setIsCouponModalOpen(false)
        setCouponForm({ code: '', type: 'percent', value: '', max_usage: '100', min_purchase: '0' })
        loadData()
        alert('Kupon berhasil dibuat di Supabase!')
      } else {
        alert('Error: ' + json.error)
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 4. HAPUS KUPON
  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Hapus kupon "${code}"?`)) return
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) loadData()
      else alert(json.error)
    } catch (e: any) {
      alert(e.message)
    }
  }

  // 5. UPDATE STATUS PESANAN (MANUAL APPROVE / CANCEL)
  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      const json = await res.json()
      if (json.success) loadData()
      else alert(json.error)
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/80 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <Link href="/" className="text-xl font-black bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            KHEIREDITZ ADMIN
          </Link>

          <nav className="space-y-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'overview' ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              📊 Overview & Analytics
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'products' ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              📦 Kelola Produk ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'orders' ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              💳 Pesanan & Transaksi ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'coupons' ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              🎟️ Kupon & Promo ({coupons.length})
            </button>
            <Link href="/produk" className="block px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
              🌐 Buka Katalog Toko
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <Link href="/" className="block text-center py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 rounded-lg transition">
            ← Kembali ke Depan
          </Link>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl font-black text-white">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'products' && 'Manajemen Produk Digital'}
                {activeTab === 'orders' && 'Semua Transaksi & Pesanan'}
                {activeTab === 'coupons' && 'Manajemen Kupon Diskon'}
              </h1>
              <p className="text-xs text-slate-400">Sinkronisasi Database Supabase PostgreSQL Real-time</p>
            </div>
            <div className="flex gap-2">
              {activeTab === 'products' && (
                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
                >
                  + Tambah Produk Baru
                </button>
              )}
              {activeTab === 'coupons' && (
                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition transform active:scale-95"
                >
                  + Buat Kupon Baru
                </button>
              )}
              <button
                onClick={loadData}
                className="px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 font-medium">Total Omzet Lunas</span>
                  <div className="text-2xl font-black mt-2 text-emerald-400">{formatRupiah(stats.totalRevenue)}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{stats.paidOrdersCount} Transaksi Sukses</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 font-medium">Order Pending</span>
                  <div className="text-2xl font-black mt-2 text-amber-400">{stats.pendingOrdersCount} Pesanan</div>
                  <div className="text-[11px] text-slate-500 mt-1">Menunggu pembayaran QRIS/VA</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 font-medium">Produk Aktif</span>
                  <div className="text-2xl font-black mt-2 text-cyan-400">{products.length} Item</div>
                  <div className="text-[11px] text-slate-500 mt-1">Di katalog Supabase</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 font-medium">Kupon Aktif</span>
                  <div className="text-2xl font-black mt-2 text-indigo-400">{coupons.length} Kode</div>
                  <div className="text-[11px] text-slate-500 mt-1">Siap dipakai checkout</div>
                </div>
              </div>

              {/* Quick Table Recent Orders */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-4">5 Transaksi Terakhir</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Pelanggan</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id}>
                          <td className="py-3 px-4 font-semibold text-white">{ord.customer_name || 'Guest'}</td>
                          <td className="py-3 px-4 text-slate-400">{ord.customer_email}</td>
                          <td className="py-3 px-4 font-bold text-emerald-400">{formatRupiah(ord.total)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}>
                              {ord.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{formatDate(ord.created_at)}</td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-6 text-slate-500">Belum ada transaksi</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUK (CRUD LENGKAP) */}
          {activeTab === 'products' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Nama Produk</th>
                      <th className="py-3 px-4">Harga Normal</th>
                      <th className="py-3 px-4">Harga Diskon</th>
                      <th className="py-3 px-4">File Download</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-semibold text-white">{p.name}</td>
                        <td className="py-3 px-4">{formatRupiah(p.price)}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">{p.discount_price ? formatRupiah(p.discount_price) : '-'}</td>
                        <td className="py-3 px-4 text-slate-400">{p.file_size || 'Aktif'}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[11px] font-bold"
                          >
                            🗑 Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-slate-500">Belum ada produk. Tambahkan di atas!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PESANAN & TRANSAKSI */}
          {activeTab === 'orders' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Pelanggan</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Ubah Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono text-cyan-400">{o.id.substring(0, 8)}...</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{o.customer_name || 'Guest'}</div>
                          <div className="text-[11px] text-slate-400">{o.customer_email}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-400">{formatRupiah(o.total)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}>
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center space-x-2">
                          {o.status !== 'paid' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'paid')}
                              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold"
                            >
                              ✓ Set Paid
                            </button>
                          )}
                          {o.status !== 'expired' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'expired')}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-[10px]"
                            >
                              Expire
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-slate-500">Belum ada pesanan masuk</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: KUPON DISKON (CRUD) */}
          {activeTab === 'coupons' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Kode Kupon</th>
                      <th className="py-3 px-4">Tipe Potongan</th>
                      <th className="py-3 px-4">Nilai Diskon</th>
                      <th className="py-3 px-4">Batas Pemakaian</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{c.code}</td>
                        <td className="py-3 px-4 uppercase">{c.type}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">
                          {c.type === 'percent' ? `${c.value}%` : formatRupiah(c.value)}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{c.used_count || 0} / {c.max_usage}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDeleteCoupon(c.id, c.code)}
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[11px] font-bold"
                          >
                            🗑 Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-slate-500">Belum ada kupon diskon. Buat di atas!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODAL 1: TAMBAH PRODUK */}
          {isProductModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">Tambah Produk Digital Baru (Supabase)</h3>
                  <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
                </div>
                <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nama Produk</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: WhatsApp Bot Baileys Pro"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Harga Normal (Rp)</label>
                      <input
                        type="number"
                        required
                        placeholder="150000"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Harga Diskon (Opsional)</label>
                      <input
                        type="number"
                        placeholder="99000"
                        value={productForm.discount_price}
                        onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Deskripsi Singkat</label>
                    <textarea
                      placeholder="Deskripsi fitur produk digital..."
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Link Download Aset</label>
                      <input
                        type="text"
                        placeholder="https://drive.google.com/..."
                        value={productForm.file_url}
                        onChange={(e) => setProductForm({ ...productForm, file_url: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Ukuran File</label>
                      <input
                        type="text"
                        placeholder="Contoh: 45 MB / 1.2 GB"
                        value={productForm.file_size}
                        onChange={(e) => setProductForm({ ...productForm, file_size: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="pt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold disabled:opacity-50">
                      {isSubmitting ? 'Menyimpan...' : 'Simpan ke Supabase'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL 2: TAMBAH KUPON */}
          {isCouponModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">Buat Kupon Diskon Baru</h3>
                  <button onClick={() => setIsCouponModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
                </div>
                <form onSubmit={handleAddCoupon} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Kode Kupon (Huruf Kapital)</label>
                    <input
                      type="text"
                      required
                      placeholder="CONTOH: DISKON50"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white uppercase focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Tipe Diskon</label>
                      <select
                        value={couponForm.type}
                        onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="percent">Persentase (%)</option>
                        <option value="fixed">Potongan Tetap (Rp)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Nilai Diskon</label>
                      <input
                        type="number"
                        required
                        placeholder={couponForm.type === 'percent' ? '50' : '20000'}
                        value={couponForm.value}
                        onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Maksimal Pemakaian (Kuota)</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={couponForm.max_usage}
                      onChange={(e) => setCouponForm({ ...couponForm, max_usage: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="pt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setIsCouponModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold disabled:opacity-50">
                      {isSubmitting ? 'Membuat...' : 'Buat Kupon Supabase'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
