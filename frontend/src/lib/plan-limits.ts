import type { SupabaseClient } from "@supabase/supabase-js";
import {
  LIMITES_PLAN,
  type PlanTipoPersistido,
  planTieneLimitesIlimitados,
} from "@/lib/roles-planes-oficial";

export type PlanTipo = PlanTipoPersistido;

export type UpgradeRazon =
  | "cotizaciones_gratis"
  | "cotizaciones_basico"
  | "facturas_basico"
  | "ia_limite"
  | "roles_personalizados_limite";

export const UPGRADE_MENSAJES: Record<UpgradeRazon, { titulo: string; subtitulo: string }> = {
  cotizaciones_gratis: {
    titulo: "Límite de prueba gratuita",
    subtitulo: "Ya usaste tus 5 cotizaciones. Pásate a Pro para seguir trabajando.",
  },
  cotizaciones_basico: {
    titulo: "Límite mensual alcanzado",
    subtitulo: "Tu plan Básico incluye 20 cotizaciones/mes. Pro es ilimitado.",
  },
  facturas_basico: {
    titulo: "Límite de facturas",
    subtitulo: "Facturación no disponible en tu plan. Pásate a Pro o Business para facturar.",
  },
  ia_limite: {
    titulo: "Límite de IA diario",
    subtitulo: "3 llamadas/día en prueba gratuita y plan Básico. Pro: IA ilimitada.",
  },
  roles_personalizados_limite: {
    titulo: "Límite de roles personalizados",
    subtitulo:
      "Has alcanzado el máximo de roles personalizados de tu empresa. Contacta a soporte o solicita ampliación desde tu suscripción Business.",
  },
};

function inicioMesISO(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function obtenerPlanTipo(
  supabase: SupabaseClient
): Promise<PlanTipo> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "gratis";
  const { data } = await supabase
    .from("perfiles")
    .select("plan_tipo")
    .eq("id", user.id)
    .single();
  const plan = data?.plan_tipo as PlanTipo | undefined;
  return plan ?? "gratis";
}

export async function verificarLimiteCotizacion(
  supabase: SupabaseClient
): Promise<{ ok: true } | { ok: false; razon: UpgradeRazon }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, razon: "cotizaciones_gratis" };

  const plan = await obtenerPlanTipo(supabase);
  if (planTieneLimitesIlimitados(plan)) return { ok: true };

  if (plan === "gratis") {
    const { count } = await supabase
      .from("presupuestos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    if ((count ?? 0) >= LIMITES_PLAN.gratis.cotizacionesTotal) {
      return { ok: false, razon: "cotizaciones_gratis" };
    }
    return { ok: true };
  }

  const { count } = await supabase
    .from("presupuestos")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", inicioMesISO());

  if ((count ?? 0) >= LIMITES_PLAN.basico.cotizacionesMes) {
    return { ok: false, razon: "cotizaciones_basico" };
  }
  return { ok: true };
}

export async function verificarLimiteFactura(
  supabase: SupabaseClient
): Promise<{ ok: true } | { ok: false; razon: UpgradeRazon }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, razon: "facturas_basico" };

  const plan = await obtenerPlanTipo(supabase);
  if (plan === "basico") {
    return { ok: false, razon: "facturas_basico" };
  }
  if (planTieneLimitesIlimitados(plan)) return { ok: true };

  if (plan === "gratis") return { ok: true };

  return { ok: true };
}

export async function verificarLimiteIA(
  supabase: SupabaseClient
): Promise<{ ok: true; restantes?: number } | { ok: false; razon: UpgradeRazon }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, razon: "ia_limite" };

  const plan = await obtenerPlanTipo(supabase);
  if (planTieneLimitesIlimitados(plan)) return { ok: true };

  const limite =
    plan === "basico"
      ? LIMITES_PLAN.basico.iaCotizacionesDia
      : LIMITES_PLAN.gratis.iaCotizacionesDia;
  const hoy = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("ia_uso_diario")
    .select("llamadas")
    .eq("user_id", user.id)
    .eq("fecha", hoy)
    .maybeSingle();

  const usadas = data?.llamadas ?? 0;
  if (usadas >= limite) return { ok: false, razon: "ia_limite" };
  return { ok: true, restantes: limite - usadas };
}

export async function verificarLimiteRolesPersonalizados(
  supabase: SupabaseClient,
  empresaId: string
): Promise<{ ok: true; limite: number | null; activos: number } | { ok: false; razon: UpgradeRazon; limite: number; activos: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, razon: "roles_personalizados_limite", limite: 0, activos: 0 };
  }

  const plan = await obtenerPlanTipo(supabase);
  if (plan !== "business") {
    return { ok: false, razon: "roles_personalizados_limite", limite: 0, activos: 0 };
  }

  const { count: activos } = await supabase
    .from("roles_personalizados")
    .select("*", { count: "exact", head: true })
    .eq("empresa_id", empresaId)
    .eq("activo", true);

  const { data: suscripcion } = await supabase
    .from("suscripciones")
    .select("limite_roles_personalizados")
    .eq("user_id", user.id)
    .maybeSingle();

  const limite = suscripcion?.limite_roles_personalizados ?? null;
  const totalActivos = activos ?? 0;

  if (limite !== null && totalActivos >= limite) {
    return { ok: false, razon: "roles_personalizados_limite", limite, activos: totalActivos };
  }

  return { ok: true, limite, activos: totalActivos };
}

export async function registrarUsoIA(supabase: SupabaseClient): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { data, error } = await supabase.rpc("incrementar_ia_uso", { p_user_id: user.id });
  if (error) {
    const hoy = new Date().toISOString().slice(0, 10);
    const { data: row } = await supabase
      .from("ia_uso_diario")
      .select("llamadas")
      .eq("user_id", user.id)
      .eq("fecha", hoy)
      .maybeSingle();
    const next = (row?.llamadas ?? 0) + 1;
    await supabase.from("ia_uso_diario").upsert(
      { user_id: user.id, fecha: hoy, llamadas: next },
      { onConflict: "user_id,fecha" }
    );
    return next;
  }
  return data as number;
}
