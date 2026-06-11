# DARIVO PRO — Configuración (Pydantic Settings v2)
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL:         str
    SUPABASE_SERVICE_KEY: str  # Service role key — solo backend

    # WhatsApp Meta Cloud API
    WA_PHONE_NUMBER_ID: str
    WA_ACCESS_TOKEN:    str
    WA_VERIFY_TOKEN:    str = "darivo_verify"

    # Supabase Storage
    STORAGE_BUCKET_PDF: str = "documentos"

    # Seguridad interna
    SERVICE_KEY: str          # Clave entre Next.js y FastAPI

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "https://darivo-pro.vercel.app",
    ]

    # PDF
    PDF_TEMPLATE_DIR: str = "./services/pdf/templates"

    class Config:
        env_file = ".env"


settings = Settings()
