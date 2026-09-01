-- =========================================================================
-- DATABASE SCHEMA: KHEIREDITZ DIGITAL STORE (SUPABASE POSTGRES + RLS)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'affiliate', 'staff', 'admin', 'super_admin');
CREATE TYPE coupon_type AS ENUM ('percent', 'fixed');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'failed', 'expired', 'refunded');
CREATE TYPE affiliate_status AS ENUM ('active', 'suspended');
CREATE TYPE commission_status AS ENUM ('pending', 'paid');
CREATE TYPE payout_status AS ENUM ('pending', 'approved', 'rejected', 'paid');

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'customer' NOT NULL,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_banned BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- TAGS
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    thumbnail TEXT,
    banner_image TEXT,
    price NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    discount_price NUMERIC(15, 2),
    file_url TEXT,
    file_size TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    total_sales INTEGER DEFAULT 0 NOT NULL,
    rating_avg NUMERIC(3, 2) DEFAULT 5.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- PRODUCT_TAGS
CREATE TABLE IF NOT EXISTS public.product_tags (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

-- PRODUCT_VARIANTS
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    type coupon_type DEFAULT 'percent' NOT NULL,
    value NUMERIC(15, 2) NOT NULL,
    max_usage INTEGER DEFAULT 100,
    used_count INTEGER DEFAULT 0 NOT NULL,
    min_purchase NUMERIC(15, 2) DEFAULT 0,
    expired_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    status order_status DEFAULT 'pending' NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL,
    discount NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    total NUMERIC(15, 2) NOT NULL,
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
    payment_method TEXT,
    payment_ref TEXT,
    snap_token TEXT,
    affiliate_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    paid_at TIMESTAMPTZ
);

-- ORDER_ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    price NUMERIC(15, 2) NOT NULL,
    qty INTEGER DEFAULT 1 NOT NULL
);

-- DOWNLOADS
CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    signed_url TEXT,
    download_count INTEGER DEFAULT 0 NOT NULL,
    max_download INTEGER DEFAULT 10 NOT NULL,
    expired_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    is_approved BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- WISHLISTS
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- BANNERS
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    link_url TEXT,
    title TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- AFFILIATES
CREATE TABLE IF NOT EXISTS public.affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    commission_rate NUMERIC(5, 2) DEFAULT 10.00 NOT NULL,
    total_earned NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    total_paid NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    balance NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    status affiliate_status DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- AFFILIATE_CLICKS
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- AFFILIATE_COMMISSIONS
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    status commission_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- PAYOUTS
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    status payout_status DEFAULT 'pending' NOT NULL,
    method TEXT NOT NULL,
    account_details JSONB NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    paid_at TIMESTAMPTZ
);

-- NEWSLETTER_SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    is_subscribed BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- AUDIT_LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public tags read" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public products read" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Public variants read" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Public banners read" ON public.banners FOR SELECT USING (is_active = true);
CREATE POLICY "Public approved reviews read" ON public.reviews FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

CREATE POLICY "Users can read own downloads" ON public.downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own affiliate data" ON public.affiliates FOR SELECT USING (auth.uid() = user_id);
