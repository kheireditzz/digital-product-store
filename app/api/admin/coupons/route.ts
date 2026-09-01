import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET: Ambil kupon diskon
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ success: true, data: coupons || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST: Buat kupon baru
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, type, value, max_usage, min_purchase } = body

    if (!code || !value) {
      return NextResponse.json({ error: 'Kode dan nilai kupon wajib diisi' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: code.toUpperCase().trim(),
        type: type || 'percent',
        value: Number(value),
        max_usage: max_usage ? Number(max_usage) : 100,
        min_purchase: min_purchase ? Number(min_purchase) : 0,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE: Hapus kupon
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 })

    const supabase = createAdminClient()
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true, message: 'Kupon berhasil dihapus' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
