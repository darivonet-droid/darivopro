# DARIVO PRO — Cliente Supabase (service role, solo backend)
from functools import lru_cache

from supabase import Client, create_client

from config.settings import settings


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    """Cliente Supabase con service role. Singleton perezoso para no
    conectar en import time (facilita tests y CI)."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
