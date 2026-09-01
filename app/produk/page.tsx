import React from 'react'
import Navbar from '@/components/marketing/navbar'
import Footer from '@/components/marketing/footer'
import ProductCard from '@/components/marketing/product-card'

const ALL_PRODUCTS = [
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
  },
  {
    id: '5',
    name: 'Auto Headless Video Uploader Python Script TikTok & IG Reels',
    slug: 'auto-video-uploader-python-script',
    price: 199000,
    discountPrice: 99000,
    rating: 4.7,
    categoryName: 'Source Code',
    totalSales: 87
  },
  {
    id: '6',
    name: 'E-Book Mahir Full Stack Web Development dari Nol sampai Deploy',
    slug: 'ebook-fullstack-web-development-lengkap',
    price: 99000,
    discountPrice: 49000,
    rating: 5.0,
    categoryName: 'E-Book',
    totalSales: 512
  }
]

export default function ProdukPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header */}
        <div className="border-b border-slate-800 pb-8 mb-10">
          <h1 className="text-3xl font-black text-white mb-2">Katalog Semua Produk</h1>
          <p className="text-sm text-slate-400">
            Temukan berbagai source code, template video, preset, e-book, dan aset digital siap unduh.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ALL_PRODUCTS.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
