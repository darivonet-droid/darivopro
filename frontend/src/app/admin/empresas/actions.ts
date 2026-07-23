"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorSiNoEsAdmin, adminAutenticadoOError } from "@/lib/acceso-producto";
import { cambiarPlanCuenta, registrarCambioPlan } from "@/lib/plan-cuenta";
import type { PlanTipoPersistido } from "@/lib/roles-planes-oficial";

/**
 * Acciones del Módulo Admin Empresas (02-PANEL-ADMIN-EMPRESAS.md §5, §12:
 * "El cambio de plan se realiza desde este módulo" / "La activación y
 * desactivación de empresas se realiza desde este módulo").
 * Cambiar plan opera sobre `perfiles.plan_tipo` (el plan vive en el gerente,
 * no en `empresas`). Activar/desactivar opera sobre `empresas.activo`
 * (migración 20260709180000).
 */
/**
 * Tercer punto de cambio de plan del Panel Admin, además de Usuarios y del
 * nuevo de Suscripciones (Tarea 3, 23/07/2026). Hasta hoy hacía su propio
 * `UPDATE perfiles SET plan_tipo` sin dejar ningún rastro: una segunda vía sin
 * auditar habría vaciado de sentido el log de `admin_plan_auditoria`.
 *
 * Pasa a delegar en la misma lógica (`lib/plan-cuenta.ts`), así que queda
 * registrado igual que las otras dos. Su presencia en este módulo **no se
 * toca**: `02-PANEL-ADMIN-EMPRESAS.md` §5/§12 dice explícitamente que el
 * cambio de plan se hace desde aquí, y retirarlo no estaba en el encargo —
 * queda reportado para que lo decida el propietario.
 */
export async function cambiarPlanEmpresaAction(
  gerenteUserId: string,
  plan: PlanTipoPersistido
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await adminAutenticadoOError();
  if (!auth.ok) return auth;

  const result = await cambiarPlanCuenta({
    cuentaUserId: gerenteUserId,
    planNuevo: plan,
    motivo: "Cambio desde Admin → Empresas (sin motivo indicado)",
    adminUserId: auth.adminUserId,
    adminEmail: auth.adminEmail,
  });

  if (result.ok) {
    revalidatePath("/admin/empresas");
    revalidatePath("/admin/suscripciones");
  }
  return result;
}

/**
 * "Nueva empresa" (Doc 02 §1/§5). `empresas.gerente_user_id` es NOT NULL
 * UNIQUE → toda empresa necesita un gerente con cuenta real. Mismo mecanismo
 * que `invitarEmpleadoAction` (Empresa) / `nuevoEmpleadoAction` (Admin
 * Empleados): invita al gerente vía Supabase Auth, crea la fila en
 * `empresas`, y vincula `perfiles.empresa_id` del gerente saltando su
 * onboarding propio (se está creando la empresa directamente desde Admin).
 */
export async function crearEmpresaAction(input: {
  razonSocial: string;
  email: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  // Antes usaba errorSiNoEsAdmin(); se cambia a la variante que además devuelve
  // la identidad real del administrador, necesaria para firmar el registro de
  // auditoría del plan Business que este alta asigna. Mismo criterio de
  // autorización, ninguna vía nueva de acceso.
  const auth = await adminAutenticadoOError();
  if (!auth.ok) return auth;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }
  if (!input.razonSocial.trim() || !input.email.trim()) {
    return { ok: false, error: "Razón social y correo del gerente son obligatorios" };
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    input.email.trim(),
    { redirectTo: `${base}/auth/callback?next=/dashboard` }
  );
  if (inviteError || !invited?.user) {
    return { ok: false, error: inviteError?.message ?? "No se pudo enviar la invitación al gerente" };
  }
  const gerenteUserId = invited.user.id;

  const { error: empresaError } = await admin.from("empresas").insert({
    gerente_user_id: gerenteUserId,
    razon_social: input.razonSocial.trim(),
    ruc: input.ruc?.trim() || null,
    direccion: input.direccion?.trim() || null,
    telefono: input.telefono?.trim() || null,
  });
  if (empresaError) return { ok: false, error: empresaError.message };

  const { data: empresaCreada } = await admin
    .from("empresas")
    .select("id")
    .eq("gerente_user_id", gerenteUserId)
    .single();

  // plan_tipo="business" al crear: puedeAccederEmpresa() (acceso-producto.ts)
  // exige ese plan — sin esto, el gerente recién creado no podría ni entrar
  // al producto Empresa. Editable después desde el selector de Plan de la
  // tabla, igual que cualquier otra empresa.
  const { error: perfilError } = await admin
    .from("perfiles")
    .upsert({
      id: gerenteUserId,
      razon_social: input.razonSocial.trim(),
      empresa_id: empresaCreada?.id,
      onboarding_done: true,
      plan_tipo: "business",
    });
  if (perfilError) return { ok: false, error: perfilError.message };

  // Rastro del plan Business que acaba de asignar este alta (hueco #3 del
  // blindaje del 23/07/2026: era una acción de operador que fijaba un plan sin
  // quedar registrada). Se AÑADE el registro después del upsert en vez de
  // reencaminar la escritura por `cambiarPlanCuenta()`: ese upsert crea el
  // perfil completo (razón social, empresa_id, onboarding), no es solo un
  // cambio de plan, y reencaminarlo alteraría el flujo de creación.
  //
  // `planAnterior: null` porque la cuenta se acaba de invitar: no tenía plan
  // previo. La columna `plan_anterior` es nullable a propósito
  // (20260723130000_admin_plan_auditoria.sql:41 — sin NOT NULL).
  //
  // Si el log fallara, la empresa YA está creada: devolver error haría creer al
  // administrador que el alta no se hizo, que es peor que un log incompleto. El
  // fallo queda en `console.error` desde `registrarCambioPlan()`.
  await registrarCambioPlan({
    cuentaUserId: gerenteUserId,
    planAnterior: null,
    planNuevo: "business",
    motivo: "Alta de empresa desde Admin con plan Business",
    adminUserId: auth.adminUserId,
    adminEmail: auth.adminEmail,
  });

  revalidatePath("/admin/empresas");
  revalidatePath("/admin/suscripciones");
  return { ok: true };
}

export async function setEmpresaActivaAction(
  empresaId: string,
  activa: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const errorAuth = await errorSiNoEsAdmin();
  if (errorAuth) return { ok: false, error: errorAuth };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }

  const { error } = await admin
    .from("empresas")
    .update({ activo: activa })
    .eq("id", empresaId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/empresas");
  return { ok: true };
}
