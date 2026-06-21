// DARIVO PRO — Utilidades globales

/** Formatea como Sol peruano */
export const fmtPEN = (n: number, sym = "S/") =>
  `${sym} ${(n || 0).toLocaleString("es-PE", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;

/** Fecha hoy YYYY-MM-DD */
export const hoy = () => new Date().toISOString().slice(0, 10);

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
