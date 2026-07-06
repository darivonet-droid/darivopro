/**
 * DARIVO PRO — Roles, Planes y Permisos (implementación Móvil)
 *
 * Fuente funcional:
 * - 12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md §6–§8, §16
 * - 04-PANEL-ADMIN-SUSCRIPCIONES.md §6 (catálogo oficial)
 * - 01-VISION-DEL-PRODUCTO.md §8 (secuencia suscripción → producto → rol → permisos)
 *
 * Darivo Pro Móvil NO administra roles ni permisos granulares (Doc 12 §16).
 * Aplica limitaciones del plan (`plan_tipo` en perfiles) y permisos de Empresa cuando existan (Tarea 05).
 */

/** Roles de plataforma (Doc 12 §6.1) */
export const ROLES_PLATAFORMA = ["administrador_darivo"] as const;

/** Roles del cliente (Doc 12 §6.2–§6.3 · Visión §8) */
export const ROLES_CLIENTE = ["gerente", "tecnico"] as const;

export type RolPlataforma = (typeof ROLES_PLATAFORMA)[number];
export type RolCliente = (typeof ROLES_CLIENTE)[number];

/**
 * Planes de suscripción oficiales (04 §6).
 * Únicos nombres comerciales aprobados: Básico · Pro · Business.
 */
export const PLANES_SUSCRIPCION_OFICIALES = ["basico", "pro", "business"] as const;
export type PlanSuscripcionOficial = (typeof PLANES_SUSCRIPCION_OFICIALES)[number];

/**
 * Valores en `perfiles.plan_tipo` (migración 005 + 20260706123000).
 * - `gratis`: estado sin suscripción de pago (5 cotizaciones totales — onboarding)
 * - `basico` | `pro` | `business`: planes oficiales (04 §6)
 */
export type PlanTipoPersistido = "gratis" | PlanSuscripcionOficial;

/** Límites de uso — referencia 04 §6 + implementación Móvil (Mi Plan / UpgradeModal) */
export const LIMITES_PLAN = {
  gratis: {
    presupuestosTotal: 5,
    facturasHabilitado: false,
    iaCotizacionesDia: 3,
    iaFacturasHabilitado: false,
  },
  basico: {
    presupuestosMes: 20,
    facturasHabilitado: false,
    iaCotizacionesDia: 5,
    iaFacturasHabilitado: false,
  },
  pro: {
    presupuestosMes: Infinity,
    facturasHabilitado: true,
    iaCotizacionesDia: Infinity,
    iaFacturasHabilitado: true,
  },
  business: {
    presupuestosMes: Infinity,
    facturasHabilitado: true,
    iaCotizacionesDia: Infinity,
    iaFacturasHabilitado: true,
    tecnicosIncluidos: 5,
    rolesPersonalizados: true,
  },
} as const;

export const PRECIOS_OFICIALES: Record<
  PlanSuscripcionOficial,
  { mensual: number; anual: number; nombre: string }
> = {
  basico: { mensual: 49, anual: 490, nombre: "BÁSICO" }, // provisional
  pro: { mensual: 79, anual: 790, nombre: "PRO" }, // provisional
  business: { mensual: 115, anual: 1150, nombre: "BUSINESS" }, // provisional, rango 115-120
};

/** Usuario solo Móvil = Gerente + Técnico simultáneamente (Visión §5 excepción) */
export const ROL_IMPLICITO_MOVIL_SOLO = "gerente_tecnico" as const;

/**
 * Matriz detallada de permisos por empleado: pendiente aprobación propietario (Doc 12 §8).
 * Móvil no implementa administración de permisos.
 */
export const MATRIZ_PERMISOS_APROBADA = false;

export function planTieneLimitesIlimitados(plan: PlanTipoPersistido): boolean {
  return plan === "pro" || plan === "business";
}

export function esPlanSuscripcionOficial(
  plan: string | null | undefined
): plan is PlanSuscripcionOficial {
  return plan === "basico" || plan === "pro" || plan === "business";
}
