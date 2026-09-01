import React from 'react'

export const metadata = {
  title: 'Digital Product Store - Kheireditz',
  description: 'Marketplace Produk Digital Terpercaya',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#0f172a', color: '#f8fafc' }}>
        {children}
      </body>
    </html>
  )
}
