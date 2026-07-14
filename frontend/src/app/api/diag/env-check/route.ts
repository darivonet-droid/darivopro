// DIAG TEMPORAL 14/07/2026 — verificar a qué proyecto Supabase apunta cada
// variable de entorno de producción, sin exponer ningún valor completo.
// Solo decodifica el campo "ref"/"role" del payload del JWT (público por
// diseño en un JWT, no es la firma/secreto) — nunca el token entero.
// Retirar después de confirmar la causa del error de signup.
import { NextResponse } from "next/server";

function decodeJwtRef(token: string | undefined): { ref?: string; role?: string; error?: string } {
  if (!token) return { error: "missing" };
  try {
    const parts = token.split(".");
    if (parts.length < 2) return { error: "not-a-jwt" };
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    return { ref: payload.ref, role: payload.role };
  } catch {
    return { error: "decode-failed" };
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const urlRef = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1] ?? null;
  const anon = decodeJwtRef(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const service = decodeJwtRef(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return NextResponse.json({
    urlRef,
    anonRef: anon.ref ?? null,
    anonRole: anon.role ?? null,
    anonError: anon.error ?? null,
    serviceRef: service.ref ?? null,
    serviceRole: service.role ?? null,
    serviceError: service.error ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  });
}
