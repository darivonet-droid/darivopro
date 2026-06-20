# DARIVO PRO — Configuración (Pydantic Settings v2)
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Supabase (requerido para endpoints de datos; vacío permite /health en deploy)
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # WhatsApp Meta Cloud API (opcional — el frontend ya usa wa.me directo)
    WA_PHONE_NUMBER_ID: str = ""
    WA_ACCESS_TOKEN: str = ""
    WA_VERIFY_TOKEN: str = "darivo_verify"

    # Supabase Storage
    STORAGE_BUCKET_PDF: str = "documentos"

    # Seguridad interna Next.js ↔ FastAPI (legacy)
    SERVICE_KEY: str = ""

    # CORS — lista separada por comas en env ALLOWED_ORIGINS
    ALLOWED_ORIGINS: str = (
        "http://localhost:3000,"
        "https://darivo.net,"
        "https://www.darivo.net,"
        "https://darivo-pro.vercel.app"
    )

    # PDF (legacy — PDFs ahora en Next.js)
    PDF_TEMPLATE_DIR: str = "./services/pdf/templates"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def _origins_to_str(cls, v: object) -> str:
        if isinstance(v, list):
            return ",".join(str(x) for x in v)
        return str(v) if v is not None else ""

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


settings = Settings()
