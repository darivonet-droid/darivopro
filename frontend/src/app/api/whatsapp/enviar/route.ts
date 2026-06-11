// DARIVO PRO — Route Handler: Enviar WhatsApp
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { to, message, documentUrl } = await req.json();
  if (!to || !message)
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });

  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";
  const res = await fetch(`${backendUrl}/api/v1/whatsapp/enviar`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Service-Key": process.env.SERVICE_KEY! },
    body: JSON.stringify({ to, message, documentUrl }),
  });

  if (!res.ok) return NextResponse.json({ error: "Error WhatsApp" }, { status: 500 });
  return NextResponse.json({ data: await res.json() });
}
