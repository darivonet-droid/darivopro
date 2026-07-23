"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@supabase/supabase-js";
import { errorSiNoEsAdmin, adminAutenticadoOError } from "@/lib/acceso-producto";
import { cambiarPlanCuenta } from "@/lib/plan-cuenta";
import type { PlanTipoPersistido } from "@/lib/roles-planes-oficial";

/**
 * Server Actions del Módulo Admin Usuarios (03-PANEL-ADMIN-USUARIOS.md §5
 * "Acciones de administración": Bloquear/Desbloquear/Cambiar plan/Reenviar
 * invitación/Restablecer acceso). Todas devuelven {ok, error} — nunca se
 * asume éxito sin comprobar la respuesta real de Supabase.
 */

type Resultado = { ok: true } | { ok: false; error: string };

export async function bloquearUsuarioAction(userId: string): Promise<Resultado> {
  const errorAuth = await errorSiNoEsAdmin();
  if (errorAuth) return { ok: false, error: errorAuth };
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
  const errorAuth = await errorSiNoEsAdmin();
  if (errorAuth) return { ok: false, error: errorAuth };
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

/**
 * ⚠️ EN RETIRADA — Tarea 3 (23/07/2026). El cambio de plan de una cuenta se
 * administra ahora desde Admin → Suscripciones (`cambiarPlanCuentaAction`),
 * porque el plan es metadato de facturación, no de identidad. Este punto de
 * entrada se conserva solo durante la FASE A (aditiva) para no romper el
 * módulo Usuarios mientras se verifica el nuevo; se elimina en la FASE C junto
 * con el `<select>` de plan de `AdminUsuariosView`.
 *
 * Delega en la MISMA lógica (`lib/plan-cuenta.ts`) — no duplica el update — así
 * que desde hoy también queda registrado en `admin_plan_auditoria`, con un
 * motivo automático que deja claro por qué vía se hizo.
 */
export async function cambiarPlanUsuarioAction(
  userId: string,
  plan: PlanTipoPersistido
): Promise<Resultado> {
  const auth = await adminAutenticadoOError();
  if (!auth.ok) return auth;

  const result = await cambiarPlanCuenta({
    cuentaUserId: userId,
    planNuevo: plan,
    motivo: "Cambio desde Admin → Usuarios (punto de entrada en retirada, sin motivo indicado)",
    adminUserId: auth.adminUserId,
    adminEmail: auth.adminEmail,
  });

  if (result.ok) {
    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/suscripciones");
  }
  return result;
}

/**
 * "Reenviar invitación" — reenvía el email de invitación de Supabase Auth.
 * Falla (con error legible) si el usuario ya confirmó su correo — en ese
 * caso lo correcto es "Restablecer acceso", no reinvitar.
 */
export async function reenviarInvitacionAction(email: string): Promise<Resultado> {
  const errorAuth = await errorSiNoEsAdmin();
  if (errorAuth) return { ok: false, error: errorAuth };
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
 * "Importar usuarios (CSV)" / "Enviar invitación masiva" (03-PANEL-ADMIN-USUARIOS.md
 * §5 Acciones rápidas) — invita a un usuario NUEVO por correo real de Supabase
 * Auth (el trigger handle_new_user crea su fila de `perfiles` en plan gratis,
 * mismo flujo que un registro normal). Falla con error legible si el correo ya
 * tiene cuenta confirmada. Se llama una vez por fila/correo desde el cliente.
 */
export async function invitarUsuarioAction(email: string): Promise<Resultado> {
  const errorAuth = await errorSiNoEsAdmin();
  if (errorAuth) return { ok: false, error: errorAuth };
  const limpio = email.trim();
  if (!limpio || !limpio.includes("@")) return { ok: false, error: "Correo inválido" };
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await admin.auth.admin.inviteUserByEmail(limpio, {
    redirectTo: `${base}/auth/callback?next=/dashboard`,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

/**
 * "Restablecer acceso" — dispara el mismo flujo de "olvidé mi contraseña"
 * que usa el propio usuario en /recuperar (frontend/.../(public)/recuperar/page.tsx),
 * iniciado por el Admin. Usa un cliente normal (no service role): este
 * método no requiere sesión del destinatario, es el flujo público estándar.
 */
export async function restablecerAccesoAction(email: string): Promise<Resultado> {
  const errorAuth = await errorSiNoEsAdmin();
  if (errorAuth) return { ok: false, error: errorAuth };
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
