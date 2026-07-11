/**
 * Actualiza plan_tipo tras pago confirmado — fuente única perfiles (04 §9)
 * Usa service role (webhook server-to-server).
 *
 * Plan Business también da acceso al producto Darivo Pro Empresa
 * (04-PANEL-ADMIN-SUSCRIPCIONES.md §6, nota de nomenclatura), lo que requiere
 * una fila en `empresas` (gerente_user_id) — sin ella, Roles Personalizados
 * y demás funcionalidad de Empresa no tienen dónde vivir. Antes de esta
 * función no existía ningún camino que la creara automáticamente.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import type { PlanSuscripcionOficial } from "@/lib/roles-planes-oficial";

async function asegurarEmpresaParaGerente(userId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: existente } = await admin
    .from("empresas")
    .select("id")
    .eq("gerente_user_id", userId)
    .maybeSingle();
  if (existente) return; // idempotente — no duplica si el webhook se reprocesa

  const { data: perfil } = await admin
    .from("perfiles")
    .select("razon_social")
    .eq("id", userId)
    .maybeSingle();

  let razonSocial = perfil?.razon_social?.trim();
  if (!razonSocial) {
    const { data: authUser } = await admin.auth.admin.getUserById(userId);
    razonSocial = authUser?.user?.email?.split("@")[0] ?? "Empresa sin nombre";
  }

  const { data: empresa, error } = await admin
    .from("empresas")
    .insert({ gerente_user_id: userId, razon_social: razonSocial })
    .select("id")
    .single();

  if (error || !empresa) {
    console.error("asegurarEmpresaParaGerente:", error);
    return; // no bloquea la activación del plan si esto falla
  }

  await admin.from("perfiles").update({ empresa_id: empresa.id }).eq("id", userId);
}

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

    if (plan === "business") {
      await asegurarEmpresaParaGerente(userId);
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
