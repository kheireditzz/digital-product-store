import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type
    } = body

    // 1. Verifikasi Signature Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-test'
    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex')

    if (process.env.NODE_ENV === 'production' && hash !== signature_key) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    const supabase = createAdminClient()

    let orderStatus = 'pending'
    let isPaid = false

    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        orderStatus = 'paid'
        isPaid = true
      }
    } else if (transaction_status === 'settlement') {
      orderStatus = 'paid'
      isPaid = true
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      orderStatus = 'failed'
    } else if (transaction_status === 'pending') {
      orderStatus = 'pending'
    }

    // 2. Update Order di Supabase
    const updateData: any = {
      status: orderStatus,
      payment_method: payment_type || 'midtrans',
      payment_ref: transaction_status
    }

    if (isPaid) {
      updateData.paid_at = new Date().toISOString()
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order_id)
      .select('*, order_items(*)')
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 3. Trigger Post-payment: Buat download entry & Hitung Komisi Affiliate
    if (isPaid) {
      // Inisialisasi download tokens jika ada item
      if (order.order_items && order.order_items.length > 0) {
        for (const item of order.order_items) {
          await supabase.from('downloads').insert({
            order_item_id: item.id,
            user_id: order.user_id || null,
            download_count: 0,
            max_download: 10,
            expired_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 hari akses
          })
        }
      }

      // Hitung komisi affiliate jika ada referral code
      if (order.affiliate_ref) {
        const { data: affiliate } = await supabase
          .from('affiliates')
          .select('*')
          .eq('id', order.affiliate_ref)
          .single()

        if (affiliate && affiliate.status === 'active') {
          const commissionAmount = (Number(order.total) * Number(affiliate.commission_rate)) / 100
          await supabase.from('affiliate_commissions').insert({
            affiliate_id: affiliate.id,
            order_id: order.id,
            amount: commissionAmount,
            status: 'pending'
          })

          await supabase
            .from('affiliates')
            .update({
              total_earned: Number(affiliate.total_earned) + commissionAmount,
              balance: Number(affiliate.balance) + commissionAmount
            })
            .eq('id', affiliate.id)
        }
      }
    }

    return NextResponse.json({ status: 'success', message: 'Webhook processed' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Webhook error' }, { status: 500 })
  }
}
