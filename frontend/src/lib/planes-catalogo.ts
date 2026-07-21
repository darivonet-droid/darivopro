/**
 * DARIVO PRO — planes_catalogo (Etapa 7, 21/07/2026, decisión 7)
 *
 * Tabla real (`public.planes_catalogo`, existente desde el baseline —
 * `id, slug, nombre, precio_mensual, precio_anual, activo, limites jsonb,
 * created_at`) ahora editable desde Admin → Suscripciones. Antes de esta
 * etapa existía en el schema pero ningún código la leía ni la escribía.
 *
 * ⚠️ ALCANCE REAL (documentado también en la migración
 * 20260721222000_planes_catalogo_datos_oficiales.sql y en
 * AdminSuscripcionesView.tsx): esta tabla es un catálogo ADMINISTRATIVO.
 * `PRECIOS_OFICIALES`/`LIMITES_PLAN` (roles-planes-oficial.ts) siguen siendo
 * la ÚNICA fuente real que usan checkout, `/precios`, `lib/plan-limits.ts` y
 * los correos — nada de eso lee esta tabla todavía. Editar un plan aquí NO
 * cambia el precio real cobrado ni los límites aplicados. Recablear esos
 * consumidores es una fase 2, no construida en esta etapa.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export interface PlanCatalogoRow {
  id: string;
  slug: string;
  nombre: string;
  precioMensual: number;
  precioAnual: number;
  activo: boolean;
  /** Estructura libre — refleja hoy los mismos campos de LIMITES_PLAN (roles-planes-oficial.ts). */
  limites: Record<string, number | boolean | null>;
  createdAt: string;
}

interface PlanCatalogoDbRow {
  id: string;
  slug: string;
  nombre: string;
  precio_mensual: number | string;
  precio_anual: number | string;
  activo: boolean;
  limites: Record<string, number | boolean | null> | null;
  created_at: string;
}

function mapRow(row: PlanCatalogoDbRow): PlanCatalogoRow {
  return {
    id: row.id,
    slug: row.slug,
    nombre: row.nombre,
    precioMensual: Number(row.precio_mensual),
    precioAnual: Number(row.precio_anual),
    activo: row.activo,
    limites: row.limites ?? {},
    createdAt: row.created_at,
  };
}

const ORDEN_SLUG: Record<string, number> = { basico: 0, pro: 1, business: 2 };

export async function listarPlanesCatalogo(supabase?: SupabaseClient): Promise<PlanCatalogoRow[]> {
  const client = supabase ?? createAdminClient();
  const { data, error } = await client.from("planes_catalogo").select("*");
  if (error) throw error;
  return ((data ?? []) as PlanCatalogoDbRow[])
    .map(mapRow)
    .sort((a, b) => (ORDEN_SLUG[a.slug] ?? 99) - (ORDEN_SLUG[b.slug] ?? 99));
}

export interface CambiosPlanCatalogo {
  nombre?: string;
  precioMensual?: number;
  precioAnual?: number;
  activo?: boolean;
  limites?: Record<string, number | boolean | null>;
}

export async function actualizarPlanCatalogo(
  id: string,
  cambios: CambiosPlanCatalogo
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createAdminClient();
  const patch: Record<string, unknown> = {};
  if (cambios.nombre !== undefined) patch.nombre = cambios.nombre;
  if (cambios.precioMensual !== undefined) patch.precio_mensual = cambios.precioMensual;
  if (cambios.precioAnual !== undefined) patch.precio_anual = cambios.precioAnual;
  if (cambios.activo !== undefined) patch.activo = cambios.activo;
  if (cambios.limites !== undefined) patch.limites = cambios.limites;

  const { error } = await admin.from("planes_catalogo").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
