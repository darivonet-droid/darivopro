// DARIVO PRO — Route Handler: Enlace WhatsApp (sin backend FastAPI)
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { to, message, documentUrl } = await req.json();
  if (!to || !message)
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });

  const digits = String(to).replace(/\D/g, "");
  const numero = digits.startsWith("51") ? digits : `51${digits}`;
  const fullMessage = documentUrl ? `${message}\n\nPDF: ${documentUrl}` : message;
  const waUrl = `https://wa.me/${numero}?text=${encodeURIComponent(fullMessage)}`;

  // Legacy compatible response shape
  return NextResponse.json({ data: { waUrl } });
}
