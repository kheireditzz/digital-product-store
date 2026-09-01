export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'customer' | 'affiliate' | 'staff' | 'admin' | 'super_admin'
export type CouponType = 'percent' | 'fixed'
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded'
export type AffiliateStatus = 'active' | 'suspended'
export type CommissionStatus = 'pending' | 'paid'
export type PayoutStatus = 'pending' | 'approved' | 'rejected' | 'paid'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  referral_code: string | null
  referred_by: string | null
  is_banned: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon?: string | null
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  price: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  thumbnail: string | null
  banner_image: string | null
  price: number
  discount_price: number | null
  file_url: string | null
  file_size: string | null
  category_id: string | null
  is_active: boolean
  is_featured: boolean
  total_sales: number
  rating_avg: number
  created_at: string
  updated_at: string
  category?: Category
  variants?: ProductVariant[]
  tags?: Tag[]
}

export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  max_usage: number
  used_count: number
  min_purchase: number
  expired_at: string | null
  is_active: boolean
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id?: string | null
  price: number
  qty: number
  product?: Product
  variant?: ProductVariant
}

export interface Order {
  id: string
  user_id: string | null
  customer_name: string | null
  customer_email: string
  customer_phone: string | null
  status: OrderStatus
  subtotal: number
  discount: number
  total: number
  coupon_id: string | null
  payment_method: string | null
  payment_ref: string | null
  snap_token: string | null
  affiliate_ref: string | null
  created_at: string
  paid_at: string | null
  order_items?: OrderItem[]
}

export interface DownloadItem {
  id: string
  order_item_id: string
  user_id: string | null
  signed_url: string | null
  download_count: number
  max_download: number
  expired_at: string | null
  created_at: string
  order_item?: OrderItem
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string | null
  is_approved: boolean
  created_at: string
  user?: Profile
}

export interface Banner {
  id: string
  image_url: string
  link_url: string | null
  title: string
  sort_order: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
}

export interface Affiliate {
  id: string
  user_id: string
  commission_rate: number
  total_earned: number
  total_paid: number
  balance: number
  status: AffiliateStatus
  created_at: string
  profile?: Profile
}

export interface Payout {
  id: string
  affiliate_id: string
  amount: number
  status: PayoutStatus
  method: string
  account_details: Record<string, any>
  requested_at: string
  paid_at: string | null
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}
