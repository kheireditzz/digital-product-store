'use client'

import React, { useState } from 'react'
import Navbar from '@/components/marketing/navbar'
import Footer from '@/components/marketing/footer'
import { formatRupiah } from '@/lib/utils'

export default function DetailProdukPage({ params }: { params: { slug: string } }) {
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [selectedVariant, setSelectedVariant] = useState('personal')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Mock product data for display
  const product = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'SaaS Multi-Tenant Boilerplate Next.js 14 & Supabase',
    slug: params.slug,
    categoryName: 'Source Code & Web App',
    rating: 4.9,
    reviewsCount: 48,
    totalSales: 128,
    price: 349000,
    discountPrice: 199000,
    features: [
      'Next.js 14 App Router + TypeScript + Tailwind CSS',
      'Supabase Auth, Database PostgreSQL, Storage & RLS',
      'Integrasi Payment Gateway Midtrans (QRIS, VA, E-Wallet)',
      'Dashboard User + Super Admin Panel Lengkap',
      'Email Transaksional Notifikasi & Faktur Pembelian',
      'Dokumentasi Panduan Setup Step-by-step',
      'Free Update & Komunitas Support'
    ],
    variants: [
      { id: 'personal', name: 'Lisensi Personal (1 Proyek)', price: 199000 },
      { id: 'commercial', name: 'Lisensi Developer/Komersial (Unlimited)', price: 399000 }
    ]
  }

  const currentPrice = selectedVariant === 'commercial' ? 399000 : 199000

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName,
          customerEmail,
          customerPhone,
          couponCode: couponCode || null
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses checkout')
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else if (data.orderId) {
        alert(`Order berhasil dibuat! ID: ${data.orderId}. Silakan selesaikan pembayaran.`)
      }
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="inline-block bg-slate-800 text-cyan-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {product.categoryName}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="text-amber-400 font-bold">★ {product.rating}</span>
                <span>•</span>
                <span>{product.totalSales} Terjual</span>
                <span>•</span>
                <span>{product.reviewsCount} Ulasan Pembeli</span>
              </div>
            </div>

            {/* Thumbnail Preview Banner */}
            <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center p-8 text-center shadow-2xl">
              <div>
                <div className="text-4xl mb-3">⚡</div>
                <div className="text-xl font-bold text-white mb-2">Live Demo & Preview Source Code</div>
                <div className="text-xs text-slate-400">Next.js 14 • Supabase • Midtrans Ready</div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Yang Akan Anda Dapatkan:</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Checkout Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl shadow-indigo-500/10">
              <h2 className="text-lg font-bold text-white mb-4">Beli Langsung / Instant Checkout</h2>

              {/* License Variant Picker */}
              <div className="space-y-2 mb-6">
                <label className="text-xs font-semibold text-slate-300">Pilih Lisensi:</label>
                {product.variants.map((variant) => (
                  <label
                    key={variant.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                      selectedVariant === variant.id
                        ? 'border-indigo-500 bg-indigo-950/40 text-white'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="variant"
                        checked={selectedVariant === variant.id}
                        onChange={() => setSelectedVariant(variant.id)}
                        className="text-indigo-600 focus:ring-0"
                      />
                      <span>{variant.name}</span>
                    </div>
                    <span className="font-bold text-slate-200">{formatRupiah(variant.price)}</span>
                  </label>
                ))}
              </div>

              {/* Price Total */}
              <div className="bg-slate-950 p-4 rounded-xl mb-6 border border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Pembayaran</span>
                <span className="text-xl font-black text-emerald-400">{formatRupiah(currentPrice)}</span>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleCheckout} className="space-y-4 text-xs">
                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Anda"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Pengiriman Download</label>
                  <input
                    type="email"
                    required
                    placeholder="email@anda.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nomor WhatsApp (Opsional)</label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Kode Kupon Diskon</label>
                  <input
                    type="text"
                    placeholder="Contoh: DISKON50"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Memproses Order...' : 'Bayar Sekarang (QRIS / VA)'}
                </button>
              </form>

              <div className="mt-4 text-center text-[10px] text-slate-500">
                🔒 Pembayaran aman & terenkripsi otomatis via Midtrans
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
