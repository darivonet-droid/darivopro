# DARIVO PRO — Endpoints de catálogo (partidas + precios de la empresa)
import copy
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from core.auth import User, get_current_user
from core.supabase_client import get_supabase
from models.schemas import ApiResponse, PartidaPropiaIn, PrecioUsuarioIn
from services.catalogo_base import CATALOGO_BASE

router = APIRouter()


@router.get("", response_model=ApiResponse[List[dict]])
async def obtener_catalogo(
    user: User = Depends(get_current_user),
) -> ApiResponse[List[dict]]:
    """Catálogo base + precios personalizados + partidas propias del usuario."""
    sb = get_supabase()
    catalogo = copy.deepcopy(CATALOGO_BASE)

    precios = (
        sb.table("precios_usuario").select("svc_id, precio").eq("user_id", user.id).execute()
    )
    overrides = {p["svc_id"]: float(p["precio"]) for p in (precios.data or [])}
    for cap in catalogo:
        for partida in cap["partidas"]:
            if partida["id"] in overrides:
                partida["precio"] = overrides[partida["id"]]

    propias = (
        sb.table("partidas_propias")
        .select("*")
        .eq("user_id", user.id)
        .eq("activa", True)
        .execute()
    )
    por_capitulo: dict[str, list[dict]] = {}
    for p in propias.data or []:
        por_capitulo.setdefault(p["cap_id"], []).append({
            "id": str(p["id"]),
            "nombre": p["nombre"],
            "tipo": p["tipo"],
            "precio": float(p["precio"]),
            "unidad": p.get("unidad") or "",
            "esPropia": True,
        })
    for cap in catalogo:
        cap["partidas"].extend(por_capitulo.get(cap["id"], []))

    return ApiResponse(data=catalogo)


@router.post("/partidas", response_model=ApiResponse[dict], status_code=201)
async def crear_partida_propia(
    data: PartidaPropiaIn,
    user: User = Depends(get_current_user),
) -> ApiResponse[dict]:
    if data.cap_id not in {c["id"] for c in CATALOGO_BASE}:
        raise HTTPException(status_code=400, detail="Capítulo inválido")
    sb = get_supabase()
    res = (
        sb.table("partidas_propias")
        .insert({"user_id": user.id, **data.model_dump()})
        .execute()
    )
    return ApiResponse(data=res.data[0])


@router.put("/precios", response_model=ApiResponse[dict])
async def actualizar_precio(
    data: PrecioUsuarioIn,
    user: User = Depends(get_current_user),
) -> ApiResponse[dict]:
    sb = get_supabase()
    res = (
        sb.table("precios_usuario")
        .upsert(
            {"user_id": user.id, "svc_id": data.svc_id, "precio": data.precio},
            on_conflict="user_id,svc_id",
        )
        .execute()
    )
    return ApiResponse(data=res.data[0] if res.data else {"svc_id": data.svc_id, "precio": data.precio})
