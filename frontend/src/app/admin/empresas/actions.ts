"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PlanTipoPersistido } from "@/lib/roles-planes-oficial";

/**
 * Acciones del Módulo Admin Empresas (02-PANEL-ADMIN-EMPRESAS.md §5, §12:
 * "El cambio de plan se realiza desde este módulo" / "La activación y
 * desactivación de empresas se realiza desde este módulo").
 * Ambas operan sobre `perfiles` (plan/onboarding), no sobre `empresas`
 * (que no almacena plan ni estado — ver nota en admin-queries.ts).
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
  gerenteUserId: string,
  activa: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }

  const { error } = await admin
    .from("perfiles")
    .update({ onboarding_done: activa })
    .eq("id", gerenteUserId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/empresas");
  return { ok: true };
}
