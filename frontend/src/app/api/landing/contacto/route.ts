// DARIVO PRO — Widget de chat de la landing pública (visitantes sin cuenta).
// Ruta pública (sin sesión, igual que /api/darivo/chat y
// /api/partners/registrar-referido) — el middleware ya excluye /api/* por
// completo (frontend/src/middleware.ts matcher). Best-effort: nunca devuelve
// error al cliente, para que el widget siempre confirme recepción, igual que
// el resto de eventos de email de este proyecto (ver lib/email/send.ts).
import { NextRequest, NextResponse } from "next/server";
import { enviarContactoLanding } from "@/lib/email/send";

const MAX_LEN = 2000;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const { nombre, contacto, mensaje } = (body ?? {}) as Record<string, unknown>;

  if (typeof nombre !== "string" || !nombre.trim() || typeof mensaje !== "string" || !mensaje.trim()) {
    // Falta lo mínimo — no hay nada real que enviar, pero igual no es un
    // error del visitante que valga la pena mostrar distinto en el widget.
    return NextResponse.json({ ok: true });
  }

  await enviarContactoLanding({
    nombre: nombre.trim().slice(0, 200),
    contacto: typeof contacto === "string" ? contacto.trim().slice(0, 200) : "",
    mensaje: mensaje.trim().slice(0, MAX_LEN),
  }).catch((e) => {
    console.error("[api/landing/contacto] no se pudo enviar:", e);
  });

  return NextResponse.json({ ok: true });
}
