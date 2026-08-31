import time
import uuid
import hmac
import hashlib
import datetime
import json
from backend.config.config import Config
from backend.database.db import get_db_connection
from backend.services.dongtube_service import DongtubeService
from backend.services.supabase_service import SupabaseService

# ─────────────────────────────────────────
# AUTH CONTROLLER
# ─────────────────────────────────────────
class AuthController:

    @staticmethod
    def _make_token(email):
        return hmac.new(
            Config.SECRET_KEY.encode(),
            f"{email}:{int(time.time())}".encode(),
            hashlib.sha256
        ).hexdigest()

    @staticmethod
    def login(body):
        email    = body.get('email', '').strip().lower()
        password = body.get('password', '')
        if not email or not password:
            return {"error": "Email dan kata sandi wajib diisi"}, 400

        user_dict = None

        # 1. Try Supabase Cloud
        if SupabaseService.is_configured():
            sb_user = SupabaseService.get_user_by_email(email)
            if sb_user and sb_user.get("password") == password:
                user_dict = {
                    "id": sb_user.get("id"),
                    "name": sb_user.get("name"),
                    "email": sb_user.get("email"),
                    "role": sb_user.get("role", "user")
                }

        # 2. Fallback to SQLite Local
        if not user_dict:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("SELECT id, name, email, role FROM users WHERE email = ? AND password = ?", (email, password))
            row = c.fetchone()
            conn.close()
            if row:
                user_dict = dict(row)

        if user_dict:
            return {
                "success": True,
                "message": "Login berhasil",
                "user":  user_dict,
                "token": AuthController._make_token(email)
            }, 200

        return {"error": "Email atau kata sandi tidak valid"}, 401

    @staticmethod
    def register(body):
        name     = body.get('name', '').strip()
        email    = body.get('email', '').strip().lower()
        password = body.get('password', '')
        if not name or not email or len(password) < 6:
            return {"error": "Data tidak lengkap (nama, email, sandi ≥6 karakter)"}, 400

        # 1. Sync with Supabase Cloud
        if SupabaseService.is_configured():
            existing = SupabaseService.get_user_by_email(email)
            if existing:
                return {"error": "Alamat email sudah terdaftar"}, 409
            SupabaseService.insert_user({"name": name, "email": email, "password": password, "role": "user"})

        # 2. Sync with SQLite Local
        conn = get_db_connection()
        c = conn.cursor()
        try:
            c.execute(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
                (name, email, password)
            )
            conn.commit()
        except Exception:
            if not SupabaseService.is_configured():
                conn.close()
                return {"error": "Alamat email sudah terdaftar"}, 409
        finally:
            conn.close()

        u = {"name": name, "email": email, "role": "user"}
        return {
            "success": True,
            "message": "Registrasi anggota berhasil",
            "user":  u,
            "token": AuthController._make_token(email)
        }, 201

    @staticmethod
    def profile(email):
        user = None
        purchases = 0

        # Try Supabase Cloud
        if SupabaseService.is_configured():
            user = SupabaseService.get_user_by_email(email)
            if user:
                invoices, _ = SupabaseService.list_invoices(email=email, status_filter="paid")
                purchases = len(invoices) if isinstance(invoices, list) else 0

        # Fallback to SQLite
        if not user:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("SELECT id, name, email, role, created_at FROM users WHERE email = ?", (email,))
            row = c.fetchone()
            c.execute("SELECT COUNT(*) FROM invoices WHERE user_email = ? AND status = 'paid'", (email,))
            purchases = c.fetchone()[0]
            conn.close()
            if row:
                user = dict(row)

        if user:
            u = dict(user)
            u['total_purchases'] = purchases
            return {"success": True, "user": u}, 200
        return {"error": "Pengguna tidak ditemukan"}, 404


