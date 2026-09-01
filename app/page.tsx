import React from 'react'
import Navbar from '@/components/marketing/navbar'
import Footer from '@/components/marketing/footer'
import ProductCard from '@/components/marketing/product-card'
import Link from 'next/link'

const FEATURED_PRODUCTS = [
  {
    id: '1',
    name: 'SaaS Multi-Tenant Boilerplate Next.js 14 & Supabase',
    slug: 'saas-multi-tenant-boilerplate-nextjs-supabase',
    price: 349000,
    discountPrice: 199000,
    rating: 4.9,
    categoryName: 'Source Code',
    totalSales: 128
  },
  {
    id: '2',
    name: '150+ Pack Template Video Promosi CapCut & TikTok Affiliate',
    slug: 'pack-template-video-capcut-affiliate',
    price: 150000,
    discountPrice: 75000,
    rating: 5.0,
    categoryName: 'Video Template',
    totalSales: 342
  },
  {
    id: '3',
    name: 'WhatsApp Automation Bot Node.js Baileys Multi-Device Pro',
    slug: 'whatsapp-automation-bot-nodejs-baileys',
    price: 299000,
    discountPrice: 149000,
    rating: 4.8,
    categoryName: 'Source Code',
    totalSales: 94
  },
  {
    id: '4',
    name: 'UI/UX Design System & Dashboard Figma Complete Kit',
    slug: 'ui-ux-design-system-figma-kit',
    price: 250000,
    discountPrice: 120000,
    rating: 4.9,
    categoryName: 'Desain Grafis',
    totalSales: 215
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 border-b border-slate-800/80">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-cyan-400 text-xs font-semibold mb-6">
            ✨ Platform Marketplace Produk Digital #1 di Indonesia
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight mb-6">
            Aset Digital & Source Code Siap Pakai untuk{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Percepat Bisnis Anda
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Dapatkan source code, template video, e-book, dan aset desain berkualitas tinggi dengan lisensi jelas dan unduhan instan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/produk"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition transform active:scale-95"
            >
              Jelajahi Semua Produk
            </Link>
            <Link
              href="/affiliate"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold rounded-xl border border-slate-700 transition"
            >
              Gabung Affiliate (Komisi s.d 30%)
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-16 pt-10 border-t border-slate-800/80 text-left">
            <div>
              <div className="text-2xl font-black text-white">500+</div>
              <div className="text-xs text-slate-400">Aset Digital Siap Pakai</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">10.000+</div>
              <div className="text-xs text-slate-400">Transaksi Berhasil</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">Instant</div>
              <div className="text-xs text-slate-400">Download via QRIS / VA</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">24/7</div>
              <div className="text-xs text-slate-400">Otomatisasi Penuh</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              🔥 Produk Unggulan Terlaris
            </h2>
            <p className="text-sm text-slate-400">
              Paling banyak diunduh dan terbukti membantu ribuan kreator & developer.
            </p>
          </div>
          <Link
            href="/produk"
            className="mt-4 md:mt-0 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
          >
            Lihat semua katalog →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_PRODUCTS.map((prod) => (
            <ProductCard key={prod.id} {...prod} />
          ))}
        </div>
      </section>

      {/* Categories Banner */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Kategori Populer</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Source Code & Bot', count: '120+ Produk', icon: '💻', slug: 'source-code' },
              { title: 'Video & Motion', count: '85+ Template', icon: '🎬', slug: 'video-template' },
              { title: 'Design & UI/UX', count: '200+ Aset', icon: '🎨', slug: 'desain-grafis' },
              { title: 'E-Book & Panduan', count: '50+ Buku', icon: '📚', slug: 'e-book' },
            ].map((cat, i) => (
              <Link
                key={i}
                href={`/kategori/${cat.slug}`}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition duration-300 hover:scale-105"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <h3 className="font-bold text-white text-sm mb-1">{cat.title}</h3>
                <span className="text-xs text-slate-500">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
