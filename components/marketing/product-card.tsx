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
  categoryName = 'Digital',
  totalSales = 0
}: ProductCardProps) {
  const isDiscount = discountPrice && discountPrice < price

  return (
    <div className="clean-card rounded-2xl overflow-hidden flex flex-col group">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full bg-surface-elevated overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-card to-surface-elevated text-orange-400 p-4 text-center">
            <span className="text-2xl mb-1">⚡</span>
            <span className="text-xs font-bold text-slate-300">Kheireditz Asset</span>
          </div>
        )}
        {isDiscount && (
          <span className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-orange-500/30">
            DISKON
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span className="bg-surface-elevated px-2 py-0.5 rounded text-orange-400 font-semibold border border-surface-border">
            {categoryName}
          </span>
          <span>{totalSales} Terjual</span>
        </div>

        <Link href={`/produk/${slug}`} className="hover:text-orange-400 transition">
          <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 mb-4">
            {name}
          </h3>
        </Link>

        {/* Pricing & CTA */}
        <div className="mt-auto pt-3 border-t border-surface-border flex items-center justify-between">
          <div>
            {isDiscount ? (
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 line-through">
                  {formatRupiah(price)}
                </span>
                <span className="text-sm font-extrabold text-orange-400">
                  {formatRupiah(discountPrice!)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-extrabold text-white">
                {formatRupiah(price)}
              </span>
            )}
          </div>

          <Link
            href={`/produk/${slug}`}
            className="px-3 py-1.5 btn-primary text-xs rounded-xl shadow-md transition active:scale-95"
          >
            Beli
          </Link>
        </div>
      </div>
    </div>
  )
}
