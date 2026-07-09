# DARIVO PRO — Schemas Pydantic v2
from pydantic import BaseModel, Field, field_validator
from typing import Generic, TypeVar, Optional, List
from datetime import date
import re

T = TypeVar("T")

# ── Respuesta estándar ──────────────────────────────────────────────────────
class ApiResponse(BaseModel, Generic[T]):
    data:  Optional[T]   = None
    error: Optional[str] = None
    meta:  Optional[dict]= None

# ── Línea de cotizacion ────────────────────────────────────────────────────
class LineaCotizacion(BaseModel):
    svcId:     str
    catLabel:  str
    svcLabel:  str
    calcType:  str   # "m2" | "unit" | "hour" | "fixed"
    basePrice: float
    unit:      str
    qty:       float
    unitPrice: float
    subtotal:  float

# ── Cotizacion ─────────────────────────────────────────────────────────────
class CotizacionIn(BaseModel):
    clientName: str
    phone:      Optional[str] = None
    city:       Optional[str] = None
    items:      List[LineaCotizacion]
    margin:     float = Field(ge=0, le=200)
    totalBase:  float
    totalLabor: float
    totalFinal: float
    status:     str = "Borrador"
    notes:      Optional[str] = None

class CotizacionOut(CotizacionIn):
    id:        str
    tenant_id: str
    createdAt: str

# ── Factura ─────────────────────────────────────────────────────────────────
class LineaFactura(BaseModel):
    desc:     str
    cantidad: float
    pu:       float
    subtotal: float

class EmpresaData(BaseModel):
    razonSocial: str
    ruc:         str
    direccion:   str
    telefono:    Optional[str] = None
    moneda:      str = "PEN"
    simbolo:     str = "S/"

    @field_validator("ruc")
    @classmethod
    def validar_ruc(cls, v: str) -> str:
        if not re.match(r"^\d{11}$", v):
            raise ValueError("RUC debe tener 11 dígitos")
        return v

class FacturaIn(BaseModel):
    invNum:       str
    invDate:      str
    clientName:   str
    clientRuc:    Optional[str] = None
    clientDir:    Optional[str] = None
    moneda:       str = "PEN"
    sym:          str = "S/"
    items:        List[LineaFactura]
    subtotalBase: float
    igvAmount:    float
    totalFinal:   float
    fromQuoteId:  Optional[str] = None
    bizData:      EmpresaData

class FacturaOut(FacturaIn):
    invId:     str
    tenant_id: str
    invStatus: str = "Emitida"

# ── WhatsApp ─────────────────────────────────────────────────────────────────
class WhatsAppPayload(BaseModel):
    to:          str   # número con código país: 51XXXXXXXXX
    message:     str
    documentUrl: Optional[str] = None

# ── Cliente ──────────────────────────────────────────────────────────────────
class ClienteIn(BaseModel):
    nombre:    str
    telefono:  Optional[str] = None
    ruc:       Optional[str] = None
    direccion: Optional[str] = None
    ciudad:    Optional[str] = None
    notas:     Optional[str] = None

class ClienteOut(ClienteIn):
    id:         str
    created_at: str

# ── Catálogo ─────────────────────────────────────────────────────────────────
class PartidaPropiaIn(BaseModel):
    cap_id: str
    nombre: str
    tipo:   str = Field(pattern=r"^(m2|unidad|hora|fijo)$")
    precio: float = Field(gt=0)
    unidad: Optional[str] = None

class PrecioUsuarioIn(BaseModel):
    svc_id: str
    precio: float = Field(gt=0)
