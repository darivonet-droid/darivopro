# DARIVO PRO — Endpoint WhatsApp
#
# DEPRECATED — Meta Cloud API excluida del producto (AM §6.3).
# Patrón oficial: frontend/src/app/api/whatsapp/enviar/route.ts (wa.me).
# Mantener solo por compatibilidad legacy; no extender.
from fastapi import APIRouter, Depends, HTTPException, Header, Request
from services.whatsapp.sender import enviar_texto, enviar_documento
from models.schemas import ApiResponse, WhatsAppPayload
from config.settings import settings

router = APIRouter()

def verify_service_key(x_service_key: str = Header(...)):
    if x_service_key != settings.SERVICE_KEY:
        raise HTTPException(status_code=403, detail="Clave de servicio inválida")

@router.post("/enviar", response_model=ApiResponse[dict])
async def enviar_whatsapp(
    payload: WhatsAppPayload,
    _: None = Depends(verify_service_key),
):
    try:
        if payload.documentUrl:
            result = await enviar_documento(
                to=payload.to,
                mensaje=payload.message,
                url_documento=payload.documentUrl,
            )
        else:
            result = await enviar_texto(to=payload.to, mensaje=payload.message)
        return ApiResponse(data=result)
    except Exception as e:
        return ApiResponse(error=str(e))

@router.get("/webhook")
async def webhook_verify(hub_mode: str, hub_verify_token: str, hub_challenge: str):
    """Verificación del webhook de Meta"""
    if hub_verify_token == settings.WA_VERIFY_TOKEN:
        return int(hub_challenge)
    raise HTTPException(status_code=403, detail="Token inválido")

@router.post("/webhook")
async def webhook_recibir(request: Request):
    """Recibir mensajes entrantes de WhatsApp"""
    data = await request.json()
    # Aquí procesar mensajes entrantes (respuestas de clientes)
    # Por ahora solo confirmar recepción
    return {"status": "ok"}
