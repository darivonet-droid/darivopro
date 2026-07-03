/** Registro Partner — 06-PANEL-ADMIN-PARTNERS.md · PANEL-PARTNER.md */
export type EstadoPartner = "Activo" | "Pendiente" | "Suspendido";

export interface PartnerRegistro {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  codigo: string;
  enlace: string;
  estado: EstadoPartner;
  registros: PartnerReferido[];
  createdAt: string;
}

export interface PartnerReferido {
  email: string;
  fecha: string;
}

export const COMISIONES_OFICIALES_PLACEHOLDER = [
  { rango: "1–10 registros", comision: "Pendiente definición propietario" },
  { rango: "11–50 registros", comision: "Pendiente definición propietario" },
  { rango: "51+ registros", comision: "Pendiente definición propietario" },
] as const;

export const PARTNERS_STORAGE_KEY = "darivo_partners_registry_v1";
