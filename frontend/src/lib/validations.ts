// DARIVO PRO — Schemas de validación Zod
import { z } from "zod";

export const lineaPresupuestoSchema = z.object({
  svcId: z.string().min(1),
  catLabel: z.string(),
  svcLabel: z.string().min(1),
  calcType: z.enum(["m2", "unit", "hour", "fixed"]),
  basePrice: z.number().nonnegative(),
  unit: z.string(),
  qty: z.number().positive("La cantidad debe ser mayor a 0"),
  unitPrice: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
});

export const presupuestoSchema = z.object({
  clientName: z.string().min(2, "Ingresa el nombre del cliente"),
  phone: z.string().optional(),
  city: z.string().optional(),
  items: z.array(lineaPresupuestoSchema).min(1, "Agrega al menos una partida"),
  margin: z.number().min(0).max(200),
  totalBase: z.number().nonnegative(),
  totalLabor: z.number().nonnegative(),
  totalFinal: z.number().nonnegative(),
  status: z.enum(["Borrador", "Pendiente de firma", "Aprobado"]),
  notes: z.string().optional(),
});

export const lineaFacturaSchema = z.object({
  desc: z.string().min(1, "Ingresa la descripción"),
  cantidad: z.number().positive("Cantidad inválida"),
  pu: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
});

export const empresaSchema = z.object({
  razonSocial: z.string().min(2, "Ingresa la razón social"),
  ruc: z.string().regex(/^\d{11}$/, "El RUC debe tener 11 dígitos"),
  direccion: z.string().min(3, "Ingresa la dirección"),
  telefono: z.string().optional(),
  moneda: z.enum(["PEN", "USD"]),
  simbolo: z.string(),
});

export const facturaSchema = z.object({
  clientName: z.string().min(2, "Ingresa el nombre del cliente"),
  clientRuc: z.string().regex(/^\d{8}$|^\d{11}$/, "RUC (11) o DNI (8) inválido").optional().or(z.literal("")),
  clientDir: z.string().optional(),
  items: z.array(lineaFacturaSchema).min(1, "Agrega al menos una línea"),
});

export const clienteSchema = z.object({
  nombre: z.string().min(2, "Ingresa el nombre"),
  telefono: z.string().optional(),
  ruc: z.string().regex(/^\d{8}$|^\d{11}$/, "RUC (11) o DNI (8) inválido").optional().or(z.literal("")),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  notas: z.string().optional(),
});

export type ClienteForm = z.infer<typeof clienteSchema>;
export type EmpresaForm = z.infer<typeof empresaSchema>;
