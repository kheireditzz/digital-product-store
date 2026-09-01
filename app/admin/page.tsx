'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    discount_price: '',
    description: '',
    file_url: '',
    file_size: ''
  })

  // Fetch Produk dari Supabase via API
  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products')
      const json = await res.json()
      if (json.success) {
        setProducts(json.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Handle Tambah Produk
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const json = await res.json()
      if (json.success) {
        setIsAddModalOpen(false)
        setFormData({ name: '', slug: '', price: '', discount_price: '', description: '', file_url: '', file_size: '' })
        fetchProducts()
        alert('Produk berhasil ditambahkan ke database Supabase!')
      } else {
        alert('Error: ' + json.error)
      }
    } catch (err: any) {
      alert('Gagal menambah produk: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Hapus Produk
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus produk "${name}" dari Supabase?`)) return
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE'
      })
      const json = await res.json()
      if (json.success) {
        alert('Produk berhasil dihapus!')
        fetchProducts()
      } else {
        alert('Error: ' + json.error)
      }
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <Link href="/" className="text-xl font-black bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
            KHEIREDITZ ADMIN
          </Link>

          <nav className="space-y-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-3 py-2 rounded-lg transition ${
                activeTab === 'products' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              📦 Kelola Produk ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-3 py-2 rounded-lg transition ${
                activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              💳 Pesanan & Transaksi
            </button>
            <Link href="/produk" className="block px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition">
              🌐 Lihat Toko Live
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <Link href="/" className="block text-center py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 rounded-lg transition">
            ← Kembali ke Website
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl font-black text-white">Kelola Produk Digital (Supabase Live)</h1>
              <p className="text-xs text-slate-400">Tambah, edit, dan hapus aset digital langsung dari database cloud</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/30 transition transform active:scale-95 flex items-center gap-1.5"
              >
                <span>+</span> Tambah Produk Baru
              </button>
            </div>
          </div>

          {/* Modal Tambah Produk */}
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">Tambah Produk Digital Baru</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nama Produk</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: WhatsApp Bot Baileys Pro"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Harga Diskon (Opsional)</label>
                      <input
                        type="number"
                        placeholder="99000"
                        value={formData.discount_price}
                        onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Deskripsi Singkat</label>
                    <textarea
                      placeholder="Deskripsi fitur dan keunggulan produk digital..."
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">URL File Download</label>
                      <input
                        type="text"
                        placeholder="https://drive.google.com/... atau storage path"
                        value={formData.file_url}
                        onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Ukuran File</label>
                      <input
                        type="text"
                        placeholder="Contoh: 45 MB / 1.2 GB"
                        value={formData.file_size}
                        onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold disabled:opacity-50"
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Simpan ke Supabase'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tabel Produk */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-white">Daftar Produk ({products.length})</h2>
              <button onClick={fetchProducts} className="text-xs text-indigo-400 hover:underline">🔄 Refresh Data</button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-sm">Memuat data produk dari Supabase...</div>
            ) : products.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">Belum ada produk di database. Klik tombol "Tambah Produk Baru" di atas.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="py-3 px-4">Nama Produk</th>
                      <th className="py-3 px-4">Harga Normal</th>
                      <th className="py-3 px-4">Harga Diskon</th>
                      <th className="py-3 px-4">Ukuran File</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-semibold text-white">{p.name}</td>
                        <td className="py-3 px-4">{formatRupiah(p.price)}</td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">{p.discount_price ? formatRupiah(p.discount_price) : '-'}</td>
                        <td className="py-3 px-4 text-slate-400">{p.file_size || '-'}</td>
                        <td className="py-3 px-4 text-center space-x-2">
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[11px] font-bold transition active:scale-95"
                          >
                            🗑 Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