# ─────────────────────────────────────────
# PRODUCT CONTROLLER
# ─────────────────────────────────────────
class ProductController:

    @staticmethod
    def list_all(params=None):
        params = params or {}
        search   = params.get('search', [''])[0].strip().lower()
        category = params.get('category', [''])[0].strip().lower()
        sort     = params.get('sort', ['id'])[0]
        status   = params.get('status', ['all'])[0].strip().lower()

        allowed_sorts = {'id', 'price', 'rating', 'reviews', 'created_at', 'sort_order'}
        order = sort if sort in allowed_sorts else 'id'

        conn = get_db_connection()
        c = conn.cursor()
        query  = "SELECT * FROM products WHERE 1=1"
        args   = []

        if status == 'active':
            query += " AND active = 1"
        elif status == 'inactive':
            query += " AND active = 0"

        if search:
            query += " AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ? OR LOWER(tags) LIKE ? OR LOWER(stack) LIKE ?)"
            s = f'%{search}%'
            args += [s, s, s, s, s]

        if category and category != 'all':
            query += " AND LOWER(category) = ?"
            args.append(category)

        query += f" ORDER BY {order} ASC"
        c.execute(query, args)
        products = [dict(row) for row in c.fetchall()]
        conn.close()

        return {"success": True, "count": len(products), "products": products, "source": "sqlite"}, 200

    @staticmethod
    def get_by_id(prod_id):
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM products WHERE id = ?", (prod_id,))
        prod = c.fetchone()
        conn.close()
        if prod:
            return {"success": True, "product": dict(prod), "source": "sqlite"}, 200

        # Fallback to Supabase
        if SupabaseService.is_configured():
            sb_prod = SupabaseService.get_product(prod_id)
            if sb_prod:
                return {"success": True, "product": sb_prod, "source": "supabase"}, 200

        return {"error": "Produk tidak ditemukan"}, 404

    @staticmethod
    def create(body):
        required = ['title', 'category', 'price', 'description']
        for f in required:
            if not body.get(f) and body.get(f) != 0:
                return {"error": f"Field '{f}' wajib diisi"}, 400

        price = int(body.get('price', 0))
        orig_price = int(body.get('original_price', price) or price)

        prod_data = {
            "title": str(body.get('title', '')).strip(),
            "category": str(body.get('category', 'saas')).strip().lower(),
            "price": price,
            "original_price": orig_price,
            "rating": float(body.get('rating', 4.9)),
            "reviews": int(body.get('reviews', 12)),
            "badge": str(body.get('badge', 'PRO')).strip(),
            "description": str(body.get('description', '')).strip(),
            "stack": str(body.get('stack', '')).strip(),
            "image": str(body.get('image', '')).strip() or "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
            "file_url": str(body.get('file_url', '')).strip(),
            "demo_url": str(body.get('demo_url', '')).strip(),
            "license_type": str(body.get('license_type', 'Komersial')).strip(),
            "tags": str(body.get('tags', '')).strip(),
            "featured": int(body.get('featured', 0)),
            "active": int(body.get('active', 1))
        }

        # 1. SQLite Local (Primary & Full-Rich Storage)
        new_id = None
        try:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute('''
                INSERT INTO products 
                (title, category, price, original_price, rating, reviews, badge, description, stack, image, file_url, demo_url, license_type, tags, featured, active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                prod_data['title'], prod_data['category'],
                prod_data['price'], prod_data['original_price'],
                prod_data['rating'], prod_data['reviews'],
                prod_data['badge'], prod_data['description'], prod_data['stack'],
                prod_data['image'], prod_data['file_url'], prod_data['demo_url'],
                prod_data['license_type'], prod_data['tags'],
                prod_data['featured'], prod_data['active']
            ))
            conn.commit()
            new_id = c.lastrowid
            conn.close()
        except Exception as e:
            return {"error": f"Gagal menyimpan ke database: {str(e)}"}, 500

        # 2. Supabase Sync (Safe Columns Only)
        if SupabaseService.is_configured():
            try:
                sb_payload = {
                    "title": prod_data['title'],
                    "category": prod_data['category'],
                    "price": prod_data['price'],
                    "original_price": prod_data['original_price'],
                    "rating": prod_data['rating'],
                    "reviews": prod_data['reviews'],
                    "badge": prod_data['badge'],
                    "description": prod_data['description'],
                    "stack": prod_data['stack']
                }
                SupabaseService.insert_product(sb_payload)
            except Exception:
                pass

        prod_data['id'] = new_id
        return {"success": True, "message": "Produk berhasil ditambahkan", "id": new_id, "product": prod_data}, 201

    @staticmethod
    def update(prod_id, body):
        allowed_keys = [
            'title', 'category', 'price', 'original_price', 'rating', 'reviews',
            'badge', 'description', 'stack', 'image', 'file_url', 'demo_url',
            'license_type', 'tags', 'featured', 'active'
        ]

        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT id FROM products WHERE id = ?", (prod_id,))
        if not c.fetchone():
            conn.close()
            return {"error": "Produk tidak ditemukan"}, 404

        fields, vals = [], []
        for key in allowed_keys:
            if key in body:
                fields.append(f"{key} = ?")
                vals.append(body[key])

        if fields:
            vals.append(prod_id)
            c.execute(f"UPDATE products SET {', '.join(fields)} WHERE id = ?", vals)
            conn.commit()
        conn.close()

        # Sync safe fields to Supabase
        if SupabaseService.is_configured():
            try:
                sb_safe_keys = {'title', 'category', 'price', 'original_price', 'rating', 'reviews', 'badge', 'description', 'stack'}
                sb_body = {k: v for k, v in body.items() if k in sb_safe_keys}
                if sb_body:
                    SupabaseService.update_product(prod_id, sb_body)
            except Exception:
                pass

        return {"success": True, "message": "Produk berhasil diperbarui"}, 200

    @staticmethod
    def delete(prod_id):
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("DELETE FROM products WHERE id = ?", (prod_id,))
        conn.commit()
        conn.close()

        if SupabaseService.is_configured():
            try:
                SupabaseService.delete_product(prod_id)
            except Exception:
                pass

        return {"success": True, "message": "Produk berhasil dihapus"}, 200


# ─────────────────────────────────────────
# INVOICE & REAL PAYMENT CONTROLLER
# ─────────────────────────────────────────
class InvoiceController:

    @staticmethod
    def create(params_or_body):
        if isinstance(params_or_body, dict) and 'product_id' in params_or_body:
            prod_id    = int(params_or_body.get('product_id', 1))
            prod_title = params_or_body.get('product_title', 'Produk Digital')
            amount     = int(params_or_body.get('amount', 10000))
            user_email = params_or_body.get('user_email', 'guest@kheireditz.com').strip().lower()
            cust_name  = params_or_body.get('cust_name', 'Pembeli Resmi').strip()
        else:
            params     = params_or_body
            amount     = int(params.get('amount', ['10000'])[0])
            prod_id    = int(params.get('product_id', ['1'])[0])
            prod_title = params.get('product_title', ['Produk Digital'])[0]
            user_email = params.get('user_email', ['guest@kheireditz.com'])[0].strip().lower()
            cust_name  = params.get('cust_name', ['Pembeli Resmi'])[0].strip()

        # 1. Request real QRIS Invoice from Gateway API
        dt_res, dt_status = DongtubeService.create_invoice(amount)
        if dt_status != 200 or not dt_res.get("success"):
            inv_id = "INV" + uuid.uuid4().hex[:7]
            fee = int(amount * Config.QRIS_FEE_PERCENTAGE)
            total = amount + fee
            qris_img = f"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=QRIS_FALLBACK_{inv_id}"
            expired_at = (datetime.datetime.utcnow() + datetime.timedelta(minutes=30)).isoformat() + "Z"
        else:
            inv_id = dt_res.get("invoice_id")
            amount = dt_res.get("amount", amount)
            fee = dt_res.get("fee", 0)
            total = dt_res.get("total", amount + fee)
            qris_img = dt_res.get("qris_image_full") or dt_res.get("qris_image")
            expired_at = dt_res.get("expired_at")

        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # 2. Supabase Cloud Sync (Primary Storage)
        if SupabaseService.is_configured():
            SupabaseService.insert_invoice({
                "id": inv_id,
                "user_email": user_email,
                "customer_name": cust_name,
                "product_id": prod_id,
                "product_title": prod_title,
                "amount": amount,
                "fee": fee,
                "total": total,
                "status": "pending",
                "license_key": None
            })

        # 3. SQLite Local Sync (Safely executed if filesystem writable)
        try:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("SELECT id FROM invoices WHERE id = ?", (inv_id,))
            if not c.fetchone():
                c.execute('''
                    INSERT INTO invoices
                      (id, user_email, customer_name, product_id, product_title, amount, fee, total, status, license_key, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, ?)
                ''', (inv_id, user_email, cust_name, prod_id, prod_title, amount, fee, total, now_str))
                conn.commit()
            conn.close()
        except Exception:
            pass

        return {
            "success":    True,
            "invoice_id": inv_id,
            "amount":     amount,
            "fee":        fee,
            "total":      total,
            "qris_image": qris_img,
            "expired_at": expired_at,
            "gateway":    "QRIS Standar Nasional (Instant)"
        }, 200

    @staticmethod
    def get_status(params):
        inv_id = params.get('invoice_id', [''])[0]
        if not inv_id:
            return {"error": "Parameter invoice_id wajib diisi"}, 400

        # Check DB first (Supabase then SQLite)
        row = None
        if SupabaseService.is_configured():
            sb_inv = SupabaseService.get_invoice(inv_id)
            if sb_inv:
                row = sb_inv

        if not row:
            try:
                conn = get_db_connection()
                c = conn.cursor()
                c.execute("SELECT * FROM invoices WHERE id = ?", (inv_id,))
                r = c.fetchone()
                if r:
                    row = dict(r)
                conn.close()
            except Exception:
                pass

        # Check Gateway Live Status
        dt_res, dt_status = DongtubeService.check_status(inv_id)
        
        is_paid = False
        if dt_status == 200 and dt_res.get("status") == "paid":
            is_paid = True
        elif row and row.get("status") == "paid":
            is_paid = True

        license_key = None
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if is_paid:
            license_key = row.get("license_key") if row else None
            if not license_key:
                license_key = "CVLT-" + "-".join(uuid.uuid4().hex[:4].upper() for _ in range(3))

            # Supabase Cloud Sync
            if SupabaseService.is_configured():
                SupabaseService.update_invoice(inv_id, {
                    "status": "paid",
                    "license_key": license_key,
                    "paid_at": datetime.datetime.utcnow().isoformat() + "Z"
                })

            # SQLite Local Sync
            try:
                conn = get_db_connection()
                c = conn.cursor()
                c.execute("SELECT id FROM invoices WHERE id = ?", (inv_id,))
                if c.fetchone():
                    c.execute("UPDATE invoices SET status='paid', license_key=?, paid_at=? WHERE id=?",
                              (license_key, now_str, inv_id))
                else:
                    amount = dt_res.get("amount", 10000)
                    fee = dt_res.get("fee", 0)
                    total = dt_res.get("total", amount + fee)
                    c.execute('''
                        INSERT INTO invoices (id, user_email, customer_name, product_id, product_title, amount, fee, total, status, license_key, created_at, paid_at)
                        VALUES (?, 'pembeli@kheireditz.com', 'Pembeli Resmi', 1, 'Produk Digital', ?, ?, ?, 'paid', ?, ?, ?)
                    ''', (inv_id, amount, fee, total, license_key, now_str, now_str))
                conn.commit()
                conn.close()
            except Exception:
                pass

        invoice_data = row if row else dt_res

        return {
            "success":     True,
            "invoice_id":  inv_id,
            "status":      "paid" if is_paid else (dt_res.get("status") if dt_status == 200 else (row.get("status") if row else "pending")),
            "license_key": license_key or (invoice_data.get("license_key") if isinstance(invoice_data, dict) else None),
            "amount":      invoice_data.get("amount") if isinstance(invoice_data, dict) else None,
            "fee":         invoice_data.get("fee") if isinstance(invoice_data, dict) else None,
            "total":       invoice_data.get("total") if isinstance(invoice_data, dict) else None,
            "invoice":     invoice_data
        }, 200

    @staticmethod
    def confirm(body):
        if not body or not isinstance(body, dict):
            body = {}
        inv_id     = body.get('invoice_id', '').strip()
        prod_id    = int(body.get('product_id', 1))
        prod_title = body.get('product_title', 'Produk Digital')
        amount     = int(body.get('amount', 10000))
        fee        = int(body.get('fee', amount * Config.QRIS_FEE_PERCENTAGE))
        total      = int(body.get('total', amount + fee))
        user_email = body.get('user_email', 'guest@kheireditz.com').strip().lower()
        cust_name  = body.get('cust_name', 'Pembeli Resmi').strip()

        if not inv_id:
            inv_id = "INV" + uuid.uuid4().hex[:7]

        license_key = "CVLT-" + "-".join(uuid.uuid4().hex[:4].upper() for _ in range(3))
        now_str     = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # 1. Supabase Cloud Sync
        if SupabaseService.is_configured():
            SupabaseService.update_invoice(inv_id, {
                "status": "paid",
                "license_key": license_key,
                "user_email": user_email,
                "customer_name": cust_name,
                "paid_at": datetime.datetime.utcnow().isoformat() + "Z"
            })

        # 2. SQLite Local Sync
        try:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("SELECT id FROM invoices WHERE id = ?", (inv_id,))
            exists = c.fetchone()

            if exists:
                c.execute('''
                    UPDATE invoices 
                    SET status = 'paid', license_key = ?, paid_at = ?, user_email = ?, customer_name = ?
                    WHERE id = ?
                ''', (license_key, now_str, user_email, cust_name, inv_id))
            else:
                c.execute('''
                    INSERT INTO invoices
                      (id, user_email, customer_name, product_id, product_title, amount, fee, total, status, license_key, created_at, paid_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?, ?, ?)
                ''', (inv_id, user_email, cust_name, prod_id, prod_title, amount, fee, total, license_key, now_str, now_str))

            conn.commit()
            conn.close()
        except Exception:
            pass

        return {
            "success":     True,
            "invoice_id":  inv_id,
            "license_key": license_key,
            "amount":      amount,
            "fee":         fee,
            "total":       total,
            "status":      "paid",
            "paid_at":     now_str
        }, 200

    @staticmethod
    def list_history(params=None):
        params   = params or {}
        email    = params.get('email', [''])[0].strip().lower()
        status   = params.get('status', [''])[0].strip().lower()

        # 1. Try Supabase Cloud
        if SupabaseService.is_configured():
            sb_invs, code = SupabaseService.list_invoices(email=email if email else None, status_filter=status if status else None)
            if code == 200 and isinstance(sb_invs, list):
                return {"success": True, "total": len(sb_invs), "transactions": sb_invs, "source": "supabase"}, 200

        # 2. SQLite Local Fallback
        conn = get_db_connection()
        c = conn.cursor()
        query, args = "SELECT * FROM invoices WHERE 1=1", []
        if email:
            query += " AND LOWER(user_email) = ?"
            args.append(email)
        if status and status in ('paid', 'pending'):
            query += " AND status = ?"
            args.append(status)
        query += " ORDER BY created_at DESC"
        c.execute(query, args)
        rows = [dict(r) for r in c.fetchall()]
        conn.close()
        return {"success": True, "total": len(rows), "transactions": rows, "source": "sqlite"}, 200


# ─────────────────────────────────────────
# ADMIN CONTROLLER
# ─────────────────────────────────────────
class AdminController:

    @staticmethod
    def stats():
        total_users = 0
        total_products = 0
        total_orders = 0
        total_revenue = 0
        recent = []

        if SupabaseService.is_configured():
            prods, _ = SupabaseService.list_products()
            total_products = len(prods) if isinstance(prods, list) else 0

            invs, _ = SupabaseService.list_invoices()
            if isinstance(invs, list):
                paid_invs = [i for i in invs if i.get('status') == 'paid']
                total_orders = len(paid_invs)
                total_revenue = sum(i.get('total', 0) for i in paid_invs)
                recent = invs[:5]
        else:
            try:
                conn = get_db_connection()
                c = conn.cursor()
                c.execute("SELECT COUNT(*) FROM users WHERE role = 'user'")
                total_users = c.fetchone()[0]
                c.execute("SELECT COUNT(*) FROM products")
                total_products = c.fetchone()[0]
                c.execute("SELECT COUNT(*) FROM invoices WHERE status = 'paid'")
                total_orders = c.fetchone()[0]
                c.execute("SELECT COALESCE(SUM(total), 0) FROM invoices WHERE status = 'paid'")
                total_revenue = c.fetchone()[0]
                c.execute("SELECT * FROM invoices ORDER BY created_at DESC LIMIT 5")
                recent = [dict(r) for r in c.fetchall()]
                conn.close()
            except Exception:
                pass

        # Check Gateway Live Balance
        dt_bal, _ = DongtubeService.get_balance()

        return {
            "success": True,
            "database_mode": "Supabase Cloud" if SupabaseService.is_configured() else "SQLite Local",
            "stats": {
                "total_users":    total_users,
                "total_products": total_products,
                "total_orders":   total_orders,
                "total_revenue":  total_revenue,
                "balance":        dt_bal.get("balance", 0) if isinstance(dt_bal, dict) else 0
            },
            "recent_orders": recent
        }, 200

    @staticmethod
    def list_users():
        if SupabaseService.is_configured():
            res, status = SupabaseService._request("users", params={"select": "id,name,email,role,created_at", "order": "id.desc"})
            if status == 200 and isinstance(res, list):
                return {"success": True, "count": len(res), "users": res, "source": "supabase"}, 200

        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT id, name, email, role, created_at FROM users ORDER BY id DESC")
        users = [dict(r) for r in c.fetchall()]
        conn.close()
        return {"success": True, "count": len(users), "users": users, "source": "sqlite"}, 200


# ─────────────────────────────────────────
# BANNER & SLIDER CONTROLLER
# ─────────────────────────────────────────
class BannerController:
    DEFAULT_BANNERS = [
        {
            "id": 1,
            "title": "OmniAI Multi-Model SaaS Platform",
            "subtitle": "Komersial Starter Kit Next.js 15, FastAPI & Stripe",
            "badge": "BESTSELLER",
            "badge_color": "orange",
            "cta_text": "Beli Sekarang",
            "cta_link": "#katalog",
            "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
            "active": 1,
            "sort_order": 1
        },
        {
            "id": 2,
            "title": "FinTech 3D UI/UX Master System",
            "subtitle": "500+ Komponen Figma, Tailwind CSS & Source Code",
            "badge": "NEW RELEASE",
            "badge_color": "purple",
            "cta_text": "Lihat Katalog",
            "cta_link": "#katalog",
            "image": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop&q=80",
            "active": 1,
            "sort_order": 2
        },
        {
            "id": 3,
            "title": "CloudPOS Modern Point of Sales & PWA",
            "subtitle": "Aplikasi Kasir Multi-Outlet dengan Supabase Sync",
            "badge": "SPECIAL OFFER",
            "badge_color": "emerald",
            "cta_text": "Dapatkan Lisensi",
            "cta_link": "#katalog",
            "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
            "active": 1,
            "sort_order": 3
        }
    ]

    @staticmethod
    def list_banners(params=None):
        try:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("SELECT * FROM banners ORDER BY sort_order ASC, id ASC")
            rows = [dict(r) for r in c.fetchall()]
            conn.close()
            if rows:
                return {"success": True, "count": len(rows), "banners": rows, "source": "sqlite"}, 200
        except Exception:
            pass

        return {"success": True, "count": len(BannerController.DEFAULT_BANNERS), "banners": BannerController.DEFAULT_BANNERS, "source": "default"}, 200

    @staticmethod
    def create(body):
        banner_data = {
            "title": str(body.get('title', 'Banner Promo Baru')).strip(),
            "subtitle": str(body.get('subtitle', '')).strip(),
            "badge": str(body.get('badge', 'PROMO')).strip(),
            "badge_color": str(body.get('badge_color', 'orange')).strip(),
            "cta_text": str(body.get('cta_text', 'Beli Sekarang')).strip(),
            "cta_link": str(body.get('cta_link', '#katalog')).strip(),
            "image": str(body.get('image', '')).strip() or "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
            "active": int(body.get('active', 1)),
            "sort_order": int(body.get('sort_order', 0))
        }

        new_id = None
        try:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute('''
                INSERT INTO banners (title, subtitle, badge, badge_color, cta_text, cta_link, image, active, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                banner_data['title'], banner_data['subtitle'],
                banner_data['badge'], banner_data['badge_color'],
                banner_data['cta_text'], banner_data['cta_link'],
                banner_data['image'], banner_data['active'], banner_data['sort_order']
            ))
            conn.commit()
            new_id = c.lastrowid
            conn.close()
        except Exception as e:
            return {"error": f"Gagal menyimpan banner: {str(e)}"}, 500

        banner_data['id'] = new_id
        return {"success": True, "message": "Banner berhasil ditambahkan", "id": new_id, "banner": banner_data}, 201

    @staticmethod
    def update(banner_id, body):
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT id FROM banners WHERE id = ?", (banner_id,))
        if not c.fetchone():
            conn.close()
            return {"error": "Banner tidak ditemukan"}, 404

        fields, vals = [], []
        for key in ['title', 'subtitle', 'badge', 'badge_color', 'cta_text', 'cta_link', 'image', 'active', 'sort_order']:
            if key in body:
                fields.append(f"{key} = ?")
                vals.append(body[key])

        if fields:
            vals.append(banner_id)
            c.execute(f"UPDATE banners SET {', '.join(fields)} WHERE id = ?", vals)
            conn.commit()
        conn.close()

        return {"success": True, "message": "Banner berhasil diperbarui"}, 200

    @staticmethod
    def delete(banner_id):
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("DELETE FROM banners WHERE id = ?", (banner_id,))
        conn.commit()
        conn.close()

        return {"success": True, "message": "Banner berhasil dihapus"}, 200


