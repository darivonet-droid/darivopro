/**
 * Pagos y suscripciones — 04-PANEL-ADMIN-SUSCRIPCIONES.md · 07-MODULO-MAS.md §8
 */

import {
  PRECIOS_OFICIALES,
  type PlanSuscripcionOficial,
} from "@/lib/roles-planes-oficial";
import { dlocalSubscribeUrl } from "@/lib/dlocal";

export type CicloPago = "mensual" | "anual";

export interface CheckoutPlanRequest {
  plan: PlanSuscripcionOficial;
  ciclo: CicloPago;
}

const ENV_PLAN_TOKEN: Record<string, string | undefined> = {
  "basico:mensual": process.env.DLOCALGO_PLAN_BASICO_MENSUAL,
  "basico:anual": process.env.DLOCALGO_PLAN_BASICO_ANUAL,
  "pro:mensual": process.env.DLOCALGO_PLAN_PRO_MENSUAL,
  "pro:anual": process.env.DLOCALGO_PLAN_PRO_ANUAL,
  "business:mensual": process.env.DLOCALGO_PLAN_BUSINESS_MENSUAL,
  "business:anual": process.env.DLOCALGO_PLAN_BUSINESS_ANUAL,
};

export function montoPlan(plan: PlanSuscripcionOficial, ciclo: CicloPago): number {
  const p = PRECIOS_OFICIALES[plan];
  return ciclo === "mensual" ? p.mensual : p.anual;
}

export function descripcionPlan(plan: PlanSuscripcionOficial, ciclo: CicloPago): string {
  const p = PRECIOS_OFICIALES[plan];
  const periodo = ciclo === "mensual" ? "mensual" : "anual";
  return `Darivo Pro ${p.nombre} — suscripción ${periodo}`;
}

/** order_id codifica userId + plan para webhook (sin tabla BD — DT-08-02) */
export function buildOrderId(
  userId: string,
  plan: PlanSuscripcionOficial,
  ciclo: CicloPago
): string {
  const ts = Date.now();
  return `darivo-${userId}-${plan}-${ciclo}-${ts}`;
}

export interface ParsedOrderId {
  userId: string;
  plan: PlanSuscripcionOficial;
  ciclo: CicloPago;
}

export function parseOrderId(orderId: string): ParsedOrderId | null {
  const m = /^darivo-([0-9a-f-]{36})-(basico|pro|business)-(mensual|anual)-\d+$/i.exec(
    orderId.trim()
  );
  if (!m) return null;
  return {
    userId: m[1],
    plan: m[2] as PlanSuscripcionOficial,
    ciclo: m[3] as CicloPago,
  };
}

export function planTokenSuscripcion(
  plan: PlanSuscripcionOficial,
  ciclo: CicloPago
): string | undefined {
  return ENV_PLAN_TOKEN[`${plan}:${ciclo}`]?.trim() || undefined;
}

export function urlCheckoutSuscripcion(
  plan: PlanSuscripcionOficial,
  ciclo: CicloPago
): string | null {
  const token = planTokenSuscripcion(plan, ciclo);
  if (!token) return null;
  return dlocalSubscribeUrl(token);
}

/** Estados dLocal que activan plan (pago único o suscripción) */
export const ESTADOS_PAGO_EXITOSO = new Set([
  "PAID",
  "COMPLETED",
  "CONFIRMED",
  "ACTIVE",
  "APPROVED",
]);

export const ESTADOS_PAGO_FALLIDO = new Set([
  "REJECTED",
  "CANCELLED",
  "CANCELED",
  "FAILED",
  "EXPIRED",
]);
