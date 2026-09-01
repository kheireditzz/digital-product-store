import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET: Ambil daftar orders
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ success: true, data: orders || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT: Update status order (cth: ubah jadi 'paid', 'expired', 'refunded')
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID dan status wajib diisi' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const updateData: any = { status }
    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE: Hapus transaksi
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 })

    const supabase = createAdminClient()
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true, message: 'Order berhasil dihapus' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
