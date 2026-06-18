import type { Factura } from "@/types";

export type FiltroFactura = "Todas" | "Emitidas" | "Cobradas" | "Pendientes";
export type TipoComprobante = "boleta" | "factura";
export type FormaPago = "Efectivo" | "Yape" | "Transferencia" | "Crédito";

export function filtrarFacturas(facturas: Factura[], filtro: FiltroFactura): Factura[] {
  if (filtro === "Todas") return facturas;
  if (filtro === "Emitidas") {
    return facturas.filter((f) => f.invStatus === "Emitida" || f.invStatus === "Cobrada");
  }
  if (filtro === "Cobradas") return facturas.filter((f) => f.invStatus === "Cobrada");
  // Pendientes de cobro: emitidas sin pagar
  return facturas.filter((f) => f.invStatus === "Emitida" || f.invStatus === "Pendiente");
}

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
  return `${prefijo}-${String(siguiente).padStart(5, "0")}`;
}

export function labelTipoComprobante(tipo: TipoComprobante): string {
  return tipo === "boleta" ? "BOLETA DE VENTA" : "FACTURA ELECTRÓNICA";
}

export function buildFacturaWhatsAppUrl(phone: string, invNum: string, total: number, sym: string): string {
  const digits = phone.replace(/\D/g, "");
  const num = digits.startsWith("51") ? digits : `51${digits}`;
  const msg = `Hola, te envío el comprobante ${invNum} por ${sym} ${total.toFixed(2)}.\n\nGenerado con DARIVO PRO`;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}
