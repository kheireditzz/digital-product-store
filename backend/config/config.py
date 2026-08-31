import os

class Config:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DB_PATH = os.path.join(BASE_DIR, "data", "kheireditz.db")
    PORT = int(os.getenv("PORT", 3000))
    SECRET_KEY = os.getenv("SECRET_KEY", "KHEIREDITZ_PRODUCTION_SECRET_2026")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "kheireditz@admin.com")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin@123")
    
    # Supabase Cloud Database Integration (Live)
    SUPABASE_URL = os.getenv("SUPABASE_URL", "https://iwsqrwgaknodxdyzknqz.supabase.co")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3c3Fyd2dha25vZHhkeXprbnF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE3NjE1MywiZXhwIjoyMTAzNzUyMTUzfQ.akikrHj9C0etwV3vH4huqvZ-NrCRWIRrkg4B5t3g11k")
    
    # Payment Gateway Real Integration
    DONGTUBE_API_KEY = os.getenv("DONGTUBE_API_KEY", "DONGTUBE_20a06f2ab35b44ac")
    DONGTUBE_BASE_URL = os.getenv("DONGTUBE_BASE_URL", "https://payment.dongtube.cyou")
    
    QRIS_FEE_PERCENTAGE = 0.0218
    JWT_EXPIRATION_HOURS = 24
