'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/marketing/navbar'
import Footer from '@/components/marketing/footer'
import ProductCard from '@/components/marketing/product-card'
import Link from 'next/link'

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data.length > 0) {
          setProducts(res.data)
        } else {
          setProducts([
            { id: '1', name: 'SaaS Multi-Tenant Boilerplate Next.js 14 & Supabase', slug: 'saas-multi-tenant-boilerplate-nextjs-supabase', price: 349000, discountPrice: 199000, categoryName: 'Source Code', totalSales: 128 },
            { id: '2', name: '150+ Pack Template Video Promosi CapCut & TikTok Affiliate', slug: 'pack-template-video-capcut-affiliate', price: 150000, discountPrice: 75000, categoryName: 'Video Template', totalSales: 342 },
            { id: '3', name: 'WhatsApp Automation Bot Node.js Baileys Multi-Device Pro', slug: 'whatsapp-automation-bot-nodejs-baileys', price: 299000, discountPrice: 149000, categoryName: 'Source Code', totalSales: 94 },
            { id: '4', name: 'UI/UX Design System & Dashboard Figma Complete Kit', slug: 'ui-ux-design-system-figma-kit', price: 250000, discountPrice: 120000, categoryName: 'Desain Grafis', totalSales: 215 },
          ])
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-surface-base text-slate-200 font-sans antialiased flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar />

      {/* Hero Banner Asli */}
      <section className="relative overflow-hidden py-20 border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-semibold">
            ✨ Portal Resmi Produk & Aset Digital Kheireditz
          </div>
          <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Marketplace Aset Kreatif & Source Code{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
              Terpercaya di Indonesia
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Dapatkan source code, video template, e-book, dan aset digital siap pakai dengan lisensi resmi dan unduhan instan otomatis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/produk"
              className="w-full sm:w-auto px-8 py-3.5 btn-primary font-bold rounded-xl shadow-lg shadow-orange-500/25 transition transform active:scale-95 text-xs"
            >
              Jelajahi Semua Produk
            </Link>
            <Link
              href="/admin"
              className="w-full sm:w-auto px-8 py-3.5 btn-secondary font-semibold rounded-xl transition text-xs"
            >
              ⚙️ Panel Admin Toko
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display text-white">🔥 Produk Digital Unggulan</h2>
            <p className="text-xs text-slate-400">Paling banyak diunduh dan terverifikasi</p>
          </div>
          <Link href="/produk" className="text-xs font-semibold text-orange-400 hover:text-orange-300">
            Lihat Semua →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <ProductCard
              key={prod.id}
              id={prod.id}
              name={prod.name}
              slug={prod.slug}
              price={prod.price}
              discountPrice={prod.discount_price || prod.discountPrice}
              thumbnail={prod.thumbnail}
              categoryName={prod.categoryName || 'Aset Digital'}
              totalSales={prod.total_sales || prod.totalSales || 0}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
