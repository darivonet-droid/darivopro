// DARIVO PRO — Dispara el email de Bienvenida (info@) tras un registro real.
// Server-only: las credenciales de Gmail nunca deben llegar al cliente.
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { enviarBienvenida } from "@/lib/email/send";

export async function POST(_req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ ok: false, error: "Sin sesión" }, { status: 401 });
  }

  const nombre =
    (user.user_metadata?.nombre_empresa as string | undefined)?.trim() ||
    user.email.split("@")[0];

  await enviarBienvenida(user.email, { nombre });
  return NextResponse.json({ ok: true });
}
