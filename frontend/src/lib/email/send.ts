// DARIVO PRO — Despachador de email transaccional (9 eventos oficiales)
//
// Reset de contraseña (evento 4, noreply@) NO tiene función aquí: Supabase
// Auth ya envía ese correo por su cuenta (`supabase.auth.resetPasswordForEmail`,
// ver frontend/src/app/(public)/recuperar/page.tsx). Personalizar su plantilla
// se hace en Supabase Dashboard → Authentication → Email Templates → "Reset
// Password" (o en supabase/config.toml → [auth.email.template.recovery] para
// entornos donde se gestione por config-as-code) — es configuración de
// Supabase, no código de este módulo, y no requiere credenciales de Gmail.
//
// Ticket recibido/resuelto (eventos 8 y 9, soporte@) NO están conectados:
// el backend de tickets (/api/soporte/tickets) fue deshabilitado (INC-A01,
// 09-PANEL-ADMIN-SOPORTE.md §11 "No crear endpoints") — no existe hoy ningún
// evento real de creación/resolución de ticket en el servidor al que
// enganchar el envío. Las plantillas ya existen en templates.ts, listas para
// conectar el día que se decida reconstruir ese backend.
//
// Todas las funciones de este archivo son best-effort: nunca lanzan — un
// fallo de envío se loguea y no debe romper el flujo que lo llama (mismo
// patrón que registrarPagoEvento en api/pagos/webhook/route.ts).

import { enviarGmail } from "@/lib/email/gmail-client";
import { CUENTAS_EMAIL } from "@/lib/email/accounts";
import {
  plantillaBienvenida,
  plantillaPagoConfirmado,
  plantillaPagoFallido,
  plantillaCambioPlan,
  plantillaBienvenidaPartner,
  plantillaComisionGanada,
} from "@/lib/email/templates";

async function enviarSeguro(opts: {
  cuenta: keyof typeof CUENTAS_EMAIL;
  to: string;
  subject: string;
  html: string;
  evento: string;
}): Promise<void> {
  try {
    await enviarGmail({
      from: CUENTAS_EMAIL[opts.cuenta],
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  } catch (e) {
    console.error(`[email:${opts.evento}] no se pudo enviar a ${opts.to}:`, e);
  }
}

// 1. Bienvenida — info@
export async function enviarBienvenida(to: string, datos: { nombre: string }): Promise<void> {
  const { subject, html } = plantillaBienvenida(datos);
  await enviarSeguro({ cuenta: "info", to, subject, html, evento: "bienvenida" });
}

// 2. Pago confirmado — facturacion@
export async function enviarPagoConfirmado(
  to: string,
  datos: { nombre: string; monto: number; moneda: string; plan: string }
): Promise<void> {
  const { subject, html } = plantillaPagoConfirmado(datos);
  await enviarSeguro({ cuenta: "facturacion", to, subject, html, evento: "pago_confirmado" });
}

// 3. Pago fallido — facturacion@
export async function enviarPagoFallido(
  to: string,
  datos: { nombre: string; monto?: number; moneda?: string; plan: string }
): Promise<void> {
  const { subject, html } = plantillaPagoFallido(datos);
  await enviarSeguro({ cuenta: "facturacion", to, subject, html, evento: "pago_fallido" });
}

// 5. Cambio de plan — noreply@
export async function enviarCambioPlan(
  to: string,
  datos: { nombre: string; planAnterior: string; planNuevo: string }
): Promise<void> {
  const { subject, html } = plantillaCambioPlan(datos);
  await enviarSeguro({ cuenta: "noreply", to, subject, html, evento: "cambio_plan" });
}

// 6. Bienvenida Partner — partners@
export async function enviarBienvenidaPartner(
  to: string,
  datos: { nombre: string; codigo: string; enlace: string }
): Promise<void> {
  const { subject, html } = plantillaBienvenidaPartner(datos);
  await enviarSeguro({ cuenta: "partners", to, subject, html, evento: "bienvenida_partner" });
}

// 7. Comisión ganada — partners@
export async function enviarComisionGanada(
  to: string,
  datos: { nombre: string; monto: number; moneda: string; tipo: "venta" | "hito" }
): Promise<void> {
  const { subject, html } = plantillaComisionGanada(datos);
  await enviarSeguro({ cuenta: "partners", to, subject, html, evento: "comision_ganada" });
}
