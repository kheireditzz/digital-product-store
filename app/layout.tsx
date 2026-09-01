import React from 'react'
import './globals.css'

export const metadata = {
  title: 'Kheireditz Store — Marketplace Produk & Aset Digital',
  description: 'Source code, template video, e-book, dan aset digital terpercaya di Indonesia.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
