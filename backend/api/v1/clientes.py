# DARIVO PRO — Endpoints de clientes
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from core.auth import User, get_current_user
from core.supabase_client import get_supabase
from models.schemas import ApiResponse, ClienteIn, ClienteOut

router = APIRouter()


def _row_to_out(row: dict) -> ClienteOut:
    return ClienteOut(
        id=str(row["id"]),
        nombre=row["nombre"],
        telefono=row.get("telefono"),
        ruc=row.get("ruc"),
        direccion=row.get("direccion"),
        ciudad=row.get("ciudad"),
        notas=row.get("notas"),
        created_at=str(row.get("created_at") or ""),
    )


@router.get("", response_model=ApiResponse[List[ClienteOut]])
async def listar_clientes(
    user: User = Depends(get_current_user),
) -> ApiResponse[List[ClienteOut]]:
    sb = get_supabase()
    res = (
        sb.table("clientes")
        .select("*")
        .eq("user_id", user.id)
        .order("nombre")
        .execute()
    )
    data = [_row_to_out(r) for r in (res.data or [])]
    return ApiResponse(data=data, meta={"total": len(data)})


@router.post("", response_model=ApiResponse[ClienteOut], status_code=201)
async def crear_cliente(
    data: ClienteIn,
    user: User = Depends(get_current_user),
) -> ApiResponse[ClienteOut]:
    sb = get_supabase()
    try:
        res = (
            sb.table("clientes")
            .insert({"user_id": user.id, **data.model_dump()})
            .execute()
        )
        return ApiResponse(data=_row_to_out(res.data[0]))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo crear el cliente: {e}")


@router.put("/{cliente_id}", response_model=ApiResponse[ClienteOut])
async def actualizar_cliente(
    cliente_id: str,
    data: ClienteIn,
    user: User = Depends(get_current_user),
) -> ApiResponse[ClienteOut]:
    sb = get_supabase()
    res = (
        sb.table("clientes")
        .update(data.model_dump())
        .eq("user_id", user.id)
        .eq("id", cliente_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return ApiResponse(data=_row_to_out(res.data[0]))


@router.delete("/{cliente_id}", response_model=ApiResponse[dict])
async def eliminar_cliente(
    cliente_id: str,
    user: User = Depends(get_current_user),
) -> ApiResponse[dict]:
    sb = get_supabase()
    res = (
        sb.table("clientes")
        .delete()
        .eq("user_id", user.id)
        .eq("id", cliente_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return ApiResponse(data={"id": cliente_id, "eliminado": True})
