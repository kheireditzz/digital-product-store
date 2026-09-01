import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white tracking-wider">KHEIREDITZ</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Platform marketplace aset digital, source code, template video/desain, dan tools kreatif terpercaya di Indonesia.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Produk & Kategori</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/kategori/source-code" className="hover:text-cyan-400">Source Code & Script</Link></li>
              <li><Link href="/kategori/video-template" className="hover:text-cyan-400">Template Video (CapCut/AE)</Link></li>
              <li><Link href="/kategori/desain-grafis" className="hover:text-cyan-400">Asset Grafis & UI/UX</Link></li>
              <li><Link href="/kategori/e-book" className="hover:text-cyan-400">E-Book & Course</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Program & Bantuan</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/affiliate" className="hover:text-cyan-400">Program Affiliate (Komisi s.d 30%)</Link></li>
              <li><Link href="/faq" className="hover:text-cyan-400">FAQ & Bantuan</Link></li>
              <li><Link href="/kontak" className="hover:text-cyan-400">Hubungi Kami</Link></li>
              <li><Link href="/blog" className="hover:text-cyan-400">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Legal & Keamanan</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/kebijakan-privasi" className="hover:text-cyan-400">Kebijakan Privasi</Link></li>
              <li><Link href="/syarat-ketentuan" className="hover:text-cyan-400">Syarat & Ketentuan</Link></li>
              <li className="pt-2 text-[11px] text-slate-500">
                Didukung pembayaran instan QRIS, GoPay, OVO, ShopeePay, & Virtual Account Bank.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Kheireditz. All rights reserved.</p>
          <p>Dibuat untuk kreator & developer Indonesia 🚀</p>
        </div>
      </div>
    </footer>
  )
}
