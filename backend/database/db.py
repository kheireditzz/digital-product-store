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
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            price INTEGER NOT NULL,
            original_price INTEGER NOT NULL,
            rating REAL NOT NULL,
            reviews INTEGER NOT NULL,
            badge TEXT,
            description TEXT NOT NULL,
            stack TEXT NOT NULL
        )
    ''')

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

    # Seed Admin User
    c.execute("SELECT id FROM users WHERE email = ?", (Config.ADMIN_EMAIL,))
    if not c.fetchone():
        c.execute("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                  ("Kheireditz (Super Admin)", Config.ADMIN_EMAIL, Config.ADMIN_PASSWORD, "admin"))

    # Seed Products
    c.execute("SELECT COUNT(*) FROM products")
    if c.fetchone()[0] == 0:
        sample_products = [
            (1, "OmniAI Multi-Model SaaS Platform", "saas", 149000, 499000, 4.9, 128, "BESTSELLER",
             "Platform SaaS fullstack siap deploy yang mengintegrasikan GPT-4o, Claude 3.5 Sonnet, Gemini Pro, & DeepSeek dengan sistem langganan Stripe & Midtrans terpasang.",
             "Next.js 15, FastAPI, Tailwind CSS, PostgreSQL"),
            (2, "Next.js 15 Tailwind UI Dashboard Kit", "template", 119000, 399000, 4.8, 94, "HOT DEAL",
             "Koleksi 45+ modul antarmuka dashboard analitik, manajemen pengguna, billing panel, dan chart interaktif dengan tema dark mode Obsidian & Orange.",
             "Next.js 15, Tailwind v4, Lucide, Recharts"),
            (3, "Flutter Crypto & E-Wallet Starter", "apps", 135000, 450000, 4.9, 76, "POPULAR",
             "Source code aplikasi mobile multiplatform Android & iOS untuk ekosistem dompet digital, pelacakan portofolio kripto, transfer saldo, dan scanner QRIS.",
             "Flutter 3.22, Riverpod, SQLite, Node.js"),
            (4, "Enterprise Microservices Starter Boilerplate", "saas", 189000, 650000, 5.0, 63, "ENTERPRISE",
             "Arsitektur backend scalable berbasis microservices dengan autentikasi JWT terpusat, message broker Redis Pub/Sub, Dockerized staging, dan monitoring Prometheus.",
             "Go (Golang), Docker, Redis, PostgreSQL"),
            (5, "Design System Figma UI/UX Kit Pro", "template", 89000, 299000, 4.8, 112, "DESIGN",
             "Paket 500+ komponen Figma auto-layout, token warna, typography hierarki, icon grid, dan 20+ halaman template responsif siap pakai untuk desainer produk.",
             "Figma Components, Auto-layout, Variants"),
            (6, "Python AI Automation & Bot Scraping Engine", "scripts", 99000, 349000, 4.7, 85, "AUTOMATION",
             "Koleksi 15+ script otomatisasi Python untuk web scraping headless browser, otomatisasi data entry, pengiriman laporan berkala Telegram, dan AI parsing data.",
             "Python 3.12, Selenium, Playwright, Pandas")
        ]
        c.executemany("INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", sample_products)

    # Seed Invoices
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
    print("[*] SQLite Database initialized successfully.")
