// DARIVO PRO — Resuelve nombre/plan y dispara el email de Bienvenida (info@)
// para una cuenta recién creada. Compartido por /api/emails/bienvenida
// (registro por email/contraseña con sesión inmediata) y
// auth/callback/route.ts (confirmación por correo y login/registro con
// Google OAuth) — misma plantilla y remitente sin importar el método.
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { enviarBienvenida } from "@/lib/email/send";
import { appBaseUrl } from "@/lib/dlocal";
import { PRECIOS_OFICIALES, esPlanSuscripcionOficial } from "@/lib/roles-planes-oficial";

export async function enviarBienvenidaNuevaCuenta(
  supabase: SupabaseClient,
  user: Pick<User, "id" | "email" | "user_metadata">
): Promise<void> {
  if (!user.email) return;

  const nombre =
    (user.user_metadata?.nombre_empresa as string | undefined)?.trim() ||
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    (user.user_metadata?.name as string | undefined)?.trim() ||
    user.email.split("@")[0];

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan_tipo")
    .eq("id", user.id)
    .maybeSingle();

  const planTipo = perfil?.plan_tipo;
  const plan = esPlanSuscripcionOficial(planTipo)
    ? PRECIOS_OFICIALES[planTipo].nombre
    : "Prueba gratuita";
  const monto = esPlanSuscripcionOficial(planTipo)
    ? PRECIOS_OFICIALES[planTipo].mensual
    : undefined;

  await enviarBienvenida(user.email, {
    nombre,
    plan,
    monto,
    enlaceAcceso: `${appBaseUrl()}/login`,
  });
}
