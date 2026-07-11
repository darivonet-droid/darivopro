// DARIVO PRO — Plantillas de email transaccional
//
// ⚠️ CONTENIDO PLACEHOLDER — Mohamed comparte los 9 textos aprobados en un
// mensaje aparte (el intento anterior llegó vacío, con el marcador de
// posición sin rellenar). El copy de abajo es funcional y correcto pero NO
// es el texto final aprobado — reemplazar `subject`/`html` de cada función
// en cuanto lleguen los textos reales, sin tocar la firma de la función ni
// los puntos donde se llaman (send.ts ya los conecta a los eventos reales).

import { fmtPEN } from "@/lib/utils";

interface EmailContenido {
  subject: string;
  html: string;
}

function layout(cuerpo: string): string {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;color:#0A1628;line-height:1.5;">
    <p style="font-size:12px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">Darivo Pro</p>
    ${cuerpo}
    <p style="font-size:12px;color:#9CA3AF;margin-top:32px;">Este es un mensaje automático de Darivo Pro.</p>
  </div>`;
}

// 1. Bienvenida — info@ — al completarse el registro
export function plantillaBienvenida(datos: { nombre: string }): EmailContenido {
  return {
    subject: "Bienvenido a Darivo Pro 🎉",
    html: layout(`
      <h1 style="font-size:20px;">¡Hola, ${datos.nombre}!</h1>
      <p>Tu cuenta de Darivo Pro ya está lista. Desde la app puedes crear tu primera cotización en menos de un minuto.</p>
      <p>Cualquier duda, escríbenos respondiendo a este correo.</p>
    `),
  };
}

// 2. Pago confirmado — facturacion@ — webhook exitoso dLocal
export function plantillaPagoConfirmado(datos: {
  nombre: string;
  monto: number;
  moneda: string;
  plan: string;
}): EmailContenido {
  return {
    subject: "Pago confirmado — Darivo Pro",
    html: layout(`
      <h1 style="font-size:20px;">Pago confirmado</h1>
      <p>Hola ${datos.nombre}, confirmamos tu pago de <strong>${datos.moneda === "PEN" ? fmtPEN(datos.monto) : `${datos.moneda} ${datos.monto}`}</strong> por el <strong>Plan ${datos.plan}</strong>.</p>
      <p>Tu suscripción ya está activa.</p>
    `),
  };
}

// 3. Pago fallido — facturacion@ — webhook fallido dLocal
export function plantillaPagoFallido(datos: {
  nombre: string;
  monto?: number;
  moneda?: string;
  plan: string;
}): EmailContenido {
  const montoTxt =
    datos.monto != null
      ? datos.moneda === "PEN"
        ? fmtPEN(datos.monto)
        : `${datos.moneda} ${datos.monto}`
      : null;
  return {
    subject: "No pudimos procesar tu pago — Darivo Pro",
    html: layout(`
      <h1 style="font-size:20px;">Tu pago no se pudo procesar</h1>
      <p>Hola ${datos.nombre}, intentamos cobrar${montoTxt ? ` ${montoTxt}` : ""} por el Plan ${datos.plan} y no se pudo completar.</p>
      <p>Puedes intentarlo de nuevo desde Mi Plan en la app.</p>
    `),
  };
}

// 4. Reset de contraseña — noreply@ — gestionado por Supabase Auth, NO por este módulo.
// Ver send.ts para el detalle de por qué no hay plantillaResetPassword aquí.

// 5. Cambio de plan — noreply@ — al confirmarse upgrade/downgrade
export function plantillaCambioPlan(datos: {
  nombre: string;
  planAnterior: string;
  planNuevo: string;
}): EmailContenido {
  return {
    subject: "Tu plan de Darivo Pro cambió",
    html: layout(`
      <h1 style="font-size:20px;">Tu plan cambió</h1>
      <p>Hola ${datos.nombre}, tu plan pasó de <strong>${datos.planAnterior}</strong> a <strong>${datos.planNuevo}</strong>.</p>
      <p>Revisa en Mi Plan qué funcionalidades nuevas tienes disponibles.</p>
    `),
  };
}

// 6. Bienvenida Partner — partners@ — al activarse un partner en Admin
export function plantillaBienvenidaPartner(datos: {
  nombre: string;
  codigo: string;
  enlace: string;
}): EmailContenido {
  return {
    subject: "Bienvenido al programa de Partners de Darivo Pro",
    html: layout(`
      <h1 style="font-size:20px;">¡Bienvenido, ${datos.nombre}!</h1>
      <p>Tu cuenta de Partner ya está activa. Tu código es <strong>${datos.codigo}</strong>.</p>
      <p>Comparte tu enlace: <a href="${datos.enlace}">${datos.enlace}</a></p>
    `),
  };
}

// 7. Comisión ganada — partners@ — al insertarse fila en partner_comisiones_historial
export function plantillaComisionGanada(datos: {
  nombre: string;
  monto: number;
  moneda: string;
  tipo: "venta" | "hito";
}): EmailContenido {
  return {
    subject: "Ganaste una comisión — Darivo Pro Partners",
    html: layout(`
      <h1 style="font-size:20px;">¡Nueva comisión!</h1>
      <p>Hola ${datos.nombre}, generaste una comisión de <strong>${datos.moneda === "PEN" ? fmtPEN(datos.monto) : `${datos.moneda} ${datos.monto}`}</strong> (${datos.tipo === "venta" ? "venta referida" : "hito alcanzado"}).</p>
      <p>Revisa el detalle en tu Panel Partner.</p>
    `),
  };
}

// 8. Ticket recibido — soporte@ — al crearse ticket
// ⚠️ NO conectado todavía — el backend de tickets (/api/soporte/tickets) está
// deshabilitado (INC-A01, ver AdminSoporteView.tsx). Sin evento de creación
// real que observar, esta plantilla queda lista pero sin punto de disparo.
export function plantillaTicketRecibido(datos: { nombre: string; asunto: string }): EmailContenido {
  return {
    subject: "Recibimos tu ticket de soporte",
    html: layout(`
      <h1 style="font-size:20px;">Ticket recibido</h1>
      <p>Hola ${datos.nombre}, recibimos tu ticket "<strong>${datos.asunto}</strong>". Te responderemos pronto.</p>
    `),
  };
}

// 9. Ticket resuelto — soporte@ — al marcarse resuelto
// ⚠️ Mismo bloqueo que plantillaTicketRecibido — ver nota arriba.
export function plantillaTicketResuelto(datos: { nombre: string; asunto: string }): EmailContenido {
  return {
    subject: "Tu ticket de soporte fue resuelto",
    html: layout(`
      <h1 style="font-size:20px;">Ticket resuelto</h1>
      <p>Hola ${datos.nombre}, tu ticket "<strong>${datos.asunto}</strong>" fue marcado como resuelto.</p>
      <p>Si el problema continúa, responde a este correo para reabrirlo.</p>
    `),
  };
}
