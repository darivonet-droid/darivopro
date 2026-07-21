// DARIVO PRO — Mora de cobro: 3 días de gracia y modo solo lectura (21/07/2026)
//
// Regla de negocio ya cerrada (Etapa 1 de la auditoría de seguridad/roles):
// cuentas Empresa y Móvil tienen 3 días de gracia tras un fallo de cobro real;
// después la cuenta pasa a modo solo lectura. Admin y Partner excluidos.
//
// El refuerzo DURO vive en RLS (migración
// supabase/migrations/20260721120000_pago_fallido_solo_lectura.sql — función
// public.es_cuenta_solo_lectura() + políticas RESTRICTIVE de escritura). Este
// módulo cubre el lado de la app: marcar/limpiar la mora desde el webhook de
// dLocal y exponer el estado para la UI (banner de aviso).
//
// Tolerante a migración pendiente: si la columna perfiles.pago_fallido_desde
// aún no existe (Mohamed no corrió la migración todavía), todas las funciones
// degradan a no-op / estado "ok" sin romper ninguna pantalla — mismo patrón
// ya usado con perfiles.logo_url (19/07/2026).

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { esAdministradorDarivo, esPartnerAutorizado } from "@/lib/acceso-producto";

/** Debe coincidir con `interval '3 days'` de es_cuenta_solo_lectura() (SQL). */
export const DIAS_GRACIA_COBRO = 3;

const MS_POR_DIA = 86_400_000;

/**
 * Marca el inicio de la mora tras un webhook de cobro fallido de dLocal.
 * - Solo para cuentas con plan pagado: un checkout abandonado (CANCELLED/
 *   EXPIRED) de un usuario `gratis` no debe dejarlo en solo lectura.
 * - Idempotente: un reintento fallido NO reinicia el reloj de gracia.
 */
export async function marcarPagoFallido(userId: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("perfiles")
      .select("plan_tipo, pago_fallido_desde")
      .eq("id", userId)
      .maybeSingle();
    // error => columna inexistente (migración pendiente) u otro fallo: no-op.
    if (error || !data) return;
    if (data.plan_tipo === "gratis") return;
    if (data.pago_fallido_desde) return;

    await admin
      .from("perfiles")
      .update({ pago_fallido_desde: new Date().toISOString() })
      .eq("id", userId);
  } catch (e) {
    console.error("marcarPagoFallido:", e);
  }
}

/** Limpia la mora tras un pago exitoso (la cuenta vuelve a estar al día). */
export async function limpiarMoraPago(userId: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("perfiles")
      .update({ pago_fallido_desde: null })
      .eq("id", userId);
    if (error) return; // columna inexistente (migración pendiente): no-op.
  } catch (e) {
    console.error("limpiarMoraPago:", e);
  }
}

export type EstadoCobro =
  | { estado: "ok" }
  | { estado: "gracia"; limite: string } // ISO — fin de los 3 días de gracia
  | { estado: "solo_lectura"; desde: string }; // ISO — inicio de la mora

/**
 * Estado de cobro de la cuenta del usuario logueado, para la UI (banner).
 * Mismo criterio que es_cuenta_solo_lectura() en SQL, en este orden:
 * (1) resolver la cuenta/pagador real (el propio usuario, o el Gerente de su
 * empresa si es Técnico), (2) leer el estado de esa cuenta. Admin y Partner
 * siempre "ok" (excluidos por regla de negocio). Nunca decide por subdominio.
 */
export async function obtenerEstadoCobro(): Promise<EstadoCobro> {
  const OK: EstadoCobro = { estado: "ok" };
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return OK;
    if (esAdministradorDarivo(user.email)) return OK;

    const admin = createAdminClient();
    if (await esPartnerAutorizado(user.email, admin)) return OK;

    const { data: perfil, error } = await admin
      .from("perfiles")
      .select("empresa_id, plan_tipo, pago_fallido_desde")
      .eq("id", user.id)
      .maybeSingle();
    if (error || !perfil) return OK; // columna inexistente (migración pendiente)

    let desde: string | null = perfil.pago_fallido_desde ?? null;
    let planPagador: string | null = perfil.plan_tipo ?? null;

    if (perfil.empresa_id) {
      const { data: empresa } = await admin
        .from("empresas")
        .select("gerente_user_id")
        .eq("id", perfil.empresa_id)
        .maybeSingle();
      if (empresa && empresa.gerente_user_id !== user.id) {
        const { data: perfilGerente } = await admin
          .from("perfiles")
          .select("plan_tipo, pago_fallido_desde")
          .eq("id", empresa.gerente_user_id)
          .maybeSingle();
        desde = perfilGerente?.pago_fallido_desde ?? null;
        planPagador = perfilGerente?.plan_tipo ?? null;
      }
    }

    if (!desde || planPagador === "gratis") return OK;

    const limite = new Date(new Date(desde).getTime() + DIAS_GRACIA_COBRO * MS_POR_DIA);
    if (Date.now() < limite.getTime()) {
      return { estado: "gracia", limite: limite.toISOString() };
    }
    return { estado: "solo_lectura", desde };
  } catch {
    return OK; // sin service role en algún entorno local: no bloquear nada
  }
}
