// DARIVO PRO — Tipos TypeScript globales

export interface LineaCotizacion {
  svcId: string;
  catLabel: string;
  svcLabel: string;
  calcType: "m2" | "unit" | "hour" | "fixed";
  basePrice: number;
  unit: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

export interface Cotizacion {
  id: string;
  tenant_id: string;
  cotNum?: string;
  clientName: string;
  phone?: string;
  city?: string;
  items: LineaCotizacion[];
  margin: number;
  totalBase: number;
  totalLabor: number;
  totalFinal: number;
  status: "Borrador" | "Pendiente de firma" | "Aprobado";
  createdAt: string;
  notes?: string;
  pdfUrl?: string;   // cached after first generation
}

export interface LineaFactura {
  desc: string;
  cantidad: number;
  pu: number;
  subtotal: number;
}

export type TipoDetraccion = "construccion" | "mantenimiento";

export interface Detraccion {
  tipo:  TipoDetraccion;
  pct:   number;          // 4 o 12
  monto: number;
  neto:  number;
  ctaDetracciones?: string;
}

export type InvStatus =
  | "Borrador"
  | "En proceso"
  | "Emitida"
  | "Rechazada"
  | "Pendiente de envío"
  | "Cobrada";

export interface Factura {
  invId: string;
  tenant_id: string;
  invNum: string;
  invDate: string;
  invStatus: InvStatus;
  tipoDoc: "boleta" | "factura";
  clientName: string;
  clientRuc?: string;
  clientDni?: string;
  clientDir?: string;
  moneda: "PEN" | "USD";
  sym: string;
  items: LineaFactura[];
  subtotalBase: number;
  igvAmount: number;
  totalFinal: number;
  detraccion?: Detraccion;
  fromQuoteId?: string;
  bizData: EmpresaData;
}

export interface EmpresaData {
  razonSocial: string;
  ruc: string;
  direccion: string;
  telefono?: string;
  moneda: "PEN" | "USD";
  simbolo: string;
  tipoComprobante?: "boleta" | "factura";
  formaPago?: "Efectivo" | "Yape" | "Transferencia" | "Crédito";
  cta_detracciones?: string;
}

export interface Partida {
  id: string;
  nombre: string;
  calcType: "m2" | "unit" | "hour" | "fixed";
  precio: number;
  unidad: string;
  esPropia?: boolean;
}

export interface Capitulo {
  id: string;
  nombre: string;
  emoji: string;
  color: string;
  partidas: Partida[];
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono?: string;
  ruc?: string;
  direccion?: string;
  ciudad?: string;
  notas?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: Record<string, unknown>;
}

export interface WhatsAppPayload {
  to: string;         // número con código de país: 51XXXXXXXXX
  type: "text" | "document";
  message: string;
  documentUrl?: string;
}
