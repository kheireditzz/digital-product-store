import { NextResponse } from 'next/server'
import { snap } from '@/lib/midtrans'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkoutSchema } from '@/lib/validators'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = checkoutSchema.parse(body)

    const supabase = createAdminClient()

    // 1. Fetch Product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('id', validatedData.productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }

    let itemPrice = Number(product.discount_price || product.price)
    let variantName = ''

    if (validatedData.variantId) {
      const variant = product.variants?.find((v: any) => v.id === validatedData.variantId)
      if (variant) {
        itemPrice = Number(variant.price)
        variantName = ` (${variant.name})`
      }
    }

    let subtotal = itemPrice
    let discount = 0

    // 2. Validate Coupon
    let couponId = null
    if (validatedData.couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', validatedData.couponCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (coupon) {
        if (coupon.type === 'percent') {
          discount = (subtotal * Number(coupon.value)) / 100
        } else {
          discount = Number(coupon.value)
        }
        discount = Math.min(discount, subtotal)
        couponId = coupon.id
      }
    }

    const total = Math.max(0, subtotal - discount)

    // 3. Create Order in Database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: validatedData.customerName,
        customer_email: validatedData.customerEmail,
        customer_phone: validatedData.customerPhone || null,
        subtotal,
        discount,
        total,
        coupon_id: couponId,
        affiliate_ref: validatedData.affiliateRef || null,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Gagal membuat order' }, { status: 500 })
    }

    // 4. Create Order Item
    await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: product.id,
      variant_id: validatedData.variantId || null,
      price: itemPrice,
      qty: 1
    })

    // 5. Generate Midtrans Snap Token
    const midtransParams = {
      transaction_details: {
        order_id: order.id,
        gross_amount: total
      },
      customer_details: {
        first_name: validatedData.customerName,
        email: validatedData.customerEmail,
        phone: validatedData.customerPhone || ''
      },
      item_details: [
        {
          id: product.id,
          price: total,
          quantity: 1,
          name: `${product.name}${variantName}`.substring(0, 50)
        }
      ]
    }

    let snapToken = null
    let redirectUrl = null

    try {
      const snapResponse = await snap.createTransaction(midtransParams)
      snapToken = snapResponse.token
      redirectUrl = snapResponse.redirect_url

      await supabase
        .from('orders')
        .update({ snap_token: snapToken })
        .eq('id', order.id)
    } catch (midtransErr) {
      console.warn('Midtrans Snap Error:', midtransErr)
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      snapToken,
      redirectUrl,
      total
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan sistem' },
      { status: 400 }
    )
  }
}
