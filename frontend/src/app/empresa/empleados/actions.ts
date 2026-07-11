"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

type Resultado = { ok: true } | { ok: false; error: string };

/**
 * Invita a un Técnico con acceso real a Móvil (10-MODULO-EMPLEADOS-EMPRESA.md
 * §6). Antes, "Invitar empleado" solo insertaba una fila en
 * `empresa_empleados` sin ningún user_id — no se enviaba ningún correo ni se
 * otorgaba acceso real. Ahora:
 * 1. Crea la cuenta real en auth.users y envía el correo de invitación de
 *    Supabase Auth (`inviteUserByEmail` — magic link para fijar contraseña).
 * 2. Vincula el `perfiles` resultante a esta empresa (`empresa_id`) y salta
 *    su onboarding propio — se une a una empresa existente, no crea la suya.
 * 3. Guarda el `user_id` real en `empresa_empleados`
 *    (columna añadida por `20260713100000_empresa_empleados_user_id.sql`,
 *    pendiente de ejecución por el propietario).
 *
 * Nota de alcance: esto otorga acceso real de sesión — no implementa
 * diferenciación de permisos Gerente vs Técnico en la UI de Móvil (esa
 * jerarquía sigue solo a medias, ver CLAUDE.md DT-04-02, decisión pendiente
 * del propietario). Un Técnico invitado hoy inicia sesión y ve la misma
 * Móvil que un Gerente solo — el alcance de este fix es "el acceso es real",
 * no "los permisos ya están diferenciados".
 */
export async function invitarEmpleadoAction(
  empresaId: string,
  input: { nombre: string; email: string; telefono?: string }
): Promise<Resultado> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada" };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }

  const { data: empresa } = await admin
    .from("empresas")
    .select("id, razon_social, gerente_user_id")
    .eq("id", empresaId)
    .maybeSingle();

  if (!empresa || empresa.gerente_user_id !== user.id) {
    return { ok: false, error: "No autorizado sobre esta empresa" };
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    input.email,
    { redirectTo: `${base}/auth/callback?next=/dashboard` }
  );
  if (inviteError || !invited?.user) {
    return { ok: false, error: inviteError?.message ?? "No se pudo enviar la invitación" };
  }

  const nuevoUserId = invited.user.id;

  // Une al nuevo usuario a esta empresa y salta su onboarding propio —
  // se está uniendo a una empresa existente, no creando la suya.
  const { error: perfilError } = await admin.from("perfiles").upsert({
    id: nuevoUserId,
    empresa_id: empresaId,
    razon_social: empresa.razon_social,
    onboarding_done: true,
  });
  if (perfilError) return { ok: false, error: perfilError.message };

  const { error: empError } = await admin.from("empresa_empleados").insert({
    empresa_id: empresaId,
    user_id: nuevoUserId,
    nombre: input.nombre,
    email: input.email,
    telefono: input.telefono || null,
    rol: "Técnico",
    estado: "Pendiente",
  });
  if (empError) return { ok: false, error: empError.message };

  revalidatePath("/empresa/empleados");
  return { ok: true };
}
