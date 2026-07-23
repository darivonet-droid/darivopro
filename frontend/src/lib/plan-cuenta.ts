/**
 * Cambio de plan de una CUENTA concreta — lógica única, compartida.
 *
 * Tarea 3 FASE A (23/07/2026): esta operación vivía solo en Admin → Usuarios
 * (`cambiarPlanUsuarioAction`, un `UPDATE perfiles SET plan_tipo` sin registro
 * de ningún tipo). El plan de una cuenta es **metadato de facturación**, así
 * que pasa a administrarse desde Admin → Suscripciones. Aquí vive la lógica
 * real; las Server Actions de ambos módulos la llaman, nunca la duplican.
 *
 * Diferencia con `lib/planes-catalogo.ts`: aquel edita el **catálogo** de los 3
 * planes (nombre, precio, límites). Este cambia **a qué plan pertenece una
 * cuenta**. Son cosas distintas y no deben mezclarse.
 *
 * Estándar banco/fintech: todo cambio queda registrado en
 * `admin_plan_auditoria` (quién, qué cuenta, plan anterior → nuevo, cuándo,
 * motivo). El log es append-only también para el Panel Admin — ver la
 * migración `20260723130000_admin_plan_auditoria.sql`.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import type { PlanTipoPersistido } from "@/lib/roles-planes-oficial";

export type CambioPlanCuenta = {
  cuentaUserId: string;
  planNuevo: PlanTipoPersistido;
  /** Obligatorio: un cambio de plan sin motivo no es auditable. */
  motivo: string;
  /** Identidad real del administrador, resuelta server-side. Nunca del cliente. */
  adminUserId: string;
  adminEmail: string;
};

export type ResultadoCambioPlan = { ok: true } | { ok: false; error: string };

/** Fila del log de auditoría, tal y como se muestra en Admin → Suscripciones. */
export type PlanAuditoriaRow = {
  id: string;
  admin_email: string;
  cuenta_email: string;
  plan_anterior: string | null;
  plan_nuevo: string;
  motivo: string;
  created_at: string;
};

export async function cambiarPlanCuenta(input: CambioPlanCuenta): Promise<ResultadoCambioPlan> {
  const motivo = input.motivo.trim();
  if (!motivo) return { ok: false, error: "Indica el motivo del cambio de plan" };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }

  // Plan anterior ANTES del update — sin esto el log no puede decir de dónde
  // venía la cuenta, que es la mitad del valor de la auditoría.
  const { data: perfilAntes, error: errorLectura } = await admin
    .from("perfiles")
    .select("plan_tipo")
    .eq("id", input.cuentaUserId)
    .maybeSingle();

  if (errorLectura) return { ok: false, error: errorLectura.message };
  if (!perfilAntes) return { ok: false, error: "La cuenta no existe" };

  const planAnterior = (perfilAntes.plan_tipo as PlanTipoPersistido | null) ?? "gratis";
  if (planAnterior === input.planNuevo) {
    return { ok: false, error: "La cuenta ya está en ese plan" };
  }

  const { error: errorUpdate } = await admin
    .from("perfiles")
    .update({ plan_tipo: input.planNuevo })
    .eq("id", input.cuentaUserId);

  if (errorUpdate) return { ok: false, error: errorUpdate.message };

  // Email de la cuenta: copia inmutable en el log, para que el registro siga
  // siendo legible aunque la cuenta se borre después.
  const { data: authUser } = await admin.auth.admin.getUserById(input.cuentaUserId);
  const cuentaEmail = authUser?.user?.email ?? input.cuentaUserId;

  const { error: errorLog } = await admin.from("admin_plan_auditoria").insert({
    admin_user_id: input.adminUserId,
    admin_email: input.adminEmail,
    cuenta_user_id: input.cuentaUserId,
    cuenta_email: cuentaEmail,
    plan_anterior: planAnterior,
    plan_nuevo: input.planNuevo,
    motivo,
  });

  if (errorLog) {
    // El plan YA cambió. No se revierte en silencio (dejaría al operador
    // creyendo que no pasó nada cuando sí pasó): se informa de que el cambio
    // se aplicó pero no quedó registrado, que es exactamente lo que hay que
    // investigar si esto ocurre.
    console.error("admin_plan_auditoria: fallo al registrar el cambio de plan", errorLog);
    return {
      ok: false,
      error: `El plan se cambió, pero NO se pudo registrar en el log de auditoría (${errorLog.message}). Avisa a soporte técnico.`,
    };
  }

  return { ok: true };
}

/** Historial de cambios de plan — pestaña "Historial de cambios" de Admin → Suscripciones. */
export async function listarAuditoriaPlanes(limite = 100): Promise<PlanAuditoriaRow[]> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return [];
  }

  const { data, error } = await admin
    .from("admin_plan_auditoria")
    .select("id, admin_email, cuenta_email, plan_anterior, plan_nuevo, motivo, created_at")
    .order("created_at", { ascending: false })
    .limit(limite);

  // Tolerante a que la migración todavía no se haya corrido — la pantalla de
  // Suscripciones no debe romperse por eso, igual que ya hace con
  // `planes_catalogo` en `fetchAdminSuscripciones()`.
  if (error) return [];
  return (data ?? []) as PlanAuditoriaRow[];
}
