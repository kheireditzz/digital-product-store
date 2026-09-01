import React from 'react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  thumbnail?: string | null
  price: number
  discountPrice?: number | null
  rating?: number
  categoryName?: string
  totalSales?: number
}

export default function ProductCard({
  name,
  slug,
  thumbnail,
  price,
  discountPrice,
  rating = 5.0,
  categoryName = 'Digital',
  totalSales = 0
}: ProductCardProps) {
  const isDiscount = discountPrice && discountPrice < price

  return (
    <div className="group flex flex-col bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full bg-slate-800 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-indigo-950/40 text-indigo-400 font-semibold text-sm">
            Digital Asset
          </div>
        )}
        {isDiscount && (
          <span className="absolute top-3 right-3 bg-rose-500/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
            HEMAT {Math.round(((price - discountPrice!) / price) * 100)}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="bg-slate-800/80 px-2.5 py-1 rounded-md text-cyan-400 font-medium">
            {categoryName}
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            ★ {rating.toFixed(1)} <span className="text-slate-500">({totalSales} terjual)</span>
          </span>
        </div>

        <Link href={`/produk/${slug}`} className="hover:text-indigo-400 transition">
          <h3 className="font-bold text-slate-100 text-base leading-snug line-clamp-2 mb-3">
            {name}
          </h3>
        </Link>

        {/* Pricing & CTA */}
        <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            {isDiscount ? (
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 line-through">
                  {formatRupiah(price)}
                </span>
                <span className="text-base font-extrabold text-emerald-400">
                  {formatRupiah(discountPrice!)}
                </span>
              </div>
            ) : (
              <span className="text-base font-extrabold text-slate-100">
                {formatRupiah(price)}
              </span>
            )}
          </div>

          <Link
            href={`/produk/${slug}`}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition active:scale-95 shadow-md shadow-indigo-600/20"
          >
            Beli Sekarang
          </Link>
        </div>
      </div>
    </div>
  )
}
