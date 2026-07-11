// DARIVO PRO — Webhook dLocal Go (pagos + suscripciones)
import { NextRequest, NextResponse } from "next/server";
import { activarPlanUsuario, userIdPorEmail } from "@/lib/activar-plan";
import {
  ESTADOS_PAGO_EXITOSO,
  parseOrderId,
} from "@/lib/pagos-suscripcion";
import {
  esPlanSuscripcionOficial,
  type PlanSuscripcionOficial,
} from "@/lib/roles-planes-oficial";

type JsonRecord = Record<string, unknown>;

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function extractStatus(payload: JsonRecord): string | undefined {
  return (
    asString(payload.status) ??
    asString(payload.payment_status) ??
    asString((payload.payment as JsonRecord | undefined)?.status)
  )?.toUpperCase();
}

function extractOrderId(payload: JsonRecord): string | undefined {
  return (
    asString(payload.order_id) ??
    asString((payload.payment as JsonRecord | undefined)?.order_id) ??
    asString((payload.subscription as JsonRecord | undefined)?.order_id)
  );
}

function extractEmail(payload: JsonRecord): string | undefined {
  return (
    asString(payload.client_email) ??
    asString(payload.email) ??
    asString((payload.payer as JsonRecord | undefined)?.email) ??
    asString((payload.subscription as JsonRecord | undefined)?.client_email)
  );
}

/** Inferir plan desde nombre del plan dLocal (tokens env en dashboard) */
function planDesdeNombre(name: string | undefined): PlanSuscripcionOficial | null {
  if (!name) return null;
  const n = name.toLowerCase();
  if (n.includes("business")) return "business";
  if (n.includes("pro")) return "pro";
  if (n.includes("basico") || n.includes("básico") || n.includes("basic")) {
    return "basico";
  }
  return null;
}

function planDesdePayload(payload: JsonRecord): PlanSuscripcionOficial | null {
  const meta = payload.metadata as JsonRecord | undefined;
  const planMeta = asString(meta?.plan) ?? asString(payload.plan);
  if (esPlanSuscripcionOficial(planMeta)) return planMeta;

  const planObj = payload.plan as JsonRecord | undefined;
  const fromPlan = planDesdeNombre(asString(planObj?.name));
  if (fromPlan) return fromPlan;

  return planDesdeNombre(asString(payload.description));
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.DLOCALGO_WEBHOOK_SECRET?.trim();
  if (webhookSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  let payload: JsonRecord;
  try {
    payload = (await req.json()) as JsonRecord;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const status = extractStatus(payload);
  if (!status || !ESTADOS_PAGO_EXITOSO.has(status)) {
    return NextResponse.json({ received: true, action: "ignored", status });
  }

  const orderId = extractOrderId(payload);
  let userId: string | undefined;
  let plan: PlanSuscripcionOficial | null = null;

  if (orderId) {
    const parsed = parseOrderId(orderId);
    if (parsed) {
      userId = parsed.userId;
      plan = parsed.plan;
    }
  }

  if (!userId) {
    const email = extractEmail(payload);
    if (email) userId = (await userIdPorEmail(email)) ?? undefined;
  }

  if (!plan) plan = planDesdePayload(payload);

  if (!userId || !plan) {
    console.warn("webhook dLocal: no userId/plan", { orderId, status });
    return NextResponse.json({ received: true, action: "unmatched" });
  }

  const result = await activarPlanUsuario(userId, plan);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ received: true, action: "plan_activated", plan });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "darivo-dlocal-webhook" });
}
