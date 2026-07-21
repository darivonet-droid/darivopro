"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { enviarInvitacionEmpleado } from "@/lib/email/send";

type Resultado = { ok: true } | { ok: false; error: string };

/**
 * Invita a un Técnico con acceso real a Móvil (10-MODULO-EMPLEADOS-EMPRESA.md
 * §6). Antes, "Invitar empleado" solo insertaba una fila en
 * `empresa_empleados` sin ningún user_id — no se enviaba ningún correo ni se
 * otorgaba acceso real. Ahora:
 * 1. Crea la cuenta real en auth.users y envía el correo de invitación de
 *    Supabase Auth (`inviteUserByEmail` — magic link para fijar contraseña).
 * 2. Vincula el `perfiles` resultante a esta empresa (`empresa_id`), copia
 *    el `plan_tipo` del Gerente (el Técnico no paga por su cuenta — sin
 *    esto quedaría en el plan `gratis` por defecto del trigger
 *    `handle_new_user()`, con el límite de 5 cotizaciones de por vida) y
 *    salta su onboarding propio — se une a una empresa existente.
 * 3. Guarda el `user_id`, y los permisos por técnico (Etapa 7, CLAUDE.md
 *    21/07/2026, decisión 3 — reemplaza el default de la Tarea 2 del
 *    17/07/2026: Factura nace ACTIVADA por defecto, Informe sigue opcional;
 *    el Gerente decide ambos aquí mismo al invitar, y puede desactivar
 *    Factura si no corresponde a este Técnico) en `empresa_empleados`.
 *    No son "roles fijos" — cada módulo (Factura/Informe) es un flag
 *    activable/desactivable en cualquier momento, no solo al invitar.
 * 4. Envía un segundo correo (best-effort, `lib/email/send.ts`) indicando el
 *    rol y los permisos asignados — el invite nativo de Supabase Auth no
 *    soporta variables de plantilla personalizadas, así que el rol no puede
 *    ir en ESE correo; se informa en uno propio aparte.
 *
 * Gating real de "Técnico solo ve Cotización / Factura si está habilitada /
 * Informe si está habilitado / nunca Mis planes" vive en
 * `lib/rol-empleado.ts` (`obtenerContextoAcceso`), consumido desde
 * `(auth)/layout.tsx` y las páginas de Facturas/Informes/Mi Plan.
 */
export async function invitarEmpleadoAction(
  empresaId: string,
  input: { nombre: string; email: string; telefono?: string; facturaHabilitada: boolean; informeHabilitado: boolean }
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

  const { data: gerentePerfil } = await admin
    .from("perfiles")
    .select("plan_tipo")
    .eq("id", user.id)
    .maybeSingle();

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    input.email,
    { redirectTo: `${base}/auth/callback?next=/dashboard` }
  );
  if (inviteError || !invited?.user) {
    return { ok: false, error: inviteError?.message ?? "No se pudo enviar la invitación" };
  }

  const nuevoUserId = invited.user.id;

  // Une al nuevo usuario a esta empresa, hereda el plan del Gerente (no es
  // una suscripción propia, ver nota arriba) y salta su onboarding propio —
  // se está uniendo a una empresa existente, no creando la suya.
  const { error: perfilError } = await admin.from("perfiles").upsert({
    id: nuevoUserId,
    empresa_id: empresaId,
    razon_social: empresa.razon_social,
    plan_tipo: gerentePerfil?.plan_tipo ?? "gratis",
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
    factura_habilitada: input.facturaHabilitada,
    informe_habilitado: input.informeHabilitado,
  });
  if (empError) return { ok: false, error: empError.message };

  await enviarInvitacionEmpleado(input.email, {
    nombre: input.nombre,
    empresaNombre: empresa.razon_social,
    facturaHabilitada: input.facturaHabilitada,
    informeHabilitado: input.informeHabilitado,
  });

  revalidatePath("/empresa/empleados");
  return { ok: true };
}
