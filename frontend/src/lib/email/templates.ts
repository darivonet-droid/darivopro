// DARIVO PRO — Plantillas de email transaccional
//
// Texto real aprobado por Mohamed (12/07/2026) — reemplaza el placeholder
// funcional de la versión anterior. Módulo puro de renderizado: no hace
// llamadas a Supabase ni resuelve enlaces — todo dato (incl. URLs) llega ya
// resuelto desde el llamador (send.ts / las rutas que lo invocan).
//
// "[Datos legales pendientes]" se mantiene como texto literal a propósito —
// es contenido pendiente de completar (razón social, RUC, dirección), no un
// bug de renderizado, mismo criterio que los marcadores [pendiente] ya
// documentados en POLITICA-DE-PRIVACIDAD-DARIVO-PRO.md / TERMINOS-Y-...

import { fmtPEN } from "@/lib/utils";

interface EmailContenido {
  subject: string;
  html: string;
}

function layout(cuerpo: string): string {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;color:#0A1628;line-height:1.6;">
    <p style="font-size:12px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">Darivo Pro</p>
    ${cuerpo}
  </div>`;
}

/** Firma + separador + datos legales pendientes — igual en las 9 plantillas. */
function pie(cuenta: string, opts?: { noResponder?: boolean }): string {
  return `
    <p style="margin-top:24px;">Saludos,<br/>Equipo Darivo Pro<br/>${cuenta}</p>
    <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0 12px;" />
    <p style="font-size:11px;color:#9CA3AF;">[Datos legales pendientes]</p>
    ${opts?.noResponder ? '<p style="font-size:11px;color:#9CA3AF;">Este correo es automático, no lo respondas.</p>' : ""}
  `;
}

function montoTxt(monto: number, moneda: string): string {
  return moneda === "PEN" ? fmtPEN(monto) : `${moneda} ${monto}`;
}

// ─────────────────────────────────────────────────────────────────────────
// 1. Bienvenida — info@ — al completarse el registro
// ─────────────────────────────────────────────────────────────────────────
export function plantillaBienvenida(datos: {
  nombre: string;
  enlaceAcceso: string;
  /** Nombre a mostrar del plan actual — "Prueba gratuita" para un registro nuevo (plan_tipo='gratis'). */
  plan: string;
  /** Ausente para plan gratuito — no hay monto que mostrar. */
  monto?: number;
}): EmailContenido {
  const lineaPlan =
    datos.monto != null
      ? `Tu plan actual: ${datos.plan} — ${fmtPEN(datos.monto)} / mes.`
      : `Tu plan actual: ${datos.plan}.`;
  return {
    subject: `Bienvenido a Darivo Pro, ${datos.nombre}`,
    html: layout(`
      <p>Hola ${datos.nombre},</p>
      <p>Gracias por registrarte en Darivo Pro. Tu cuenta ya está activa y lista para que empieces a cotizar tus obras de forma rápida y ordenada, sin hojas sueltas ni cálculos a mano.</p>
      <p>Para comenzar:</p>
      <ol style="padding-left:20px;">
        <li>Ingresa con tu correo y contraseña: <a href="${datos.enlaceAcceso}">${datos.enlaceAcceso}</a></li>
        <li>Crea tu primera cotización — el proceso toma menos de 5 minutos.</li>
        <li>Ante cualquier consulta, escríbenos a soporte@darivopro.com y te atendemos a la brevedad.</li>
      </ol>
      <p>${lineaPlan}</p>
      <p>Quedamos atentos a cualquier consulta que tengas.</p>
      ${pie("info@darivopro.com")}
    `),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// 2. Pago confirmado — facturacion@ — webhook exitoso dLocal
// ─────────────────────────────────────────────────────────────────────────
export function plantillaPagoConfirmado(datos: {
  nombre: string;
  monto: number;
  moneda: string;
  plan: string;
  fecha: string;
  /** Ausente cuando no se pudo derivar el ciclo (mensual/anual) del pago — se omite la línea. */
  proximoCobro?: string;
}): EmailContenido {
  return {
    subject: "Tu pago fue confirmado — Darivo Pro",
    html: layout(`
      <p>Hola ${datos.nombre},</p>
      <p>Confirmamos que recibimos tu pago correctamente. Tu suscripción ya está activa y puedes seguir usando Darivo Pro sin interrupciones.</p>
      <p>Detalle del pago:</p>
      <ul style="padding-left:20px;">
        <li>Plan: ${datos.plan}</li>
        <li>Monto: ${montoTxt(datos.monto, datos.moneda)}</li>
        <li>Fecha: ${datos.fecha}</li>
        ${datos.proximoCobro ? `<li>Próximo cobro: ${datos.proximoCobro}</li>` : ""}
      </ul>
      <p>Si tienes alguna consulta sobre tu facturación, escríbenos a facturacion@darivopro.com.</p>
      ${pie("facturacion@darivopro.com")}
    `),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// 3. Pago fallido — facturacion@ — webhook fallido dLocal
// ─────────────────────────────────────────────────────────────────────────
export function plantillaPagoFallido(datos: {
  nombre: string;
  monto?: number;
  moneda?: string;
  plan: string;
  enlaceActualizar: string;
}): EmailContenido {
  return {
    subject: "Hay un problema con tu pago — Darivo Pro",
    html: layout(`
      <p>Hola ${datos.nombre},</p>
      <p>No pudimos procesar el cobro de tu suscripción a Darivo Pro. Para que sigas usando tu cuenta sin problemas, te pedimos actualizar tu método de pago cuanto antes.</p>
      <p>Detalle:</p>
      <ul style="padding-left:20px;">
        <li>Plan: ${datos.plan}</li>
        ${datos.monto != null && datos.moneda ? `<li>Monto: ${montoTxt(datos.monto, datos.moneda)}</li>` : ""}
      </ul>
      <p>Actualiza tu método de pago aquí: <a href="${datos.enlaceActualizar}">${datos.enlaceActualizar}</a></p>
      <p>Si ya realizaste el pago o tienes alguna duda, escríbenos a facturacion@darivopro.com y lo revisamos contigo.</p>
      ${pie("facturacion@darivopro.com")}
    `),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// 4. Restablecer contraseña — noreply@ — gestionado por Supabase Auth, NO por
// este módulo. Texto real ya aplicado en supabase/templates/recovery.html
// (config.toml) — ver send.ts para el detalle de por qué no hay función aquí.
// ─────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────
// 5. Cambio de plan — noreply@ — al confirmarse upgrade/downgrade
// ─────────────────────────────────────────────────────────────────────────
export function plantillaCambioPlan(datos: {
  nombre: string;
  planAnterior: string;
  planNuevo: string;
  monto: number;
  moneda: string;
  fecha: string;
}): EmailContenido {
  return {
    subject: "Tu plan en Darivo Pro fue actualizado",
    html: layout(`
      <p>Hola ${datos.nombre},</p>
      <p>Te confirmamos que tu plan en Darivo Pro fue actualizado con éxito.</p>
      <p>Detalle del cambio:</p>
      <ul style="padding-left:20px;">
        <li>Plan anterior: ${datos.planAnterior}</li>
        <li>Plan nuevo: ${datos.planNuevo}</li>
        <li>Nuevo monto: ${montoTxt(datos.monto, datos.moneda)} / mes</li>
        <li>Vigente desde: ${datos.fecha}</li>
      </ul>
      <p>Ya puedes disfrutar de las funciones de tu nuevo plan. Si tienes alguna consulta, escríbenos a soporte@darivopro.com.</p>
      ${pie("noreply@darivopro.com", { noResponder: true })}
    `),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// 6. Bienvenida Partner — partners@ — al activarse un partner en Admin
// ─────────────────────────────────────────────────────────────────────────
export function plantillaBienvenidaPartner(datos: {
  nombre: string;
  codigo: string;
  enlace: string;
  /** % de comisión por venta vigente — leído de partner_comisiones_config, no hardcodeado. */
  porcentajeVenta: number;
}): EmailContenido {
  return {
    subject: "Bienvenido al Programa Partner de Darivo Pro",
    html: layout(`
      <p>Hola ${datos.nombre},</p>
      <p>Ya eres parte del Programa Partner de Darivo Pro. A partir de ahora, cada vez que alguien se registre con tu código o enlace, tú ganas una comisión.</p>
      <p>Tu código de referido: <strong>${datos.codigo}</strong><br/>Tu enlace personalizado: <a href="${datos.enlace}">${datos.enlace}</a></p>
      <p>Cómo funciona:</p>
      <ul style="padding-left:20px;">
        <li>Ganas un ${datos.porcentajeVenta}% de comisión por cada venta referida.</li>
        <li>Además, hay bonos adicionales según la cantidad de clientes que refieras.</li>
      </ul>
      <p>Puedes compartir tu enlace en tus redes o directamente con maestros de obra que conozcas. Nosotros nos encargamos del resto.</p>
      <p>Cualquier consulta sobre el programa, escríbenos a partners@darivopro.com.</p>
      ${pie("partners@darivopro.com")}
    `),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// 7. Comisión ganada — partners@ — al insertarse fila en partner_comisiones_historial
// ─────────────────────────────────────────────────────────────────────────
export function plantillaComisionGanada(datos: {
  nombre: string;
  monto: number;
  moneda: string;
  tipo: "venta" | "hito";
  totalReferidos: number;
}): EmailContenido {
  return {
    subject: "¡Ganaste una comisión en Darivo Pro!",
    html: layout(`
      <p>Hola ${datos.nombre},</p>
      <p>Buenas noticias: ${datos.tipo === "venta" ? "acabas de generar una nueva venta" : "alcanzaste un nuevo hito"} con tu código de referido.</p>
      <p>Detalle:</p>
      <ul style="padding-left:20px;">
        <li>Tipo: ${datos.tipo === "venta" ? "Venta" : "Hito alcanzado"}</li>
        <li>Comisión: ${montoTxt(datos.monto, datos.moneda)}</li>
        <li>Total de clientes referidos hasta hoy: ${datos.totalReferidos}</li>
      </ul>
      <p>Sigue así — mientras más maestros de obra conozcan Darivo Pro a través de ti, más comisiones generas.</p>
      <p>Cualquier consulta sobre tus pagos, escríbenos a partners@darivopro.com.</p>
      ${pie("partners@darivopro.com")}
    `),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// 8. Ticket recibido — soporte@ — al crearse ticket
// Conectado 16/07/2026 — ver POST /api/soporte/tickets/route.ts.
// ─────────────────────────────────────────────────────────────────────────
export function plantillaTicketRecibido(datos: {
  nombre: string;
  numeroTicket: string;
  resumen: string;
}): EmailContenido {
  return {
    subject: "Recibimos tu consulta — Darivo Pro",
    html: layout(`
      <p>Hola ${datos.nombre},</p>
      <p>Recibimos tu consulta y ya está en manos de nuestro equipo de soporte.</p>
      <p>Número de ticket: <strong>${datos.numeroTicket}</strong><br/>Resumen: ${datos.resumen}</p>
      <p>Te responderemos a la brevedad. Si necesitas agregar más información, puedes responder directamente a este correo.</p>
      ${pie("soporte@darivopro.com")}
    `),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// 9. Ticket resuelto — soporte@ — al marcarse resuelto
// Conectado 16/07/2026 — ver actualizarEstadoTicket() en lib/admin-queries.ts.
// ─────────────────────────────────────────────────────────────────────────
export function plantillaTicketResuelto(datos: {
  nombre: string;
  numeroTicket: string;
  resumenSolucion: string;
}): EmailContenido {
  return {
    subject: "Tu consulta fue resuelta — Darivo Pro",
    html: layout(`
      <p>Hola ${datos.nombre},</p>
      <p>Te confirmamos que tu ticket ya fue resuelto.</p>
      <p>Número de ticket: <strong>${datos.numeroTicket}</strong><br/>Resumen de la solución: ${datos.resumenSolucion}</p>
      <p>Si el problema persiste o tienes otra consulta, no dudes en escribirnos nuevamente a soporte@darivopro.com.</p>
      <p>Gracias por tu paciencia.</p>
      ${pie("soporte@darivopro.com")}
    `),
  };
}
