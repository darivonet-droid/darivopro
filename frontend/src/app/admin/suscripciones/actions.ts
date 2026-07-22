"use server";

import { revalidatePath } from "next/cache";
import { errorSiNoEsAdmin } from "@/lib/acceso-producto";
import { actualizarPlanCatalogo, type CambiosPlanCatalogo } from "@/lib/planes-catalogo";

/**
 * Edita nombre/precio/límites/activo de uno de los 3 planes existentes en
 * `planes_catalogo` — Etapa 7 (21/07/2026, decisión 7). Nunca crea un plan
 * nuevo (no expone insert, solo update sobre un id ya existente).
 *
 * ⚠️ Ver advertencia de alcance en lib/planes-catalogo.ts: esto NO cambia el
 * precio real de checkout ni los límites aplicados hoy (esos siguen en
 * PRECIOS_OFICIALES/LIMITES_PLAN, constantes TS sin recablear a esta tabla).
 */
export async function actualizarPlanCatalogoAction(
  id: string,
  cambios: CambiosPlanCatalogo
): Promise<{ ok: true } | { ok: false; error: string }> {
  const errorAuth = await errorSiNoEsAdmin();
  if (errorAuth) return { ok: false, error: errorAuth };

  if (cambios.nombre !== undefined && !cambios.nombre.trim()) {
    return { ok: false, error: "El nombre no puede quedar vacío" };
  }
  if (cambios.precioMensual !== undefined && (!Number.isFinite(cambios.precioMensual) || cambios.precioMensual < 0)) {
    return { ok: false, error: "Precio mensual inválido" };
  }
  if (cambios.precioAnual !== undefined && (!Number.isFinite(cambios.precioAnual) || cambios.precioAnual < 0)) {
    return { ok: false, error: "Precio anual inválido" };
  }

  const result = await actualizarPlanCatalogo(id, cambios);
  if (result.ok) revalidatePath("/admin/suscripciones");
  return result;
}
