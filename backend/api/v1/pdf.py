# DARIVO PRO — Endpoint PDF
from fastapi import APIRouter, Depends, HTTPException, Header
from services.pdf.generator import generar_pdf_cotizacion, generar_pdf_factura
from models.schemas import ApiResponse
from config.settings import settings

router = APIRouter()

def verify_service_key(x_service_key: str = Header(...)):
    if x_service_key != settings.SERVICE_KEY:
        raise HTTPException(status_code=403, detail="Clave de servicio inválida")

@router.post("/cotizacion", response_model=ApiResponse[dict])
async def pdf_cotizacion(
    cotizacion: dict,
    _: None = Depends(verify_service_key),
):
    try:
        url = await generar_pdf_cotizacion(cotizacion)
        return ApiResponse(data={"url": url})
    except Exception as e:
        return ApiResponse(error=str(e))

@router.post("/factura", response_model=ApiResponse[dict])
async def pdf_factura(
    factura: dict,
    _: None = Depends(verify_service_key),
):
    try:
        url = await generar_pdf_factura(factura)
        return ApiResponse(data={"url": url})
    except Exception as e:
        return ApiResponse(error=str(e))
