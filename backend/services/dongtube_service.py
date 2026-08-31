import urllib.request
import urllib.parse
import json
import hmac
import hashlib
import ssl
from backend.config.config import Config

class DongtubeService:
    @staticmethod
    def _get_ssl_context():
        ctx = ssl.create_default_context()
        return ctx

    @staticmethod
    def create_invoice(amount):
        """
        Calls GET https://payment.dongtube.cyou/api/v1/invoice?apikey=...&amount=...
        Returns:
        {
          "success": true,
          "type": "dynamic",
          "invoice_id": "INV2285c2c",
          "amount": 10000,
          "fee": 218,
          "total": 10218,
          "qris_image": "/img-cache/abc123.png",
          "expired_at": "..."
        }
        """
        url = f"{Config.DONGTUBE_BASE_URL}/api/v1/invoice?apikey={Config.DONGTUBE_API_KEY}&amount={int(amount)}"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "KheireditzStore/2.0",
                "Accept": "application/json"
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=10, context=DongtubeService._get_ssl_context()) as response:
                data = json.loads(response.read().decode('utf-8'))
                if data.get("qris_image") and data["qris_image"].startswith("/"):
                    data["qris_image_full"] = f"{Config.DONGTUBE_BASE_URL}{data['qris_image']}"
                else:
                    data["qris_image_full"] = data.get("qris_image", "")
                return data, 200
        except Exception as e:
            return {"error": f"Gagal menghubungi Dongtube Gateway: {str(e)}"}, 502

    @staticmethod
    def check_status(invoice_id):
        """
        Calls GET https://payment.dongtube.cyou/api/v1/invoice/status?apikey=...&invoice_id=...
        """
        url = f"{Config.DONGTUBE_BASE_URL}/api/v1/invoice/status?apikey={Config.DONGTUBE_API_KEY}&invoice_id={urllib.parse.quote(invoice_id)}"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "KheireditzStore/2.0",
                "Accept": "application/json"
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=10, context=DongtubeService._get_ssl_context()) as response:
                data = json.loads(response.read().decode('utf-8'))
                if data.get("qris_image") and data["qris_image"].startswith("/"):
                    data["qris_image_full"] = f"{Config.DONGTUBE_BASE_URL}{data['qris_image']}"
                return data, 200
        except Exception as e:
            return {"error": f"Gagal memeriksa status Dongtube: {str(e)}"}, 502

    @staticmethod
    def get_balance():
        """
        Calls GET https://payment.dongtube.cyou/api/v1/balance?apikey=...
        """
        url = f"{Config.DONGTUBE_BASE_URL}/api/v1/balance?apikey={Config.DONGTUBE_API_KEY}"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "KheireditzStore/2.0",
                "Accept": "application/json"
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=10, context=DongtubeService._get_ssl_context()) as response:
                data = json.loads(response.read().decode('utf-8'))
                return data, 200
        except Exception as e:
            return {"error": f"Gagal cek saldo Dongtube: {str(e)}"}, 502

    @staticmethod
    def verify_webhook(raw_body_bytes, signature_header):
        """
        Verifies X-Signature: sha256=<hmac>
        """
        if not signature_header:
            return False
        expected_sig = "sha256=" + hmac.new(
            Config.DONGTUBE_API_KEY.encode('utf-8'),
            raw_body_bytes,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected_sig, signature_header.strip())
