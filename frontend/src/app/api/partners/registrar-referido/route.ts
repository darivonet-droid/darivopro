// DARIVO PRO — Registra un referido de Partner tras un registro exitoso
// Solo se usa cuando signUp() devuelve sesión inmediata (sin confirmación de
// correo) — el caso con confirmación de correo se resuelve en /auth/callback.
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { registrarReferidoSiCorresponde, REF_COOKIE_NAME } from "@/lib/ecosystem-store";

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sin sesión válida no hay nada que registrar — evita que se pueda forzar
  // un referido para un user_id/email arbitrario desde fuera del flujo real.
  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const codigo = cookies().get(REF_COOKIE_NAME)?.value;
  if (codigo) {
    await registrarReferidoSiCorresponde(codigo, user.email ?? "", user.id);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(REF_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
