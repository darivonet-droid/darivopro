"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { esAdministradorDarivo } from "@/lib/acceso-producto";

type Resultado = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await esAdministradorDarivo(user.email))) return null;
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

/**
 * Crea la ficha del empleado interno (07-PANEL-ADMIN-EMPLEADOS.md §5 "Nuevo empleado").
 * Envía invitación real de Supabase Auth (mismo mecanismo que `invitarEmpleadoAction`
 * de Empresa) y crea la fila en `darivo_admin_empleados`. Alcance: esto NO otorga
 * acceso al Panel Admin — ese acceso lo gatea `DARIVO_ADMIN_EMAILS` (allowlist de
 * entorno, `esAdministradorDarivo()`), separado de esta tabla y fuera del alcance de
 * una Server Action (requiere que el propietario edite la variable de entorno).
 */
export async function nuevoEmpleadoAction(input: {
  nombre: string;
  email: string;
  cargo?: string;
  departamento?: string;
}): Promise<Resultado> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "No autorizado" };
  if (!input.email.trim()) return { ok: false, error: "Correo requerido" };

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    input.email.trim(),
    { redirectTo: `${base}/auth/callback?next=/dashboard` }
  );
  if (inviteError || !invited?.user) {
    return { ok: false, error: inviteError?.message ?? "No se pudo enviar la invitación" };
  }

  const { error } = await admin.from("darivo_admin_empleados").insert({
    user_id: invited.user.id,
    email: input.email.trim(),
    nombre: input.nombre.trim() || null,
    cargo: input.cargo?.trim() || null,
    departamento: input.departamento?.trim() || null,
    activo: true,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/empleados");
  return { ok: true };
}

/** Editar empleado / Cambiar departamento (§8) — mismo formulario cubre ambas acciones del MD. */
export async function editarEmpleadoAction(
  id: string,
  input: { nombre?: string; cargo?: string; departamento?: string }
): Promise<Resultado> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "No autorizado" };

  const { error } = await admin
    .from("darivo_admin_empleados")
    .update({
      nombre: input.nombre?.trim() || null,
      cargo: input.cargo?.trim() || null,
      departamento: input.departamento?.trim() || null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/empleados");
  return { ok: true };
}

/** Activar / Desactivar empleado (§8). */
export async function cambiarActivoEmpleadoAction(id: string, activo: boolean): Promise<Resultado> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "No autorizado" };

  const { error } = await admin.from("darivo_admin_empleados").update({ activo }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/empleados");
  return { ok: true };
}

/** Eliminar empleado (§8) — borra solo la ficha en darivo_admin_empleados, no la cuenta de auth.users. */
export async function eliminarEmpleadoAction(id: string): Promise<Resultado> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "No autorizado" };

  const { error } = await admin.from("darivo_admin_empleados").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/empleados");
  return { ok: true };
}

/** Restablecer acceso (§8) — envía correo real de recuperación de contraseña. */
export async function restablecerAccesoAction(email: string): Promise<Resultado> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "No autorizado" };

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${base}/nueva-contrasena` },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Reenviar invitación (§8) — solo aplica a empleados que nunca iniciaron sesión. */
export async function reenviarInvitacionEmpleadoAction(email: string): Promise<Resultado> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "No autorizado" };

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${base}/auth/callback?next=/dashboard`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
