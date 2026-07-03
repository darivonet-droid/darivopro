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
 * Únicos nombres comerciales aprobados: Básico · Pro.
 */
export const PLANES_SUSCRIPCION_OFICIALES = ["basico", "pro"] as const;
export type PlanSuscripcionOficial = (typeof PLANES_SUSCRIPCION_OFICIALES)[number];

/**
 * Valores en `perfiles.plan_tipo` (migración 005).
 * - `gratis`: estado sin suscripción de pago (5 cotizaciones totales — onboarding)
 * - `basico` | `pro`: planes oficiales (04 §6)
 * - `empresa`: valor técnico legacy — NO es plan comercial (04 §6 prohíbe «Plan Empresa»).
 *   Se trata como Pro para límites hasta decisión propietario / Tarea 08.
 */
export type PlanTipoPersistido = "gratis" | PlanSuscripcionOficial | "empresa";

/** Límites de uso — referencia 04 §6 + implementación Móvil (Mi Plan / UpgradeModal) */
export const LIMITES_PLAN = {
  gratis: {
    presupuestosTotal: 5,
    facturasMes: null as number | null,
    iaDia: 3,
  },
  basico: {
    presupuestosMes: 20,
    facturasMes: 10,
    iaDia: 3,
  },
  pro: {
    presupuestosMes: Infinity,
    facturasMes: Infinity,
    iaDia: Infinity,
  },
} as const;

export const PRECIOS_OFICIALES: Record<
  PlanSuscripcionOficial,
  { mensual: number; anual: number; nombre: string }
> = {
  basico: { mensual: 39, anual: 390, nombre: "BÁSICO" },
  pro: { mensual: 79, anual: 790, nombre: "PRO" },
};

/** Usuario solo Móvil = Gerente + Técnico simultáneamente (Visión §5 excepción) */
export const ROL_IMPLICITO_MOVIL_SOLO = "gerente_tecnico" as const;

/**
 * Matriz detallada de permisos por empleado: pendiente aprobación propietario (Doc 12 §8).
 * Móvil no implementa administración de permisos.
 */
export const MATRIZ_PERMISOS_APROBADA = false;

export function planTieneLimitesIlimitados(plan: PlanTipoPersistido): boolean {
  return plan === "pro" || plan === "empresa";
}

export function esPlanSuscripcionOficial(
  plan: string | null | undefined
): plan is PlanSuscripcionOficial {
  return plan === "basico" || plan === "pro";
}
