# DARIVO PRO — Endpoints de facturas
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from core.auth import User, get_current_user
from core.supabase_client import get_supabase
from models.schemas import ApiResponse, FacturaIn, FacturaOut

router = APIRouter()


def _row_to_out(row: dict) -> FacturaOut:
    return FacturaOut(
        invId=str(row["inv_id"]),
        tenant_id=str(row["user_id"]),
        invNum=row["inv_num"],
        invDate=str(row.get("inv_date") or ""),
        invStatus=row.get("inv_status") or "Emitida",
        clientName=row["client_name"],
        clientRuc=row.get("client_ruc"),
        clientDir=row.get("client_dir"),
        moneda=row.get("moneda") or "PEN",
        sym=row.get("sym") or "S/",
        items=row.get("items") or [],
        subtotalBase=float(row.get("subtotal_base") or 0),
        igvAmount=float(row.get("igv_amount") or 0),
        totalFinal=float(row.get("total_final") or 0),
        fromQuoteId=str(row["from_quote_id"]) if row.get("from_quote_id") else None,
        bizData=row.get("biz_data") or {
            "razonSocial": "", "ruc": "00000000000", "direccion": "",
        },
    )


@router.get("", response_model=ApiResponse[List[FacturaOut]])
async def listar_facturas(
    user: User = Depends(get_current_user),
) -> ApiResponse[List[FacturaOut]]:
    sb = get_supabase()
    res = (
        sb.table("facturas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", desc=True)
        .execute()
    )
    data = [_row_to_out(r) for r in (res.data or [])]
    return ApiResponse(data=data, meta={"total": len(data)})


@router.get("/{inv_id}", response_model=ApiResponse[FacturaOut])
async def obtener_factura(
    inv_id: str,
    user: User = Depends(get_current_user),
) -> ApiResponse[FacturaOut]:
    sb = get_supabase()
    res = (
        sb.table("facturas")
        .select("*")
        .eq("user_id", user.id)
        .eq("inv_id", inv_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    return ApiResponse(data=_row_to_out(res.data[0]))


@router.post("", response_model=ApiResponse[FacturaOut], status_code=201)
async def emitir_factura(
    data: FacturaIn,
    user: User = Depends(get_current_user),
) -> ApiResponse[FacturaOut]:
    sb = get_supabase()
    try:
        res = (
            sb.table("facturas")
            .insert({
                "user_id": user.id,
                "inv_num": data.invNum,
                "inv_date": data.invDate,
                "inv_status": "Emitida",
                "client_name": data.clientName,
                "client_ruc": data.clientRuc,
                "client_dir": data.clientDir,
                "moneda": data.moneda,
                "sym": data.sym,
                "items": [it.model_dump() for it in data.items],
                "subtotal_base": data.subtotalBase,
                "igv_amount": data.igvAmount,
                "total_final": data.totalFinal,
                "from_quote_id": data.fromQuoteId,
                "biz_data": data.bizData.model_dump(),
            })
            .execute()
        )
        return ApiResponse(data=_row_to_out(res.data[0]))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo emitir la factura: {e}")


@router.patch("/{inv_id}/estado", response_model=ApiResponse[dict])
async def actualizar_estado_factura(
    inv_id: str,
    body: dict,
    user: User = Depends(get_current_user),
) -> ApiResponse[dict]:
    status = body.get("invStatus")
    if status not in ("Pendiente", "Emitida", "Cobrada"):
        raise HTTPException(status_code=400, detail="Estado inválido")
    sb = get_supabase()
    res = (
        sb.table("facturas")
        .update({"inv_status": status})
        .eq("user_id", user.id)
        .eq("inv_id", inv_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    return ApiResponse(data={"invId": inv_id, "invStatus": status})
