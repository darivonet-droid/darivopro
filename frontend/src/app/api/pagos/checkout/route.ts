// DARIVO PRO — Checkout dLocal Go (Mi Plan · /precios)
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  appBaseUrl,
  dlocalCreatePayment,
  DLocalConfigError,
  DLocalApiError,
} from "@/lib/dlocal";
import {
  buildOrderId,
  descripcionPlan,
  montoPlan,
  urlCheckoutSuscripcion,
  type CheckoutPlanRequest,
  type CicloPago,
} from "@/lib/pagos-suscripcion";
import {
  esPlanSuscripcionOficial,
  type PlanSuscripcionOficial,
} from "@/lib/roles-planes-oficial";

function parseBody(body: unknown): CheckoutPlanRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const plan = b.plan;
  const ciclo = b.ciclo;
  if (typeof plan !== "string" || !esPlanSuscripcionOficial(plan)) return null;
  if (ciclo !== "mensual" && ciclo !== "anual") return null;
  return { plan, ciclo: ciclo as CicloPago };
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Inicia sesión para suscribirte" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const checkout = parseBody(body);
  if (!checkout) {
    return NextResponse.json(
      { error: "Plan inválido — use basico|pro|business y mensual|anual" },
      { status: 400 }
    );
  }

  const { plan, ciclo } = checkout;
  const base = appBaseUrl();
  const successUrl = `${base}/mas/plan?pago=ok`;
  const backUrl = `${base}/mas/plan?pago=cancelado`;
  const notificationUrl = `${base}/api/pagos/webhook`;

  const subscribeUrl = urlCheckoutSuscripcion(plan, ciclo);
  if (subscribeUrl) {
    return NextResponse.json({
      redirectUrl: subscribeUrl,
      modo: "suscripcion",
      plan,
      ciclo,
    });
  }

  try {
    const orderId = buildOrderId(user.id, plan, ciclo);
    const amount = montoPlan(plan, ciclo);
    const payment = await dlocalCreatePayment({
      currency: "PEN",
      amount,
      country: "PE",
      order_id: orderId,
      description: descripcionPlan(plan, ciclo),
      success_url: successUrl,
      back_url: backUrl,
      notification_url: notificationUrl,
      payer: {
        email: user.email ?? undefined,
        name: user.user_metadata?.razon_social ?? user.email ?? undefined,
      },
    });

    const redirectUrl = payment.redirect_url;
    if (!redirectUrl) {
      return NextResponse.json(
        { error: "dLocal no devolvió URL de checkout" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      redirectUrl,
      modo: "pago",
      plan,
      ciclo,
      paymentId: payment.id,
    });
  } catch (e) {
    if (e instanceof DLocalConfigError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    if (e instanceof DLocalApiError) {
      return NextResponse.json({ error: e.message }, { status: 502 });
    }
    console.error("checkout error:", e);
    return NextResponse.json({ error: "No se pudo iniciar el pago" }, { status: 500 });
  }
}
