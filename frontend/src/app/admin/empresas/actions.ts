"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PlanTipoPersistido } from "@/lib/roles-planes-oficial";

/**
 * Acciones del Módulo Admin Empresas (02-PANEL-ADMIN-EMPRESAS.md §5, §12:
 * "El cambio de plan se realiza desde este módulo" / "La activación y
 * desactivación de empresas se realiza desde este módulo").
 * Cambiar plan opera sobre `perfiles.plan_tipo` (el plan vive en el gerente,
 * no en `empresas`). Activar/desactivar opera sobre `empresas.activo`
 * (migración 20260709180000).
 */
export async function cambiarPlanEmpresaAction(
  gerenteUserId: string,
  plan: PlanTipoPersistido
): Promise<{ ok: true } | { ok: false; error: string }> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }

  const { error } = await admin
    .from("perfiles")
    .update({ plan_tipo: plan })
    .eq("id", gerenteUserId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/empresas");
  return { ok: true };
}

export async function setEmpresaActivaAction(
  empresaId: string,
  activa: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }

  const { error } = await admin
    .from("empresas")
    .update({ activo: activa })
    .eq("id", empresaId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/empresas");
  return { ok: true };
}
