#!/usr/bin/env python3
"""
=============================================================================
KHEIREDITZ PRODUK — HIGH-PERFORMANCE FULL-STACK MVC SERVER
=============================================================================
Endpoints:
  GET  /api/v1/health             → Server health
  GET  /api/v1/products           → List/search/filter products
  GET  /api/v1/products/<id>      → Product detail
  POST /api/v1/products           → Create product (admin)
  PUT  /api/v1/products/<id>      → Update product (admin)
  DELETE /api/v1/products/<id>    → Delete product (admin)
  POST /api/v1/auth/login         → Login
  POST /api/v1/auth/register      → Register
  GET  /api/v1/auth/profile       → User profile (?email=)
  GET  /api/v1/history            → All transactions (?email=&status=)
  GET  /api/v1/invoice/status     → Invoice status (?invoice_id=)
  GET  /api/v1/invoice            → Create Dongtube QRIS invoice (?amount=)
  POST /api/v1/invoice            → Create Dongtube QRIS invoice (JSON)
  POST /api/v1/invoice/confirm    → Confirm payment & generate license
  GET  /api/v1/admin/stats        → Admin dashboard stats + Dongtube balance
  GET  /api/v1/admin/users        → List all users
  POST /api/v1/webhook            → Dongtube payment webhook (HMAC signature)
"""

import os, sys, json, re
from http.server import SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn
from http.server import HTTPServer
from urllib.parse import urlparse, parse_qs

# ── Multi-Threaded Engine ─────────────────────────────────────────────────
class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads      = True
    allow_reuse_address = True

# ── Base path ─────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from backend.config.config import Config
from backend.database.db import init_database
from backend.controllers.app_controllers import (
    AuthController,
    ProductController,
    InvoiceController,
    AdminController,
    WebhookController
)

# ── Route Regex Matchers ──────────────────────────────────────────────────
RE_PRODUCT_ID = re.compile(r'^/api/v1/products/(\d+)$')

# ── Main Request Handler ──────────────────────────────────────────────────
class FullStackRouter(SimpleHTTPRequestHandler):

    # Zero-latency overrides
    def address_string(self):
        return self.client_address[0]

    def log_message(self, format, *args):
        pass  # Silent mode — no console blocking

    # ── CORS & JSON helpers ───────────────────────────────────────────────
    def _cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Signature, X-Webhook-Event')

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False, indent=2).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self._cors_headers()
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    def _read_body_raw(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            return self.rfile.read(length) if length > 0 else b'{}'
        except Exception:
            return b'{}'

    def _read_body(self):
        raw = self._read_body_raw()
        try:
            return json.loads(raw.decode('utf-8'))
        except Exception:
            return {}

    # ── GET ───────────────────────────────────────────────────────────────
    def do_GET(self):
        parsed = urlparse(self.path)
        path   = parsed.path
        params = parse_qs(parsed.query)

        # Health
        if path == '/api/v1/health':
            return self.send_json({
                "status":       "healthy",
                "version":      "2.0",
                "architecture": "Threaded MVC Full-Stack",
                "database":     "SQLite 3",
                "gateway":      "QRIS Realtime Otomatis",
                "engine":       "Python 3 High-Performance"
            })

        # Products list (search, filter, sort supported)
        elif path == '/api/v1/products':
            res, status = ProductController.list_all(params)
            return self.send_json(res, status)

        # Product by ID
        elif RE_PRODUCT_ID.match(path):
            prod_id = int(RE_PRODUCT_ID.match(path).group(1))
            res, status = ProductController.get_by_id(prod_id)
            return self.send_json(res, status)

        # Transaction history (filterable by email & status)
        elif path in ['/api/v1/history', '/api/v1/invoices']:
            res, status = InvoiceController.list_history(params)
            return self.send_json(res, status)

        # Invoice status
        elif path == '/api/v1/invoice/status':
            res, status = InvoiceController.get_status(params)
            return self.send_json(res, status)

        # Create QRIS invoice (GET)
        elif path == '/api/v1/invoice':
            res, status = InvoiceController.create(params)
            return self.send_json(res, status)

        # User profile
        elif path == '/api/v1/auth/profile':
            email = params.get('email', [''])[0].strip()
            res, status = AuthController.profile(email)
            return self.send_json(res, status)

        # Admin: dashboard stats
        elif path == '/api/v1/admin/stats':
            res, status = AdminController.stats()
            return self.send_json(res, status)

        # Admin: all users
        elif path == '/api/v1/admin/users':
            res, status = AdminController.list_users()
            return self.send_json(res, status)

        # Static files fallback
        else:
            return super().do_GET()

    # ── POST ──────────────────────────────────────────────────────────────
    def do_POST(self):
        parsed = urlparse(self.path)
        path   = parsed.path
        raw    = self._read_body_raw()

        try:
            body = json.loads(raw.decode('utf-8'))
        except Exception:
            body = {}

        if path == '/api/v1/auth/login':
            res, status = AuthController.login(body)

        elif path == '/api/v1/auth/register':
            res, status = AuthController.register(body)

        elif path == '/api/v1/invoice':
            res, status = InvoiceController.create(body)

        elif path == '/api/v1/invoice/confirm':
            res, status = InvoiceController.confirm(body)

        elif path == '/api/v1/products':
            res, status = ProductController.create(body)

        elif path == '/api/v1/webhook':
            res, status = WebhookController.handle(raw, self.headers)

        else:
            res, status = {"error": "Endpoint tidak ditemukan"}, 404

        return self.send_json(res, status)

    # ── PUT ───────────────────────────────────────────────────────────────
    def do_PUT(self):
        parsed = urlparse(self.path)
        path   = parsed.path
        body   = self._read_body()

        m = RE_PRODUCT_ID.match(path)
        if m:
            res, status = ProductController.update(int(m.group(1)), body)
        else:
            res, status = {"error": "Endpoint tidak ditemukan"}, 404

        return self.send_json(res, status)

    # ── DELETE ────────────────────────────────────────────────────────────
    def do_DELETE(self):
        parsed = urlparse(self.path)
        path   = parsed.path

        m = RE_PRODUCT_ID.match(path)
        if m:
            res, status = ProductController.delete(int(m.group(1)))
        else:
            res, status = {"error": "Endpoint tidak ditemukan"}, 404

        return self.send_json(res, status)


# ── Entry Point ───────────────────────────────────────────────────────────
def main():
    os.chdir(BASE_DIR)
    init_database()

    server = ThreadedHTTPServer(('0.0.0.0', Config.PORT), FullStackRouter)
    print(f"✅  Kheireditz Full-Stack v2.0  →  http://127.0.0.1:{Config.PORT}")
    print(f"    Database  : {Config.DB_PATH}")
    print(f"    Gateway   : Dongtube Payment (Live)")
    print(f"    Admin     : {Config.ADMIN_EMAIL}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑  Server stopped.")
        server.server_close()

if __name__ == '__main__':
    main()
