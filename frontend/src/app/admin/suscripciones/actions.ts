"use server";

import { revalidatePath } from "next/cache";
import { errorSiNoEsAdmin, adminAutenticadoOError } from "@/lib/acceso-producto";
import { actualizarPlanCatalogo, type CambiosPlanCatalogo } from "@/lib/planes-catalogo";
import { cambiarPlanCuenta } from "@/lib/plan-cuenta";
import type { PlanTipoPersistido } from "@/lib/roles-planes-oficial";

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

const PLANES_VALIDOS: readonly PlanTipoPersistido[] = ["gratis", "basico", "pro", "business"];

/**
 * Cambia el plan de UNA CUENTA concreta — Tarea 3 FASE A (23/07/2026).
 * Es la "vista de suscripciones por usuario" que `04-PANEL-ADMIN-SUSCRIPCIONES.md`
 * dejaba anotada como fase posterior. El plan de una cuenta es metadato de
 * facturación, así que se administra desde aquí y no desde Admin → Usuarios.
 *
 * - Rol Admin revalidado **server-side** en cada llamada (`adminAutenticadoOError`),
 *   sin confiar en el cliente ni en que el middleware siga cubriendo /admin/*.
 * - La identidad del administrador que firma el cambio se resuelve de la sesión
 *   real en el servidor; el cliente no puede enviarla ni suplantarla.
 * - `motivo` es obligatorio: queda en el log `admin_plan_auditoria`.
 *
 * No toca el catálogo de planes (`actualizarPlanCatalogoAction`) ni ninguna
 * tabla de datos de cliente.
 */
export async function cambiarPlanCuentaAction(
  cuentaUserId: string,
  plan: PlanTipoPersistido,
  motivo: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await adminAutenticadoOError();
  if (!auth.ok) return auth;

  if (!cuentaUserId) return { ok: false, error: "Cuenta no indicada" };
  if (!PLANES_VALIDOS.includes(plan)) return { ok: false, error: "Plan no válido" };
  if (!motivo.trim()) return { ok: false, error: "Indica el motivo del cambio de plan" };

  const result = await cambiarPlanCuenta({
    cuentaUserId,
    planNuevo: plan,
    motivo,
    adminUserId: auth.adminUserId,
    adminEmail: auth.adminEmail,
  });

  if (result.ok) {
    revalidatePath("/admin/suscripciones");
    revalidatePath("/admin/usuarios");
  }
  return result;
}
