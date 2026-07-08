# DARIVO PRO — Endpoints de cotizaciones
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from core.auth import User, get_current_user
from core.supabase_client import get_supabase
from models.schemas import ApiResponse, CotizacionIn, CotizacionOut

router = APIRouter()


def _row_to_out(row: dict, items: list[dict]) -> CotizacionOut:
    return CotizacionOut(
        id=str(row["id"]),
        tenant_id=str(row["user_id"]),
        clientName=row["client_name"],
        phone=row.get("phone"),
        city=row.get("city"),
        margin=float(row.get("margin") or 0),
        totalBase=float(row.get("total_base") or 0),
        totalLabor=float(row.get("total_labor") or 0),
        totalFinal=float(row.get("total_final") or 0),
        status=row.get("status") or "Borrador",
        notes=row.get("notes"),
        createdAt=str(row.get("created_at") or ""),
        items=[
            {
                "svcId": it["svc_id"],
                "catLabel": it.get("cat_label") or "",
                "svcLabel": it.get("svc_label") or "",
                "calcType": it.get("calc_type") or "fixed",
                "basePrice": float(it.get("base_price") or 0),
                "unit": it.get("unit") or "",
                "qty": float(it.get("qty") or 0),
                "unitPrice": float(it.get("unit_price") or 0),
                "subtotal": float(it.get("subtotal") or 0),
            }
            for it in items
        ],
    )


@router.get("", response_model=ApiResponse[List[CotizacionOut]])
async def listar_cotizaciones(
    user: User = Depends(get_current_user),
) -> ApiResponse[List[CotizacionOut]]:
    sb = get_supabase()
    res = (
        sb.table("cotizaciones")
        .select("*, items:cotizacion_items(*)")
        .eq("user_id", user.id)
        .order("created_at", desc=True)
        .execute()
    )
    data = [_row_to_out(r, r.get("items") or []) for r in (res.data or [])]
    return ApiResponse(data=data, meta={"total": len(data)})


@router.get("/{cotizacion_id}", response_model=ApiResponse[CotizacionOut])
async def obtener_cotizacion(
    cotizacion_id: str,
    user: User = Depends(get_current_user),
) -> ApiResponse[CotizacionOut]:
    sb = get_supabase()
    res = (
        sb.table("cotizaciones")
        .select("*, items:cotizacion_items(*)")
        .eq("user_id", user.id)
        .eq("id", cotizacion_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    row = res.data[0]
    return ApiResponse(data=_row_to_out(row, row.get("items") or []))


@router.post("", response_model=ApiResponse[CotizacionOut], status_code=201)
async def crear_cotizacion(
    data: CotizacionIn,
    user: User = Depends(get_current_user),
) -> ApiResponse[CotizacionOut]:
    sb = get_supabase()
    try:
        res = (
            sb.table("cotizaciones")
            .insert({
                "user_id": user.id,
                "client_name": data.clientName,
                "phone": data.phone,
                "city": data.city,
                "margin": data.margin,
                "total_base": data.totalBase,
                "total_labor": data.totalLabor,
                "total_final": data.totalFinal,
                "status": data.status,
                "notes": data.notes,
            })
            .execute()
        )
        row = res.data[0]
        items_rows: list[dict] = []
        if data.items:
            items_res = (
                sb.table("cotizacion_items")
                .insert([
                    {
                        "cotizacion_id": row["id"],
                        "svc_id": it.svcId,
                        "cat_label": it.catLabel,
                        "svc_label": it.svcLabel,
                        "calc_type": it.calcType,
                        "base_price": it.basePrice,
                        "unit": it.unit,
                        "qty": it.qty,
                        "unit_price": it.unitPrice,
                        "subtotal": it.subtotal,
                    }
                    for it in data.items
                ])
                .execute()
            )
            items_rows = items_res.data or []
        return ApiResponse(data=_row_to_out(row, items_rows))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo crear la cotización: {e}")


@router.patch("/{cotizacion_id}/estado", response_model=ApiResponse[dict])
async def actualizar_estado(
    cotizacion_id: str,
    body: dict,
    user: User = Depends(get_current_user),
) -> ApiResponse[dict]:
    status = body.get("status")
    if status not in ("Borrador", "Pendiente de firma", "Aprobado"):
        raise HTTPException(status_code=400, detail="Estado inválido")
    sb = get_supabase()
    res = (
        sb.table("cotizaciones")
        .update({"status": status})
        .eq("user_id", user.id)
        .eq("id", cotizacion_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    return ApiResponse(data={"id": cotizacion_id, "status": status})


@router.delete("/{cotizacion_id}", response_model=ApiResponse[dict])
async def eliminar_cotizacion(
    cotizacion_id: str,
    user: User = Depends(get_current_user),
) -> ApiResponse[dict]:
    sb = get_supabase()
    res = (
        sb.table("cotizaciones")
        .delete()
        .eq("user_id", user.id)
        .eq("id", cotizacion_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    return ApiResponse(data={"id": cotizacion_id, "eliminado": True})
