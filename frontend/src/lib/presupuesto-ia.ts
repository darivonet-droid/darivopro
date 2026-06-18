import type { LineaPresupuesto } from "@/types";
import { calcIGV } from "@/lib/utils";

export const IA_SYSTEM_PROMPT =
  "Eres asistente de presupuestos para contratistas en Perú. Convierte descripción en JSON: {titulo, items:[{descripcion,cantidad,unidad,precio_unit,total}], subtotal, igv(subtotal*0.18), total}. Precios mercado Lima 2025.";

export interface IAPresupuestoItem {
  descripcion: string;
  cantidad: number;
  unidad: string;
  precio_unit: number;
  total: number;
}

export interface IAPresupuestoResult {
  titulo: string;
  items: IAPresupuestoItem[];
  subtotal: number;
  igv: number;
  total: number;
}

export interface PresupuestoDraft {
  clientName: string;
  phone: string;
  city: string;
  items: LineaPresupuesto[];
  margin: number;
  notes: string;
  iaResult?: IAPresupuestoResult | null;
}

export const DRAFT_STORAGE_KEY = "darivo_presupuesto_draft";

const CALC_MAP: Record<string, LineaPresupuesto["calcType"]> = {
  m2: "m2",
  m²: "m2",
  unit: "unit",
  unidad: "unit",
  hora: "hour",
  horas: "hour",
  hour: "hour",
  fijo: "fixed",
  fixed: "fixed",
};

export function iaItemsALineas(
  items: IAPresupuestoItem[],
  catLabel = "IA"
): LineaPresupuesto[] {
  return items.map((it, i) => ({
    svcId: `ia-${Date.now()}-${i}`,
    catLabel,
    svcLabel: it.descripcion,
    calcType: CALC_MAP[it.unidad?.toLowerCase()] ?? "fixed",
    basePrice: it.precio_unit,
    unit: it.unidad || "und",
    qty: it.cantidad,
    unitPrice: it.precio_unit,
    subtotal: it.total,
  }));
}

export function recalcularTotalesIA(items: IAPresupuestoItem[]): IAPresupuestoResult {
  const subtotal = Math.round(items.reduce((s, it) => s + it.total, 0) * 100) / 100;
  const { igv, total } = calcIGV(subtotal);
  return { titulo: "", items, subtotal, igv, total };
}

export function parseIAResponse(text: string): IAPresupuestoResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("La IA no devolvió JSON válido");
  const parsed = JSON.parse(jsonMatch[0]) as IAPresupuestoResult;
  if (!parsed.items?.length) throw new Error("Sin partidas en la respuesta");
  const subtotal =
    parsed.subtotal ??
    parsed.items.reduce((s, it) => s + Number(it.total ?? 0), 0);
  const { igv, total } = calcIGV(subtotal);
  return { ...parsed, subtotal, igv, total };
}

export function nextPresupuestoNum(secuencia = 1): string {
  return `P001-${String(secuencia).padStart(5, "0")}`;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const num = digits.startsWith("51") ? digits : `51${digits}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}
