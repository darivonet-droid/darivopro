// DARIVO PRO — Rol Gerente/Técnico (Empresa + Móvil), Tarea 2 de la cola
// pendiente (CLAUDE.md, 17/07/2026).
//
// Gerente = dueño de la empresa (empresas.gerente_user_id), acceso total
// dentro de su plan — sin cambios respecto a hoy.
// Técnico = fila en empresa_empleados vinculada por user_id. Solo ve
// Cotización; Factura y Diaria/Informe se activan por técnico individual
// desde Empresa (empresa_empleados.factura_habilitada/informe_habilitado);
// nunca ve "Mis planes".
// Usuario "solo Móvil" (sin empresa, Visión §5 excepción) = Gerente+Técnico
// simultáneo, acceso total — comportamiento sin cambios.
//
// empresa_empleados solo es legible por el Gerente vía RLS
// (empresa_empleados_gerente, baseline_v2.sql:773-775) — un Técnico no puede
// leer su propia fila con el cliente normal. Por eso este helper usa
// createAdminClient() (mismo patrón ya usado en auth/callback/route.ts para
// esta misma tabla) — se llama únicamente desde Server Components/Route
// Handlers de confianza, nunca se expone al navegador.
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PlanTipoPersistido } from "@/lib/roles-planes-oficial";

export type ContextoAcceso =
  | { rol: "invitado"; empresaId: null; planEfectivo: "gratis"; facturaHabilitada: false; informeHabilitado: false }
  | { rol: "solo"; empresaId: null; planEfectivo: PlanTipoPersistido; facturaHabilitada: true; informeHabilitado: true }
  | { rol: "gerente"; empresaId: string; planEfectivo: PlanTipoPersistido; facturaHabilitada: true; informeHabilitado: true }
  | { rol: "tecnico"; empresaId: string; planEfectivo: PlanTipoPersistido; facturaHabilitada: boolean; informeHabilitado: boolean };

const SIN_SESION: ContextoAcceso = {
  rol: "invitado",
  empresaId: null,
  planEfectivo: "gratis",
  facturaHabilitada: false,
  informeHabilitado: false,
};

/** Calcula el contexto de acceso del usuario logueado (sesión leída del server client actual). */
export async function obtenerContextoAcceso(): Promise<ContextoAcceso> {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return SIN_SESION;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    // Sin service role configurada (algún entorno local) — no degradar a
    // "sin acceso": mismo comportamiento de siempre (gerente/solo, sin
    // restricción de técnico), es preferible a bloquear todo el Móvil.
    return { rol: "solo", empresaId: null, planEfectivo: "gratis", facturaHabilitada: true, informeHabilitado: true };
  }

  const { data: perfil } = await admin
    .from("perfiles")
    .select("empresa_id, plan_tipo")
    .eq("id", user.id)
    .maybeSingle();

  const planPropio = (perfil?.plan_tipo as PlanTipoPersistido | undefined) ?? "gratis";

  if (!perfil?.empresa_id) {
    return { rol: "solo", empresaId: null, planEfectivo: planPropio, facturaHabilitada: true, informeHabilitado: true };
  }

  const { data: empresa } = await admin
    .from("empresas")
    .select("gerente_user_id")
    .eq("id", perfil.empresa_id)
    .maybeSingle();

  if (!empresa) {
    return { rol: "solo", empresaId: null, planEfectivo: planPropio, facturaHabilitada: true, informeHabilitado: true };
  }

  if (empresa.gerente_user_id === user.id) {
    return { rol: "gerente", empresaId: perfil.empresa_id, planEfectivo: planPropio, facturaHabilitada: true, informeHabilitado: true };
  }

  const { data: empleado } = await admin
    .from("empresa_empleados")
    .select("factura_habilitada, informe_habilitado")
    .eq("user_id", user.id)
    .eq("empresa_id", perfil.empresa_id)
    .maybeSingle();

  return {
    rol: "tecnico",
    empresaId: perfil.empresa_id,
    // plan_tipo del propio Técnico se fija al plan del Gerente en el
    // momento de la invitación (invitarEmpleadoAction) — no se recalcula
    // aquí en vivo para no depender de una lectura cross-usuario extra en
    // cada límite; si el Gerente cambia de plan, el Técnico requiere
    // re-invitación o ajuste manual (limitación conocida, documentada).
    planEfectivo: planPropio,
    facturaHabilitada: empleado?.factura_habilitada ?? false,
    informeHabilitado: empleado?.informe_habilitado ?? false,
  };
}
