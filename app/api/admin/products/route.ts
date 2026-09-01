import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET: Ambil semua produk
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data: products, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ success: true, data: products || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST: Tambah produk baru
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()

    const { name, slug, description, price, discount_price, category_id, file_url, file_size, is_active } = body

    if (!name || !price) {
      return NextResponse.json({ error: 'Nama dan harga produk wajib diisi' }, { status: 400 })
    }

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        slug: finalSlug,
        description: description || null,
        price: Number(price),
        discount_price: discount_price ? Number(discount_price) : null,
        category_id: category_id || null,
        file_url: file_url || null,
        file_size: file_size || null,
        is_active: is_active ?? true,
        is_featured: false
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE: Hapus produk berdasarkan ID
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT: Update data produk
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updateFields } = body

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('products')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
