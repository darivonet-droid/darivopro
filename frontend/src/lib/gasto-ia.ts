/** Prompts IA — Módulo Cierre (09-MODULO-CIERRE.md §6–§7) */

export interface GastoIAExtraccion {
  proveedor: string;
  fecha: string;
  categoria: string;
  metodoPago: string;
  total: number;
  descripcion: string;
}

export const CATEGORIAS_GASTO_OFICIALES = [
  "Materiales",
  "Herramientas",
  "Transporte",
  "Subcontrata",
  "Oficina",
  "Otros",
] as const;

export function buildGastoSystemPrompt(): string {
  return `Eres asistente de registro de gastos para contratistas en Perú.
Extrae información de facturas, boletas o recibos en soles (S/).

REGLAS:
- Moneda siempre PEN (S/)
- Fecha en formato YYYY-MM-DD; si no hay fecha, usa hoy
- Categoría: una de ${CATEGORIAS_GASTO_OFICIALES.join(", ")}
- Total: número decimal sin símbolo
- No inventes datos no visibles; usa cadena vacía si falta

Responde ÚNICAMENTE JSON:
{
  "proveedor": "",
  "fecha": "YYYY-MM-DD",
  "categoria": "Materiales",
  "metodoPago": "Efectivo",
  "total": 0,
  "descripcion": ""
}`;
}

export function normalizarGastoIA(raw: GastoIAExtraccion): GastoIAExtraccion {
  const cat = CATEGORIAS_GASTO_OFICIALES.includes(
    raw.categoria as (typeof CATEGORIAS_GASTO_OFICIALES)[number]
  )
    ? raw.categoria
    : "Otros";
  return {
    proveedor: (raw.proveedor ?? "").trim() || "Proveedor",
    fecha: /^\d{4}-\d{2}-\d{2}$/.test(raw.fecha ?? "")
      ? raw.fecha
      : new Date().toISOString().slice(0, 10),
    categoria: cat,
    metodoPago: (raw.metodoPago ?? "").trim() || "Efectivo",
    total: Math.max(0, Number(raw.total) || 0),
    descripcion: (raw.descripcion ?? "").trim(),
  };
}
