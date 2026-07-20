// DARIVO PRO — Destino post-login para el flujo de contraseña (20/07/2026).
//
// login/page.tsx `entrar()` corre en el cliente y no puede leer allowlists de
// servidor (DARIVO_ADMIN_EMAILS/DARIVO_PARTNER_EMAILS) ni el service role —
// esta ruta hace la resolución con la sesión ya autenticada (cookie) y
// devuelve el mismo shape que usa auth/callback/route.ts (OAuth), para que
// ambos flujos aterricen en el mismo panel según el mismo criterio.
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { resolverDestinoPostLogin } from "@/lib/destino-post-login";

export async function GET() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ tipo: "ruta", ruta: "/login" });
  }

  const destino = await resolverDestinoPostLogin(supabase, user);
  return NextResponse.json(destino);
}
