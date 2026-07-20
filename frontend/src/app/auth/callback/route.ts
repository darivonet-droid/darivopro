// DARIVO PRO — Callback Supabase Auth (confirmación email, login Google OAuth)
//
// Nota (12/07/2026, actualizada 20/07/2026): esta ruta también la usa el
// login con Google (ver login/page.tsx), no solo la confirmación de registro
// nuevo. El email de Bienvenida (info@) se dispara en el flujo de registro
// con sesión inmediata directamente desde registro/page.tsx; aquí (confirmación
// por correo y Google OAuth) se dispara solo si created_at/last_sign_in_at del
// usuario están a menos de 10s entre sí — señal de "primer login real de esta
// cuenta", no una recurrente. Umbral es una interpretación propia (Supabase no
// expone un flag "es la primera vez" directo) — ver enviarBienvenidaNuevaCuenta.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { registrarReferidoSiCorresponde, REF_COOKIE_NAME } from "@/lib/ecosystem-store";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarBienvenidaNuevaCuenta } from "@/lib/email/bienvenida-nueva-cuenta";

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

  // Email de Bienvenida en el primer login real de esta cuenta (típicamente
  // Google OAuth nuevo, o confirmación por correo si el proyecto la requiere)
  // — best-effort, nunca bloquea el login. Ver nota de cabecera.
  if (data.user) {
    const creado = data.user.created_at ? new Date(data.user.created_at).getTime() : NaN;
    const primerLogin = data.user.last_sign_in_at
      ? new Date(data.user.last_sign_in_at).getTime()
      : NaN;
    const esPrimeraVez =
      Number.isFinite(creado) && Number.isFinite(primerLogin) && Math.abs(primerLogin - creado) < 10_000;
    if (esPrimeraVez) {
      enviarBienvenidaNuevaCuenta(supabase, data.user).catch(() => {});
    }
  }

  // Registra el referido de Partner si venía de /ref/{codigo} (caso: el
  // registro requirió confirmación por correo, así que llega aquí en vez de
  // por /api/partners/registrar-referido). Nunca bloquea el login si falla.
  const refCodigo = cookieStore.get(REF_COOKIE_NAME)?.value;
  if (refCodigo && data.user) {
    await registrarReferidoSiCorresponde(refCodigo, data.user.email ?? "", data.user.id).catch(() => {});
  }

  // Última actividad de Empleados Empresa (Técnico) — best-effort, nunca
  // bloquea el login. Cubre Google OAuth y aceptar invitación por correo.
  // Tarea 2 (CLAUDE.md 17/07/2026): además, si es su primer login real
  // (estado todavía "Pendiente" desde la invitación), pasa a "Activo" solo
  // — los permisos (factura_habilitada/informe_habilitado) ya quedaron
  // fijados por el Gerente al invitar, aquí no se tocan.
  if (data.user) {
    try {
      const admin = createAdminClient();
      await admin
        .from("empresa_empleados")
        .update({ ultima_actividad: new Date().toISOString() })
        .eq("user_id", data.user.id);
      await admin
        .from("empresa_empleados")
        .update({ estado: "Activo" })
        .eq("user_id", data.user.id)
        .eq("estado", "Pendiente");
    } catch {
      /* no crítico */
    }
  }

  const destino = next.startsWith("/") ? next : "/onboarding/1";
  const res = NextResponse.redirect(`${origin}${destino}`);
  res.cookies.set(REF_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
