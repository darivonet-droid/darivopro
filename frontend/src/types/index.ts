// DARIVO PRO — Tipos TypeScript globales

export interface LineaPresupuesto {
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

export interface Presupuesto {
  id: string;
  tenant_id: string;
  clientName: string;
  phone?: string;
  city?: string;
  items: LineaPresupuesto[];
  margin: number;
  totalBase: number;
  totalLabor: number;
  totalFinal: number;
  status: "Borrador" | "Pendiente de firma" | "Aprobado";
  createdAt: string;
  notes?: string;
}

export interface LineaFactura {
  desc: string;
  cantidad: number;
  pu: number;
  subtotal: number;
}

export interface Factura {
  invId: string;
  tenant_id: string;
  invNum: string;
  invDate: string;
  invStatus: "Pendiente" | "Emitida" | "Cobrada";
  clientName: string;
  clientRuc?: string;
  clientDir?: string;
  moneda: "PEN" | "USD";
  sym: string;
  items: LineaFactura[];
  subtotalBase: number;
  igvAmount: number;
  totalFinal: number;
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
}

export interface Partida {
  id: string;
  nombre: string;
  tipo: "m2" | "unidad" | "hora" | "fijo";
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
