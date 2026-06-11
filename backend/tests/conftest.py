# DARIVO PRO — Configuración de tests
# Variables de entorno mínimas para poder importar la app sin un .env real
import os

os.environ.setdefault("SUPABASE_URL", "http://localhost:54321")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "test-service-key")
os.environ.setdefault("WA_PHONE_NUMBER_ID", "test")
os.environ.setdefault("WA_ACCESS_TOKEN", "test")
os.environ.setdefault("WA_VERIFY_TOKEN", "test")
os.environ.setdefault("SERVICE_KEY", "test")
