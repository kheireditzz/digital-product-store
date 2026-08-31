import sqlite3
import os
from backend.config.config import Config

def get_db_connection():
    os.makedirs(os.path.dirname(Config.DB_PATH), exist_ok=True)
    conn = sqlite3.connect(Config.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    conn = get_db_connection()
    c = conn.cursor()

    # Table 1: Users
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Table 2: Products
    c.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            price INTEGER NOT NULL,
            original_price INTEGER NOT NULL,
            rating REAL NOT NULL DEFAULT 4.9,
            reviews INTEGER NOT NULL DEFAULT 12,
            badge TEXT DEFAULT 'PRO',
            description TEXT NOT NULL,
            stack TEXT NOT NULL DEFAULT '',
            image TEXT DEFAULT '',
            file_url TEXT DEFAULT '',
            demo_url TEXT DEFAULT '',
            license_type TEXT DEFAULT 'Komersial',
            tags TEXT DEFAULT '',
            featured INTEGER DEFAULT 0,
            active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Migration for Products: Add missing columns if table existed previously
    c.execute("PRAGMA table_info(products)")
    existing_cols = [col[1] for col in c.fetchall()]
    new_cols = [
        ("image", "TEXT DEFAULT ''"),
        ("file_url", "TEXT DEFAULT ''"),
        ("demo_url", "TEXT DEFAULT ''"),
        ("license_type", "TEXT DEFAULT 'Komersial'"),
        ("tags", "TEXT DEFAULT ''"),
        ("featured", "INTEGER DEFAULT 0"),
        ("active", "INTEGER DEFAULT 1"),
        ("created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    ]
    for col_name, col_type in new_cols:
        if col_name not in existing_cols:
            try:
                c.execute(f"ALTER TABLE products ADD COLUMN {col_name} {col_type}")
            except Exception:
                pass

    # Table 3: Invoices & Payments
    c.execute('''
        CREATE TABLE IF NOT EXISTS invoices (
            id TEXT PRIMARY KEY,
            user_email TEXT NOT NULL,
            customer_name TEXT NOT NULL,
            product_id INTEGER NOT NULL,
            product_title TEXT NOT NULL,
            amount INTEGER NOT NULL,
            fee INTEGER NOT NULL,
            total INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            license_key TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            paid_at TIMESTAMP
        )
    ''')

    # Table 4: Banners & Sliders
    c.execute('''
        CREATE TABLE IF NOT EXISTS banners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subtitle TEXT DEFAULT '',
            badge TEXT DEFAULT 'PROMO',
            badge_color TEXT DEFAULT 'orange',
            cta_text TEXT DEFAULT 'Beli Sekarang',
            cta_link TEXT DEFAULT '#katalog',
            image TEXT DEFAULT '',
            active INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Table 5: Store Settings
    c.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY,
            store_name TEXT DEFAULT 'Kheireditz Produk Digital',
            tagline TEXT DEFAULT 'Ekosistem Aset & Source Code Developer Premium',
            announcement TEXT DEFAULT 'PROMO SPESIAL: Diskon Kilat hingga 75% • Garansi Lisensi Seumur Hidup & Update Gratis!',
            cs_whatsapp TEXT DEFAULT '6281234567890',
            cs_email TEXT DEFAULT 'support@kheireditz.my.id',
            qris_fee_percent REAL DEFAULT 2.18,
            logo_url TEXT DEFAULT '',
            hero_headline TEXT DEFAULT 'Aset & Source Code Digital Siap Produksi',
            hero_subheadline TEXT DEFAULT 'Pilih produk pada katalog di bawah ini, telaah rincian spesifikasi teknis, dan lakukan transaksi langsung melalui QRIS instan.',
            telegram_url TEXT DEFAULT '',
            instagram_url TEXT DEFAULT ''
        )
    ''')

    # Seed Admin User
    c.execute("SELECT id FROM users WHERE email = ?", (Config.ADMIN_EMAIL,))
    if not c.fetchone():
        c.execute("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                  ("Kheireditz (Super Admin)", Config.ADMIN_EMAIL, Config.ADMIN_PASSWORD, "admin"))

    # Seed Products if empty
    c.execute("SELECT COUNT(*) FROM products")
    if c.fetchone()[0] == 0:
        sample_products = [
            (1, "OmniAI Multi-Model SaaS Platform", "saas", 149000, 499000, 4.9, 128, "BESTSELLER",
             "Platform SaaS fullstack siap deploy yang mengintegrasikan GPT-4o, Claude 3.5 Sonnet, Gemini Pro, & DeepSeek dengan sistem langganan Stripe & Midtrans terpasang.",
             "Next.js 15, FastAPI, Tailwind CSS, PostgreSQL",
             "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
             "https://drive.google.com/cybervault-bundle-official", "https://demo.omni-ai.io", "Komersial", "Next.js,AI,SaaS", 1, 1),
            (2, "Next.js 15 Tailwind UI Dashboard Kit", "template", 119000, 399000, 4.8, 94, "HOT DEAL",
             "Koleksi 45+ modul antarmuka dashboard analitik, manajemen pengguna, billing panel, dan chart interaktif dengan tema dark mode Obsidian & Orange.",
             "Next.js 15, Tailwind v4, Lucide, Recharts",
             "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
             "https://drive.google.com/dashboard-ui-kit", "https://demo.dashboard-ui.io", "Komersial", "Next.js,Tailwind,UI", 1, 1),
            (3, "Flutter Crypto & E-Wallet Starter", "apps", 135000, 450000, 4.9, 76, "POPULAR",
             "Source code aplikasi mobile multiplatform Android & iOS untuk ekosistem dompet digital, pelacakan portofolio kripto, transfer saldo, dan scanner QRIS.",
             "Flutter 3.22, Riverpod, SQLite, Node.js",
             "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80",
             "https://drive.google.com/flutter-wallet-bundle", "https://demo.flutter-wallet.app", "Komersial", "Flutter,Mobile,Crypto", 0, 1),
            (4, "Enterprise Microservices Starter Boilerplate", "saas", 189000, 650000, 5.0, 63, "ENTERPRISE",
             "Arsitektur backend scalable berbasis microservices dengan autentikasi JWT terpusat, message broker Redis Pub/Sub, Dockerized staging, dan monitoring Prometheus.",
             "Go (Golang), Docker, Redis, PostgreSQL",
             "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
             "https://drive.google.com/golang-microservices", "https://api.enterprise-demo.io", "Komersial", "Go,Docker,Backend", 0, 1),
            (5, "Design System Figma UI/UX Kit Pro", "template", 89000, 299000, 4.8, 112, "DESIGN",
             "Paket 500+ komponen Figma auto-layout, token warna, typography hierarki, icon grid, dan 20+ halaman template responsif siap pakai untuk desainer produk.",
             "Figma Components, Auto-layout, Variants",
             "https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=800&auto=format&fit=crop&q=80",
             "https://drive.google.com/figma-design-system", "https://figma.com/@kheireditz", "Komersial", "Figma,UI/UX,Design", 0, 1),
            (6, "Python AI Automation & Bot Scraping Engine", "scripts", 99000, 349000, 4.7, 85, "AUTOMATION",
             "Koleksi 15+ script otomatisasi Python untuk web scraping headless browser, otomatisasi data entry, pengiriman laporan berkala Telegram, dan AI parsing data.",
             "Python 3.12, Selenium, Playwright, Pandas",
             "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
             "https://drive.google.com/python-automation-pack", "", "Komersial", "Python,Bot,Scraping", 0, 1)
        ]
        c.executemany("""
            INSERT INTO products 
            (id, title, category, price, original_price, rating, reviews, badge, description, stack, image, file_url, demo_url, license_type, tags, featured, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_products)
    else:
        # Update existing products with images if empty
        default_images = {
            1: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
            2: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
            3: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80",
            4: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
            5: "https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=800&auto=format&fit=crop&q=80",
            6: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80"
        }
        for pid, img in default_images.items():
            c.execute("UPDATE products SET image = ? WHERE id = ? AND (image IS NULL OR image = '')", (img, pid))

    # Seed Banners if empty
    c.execute("SELECT COUNT(*) FROM banners")
    if c.fetchone()[0] == 0:
        sample_banners = [
            (1, "OmniAI Multi-Model SaaS Platform", "Komersial Starter Kit Next.js 15, FastAPI & Stripe", "BESTSELLER", "orange", "Beli Sekarang", "#katalog", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80", 1, 1),
            (2, "FinTech 3D UI/UX Master System", "500+ Komponen Figma, Tailwind CSS & Source Code", "NEW RELEASE", "purple", "Lihat Katalog", "#katalog", "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop&q=80", 1, 2),
            (3, "CloudPOS Modern Point of Sales & PWA", "Aplikasi Kasir Multi-Outlet dengan Supabase Sync", "SPECIAL OFFER", "emerald", "Dapatkan Lisensi", "#katalog", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80", 1, 3)
        ]
        c.executemany("""
            INSERT INTO banners (id, title, subtitle, badge, badge_color, cta_text, cta_link, image, active, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_banners)

    # Seed Settings if empty
    c.execute("SELECT id FROM settings WHERE id = 1")
    if not c.fetchone():
        c.execute("""
            INSERT INTO settings (id, store_name, tagline, announcement, cs_whatsapp, cs_email, qris_fee_percent)
            VALUES (1, ?, ?, ?, ?, ?, ?)
        """, (
            "Kheireditz Produk Digital",
            "Ekosistem Aset & Source Code Developer Premium",
            "PROMO SPESIAL: Diskon Kilat hingga 75% • Garansi Lisensi Seumur Hidup & Update Gratis!",
            "6281234567890",
            "support@kheireditz.my.id",
            2.18
        ))

    # Seed Invoices if empty
    c.execute("SELECT COUNT(*) FROM invoices")
    if c.fetchone()[0] == 0:
        sample_invoices = [
            ("INV2285c2c", Config.ADMIN_EMAIL, "Budi Setiawan", 1, "OmniAI Multi-Model SaaS Platform", 149000, 3248, 152248, "paid", "CVLT-89F3-X981-9920", "2026-08-31 19:45:00", "2026-08-31 19:46:12"),
            ("INV1894b7a", Config.ADMIN_EMAIL, "Budi Setiawan", 2, "Next.js 15 Tailwind UI Dashboard Kit", 119000, 2594, 121594, "paid", "CVLT-NX15-7721-0044", "2026-08-30 14:20:00", "2026-08-30 14:21:05"),
            ("INV1102x9d", Config.ADMIN_EMAIL, "Budi Setiawan", 3, "Flutter Crypto & E-Wallet Starter", 135000, 2943, 137943, "paid", "CVLT-FLUT-8832-1192", "2026-08-28 11:10:00", "2026-08-28 11:11:40")
        ]
        c.executemany("INSERT INTO invoices VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", sample_invoices)

    conn.commit()
    conn.close()
    print("[*] SQLite Database initialized & migrated successfully.")

