// DARIVO PRO — Recibe el evento de "nueva fila en partner_comisiones_historial"
// y dispara el email de Comisión ganada (partners@).
//
// ⚠️ Requiere configuración manual pendiente del propietario — no se puede
// hacer desde código: Supabase Dashboard → Database → Webhooks → Create a
// new hook → tabla `partner_comisiones_historial`, evento `INSERT`, tipo
// "HTTP Request" → URL: https://<tu-dominio>/api/webhooks/supabase/partner-comision,
// método POST, header `Authorization: Bearer <SUPABASE_WEBHOOK_SECRET>` (mismo
// valor que la variable de entorno de abajo).
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarComisionGanada } from "@/lib/email/send";

interface SupabaseWebhookPayload {
  type: string;
  table: string;
  record: {
    partner_id: string;
    tipo: "venta" | "hito";
    monto: number;
    moneda: string;
  } | null;
}

export async function POST(req: NextRequest) {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET?.trim();
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  let body: SupabaseWebhookPayload;
  try {
    body = (await req.json()) as SupabaseWebhookPayload;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (body.type !== "INSERT" || !body.record) {
    return NextResponse.json({ received: true, action: "ignored" });
  }

  const { partner_id, tipo, monto, moneda } = body.record;
  const admin = createAdminClient();
  const { data: partner } = await admin
    .from("partners")
    .select("nombre, email")
    .eq("id", partner_id)
    .maybeSingle();

  if (!partner?.email) {
    return NextResponse.json({ received: true, action: "unmatched" });
  }

  await enviarComisionGanada(partner.email, {
    nombre: partner.nombre,
    monto,
    moneda,
    tipo,
  });

  return NextResponse.json({ received: true, action: "email_enviado" });
}
