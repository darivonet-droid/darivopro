import type { Detraccion, Factura, InvStatus, TipoDetraccion } from "@/types";

export type FiltroFactura = "Todas" | "Emitidas" | "Cobradas" | "Pendientes";
export type TipoComprobante = "boleta" | "factura";
export type FormaPago = "Efectivo" | "Yape" | "Transferencia" | "Crédito";

/* ─── Detracciones SUNAT ──────────────────────────────────── */
export const DETRACCION_UMBRAL = 700; // S/700

export interface OpcionDetraccion {
  tipo:    TipoDetraccion;
  label:   string;
  emoji:   string;
  codigos: string;
  pct:     number;
}

export const OPCIONES_DETRACCION: OpcionDetraccion[] = [
  {
    tipo:    "construccion",
    label:   "Construcción / Remodelación",
    emoji:   "🏗️",
    codigos: "030",
    pct:     4,
  },
  {
    tipo:    "mantenimiento",
    label:   "Reparación / Mantenimiento",
    emoji:   "🔧",
    codigos: "022/037",
    pct:     12,
  },
];

export function calcularDetraccion(
  total: number,
  tipo: TipoDetraccion,
  ctaDetracciones?: string
): Detraccion {
  const opcion = OPCIONES_DETRACCION.find((o) => o.tipo === tipo)!;
  const pct    = opcion.pct;
  const monto  = Math.round(total * pct) / 100;
  const neto   = Math.round((total - monto) * 100) / 100;
  return { tipo, pct, monto, neto, ctaDetracciones };
}

/* ─── Validaciones RUC Perú ───────────────────────────────── */
export function validarRucFactura(ruc: string): boolean {
  return /^\d{11}$/.test(ruc) && (ruc.startsWith("10") || ruc.startsWith("20"));
}

export function validarDni(dni: string): boolean {
  return /^\d{8}$/.test(dni);
}

/* ─── Filtros ─────────────────────────────────────────────── */
export function filtrarFacturas(facturas: Factura[], filtro: FiltroFactura): Factura[] {
  if (filtro === "Todas") return facturas;
  if (filtro === "Emitidas") {
    return facturas.filter((f) => f.invStatus === "Emitida" || f.invStatus === "Cobrada");
  }
  if (filtro === "Cobradas") return facturas.filter((f) => f.invStatus === "Cobrada");
  // Pendientes = emitidas sin cobrar (estado Emitida)
  return facturas.filter((f) => f.invStatus === "Emitida");
}

/** Estados oficiales de factura — referencia única para validaciones UI */
export const INV_STATUSES: InvStatus[] = [
  "Borrador",
  "En proceso",
  "Emitida",
  "Rechazada",
  "Pendiente de envío",
  "Cobrada",
];

/* ─── Numeración (8 dígitos, serie B001 / F001) ──────────── */
export function nextNumeroComprobante(
  tipo: TipoComprobante,
  existentes: string[]
): string {
  const prefijo = tipo === "boleta" ? "B001" : "F001";
  const nums = existentes
    .filter((n) => n.startsWith(prefijo))
    .map((n) => parseInt(n.split("-")[1] ?? "0", 10))
    .filter((n) => !Number.isNaN(n));
  const siguiente = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefijo}-${String(siguiente).padStart(8, "0")}`;
}

export function labelTipoComprobante(tipo: TipoComprobante): string {
  return tipo === "boleta" ? "BOLETA DE VENTA" : "FACTURA ELECTRÓNICA";
}

/* ─── WhatsApp ────────────────────────────────────────────── */
export function buildFacturaWhatsAppUrl(phone: string, invNum: string, total: number, sym: string): string {
  const digits = phone.replace(/\D/g, "");
  const num = digits.startsWith("51") ? digits : `51${digits}`;
  const msg = `Hola, te envío el comprobante ${invNum} por ${sym} ${total.toFixed(2)}.\n\nGenerado con DARIVO PRO`;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}
