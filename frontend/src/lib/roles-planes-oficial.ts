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
    cotizacionesTotal: 5,
    facturasHabilitado: false,
    iaCotizacionesDia: 3,
    iaFacturasHabilitado: false,
  },
  basico: {
    cotizacionesMes: 20,
    facturasHabilitado: false,
    iaCotizacionesDia: 5,
    iaFacturasHabilitado: false,
  },
  pro: {
    cotizacionesMes: Infinity,
    facturasHabilitado: true,
    iaCotizacionesDia: Infinity,
    iaFacturasHabilitado: true,
  },
  business: {
    cotizacionesMes: Infinity,
    facturasHabilitado: true,
    iaCotizacionesDia: Infinity,
    iaFacturasHabilitado: true,
    tecnicosIncluidos: 5,
    rolesPersonalizados: true,
  },
} as const;

// Precios oficiales confirmados por el propietario 17/07/2026 — ya no
// provisionales. Anual = mensual × 10, sin descuento adicional, para los 3
// planes (regla explícita del propietario, misma sesión).
export const PRECIOS_OFICIALES: Record<
  PlanSuscripcionOficial,
  { mensual: number; anual: number; nombre: string }
> = {
  basico: { mensual: 49, anual: 490, nombre: "BÁSICO" },
  pro: { mensual: 89, anual: 890, nombre: "PRO" },
  business: { mensual: 130, anual: 1300, nombre: "BUSINESS" },
};

/** Usuario solo Móvil = Gerente + Técnico simultáneamente (Visión §5 excepción) */
export const ROL_IMPLICITO_MOVIL_SOLO = "gerente_tecnico" as const;

/**
 * Aprobación formal de la matriz detallada de permisos (Doc 12 §8) — decisión
 * exclusiva del propietario, NO del código.
 *
 * Desde la Etapa 6 (21/07/2026) la matriz real vive en `lib/matriz-permisos.ts`
 * (MATRIZ_PERMISOS) y la UI de Admin la renderiza dinámicamente aunque este
 * flag siga en false — el flag ya no oculta contenido decorativo; hoy solo
 * controla el banner de "aprobación formal pendiente" en Admin → Roles →
 * Permisos.
 *
 * Activado a `true` en la Etapa 7 (21/07/2026, decisión 6) — el propietario
 * aprobó formalmente la matriz tras resolver las decisiones de esa etapa
 * (Admin/Partner y Móvil, modelo de módulos activables en Empresa, Mis
 * Tarifas para Técnico, tickets de Partner). Efecto visible único: el banner
 * "Matriz operativa vigente... celdas pendientes de decisión del propietario"
 * ya no se muestra en Admin → Roles → Permisos. Las celdas que aún queden
 * `"pendiente"` (ej. Roles personalizados del Gerente, sistema construido
 * pero inerte) siguen sin resolver — este flag no las cierra, solo confirma
 * que la matriz en su conjunto ya tiene aprobación formal del propietario.
 */
export const MATRIZ_PERMISOS_APROBADA = true;

export function planTieneLimitesIlimitados(plan: PlanTipoPersistido): boolean {
  return plan === "pro" || plan === "business";
}

export function esPlanSuscripcionOficial(
  plan: string | null | undefined
): plan is PlanSuscripcionOficial {
  return plan === "basico" || plan === "pro" || plan === "business";
}
