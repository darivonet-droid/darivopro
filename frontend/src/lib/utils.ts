// DARIVO PRO — Utilidades globales

/** Formatea como Sol peruano */
export const fmtPEN = (n: number, sym = "S/") =>
  `${sym} ${(n || 0).toLocaleString("es-PE", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;

/** Fecha hoy YYYY-MM-DD */
export const hoy = () => new Date().toISOString().slice(0, 10);

/** Normaliza un teléfono a SOLO dígitos (sin espacios, +, guiones). "" → "" */
export const soloDigitos = (s?: string | null) => {
  const digits = (s ?? "").replace(/\D/g, "");
  // Perú: 51 + 9 dígitos locales → quitar prefijo de país (03-MODULO-CLIENTES.md §2)
  if (digits.length === 11 && digits.startsWith("51")) {
    return digits.slice(2);
  }
  return digits;
};

/** Calcula IGV 18% Perú — siempre subtotal × 0.18 */
export const calcIGV = (subtotal: number) => {
  const igv = Math.round(subtotal * 0.18 * 100) / 100;
  const total = Math.round((subtotal + igv) * 100) / 100;
  return { neto: subtotal, igv, total };
};

/** Agrupa items por capítulo */
export const agruparPorCapitulo = <T extends { catLabel?: string; capNombre?: string }>(
  items: T[]
): Record<string, T[]> => {
  const g: Record<string, T[]> = {};
  items.forEach(it => {
    const cap = it.catLabel || it.capNombre || "Sin capítulo";
    (g[cap] = g[cap] || []).push(it);
  });
  return g;
};

/** Valida RUC peruano */
export const validarRUC = (ruc: string) => /^\d{11}$/.test(ruc);

/** Filtro de fecha relativo a hoy — botones Hoy/Semanal/Mensual (Clientes/Facturas/Nueva factura). */
export type FiltroFecha = "hoy" | "semana" | "mes";

/** "Hoy" siempre en hora de Perú (America/Lima, UTC-5 fijo, sin horario de
 * verano) — no la hora local del dispositivo del usuario ni la del servidor.
 * Semanal/Mensual son ventana rolling de 7/30 días en tiempo absoluto, por lo
 * que no dependen de zona horaria (a diferencia de "mismo día calendario"). */
const FORMATO_DIA_LIMA = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Lima",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function diaEnLima(fecha: Date): string {
  return FORMATO_DIA_LIMA.format(fecha);
}

/** ¿La fecha cae dentro del rango del filtro? `null` = sin filtro, siempre true. */
export function cumpleFiltroFecha(fechaISO: string | null | undefined, filtro: FiltroFecha | null): boolean {
  if (!filtro) return true;
  if (!fechaISO) return false;
  const fecha = new Date(fechaISO);
  const ahora = new Date();
  if (filtro === "hoy") return diaEnLima(fecha) === diaEnLima(ahora);
  const dias = filtro === "semana" ? 7 : 30;
  const limite = new Date(ahora.getTime() - dias * 86400000);
  return fecha >= limite && fecha <= ahora;
}

/**
 * Valida teléfono peruano por cantidad de dígitos (sin selector de tipo visible):
 * 9 dígitos → debe empezar en "9" (celular); 8 o menos → sin restricción (fijo);
 * más de 9 → inválido. Vacío se considera válido (campo opcional).
 */
export function validarTelefono(telefono?: string | null): { valido: boolean; mensaje?: string } {
  const digitos = soloDigitos(telefono);
  if (digitos.length === 0) return { valido: true };
  if (digitos.length > 9) return { valido: false, mensaje: "Máximo 9 dígitos" };
  if (digitos.length === 9 && !digitos.startsWith("9")) {
    return { valido: false, mensaje: "Un número de 9 dígitos debe empezar en 9" };
  }
  return { valido: true };
}

/** Contador correlativo de facturas */
let _counter = 1;
export const nextInvoiceNum = () => `F001-${String(_counter++).padStart(6, "0")}`;

/** Construye mensaje WhatsApp para cotización */
export function buildWAMsgCotizacion(params: {
  cotNum?:     string;
  clientName:  string;
  groupedItems: Record<string, { svcLabel: string; calcType: string; qty: number; unitPrice: number; subtotal: number; unit: string }[]>;
  totalBase:   number;
  totalLabor:  number;
  margin:      number;
  totalFinal:  number;
  pdfUrl?:     string;
  sym?:        string;
}): string {
  const sym = params.sym ?? "S/";
  const fmt = (n: number) =>
    `${sym} ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const desglose = Object.entries(params.groupedItems)
    .map(([cat, its]) => {
      const lineas = its
        .map((it) =>
          it.calcType === "fixed"
            ? `  • ${it.svcLabel}: ${fmt(it.subtotal)}`
            : `  • ${it.svcLabel}: ${it.qty} ${it.unit} × ${fmt(it.unitPrice)} = ${fmt(it.subtotal)}`
        )
        .join("\n");
      return `▸ ${cat.toUpperCase()}\n${lineas}`;
    })
    .join("\n\n");

  const saludo = params.clientName && params.clientName !== "Sin cliente"
    ? `Hola ${params.clientName},`
    : "Hola,";

  const ref = params.cotNum ? ` ${params.cotNum}` : "";
  const pdfLine = params.pdfUrl ? `\n\n📄 PDF: ${params.pdfUrl}` : "";

  return `${saludo}

Te envío la cotización${ref}:

${desglose}

━━━━━━━━━━━━━━━━
Materiales:        ${fmt(params.totalBase)}
Mano de obra (${params.margin}%): ${fmt(params.totalLabor)}
*TOTAL: ${fmt(params.totalFinal)}*${pdfLine}

Generado con darivopro.com`;
}

/** Construye mensaje WhatsApp para factura */
export const buildWAMessage = (
  clientName: string,
  items: Array<{ desc: string; subtotal: number }>,
  totales: { base: number; igv: number; total: number; sym: string },
  empresa: { razonSocial: string; ruc: string },
  invNum: string
) => `Estimado/a ${clientName},

Le envío la factura ${invNum} por el servicio realizado.

${items.map(it => `• ${it.desc}: ${totales.sym} ${it.subtotal.toFixed(2)}`).join("\n")}

Base imponible: ${totales.sym} ${totales.base.toFixed(2)}
IGV (18%): ${totales.sym} ${totales.igv.toFixed(2)}
TOTAL: ${totales.sym} ${totales.total.toFixed(2)}

${empresa.razonSocial}
RUC: ${empresa.ruc}
Generado con darivopro.com`;
