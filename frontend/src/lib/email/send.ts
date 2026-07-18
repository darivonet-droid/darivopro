// DARIVO PRO — Despachador de email transaccional (9 eventos oficiales)
//
// Texto real aprobado por Mohamed conectado 12/07/2026 (templates.ts) — las
// firmas de datos de abajo cambiaron para reflejar lo que cada plantilla
// necesita ahora; los call-sites (webhook, ecosystem-store, rutas de email)
// se actualizaron en el mismo commit.
//
// Reset de contraseña (evento 4, noreply@) NO tiene función aquí: Supabase
// Auth ya envía ese correo por su cuenta (`supabase.auth.resetPasswordForEmail`,
// ver frontend/src/app/(public)/recuperar/page.tsx). El texto real ya se
// aplicó en `supabase/templates/recovery.html` (referenciado desde
// config.toml para el entorno local) — falta que el propietario pegue el
// mismo HTML en el Dashboard del proyecto hosted (Authentication → Email
// Templates → Reset Password), config.toml no sincroniza eso automáticamente.
//
// Ticket recibido/resuelto (eventos 8 y 9, soporte@): conectados 16/07/2026
// al backend real de tickets (INC-A01/DOC-01 desbloqueados a pedido del
// propietario) — ver POST /api/soporte/tickets/route.ts y
// actualizarEstadoTicket() en lib/admin-queries.ts.
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
  plantillaTicketRecibido,
  plantillaTicketResuelto,
  plantillaContactoLanding,
  plantillaInvitacionEmpleado,
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
export async function enviarBienvenida(
  to: string,
  datos: { nombre: string; enlaceAcceso: string; plan: string; monto?: number }
): Promise<void> {
  const { subject, html } = plantillaBienvenida(datos);
  await enviarSeguro({ cuenta: "info", to, subject, html, evento: "bienvenida" });
}

// 2. Pago confirmado — facturacion@
export async function enviarPagoConfirmado(
  to: string,
  datos: {
    nombre: string;
    monto: number;
    moneda: string;
    plan: string;
    fecha: string;
    proximoCobro?: string;
  }
): Promise<void> {
  const { subject, html } = plantillaPagoConfirmado(datos);
  await enviarSeguro({ cuenta: "facturacion", to, subject, html, evento: "pago_confirmado" });
}

// 3. Pago fallido — facturacion@
export async function enviarPagoFallido(
  to: string,
  datos: { nombre: string; monto?: number; moneda?: string; plan: string; enlaceActualizar: string }
): Promise<void> {
  const { subject, html } = plantillaPagoFallido(datos);
  await enviarSeguro({ cuenta: "facturacion", to, subject, html, evento: "pago_fallido" });
}

// 5. Cambio de plan — noreply@
export async function enviarCambioPlan(
  to: string,
  datos: {
    nombre: string;
    planAnterior: string;
    planNuevo: string;
    monto: number;
    moneda: string;
    fecha: string;
  }
): Promise<void> {
  const { subject, html } = plantillaCambioPlan(datos);
  await enviarSeguro({ cuenta: "noreply", to, subject, html, evento: "cambio_plan" });
}

// 6. Bienvenida Partner — partners@
export async function enviarBienvenidaPartner(
  to: string,
  datos: { nombre: string; codigo: string; enlace: string; porcentajeVenta: number }
): Promise<void> {
  const { subject, html } = plantillaBienvenidaPartner(datos);
  await enviarSeguro({ cuenta: "partners", to, subject, html, evento: "bienvenida_partner" });
}

// 7. Comisión ganada — partners@
export async function enviarComisionGanada(
  to: string,
  datos: { nombre: string; monto: number; moneda: string; tipo: "venta" | "hito"; totalReferidos: number }
): Promise<void> {
  const { subject, html } = plantillaComisionGanada(datos);
  await enviarSeguro({ cuenta: "partners", to, subject, html, evento: "comision_ganada" });
}

// 8. Ticket recibido — soporte@
export async function enviarTicketRecibido(
  to: string,
  datos: { nombre: string; numeroTicket: string; resumen: string }
): Promise<void> {
  const { subject, html } = plantillaTicketRecibido(datos);
  await enviarSeguro({ cuenta: "soporte", to, subject, html, evento: "ticket_recibido" });
}

// 9. Ticket resuelto — soporte@
export async function enviarTicketResuelto(
  to: string,
  datos: { nombre: string; numeroTicket: string; resumenSolucion: string }
): Promise<void> {
  const { subject, html } = plantillaTicketResuelto(datos);
  await enviarSeguro({ cuenta: "soporte", to, subject, html, evento: "ticket_resuelto" });
}

// 10. Contacto desde el widget de chat de la landing — soporte@ (interno,
// no es uno de los 9 eventos oficiales al usuario). from=to=soporte@: el
// equipo se lo envía a sí mismo con el mensaje del visitante adentro.
export async function enviarContactoLanding(
  datos: { nombre: string; contacto: string; mensaje: string }
): Promise<void> {
  const { subject, html } = plantillaContactoLanding(datos);
  await enviarSeguro({
    cuenta: "soporte",
    to: CUENTAS_EMAIL.soporte,
    subject,
    html,
    evento: "contacto_landing",
  });
}

// 11. Invitación de empleado (Técnico) — soporte@ → el técnico invitado
export async function enviarInvitacionEmpleado(
  to: string,
  datos: { nombre: string; empresaNombre: string; facturaHabilitada: boolean; informeHabilitado: boolean }
): Promise<void> {
  const { subject, html } = plantillaInvitacionEmpleado(datos);
  await enviarSeguro({ cuenta: "soporte", to, subject, html, evento: "invitacion_empleado" });
}
