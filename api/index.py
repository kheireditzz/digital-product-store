import os
import sys
import json
import re
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Add root directory to sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)

from backend.config.config import Config
from backend.database.db import init_database
from backend.controllers.app_controllers import (
    AuthController,
    ProductController,
    InvoiceController,
    AdminController,
    WebhookController,
    BannerController,
    SettingsController
)

# Initialize database
try:
    init_database()
except Exception as e:
    print("Database init:", e)

RE_PRODUCT_ID = re.compile(r'^/api/v1/products/(\d+)$')
RE_BANNER_ID  = re.compile(r'^/api/v1/banners/(\d+)$')

class handler(BaseHTTPRequestHandler):
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

    def do_GET(self):
        parsed = urlparse(self.path)
        path   = parsed.path
        params = parse_qs(parsed.query)

        if path == '/api/v1/health':
            return self.send_json({
                "status":       "healthy",
                "version":      "2.0",
                "platform":     "Vercel Serverless Function",
                "database":     "Supabase Cloud (PostgreSQL)",
                "gateway":      "QRIS Realtime Otomatis",
                "engine":       "Python 3 High-Performance"
            })

        elif path == '/api/v1/products':
            res, status = ProductController.list_all(params)
            return self.send_json(res, status)

        elif RE_PRODUCT_ID.match(path):
            prod_id = int(RE_PRODUCT_ID.match(path).group(1))
            res, status = ProductController.get_by_id(prod_id)
            return self.send_json(res, status)

        elif path in ['/api/v1/history', '/api/v1/invoices']:
            res, status = InvoiceController.list_history(params)
            return self.send_json(res, status)

        elif path == '/api/v1/invoice/status':
            res, status = InvoiceController.get_status(params)
            return self.send_json(res, status)

        elif path == '/api/v1/invoice':
            res, status = InvoiceController.create(params)
            return self.send_json(res, status)

        elif path == '/api/v1/banners':
            res, status = BannerController.list_banners()
            return self.send_json(res, status)

        elif path == '/api/v1/settings':
            res, status = SettingsController.get()
            return self.send_json(res, status)

        elif path == '/api/v1/auth/profile':
            email = params.get('email', [''])[0].strip()
            res, status = AuthController.profile(email)
            return self.send_json(res, status)

        elif path == '/api/v1/admin/stats':
            res, status = AdminController.stats()
            return self.send_json(res, status)

        elif path == '/api/v1/admin/users':
            res, status = AdminController.list_users()
            return self.send_json(res, status)

        else:
            return self.send_json({"error": "Endpoint tidak ditemukan"}, 404)

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
        elif path == '/api/v1/banners':
            res, status = BannerController.create(body)
        elif path == '/api/v1/settings':
            res, status = SettingsController.update(body)
        elif path == '/api/v1/webhook':
            res, status = WebhookController.handle(raw, self.headers)
        else:
            res, status = {"error": "Endpoint tidak ditemukan"}, 404

        return self.send_json(res, status)

    def do_PUT(self):
        parsed = urlparse(self.path)
        path   = parsed.path
        body   = self._read_body()
        m_prod = RE_PRODUCT_ID.match(path)
        m_ban  = RE_BANNER_ID.match(path)
        if m_prod:
            res, status = ProductController.update(int(m_prod.group(1)), body)
        elif m_ban:
            res, status = BannerController.update(int(m_ban.group(1)), body)
        elif path == '/api/v1/settings':
            res, status = SettingsController.update(body)
        else:
            res, status = {"error": "Endpoint tidak ditemukan"}, 404
        return self.send_json(res, status)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path   = parsed.path
        m_prod = RE_PRODUCT_ID.match(path)
        m_ban  = RE_BANNER_ID.match(path)
        if m_prod:
            res, status = ProductController.delete(int(m_prod.group(1)))
        elif m_ban:
            res, status = BannerController.delete(int(m_ban.group(1)))
        else:
            res, status = {"error": "Endpoint tidak ditemukan"}, 404
        return self.send_json(res, status)
