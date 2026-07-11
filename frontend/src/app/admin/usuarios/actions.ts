"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@supabase/supabase-js";
import type { PlanTipoPersistido } from "@/lib/roles-planes-oficial";

/**
 * Server Actions del Módulo Admin Usuarios (03-PANEL-ADMIN-USUARIOS.md §5
 * "Acciones de administración": Bloquear/Desbloquear/Cambiar plan/Reenviar
 * invitación/Restablecer acceso). Todas devuelven {ok, error} — nunca se
 * asume éxito sin comprobar la respuesta real de Supabase.
 */

type Resultado = { ok: true } | { ok: false; error: string };

export async function bloquearUsuarioAction(userId: string): Promise<Resultado> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }
  // Supabase no tiene "ban permanente" — usa una duración muy larga (100 años).
  const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function desbloquearUsuarioAction(userId: string): Promise<Resultado> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }
  const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: "none" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function cambiarPlanUsuarioAction(
  userId: string,
  plan: PlanTipoPersistido
): Promise<Resultado> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }
  const { error } = await admin.from("perfiles").update({ plan_tipo: plan }).eq("id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

/**
 * "Reenviar invitación" — reenvía el email de invitación de Supabase Auth.
 * Falla (con error legible) si el usuario ya confirmó su correo — en ese
 * caso lo correcto es "Restablecer acceso", no reinvitar.
 */
export async function reenviarInvitacionAction(email: string): Promise<Resultado> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }
  const { error } = await admin.auth.admin.inviteUserByEmail(email);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * "Restablecer acceso" — dispara el mismo flujo de "olvidé mi contraseña"
 * que usa el propio usuario en /recuperar (frontend/.../(public)/recuperar/page.tsx),
 * iniciado por el Admin. Usa un cliente normal (no service role): este
 * método no requiere sesión del destinatario, es el flujo público estándar.
 */
export async function restablecerAccesoAction(email: string): Promise<Resultado> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { ok: false, error: "Supabase no configurado" };

  const supabase = createClient(url, key);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${base}/nueva-contrasena`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
