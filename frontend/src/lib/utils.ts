// DARIVO PRO — Utilidades globales

/** Formatea como EUR */
export const fmt = (n: number) =>
  (n || 0).toLocaleString("es-ES", { style:"currency", currency:"EUR", maximumFractionDigits:0 });

/** Formatea como Sol peruano */
export const fmtPEN = (n: number, sym = "S/") =>
  `${sym} ${(n || 0).toLocaleString("es-PE", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;

/** Fecha hoy YYYY-MM-DD */
export const hoy = () => new Date().toISOString().slice(0, 10);

/** Calcula IGV 18% Perú */
export const calcIGV = (base: number, incluido = false) => {
  if (incluido) {
    const igv  = base * (18/118);
    return { neto: base - igv, igv, total: base };
  }
  const igv = base * 0.18;
  return { neto: base, igv, total: base + igv };
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

/** Contador correlativo de facturas */
let _counter = 1;
export const nextInvoiceNum = () => `F001-${String(_counter++).padStart(6, "0")}`;

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
Generado con DARIVO PRO`;
