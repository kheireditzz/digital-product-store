import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId
    const supabase = createAdminClient()

    // 1. Cek Order status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(*))')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    }

    if (order.status !== 'paid') {
      return NextResponse.json({ error: 'Pembayaran belum diselesaikan' }, { status: 403 })
    }

    // 2. Cek download records & buat Signed URL
    const items = order.order_items || []
    const downloadLinks = []

    for (const item of items) {
      if (item.product && item.product.file_url) {
        // Jika file_url adalah path di private storage Supabase
        let downloadUrl = item.product.file_url

        if (!item.product.file_url.startsWith('http')) {
          const { data: signedData, error: signError } = await supabase
            .storage
            .from('digital-assets')
            .createSignedUrl(item.product.file_url, 60 * 60) // 1 jam expiry

          if (!signError && signedData) {
            downloadUrl = signedData.signedUrl
          }
        }

        downloadLinks.push({
          productId: item.product.id,
          productName: item.product.name,
          downloadUrl,
          fileSize: item.product.file_size || 'Unknown'
        })
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      customerEmail: order.customer_email,
      items: downloadLinks
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengambil file download' }, { status: 500 })
  }
}
