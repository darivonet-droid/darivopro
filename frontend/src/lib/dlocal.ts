/**
 * Cliente dLocal Go API — registro oficial 08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md §5.3
 * Docs: https://docs.dlocalgo.com/integration-api/
 */

export class DLocalConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DLocalConfigError";
  }
}

export class DLocalApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "DLocalApiError";
  }
}

function sandbox(): boolean {
  return process.env.DLOCALGO_SANDBOX !== "false";
}

export function dlocalApiBase(): string {
  return sandbox()
    ? "https://api-sbx.dlocalgo.com"
    : "https://api.dlocalgo.com";
}

export function dlocalCheckoutBase(): string {
  return sandbox()
    ? "https://checkout-sbx.dlocalgo.com"
    : "https://checkout.dlocalgo.com";
}

function authHeader(): string {
  const key = process.env.DLOCALGO_API_KEY;
  const secret = process.env.DLOCALGO_API_SECRET;
  if (!key || !secret) {
    throw new DLocalConfigError("DLOCALGO_API_KEY / DLOCALGO_API_SECRET no configuradas");
  }
  return `Bearer ${key}:${secret}`;
}

async function dlocalRequest<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(`${dlocalApiBase()}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let json: T | { message?: string; error?: string };
  try {
    json = text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    throw new DLocalApiError(`Respuesta inválida de dLocal (${res.status})`, res.status);
  }

  if (!res.ok) {
    const err = json as { message?: string; error?: string };
    throw new DLocalApiError(
      err.message ?? err.error ?? `Error dLocal (${res.status})`,
      res.status
    );
  }

  return json as T;
}

export interface DLocalPaymentCreateBody {
  currency: string;
  amount: number;
  country: string;
  order_id: string;
  description: string;
  success_url: string;
  back_url: string;
  notification_url: string;
  payer?: {
    name?: string;
    email?: string;
  };
}

export interface DLocalPaymentResponse {
  id?: string;
  status?: string;
  redirect_url?: string;
  order_id?: string;
}

/** Pago único con checkout redirect (04 §13 · Mi Plan) */
export async function dlocalCreatePayment(
  body: DLocalPaymentCreateBody
): Promise<DLocalPaymentResponse> {
  return dlocalRequest<DLocalPaymentResponse>("/v1/payments", {
    method: "POST",
    body,
  });
}

/** URL de suscripción recurrente cuando existen plan_token en env */
export function dlocalSubscribeUrl(planToken: string): string {
  return `${dlocalCheckoutBase()}/validate/subscription/${planToken}`;
}

export interface DLocalPlanCreateBody {
  name: string;
  description: string;
  country: string;
  currency: string;
  amount: number;
  frequency_type: "MONTHLY" | "YEARLY";
  frequency_value: number;
  notification_url: string;
  success_url: string;
  back_url: string;
  error_url: string;
}

export interface DLocalPlanResponse {
  plan_token?: string;
  subscribe_url?: string;
}

export async function dlocalCreatePlan(
  body: DLocalPlanCreateBody
): Promise<DLocalPlanResponse> {
  return dlocalRequest<DLocalPlanResponse>("/v1/subscription/plan", {
    method: "POST",
    body,
  });
}

export function appBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
