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

        # 1. Try Supabase Cloud
        if SupabaseService.is_configured():
            sb_prods, status = SupabaseService.list_products()
            if status == 200 and isinstance(sb_prods, list) and len(sb_prods) > 0:
                filtered = sb_prods
                if search:
                    filtered = [p for p in filtered if search in p.get('title','').lower() or search in p.get('description','').lower() or search in p.get('category','').lower()]
                if category and category != 'all':
                    filtered = [p for p in filtered if p.get('category','').lower() == category]
                return {"success": True, "count": len(filtered), "products": filtered, "source": "supabase"}, 200

        # 2. Fallback to SQLite Local
        allowed_sorts = {'id', 'price', 'rating', 'reviews'}
        order = sort if sort in allowed_sorts else 'id'

        conn = get_db_connection()
        c = conn.cursor()
        query  = "SELECT * FROM products WHERE 1=1"
        args   = []
        if search:
            query += " AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?)"
            s = f'%{search}%'
            args += [s, s, s]
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
        if SupabaseService.is_configured():
            prod = SupabaseService.get_product(prod_id)
            if prod:
                return {"success": True, "product": prod, "source": "supabase"}, 200

        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM products WHERE id = ?", (prod_id,))
        prod = c.fetchone()
        conn.close()
        if prod:
            return {"success": True, "product": dict(prod), "source": "sqlite"}, 200
        return {"error": "Produk tidak ditemukan"}, 404

    @staticmethod
    def create(body):
        required = ['title', 'category', 'price', 'original_price', 'description', 'stack']
        for f in required:
            if not body.get(f):
                return {"error": f"Field '{f}' wajib diisi"}, 400

        prod_data = {
            "title": body['title'],
            "category": body['category'],
            "price": int(body['price']),
            "original_price": int(body['original_price']),
            "rating": float(body.get('rating', 4.5)),
            "reviews": int(body.get('reviews', 0)),
            "badge": body.get('badge', 'NEW'),
            "description": body['description'],
            "stack": body['stack']
        }

        # 1. Supabase Cloud Sync
        if SupabaseService.is_configured():
            SupabaseService.insert_product(prod_data)

        # 2. SQLite Local Sync
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('''
            INSERT INTO products (title, category, price, original_price, rating, reviews, badge, description, stack)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            prod_data['title'], prod_data['category'],
            prod_data['price'], prod_data['original_price'],
            prod_data['rating'], prod_data['reviews'],
            prod_data['badge'], prod_data['description'], prod_data['stack']
        ))
        conn.commit()
        new_id = c.lastrowid
        conn.close()
        return {"success": True, "message": "Produk berhasil ditambahkan", "id": new_id}, 201

    @staticmethod
    def update(prod_id, body):
        if SupabaseService.is_configured():
            SupabaseService.update_product(prod_id, body)

        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT id FROM products WHERE id = ?", (prod_id,))
        if not c.fetchone():
            conn.close()
            return {"error": "Produk tidak ditemukan"}, 404
        fields, vals = [], []
        for key in ['title', 'category', 'price', 'original_price', 'rating', 'reviews', 'badge', 'description', 'stack']:
            if key in body:
                fields.append(f"{key} = ?")
                vals.append(body[key])
        if not fields:
            conn.close()
            return {"error": "Tidak ada field yang diupdate"}, 400
        vals.append(prod_id)
        c.execute(f"UPDATE products SET {', '.join(fields)} WHERE id = ?", vals)
        conn.commit()
        conn.close()
        return {"success": True, "message": "Produk berhasil diperbarui"}, 200

    @staticmethod
    def delete(prod_id):
        if SupabaseService.is_configured():
            SupabaseService.delete_product(prod_id)

        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT id FROM products WHERE id = ?", (prod_id,))
        if not c.fetchone():
            conn.close()
            return {"error": "Produk tidak ditemukan"}, 404
        c.execute("DELETE FROM products WHERE id = ?", (prod_id,))
        conn.commit()
        conn.close()
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

        # 2. Supabase Cloud Sync
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

        # 3. SQLite Local Sync
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

        # Check DB first
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM invoices WHERE id = ?", (inv_id,))
        row = c.fetchone()
        
        # Check Gateway Live Status
        dt_res, dt_status = DongtubeService.check_status(inv_id)
        
        is_paid = False
        if dt_status == 200 and dt_res.get("status") == "paid":
            is_paid = True
        elif row and dict(row).get("status") == "paid":
            is_paid = True

        license_key = None
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if is_paid:
            if row:
                license_key = dict(row).get("license_key")
                if not license_key:
                    license_key = "CVLT-" + "-".join(uuid.uuid4().hex[:4].upper() for _ in range(3))
                    c.execute("UPDATE invoices SET status='paid', license_key=?, paid_at=? WHERE id=?",
                              (license_key, now_str, inv_id))
                    conn.commit()
            else:
                license_key = "CVLT-" + "-".join(uuid.uuid4().hex[:4].upper() for _ in range(3))
                amount = dt_res.get("amount", 10000)
                fee = dt_res.get("fee", 0)
                total = dt_res.get("total", amount + fee)
                c.execute('''
                    INSERT INTO invoices (id, user_email, customer_name, product_id, product_title, amount, fee, total, status, license_key, created_at, paid_at)
                    VALUES (?, 'pembeli@kheireditz.com', 'Pembeli Resmi', 1, 'Produk Digital', ?, ?, ?, 'paid', ?, ?, ?)
                ''', (inv_id, amount, fee, total, license_key, now_str, now_str))
                conn.commit()

            # Supabase Cloud Sync
            if SupabaseService.is_configured():
                SupabaseService.update_invoice(inv_id, {
                    "status": "paid",
                    "license_key": license_key,
                    "paid_at": datetime.datetime.utcnow().isoformat() + "Z"
                })

        c.execute("SELECT * FROM invoices WHERE id = ?", (inv_id,))
        updated_row = c.fetchone()
        conn.close()

        invoice_data = dict(updated_row) if updated_row else dt_res

        return {
            "success":     True,
            "invoice_id":  inv_id,
            "status":      "paid" if is_paid else (dt_res.get("status") if dt_status == 200 else "pending"),
            "license_key": license_key or invoice_data.get("license_key"),
            "amount":      invoice_data.get("amount"),
            "fee":         invoice_data.get("fee"),
            "total":       invoice_data.get("total"),
            "invoice":     invoice_data
        }, 200

    @staticmethod
    def confirm(body):
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
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("UPDATE invoices SET status='paid', license_key=?, paid_at=? WHERE id=?", (license_key, now, invoice_id))
            conn.commit()
            conn.close()

        return {
            "success":        True,
            "received_event": event,
            "invoice_id":     invoice_id,
            "verified":       True
        }, 200
