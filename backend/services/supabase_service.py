import urllib.request
import urllib.parse
import json
import ssl
import os
from backend.config.config import Config

class SupabaseService:
    @staticmethod
    def is_configured():
        return bool(Config.SUPABASE_URL and Config.SUPABASE_KEY)

    @staticmethod
    def _headers():
        return {
            "apikey": Config.SUPABASE_KEY,
            "Authorization": f"Bearer {Config.SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    @staticmethod
    def _request(endpoint, method="GET", body=None, params=None):
        if not SupabaseService.is_configured():
            return None, 503

        url = f"{Config.SUPABASE_URL.rstrip('/')}/rest/v1/{endpoint.lstrip('/')}"
        if params:
            query = urllib.parse.urlencode(params)
            url += f"?{query}"

        data = json.dumps(body).encode('utf-8') if body is not None else None
        req = urllib.request.Request(
            url,
            data=data,
            headers=SupabaseService._headers(),
            method=method
        )
        ctx = ssl.create_default_context()

        try:
            with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
                raw = resp.read().decode('utf-8')
                return (json.loads(raw) if raw else {}), resp.status
        except urllib.error.HTTPError as e:
            try:
                err_body = json.loads(e.read().decode('utf-8'))
            except Exception:
                err_body = {"error": str(e)}
            return err_body, e.code
        except Exception as e:
            return {"error": f"Supabase connection error: {str(e)}"}, 500

    # ── Table: users ──────────────────────────────────────────────
    @staticmethod
    def get_user_by_email(email):
        res, status = SupabaseService._request("users", method="GET", params={"email": f"eq.{email}", "select": "*"})
        if status == 200 and isinstance(res, list) and len(res) > 0:
            return res[0]
        return None

    @staticmethod
    def insert_user(user_data):
        res, status = SupabaseService._request("users", method="POST", body=user_data)
        return res, status

    # ── Table: products ───────────────────────────────────────────
    @staticmethod
    def list_products(order="id.asc"):
        res, status = SupabaseService._request("products", method="GET", params={"select": "*", "order": order})
        return res, status

    @staticmethod
    def get_product(prod_id):
        res, status = SupabaseService._request("products", method="GET", params={"id": f"eq.{prod_id}", "select": "*"})
        if status == 200 and isinstance(res, list) and len(res) > 0:
            return res[0]
        return None

    @staticmethod
    def insert_product(prod_data):
        res, status = SupabaseService._request("products", method="POST", body=prod_data)
        return res, status

    @staticmethod
    def update_product(prod_id, prod_data):
        res, status = SupabaseService._request(f"products?id=eq.{prod_id}", method="PATCH", body=prod_data)
        return res, status

    @staticmethod
    def delete_product(prod_id):
        res, status = SupabaseService._request(f"products?id=eq.{prod_id}", method="DELETE")
        return res, status

    # ── Table: invoices ───────────────────────────────────────────
    @staticmethod
    def list_invoices(email=None, status_filter=None):
        params = {"select": "*", "order": "created_at.desc"}
        if email:
            params["user_email"] = f"eq.{email}"
        if status_filter:
            params["status"] = f"eq.{status_filter}"
        res, status = SupabaseService._request("invoices", method="GET", params=params)
        return res, status

    @staticmethod
    def get_invoice(inv_id):
        res, status = SupabaseService._request("invoices", method="GET", params={"id": f"eq.{inv_id}", "select": "*"})
        if status == 200 and isinstance(res, list) and len(res) > 0:
            return res[0]
        return None

    @staticmethod
    def insert_invoice(inv_data):
        res, status = SupabaseService._request("invoices", method="POST", body=inv_data)
        return res, status

    @staticmethod
    def update_invoice(inv_id, inv_data):
        res, status = SupabaseService._request(f"invoices?id=eq.{inv_id}", method="PATCH", body=inv_data)
        return res, status
