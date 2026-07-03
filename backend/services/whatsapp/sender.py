# DARIVO PRO — Servicio WhatsApp Meta Cloud API
#
# DEPRECATED — Excluido del producto oficial (DARIVO-PRO-ARQUITECTURA-MAESTRA.md §6.3).
# El patrón aprobado es enlace wa.me vía frontend/src/app/api/whatsapp/enviar/route.ts.
# Este módulo se mantiene solo por compatibilidad legacy; no usar en nuevas implementaciones.
import httpx
from config.settings import settings

WA_API_URL = f"https://graph.facebook.com/v19.0/{settings.WA_PHONE_NUMBER_ID}/messages"

HEADERS = {
    "Authorization": f"Bearer {settings.WA_ACCESS_TOKEN}",
    "Content-Type": "application/json",
}


async def enviar_texto(to: str, mensaje: str) -> dict:
    """Envía mensaje de texto por WhatsApp (DEPRECATED — usar wa.me en frontend)."""
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "text",
        "text": {"preview_url": False, "body": mensaje},
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(WA_API_URL, json=payload, headers=HEADERS)
        res.raise_for_status()
        return res.json()


async def enviar_documento(to: str, mensaje: str, url_documento: str, nombre: str = "Documento DARIVO PRO.pdf") -> dict:
    """Envía PDF como documento adjunto por WhatsApp (DEPRECATED — usar wa.me en frontend)."""
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "document",
        "document": {
            "link": url_documento,
            "caption": mensaje,
            "filename": nombre,
        },
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(WA_API_URL, json=payload, headers=HEADERS)
        res.raise_for_status()
        return res.json()


async def enviar_plantilla(to: str, template_name: str, params: list[str]) -> dict:
    """Envía mensaje con plantilla aprobada por Meta (DEPRECATED)."""
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": "es"},
            "components": [{
                "type": "body",
                "parameters": [{"type": "text", "text": p} for p in params],
            }],
        },
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(WA_API_URL, json=payload, headers=HEADERS)
        res.raise_for_status()
        return res.json()
