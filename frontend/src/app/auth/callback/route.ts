// DARIVO PRO — Callback Supabase Auth (confirmación email, magic links)
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { registrarReferidoSiCorresponde, REF_COOKIE_NAME } from "@/lib/ecosystem-store";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding/1";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=confirmacion`);
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=confirmacion`);
  }

  // Registra el referido de Partner si venía de /ref/{codigo} (caso: el
  // registro requirió confirmación por correo, así que llega aquí en vez de
  // por /api/partners/registrar-referido). Nunca bloquea el login si falla.
  const refCodigo = cookieStore.get(REF_COOKIE_NAME)?.value;
  if (refCodigo && data.user) {
    await registrarReferidoSiCorresponde(refCodigo, data.user.email ?? "", data.user.id).catch(() => {});
  }

  const destino = next.startsWith("/") ? next : "/onboarding/1";
  const res = NextResponse.redirect(`${origin}${destino}`);
  res.cookies.set(REF_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
