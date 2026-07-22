import type { Capitulo, LineaCotizacion } from "@/types";
import { calcIGV } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Partida en el resultado IA.
 * svcId/catLabel vienen del catálogo real cuando la IA los mapea correctamente.
 * precio_unit SIEMPRE proviene del catálogo — nunca inventado por la IA.
 */
export interface IACotizacionItem {
  descripcion: string;
  cantidad:    number;
  unidad:      string;
  precio_unit: number;
  total:       number;
  svcId?:      string;   // ID real del catálogo
  catLabel?:   string;   // Nombre del capítulo
  sugerida?:   boolean;  // Propuesta por IA, no mencionada explícitamente
}

export interface IACotizacionResult {
  titulo:           string;
  items:            IACotizacionItem[];
  subtotal:         number;
  igv:              number;
  total:            number;
  notasFaltantes?:  string[];  // trabajos mencionados sin partida equivalente
}

export interface CotizacionDraft {
  clientName: string;
  phone:      string;
  city:       string;
  items:      LineaCotizacion[];
  margin:     number;
  notes:      string;
  iaResult?:  IACotizacionResult | null;
  /** Carrito real del wizard manual (forma local `BasketItem[]`, distinta de
   * `items`/`LineaCotizacion[]` que usa el flujo IA) — opcional para no
   * afectar el draft del flujo IA, que nunca lo escribe. Ver hallazgo
   * "borrador no persiste el basket real", CLAUDE.md 16/07/2026. */
  basket?:    unknown[];
}

export const DRAFT_STORAGE_KEY = "darivo_cotizacion_draft";
/** Handoff IA → wizard Resumen (08-MODULO-IA.md §9) */
export const WIZARD_IA_SESSION_KEY = "darivo_wizard_ia_handoff";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CALC_MAP: Record<string, LineaCotizacion["calcType"]> = {
  m2: "m2", "m²": "m2",
  unit: "unit", unidad: "unit", und: "unit", pto: "unit",
  hora: "hour", horas: "hour", h: "hour", hour: "hour",
  fijo: "fixed", fixed: "fixed",
};

/**
 * Convierte los items IA en LineaCotizacion para guardar en Supabase.
 * Usa svcId real del catálogo cuando está disponible.
 * Omite items con cantidad = 0.
 */
export function iaItemsALineas(
  items:           IACotizacionItem[],
  defaultCatLabel = "IA"
): LineaCotizacion[] {
  return items
    .filter((it) => it.cantidad > 0)
    .map((it, i) => ({
      svcId:     it.svcId ?? `ia-${Date.now()}-${i}`,
      catLabel:  it.catLabel ?? defaultCatLabel,
      svcLabel:  it.descripcion,
      calcType:  CALC_MAP[it.unidad?.toLowerCase()] ?? "fixed",
      basePrice: it.precio_unit,
      unit:      it.unidad || "und",
      qty:       it.cantidad,
      unitPrice: it.precio_unit,
      subtotal:  it.total,
    }));
}

export function recalcularTotalesIA(items: IACotizacionItem[]): IACotizacionResult {
  const subtotal = Math.round(items.reduce((s, it) => s + it.total, 0) * 100) / 100;
  const { igv, total } = calcIGV(subtotal);
  return { titulo: "", items, subtotal, igv, total };
}

export function parseIAResponse(text: string): IACotizacionResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("La IA no devolvió JSON válido");
  const parsed = JSON.parse(jsonMatch[0]) as IACotizacionResult;
  if (!parsed.items?.length) throw new Error("Sin partidas en la respuesta");
  const subtotal =
    parsed.subtotal ??
    parsed.items.reduce((s, it) => s + Number(it.total ?? 0), 0);
  const { igv, total } = calcIGV(subtotal);
  return { ...parsed, subtotal, igv, total };
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

/**
 * Genera un prompt compacto del catálogo para el system prompt de OpenAI.
 * Formato: CAPÍTULO [id]: id_partida | nombre | unidad | precio
 */
export function buildCatalogPrompt(catalogo: Capitulo[]): string {
  return catalogo
    .map((cap) => {
      const partidas = cap.partidas
        .map((p) => `  ${p.id} | ${p.nombre} | ${p.unidad} | S/${p.precio}`)
        .join("\n");
      return `${cap.nombre.toUpperCase()} [${cap.id}]:\n${partidas}`;
    })
    .join("\n\n");
}

/**
 * System prompt completo con catálogo embebido.
 * Se genera en el servidor donde el catálogo ya está mezclado con overrides del usuario.
 */
export function buildSystemPrompt(catalogo: Capitulo[]): string {
  const catalogText = buildCatalogPrompt(catalogo);
  return `Eres asistente de cotizaciones para contratistas en Perú. \
Analiza la descripción de obra y mapea cada trabajo al servicio más cercano del CATÁLOGO OFICIAL.

REGLAS CRÍTICAS:
1. SOLO usa los svcId exactos del catálogo — jamás inventes un ID nuevo
2. NUNCA inventes precios — el sistema aplica los precios del catálogo
3. Extrae cantidades y unidades del texto (números, m², ml, unidades, puntos, h, etc.)
4. Si el texto no menciona cantidad, estima según contexto (baño estándar ≈ 8 m² paredes; dormitorio ≈ 12 m²; sala ≈ 20 m²)
5. Sugiere partidas relacionadas que casi siempre acompañan el trabajo (ej: tarrajeo implica pintura; punto de agua implica punto de desagüe)
6. Si un trabajo mencionado no tiene equivalente en el catálogo, inclúyelo en "notasFaltantes"

CATÁLOGO OFICIAL (usa solo estos IDs):
${catalogText}

Responde ÚNICAMENTE con JSON sin markdown:
{
  "titulo": "descripción breve en 5 palabras máx",
  "items": [
    {"svcId": "alb-tarrajeo", "qty": 24, "sugerida": false, "nota": "paredes baño"},
    {"svcId": "pin-interior", "qty": 24, "sugerida": true, "nota": "paredes nuevas suelen pintarse"}
  ],
  "notasFaltantes": ["retirada de escombros — sin equivalente en catálogo"]
}`;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const num = digits.startsWith("51") ? digits : `51${digits}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

// Legacy — kept for backwards compat (draft restore)
export const IA_SYSTEM_PROMPT =
  "Eres asistente de cotizaciones para contratistas en Perú. Convierte descripción en JSON: {titulo, items:[{descripcion,cantidad,unidad,precio_unit,total}], subtotal, igv(subtotal*0.18), total}. Precios mercado Lima 2025.";
