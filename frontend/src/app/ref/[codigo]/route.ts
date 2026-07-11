// DARIVO PRO — Captura de enlace de Partner (/ref/{codigo})
// Setea cookie de tracking si el código existe y redirige siempre a /registro.
// Un código inválido o inexistente nunca bloquea — sigue como registro normal.
import { NextResponse, type NextRequest } from "next/server";
import { findPartnerByCodigo, REF_COOKIE_NAME, REF_COOKIE_MAX_AGE_SECONDS } from "@/lib/ecosystem-store";

export async function GET(
  request: NextRequest,
  { params }: { params: { codigo: string } }
) {
  const { origin } = new URL(request.url);
  const res = NextResponse.redirect(`${origin}/registro`);

  const codigo = params.codigo?.trim();
  if (codigo) {
    const partner = await findPartnerByCodigo(codigo);
    if (partner) {
      res.cookies.set(REF_COOKIE_NAME, codigo.toUpperCase(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: REF_COOKIE_MAX_AGE_SECONDS,
        path: "/",
      });
    }
  }

  return res;
}
