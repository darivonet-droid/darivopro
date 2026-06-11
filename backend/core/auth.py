# DARIVO PRO — Autenticación
# - get_current_user: valida el JWT de Supabase (header Authorization: Bearer)
# - verify_service_key: valida la clave compartida Next.js ↔ FastAPI

from dataclasses import dataclass
from typing import Optional

from fastapi import Header, HTTPException

from config.settings import settings
from core.supabase_client import get_supabase


@dataclass
class User:
    id: str
    email: Optional[str]

    @property
    def tenant_id(self) -> str:
        # Cada usuario es su propio tenant (un negocio = una cuenta)
        return self.id


async def get_current_user(authorization: str = Header(...)) -> User:
    """Valida el token JWT de Supabase y retorna el usuario."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Formato de autorización inválido")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        res = get_supabase().auth.get_user(token)
        user = res.user
    except Exception:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")
    if user is None:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")
    return User(id=user.id, email=user.email)


def verify_service_key(x_service_key: str = Header(...)) -> None:
    if x_service_key != settings.SERVICE_KEY:
        raise HTTPException(status_code=403, detail="Clave de servicio inválida")
