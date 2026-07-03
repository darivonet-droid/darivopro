/**
 * Actualiza plan_tipo tras pago confirmado — fuente única perfiles (04 §9)
 * Usa service role (webhook server-to-server).
 */
import { createAdminClient } from "@/lib/supabase/admin";
import type { PlanSuscripcionOficial } from "@/lib/roles-planes-oficial";

export async function activarPlanUsuario(
  userId: string,
  plan: PlanSuscripcionOficial
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("perfiles")
      .update({ plan_tipo: plan })
      .eq("id", userId);

    if (error) {
      console.error("activarPlanUsuario:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error("activarPlanUsuario:", e);
    return { ok: false, error: "No se pudo actualizar el plan" };
  }
}

/** Resuelve userId por email cuando el webhook de suscripción no trae order_id */
export async function userIdPorEmail(
  email: string
): Promise<string | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) {
      console.error("userIdPorEmail:", error);
      return null;
    }
    const user = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    return user?.id ?? null;
  } catch (e) {
    console.error("userIdPorEmail:", e);
    return null;
  }
}
