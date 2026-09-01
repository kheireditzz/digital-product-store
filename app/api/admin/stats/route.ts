import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // 1. Hitung total omzet & total order
    const { data: orders } = await supabase
      .from('orders')
      .select('id, total, status, created_at')

    let totalRevenue = 0
    let paidOrdersCount = 0
    let pendingOrdersCount = 0

    orders?.forEach((o: any) => {
      if (o.status === 'paid') {
        totalRevenue += Number(o.total || 0)
        paidOrdersCount++
      } else if (o.status === 'pending') {
        pendingOrdersCount++
      }
    })

    // 2. Hitung total produk
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    // 3. Hitung total affiliate & payout pending
    const { data: payouts } = await supabase
      .from('payouts')
      .select('amount, status')
      .eq('status', 'pending')

    const pendingPayoutTotal = payouts?.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0) || 0

    // 4. Hitung subscriber & ulasan
    const { count: subscriberCount } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        paidOrdersCount,
        pendingOrdersCount,
        productCount: productCount || 0,
        pendingPayoutTotal,
        subscriberCount: subscriberCount || 0
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
