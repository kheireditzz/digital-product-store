-- =======================================================
-- KHEIREDITZ PRODUK — SUPABASE POSTGRESQL SCHEMA
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor
-- =======================================================

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Products
CREATE TABLE IF NOT EXISTS public.products (
    id BIGINT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price BIGINT NOT NULL,
    original_price BIGINT NOT NULL,
    rating NUMERIC(3,2) DEFAULT 5.0,
    reviews INTEGER DEFAULT 0,
    badge TEXT,
    description TEXT NOT NULL,
    stack TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    product_id BIGINT NOT NULL,
    product_title TEXT NOT NULL,
    amount BIGINT NOT NULL,
    fee BIGINT NOT NULL,
    total BIGINT NOT NULL,
    status TEXT DEFAULT 'pending',
    license_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- Enable Row Level Security (RLS) & Berikan Akses Anon/Service Role
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public write access to products" ON public.products FOR ALL USING (true);

CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all access to invoices" ON public.invoices FOR ALL USING (true);

-- Seed Initial Products
INSERT INTO public.products (id, title, category, price, original_price, rating, reviews, badge, description, stack)
VALUES 
(1, 'OmniAI Multi-Model SaaS Platform', 'saas', 149000, 499000, 4.9, 128, 'BESTSELLER', 'Platform SaaS fullstack siap deploy yang mengintegrasikan GPT-4o, Claude 3.5 Sonnet, Gemini Pro, & DeepSeek dengan sistem langganan Stripe & Midtrans terpasang.', 'Next.js 15, FastAPI, Tailwind CSS, PostgreSQL'),
(2, 'Next.js 15 Tailwind UI Dashboard Kit', 'template', 119000, 399000, 4.8, 94, 'HOT DEAL', 'Koleksi 45+ modul antarmuka dashboard analitik, manajemen pengguna, billing panel, dan chart interaktif dengan tema dark mode Obsidian & Orange.', 'Next.js 15, Tailwind v4, Lucide, Recharts'),
(3, 'Flutter Crypto & E-Wallet Starter', 'apps', 135000, 450000, 4.9, 76, 'POPULAR', 'Source code aplikasi mobile multiplatform Android & iOS untuk ekosistem dompet digital, pelacakan portofolio kripto, transfer saldo, dan scanner QRIS.', 'Flutter 3.22, Riverpod, SQLite, Node.js'),
(4, 'Enterprise Microservices Starter Boilerplate', 'saas', 189000, 650000, 5.0, 63, 'ENTERPRISE', 'Arsitektur backend scalable berbasis microservices dengan autentikasi JWT terpusat, message broker Redis Pub/Sub, Dockerized staging, dan monitoring Prometheus.', 'Go (Golang), Docker, Redis, PostgreSQL'),
(5, 'Design System Figma UI/UX Kit Pro', 'template', 89000, 299000, 4.8, 112, 'DESIGN', 'Paket 500+ komponen Figma auto-layout, token warna, typography hierarki, icon grid, dan 20+ halaman template responsif siap pakai untuk desainer produk.', 'Figma Components, Auto-layout, Variants'),
(6, 'Python AI Automation & Bot Scraping Engine', 'scripts', 99000, 349000, 4.7, 85, 'AUTOMATION', 'Koleksi 15+ script otomatisasi Python untuk web scraping headless browser, otomatisasi data entry, pengiriman laporan berkala Telegram, dan AI parsing data.', 'Python 3.12, Selenium, Playwright, Pandas')
ON CONFLICT (id) DO NOTHING;
