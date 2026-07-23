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
import { ESTADOS_PAGO_EXITOSO, parseOrderId } from "@/lib/pagos-suscripcion";
import { registrarCambioPlan } from "@/lib/plan-cuenta";

/**
 * ¿Este usuario tiene al menos un pago real y exitoso del plan Business?
 * Se apoya en `pagos_eventos.dlocal_order_id`, que ya codifica el plan
 * (`buildOrderId` — pagos-suscripcion.ts) — no hace falta columna nueva
 * para esta comprobación.
 */
async function tienePagoRealBusiness(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("pagos_eventos")
    .select("dlocal_order_id, estado")
    .eq("user_id", userId);

  return (data ?? []).some((ev) => {
    const estado = ev.estado?.toUpperCase();
    if (!estado || !ESTADOS_PAGO_EXITOSO.has(estado)) return false;
    if (!ev.dlocal_order_id) return false;
    return parseOrderId(ev.dlocal_order_id)?.plan === "business";
  });
}

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

/**
 * @param opts.origenPartnerId — presente solo cuando el plan se otorga porque
 * el usuario es un Partner activo (06-PANEL-ADMIN-PARTNERS.md §5.1 "Plan
 * regalado"), nunca en una activación por pago real (webhook). Se usa para
 * poder revocar el plan más adelante sin arriesgar a alguien que sí pagó
 * — ver `revocarBusinessSiFueRegaloPartner`.
 */
export async function activarPlanUsuario(
  userId: string,
  plan: PlanSuscripcionOficial,
  opts?: { origenPartnerId?: string }
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

      if (opts?.origenPartnerId) {
        // Otorgado por ser Partner activo — solo marca el origen si el
        // usuario no tiene ya un pago real propio (nunca pisa un plan pagado).
        const yaPago = await tienePagoRealBusiness(userId);
        if (!yaPago) {
          await admin
            .from("perfiles")
            .update({ plan_origen_partner_id: opts.origenPartnerId })
            .eq("id", userId);
        }
      } else {
        // Activación por pago real (webhook) — limpia cualquier marca de
        // "regalo de Partner" previa: ahora es un plan pagado, no revocable.
        await admin
          .from("perfiles")
          .update({ plan_origen_partner_id: null })
          .eq("id", userId);
      }
    }

    return { ok: true };
  } catch (e) {
    console.error("activarPlanUsuario:", e);
    return { ok: false, error: "No se pudo actualizar el plan" };
  }
}

/**
 * Revoca el Plan Business otorgado por ser Partner activo, cuando el Partner
 * deja de estar Activo (Pendiente/Suspendido) — 06-PANEL-ADMIN-PARTNERS.md
 * §5.1 "mientras permanezca activo". Solo revoca si:
 * 1. El origen registrado (`plan_origen_partner_id`) es exactamente este Partner.
 * 2. El usuario sigue en plan Business (si ya cambió, no hay nada que hacer).
 * 3. No tiene un pago real propio de Business (`tienePagoRealBusiness`) —
 *    si lo tiene, se queda en Business sin tocar nada.
 */
export async function revocarBusinessSiFueRegaloPartner(
  partnerId: string,
  userId: string,
  /**
   * Administrador que dispara la suspensión del Partner, para firmar el
   * registro de auditoría (hueco #2 del blindaje del 23/07/2026: esta
   * revocación degradaba una cuenta a `gratis` sin dejar rastro).
   *
   * Se pasa **explícitamente** desde la Server Action en vez de resolverlo
   * aquí leyendo la sesión: esta función es una lib, y si algún día se llamara
   * desde un cron o un webhook no habría sesión que leer. Es opcional para no
   * romper a ningún llamador; si falta, NO se inventa un actor — se omite el
   * registro y se deja constancia en `console.error`.
   */
  actor?: { adminUserId: string; adminEmail: string; partnerEmail?: string }
): Promise<void> {
  const admin = createAdminClient();
  const { data: perfil } = await admin
    .from("perfiles")
    .select("plan_origen_partner_id, plan_tipo")
    .eq("id", userId)
    .maybeSingle();

  if (!perfil) return;
  if (perfil.plan_origen_partner_id !== partnerId) return;
  if (perfil.plan_tipo !== "business") return;
  if (await tienePagoRealBusiness(userId)) return;

  const { error } = await admin
    .from("perfiles")
    .update({ plan_tipo: "gratis", plan_origen_partner_id: null })
    .eq("id", userId);

  if (error) {
    console.error("revocarBusinessSiFueRegaloPartner:", error);
    return;
  }

  // Rastro de la degradación. Se AÑADE el registro tras la escritura, sin
  // reencaminarla por `cambiarPlanCuenta()`: ese update toca además
  // `plan_origen_partner_id`, no es solo un cambio de plan.
  if (!actor) {
    console.error(
      `revocarBusinessSiFueRegaloPartner: cuenta ${userId} degradada a 'gratis' por la suspensión del partner ${partnerId}, SIN registrar en auditoría — no se recibió la identidad del administrador. No se inventa un actor.`
    );
    return;
  }

  await registrarCambioPlan({
    cuentaUserId: userId,
    planAnterior: "business",
    planNuevo: "gratis",
    motivo: `Revocación automática de Business por suspensión del partner ${actor.partnerEmail ?? partnerId}`,
    adminUserId: actor.adminUserId,
    adminEmail: actor.adminEmail,
  });
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