# ─────────────────────────────────────────
# SETTINGS & STORE CONFIG CONTROLLER
# ─────────────────────────────────────────
class SettingsController:
    DEFAULT_SETTINGS = {
        "store_name": "Kheireditz Produk Digital",
        "tagline": "Ekosistem Aset & Source Code Developer Premium",
        "announcement": "PROMO SPESIAL: Diskon Kilat hingga 75% • Garansi Lisensi Seumur Hidup & Update Gratis!",
        "cs_whatsapp": "6281234567890",
        "cs_email": "support@kheireditz.my.id",
        "qris_fee_percent": 2.18,
        "logo_url": "",
        "hero_headline": "Aset & Source Code Digital Siap Produksi",
        "hero_subheadline": "Pilih produk pada katalog di bawah ini, telaah rincian spesifikasi teknis, dan lakukan transaksi langsung melalui QRIS instan.",
        "telegram_url": "",
        "instagram_url": ""
    }

    @staticmethod
    def get():
        try:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("SELECT * FROM settings WHERE id = 1")
            row = c.fetchone()
            conn.close()
            if row:
                return {"success": True, "settings": dict(row), "source": "sqlite"}, 200
        except Exception:
            pass

        return {"success": True, "settings": SettingsController.DEFAULT_SETTINGS, "source": "default"}, 200

    @staticmethod
    def update(body):
        try:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("SELECT id FROM settings WHERE id = 1")
            exists = c.fetchone()

            allowed = [
                'store_name', 'tagline', 'announcement', 'cs_whatsapp', 'cs_email',
                'qris_fee_percent', 'logo_url', 'hero_headline', 'hero_subheadline',
                'telegram_url', 'instagram_url'
            ]

            if exists:
                fields, vals = [], []
                for k in allowed:
                    if k in body:
                        fields.append(f"{k} = ?")
                        vals.append(body[k])
                if fields:
                    vals.append(1)
                    c.execute(f"UPDATE settings SET {', '.join(fields)} WHERE id = ?", vals)
            else:
                c.execute('''
                    INSERT INTO settings 
                    (id, store_name, tagline, announcement, cs_whatsapp, cs_email, qris_fee_percent, logo_url, hero_headline, hero_subheadline, telegram_url, instagram_url)
                    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    body.get('store_name', 'Kheireditz Produk Digital'),
                    body.get('tagline', 'Ekosistem Aset Digital'),
                    body.get('announcement', 'Promo Spesial'),
                    body.get('cs_whatsapp', '6281234567890'),
                    body.get('cs_email', 'support@kheireditz.my.id'),
                    float(body.get('qris_fee_percent', 2.18)),
                    body.get('logo_url', ''),
                    body.get('hero_headline', 'Aset & Source Code Digital Siap Produksi'),
                    body.get('hero_subheadline', 'Pilih produk pada katalog di bawah ini...'),
                    body.get('telegram_url', ''),
                    body.get('instagram_url', '')
                ))
            conn.commit()
            conn.close()
            return {"success": True, "message": "Pengaturan toko berhasil diperbarui"}, 200
        except Exception as e:
            return {"error": f"Gagal memperbarui pengaturan: {str(e)}"}, 500


# ─────────────────────────────────────────
# WEBHOOK CONTROLLER
# ─────────────────────────────────────────
class WebhookController:

    @staticmethod
    def handle(raw_body_bytes, headers):
        sig = headers.get('X-Signature', '')
        if not DongtubeService.verify_webhook(raw_body_bytes, sig):
            return {"error": "Invalid webhook HMAC signature"}, 401

        try:
            body = json.loads(raw_body_bytes.decode('utf-8'))
        except Exception:
            return {"error": "Invalid JSON body"}, 400

        event      = body.get('event', 'invoice.paid')
        invoice_id = body.get('invoice_id', '')

        if event == 'invoice.paid' and invoice_id:
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            license_key = "CVLT-" + "-".join(uuid.uuid4().hex[:4].upper() for _ in range(3))

            # Supabase Cloud Sync
            if SupabaseService.is_configured():
                SupabaseService.update_invoice(invoice_id, {
                    "status": "paid",
                    "license_key": license_key,
                    "paid_at": datetime.datetime.utcnow().isoformat() + "Z"
                })

            # SQLite Local Sync
            try:
                conn = get_db_connection()
                c = conn.cursor()
                c.execute("UPDATE invoices SET status='paid', license_key=?, paid_at=? WHERE id=?", (license_key, now, invoice_id))
                conn.commit()
                conn.close()
            except Exception:
                pass

        return {
            "success":        True,
            "received_event": event,
            "invoice_id":     invoice_id,
            "verified":       True
        }, 200
