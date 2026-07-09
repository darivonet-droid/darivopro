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

/**
 * Plan oficial de comisiones — 06-PANEL-ADMIN-PARTNERS.md §5.1 (aprobado por
 * el propietario 07/07/2026). Sustituye y deroga la tabla anterior por
 * tramo de registros (S/6–S/12) — esa tabla queda oficialmente eliminada,
 * no debe volver a documentarse ni configurarse.
 */
export const COMISION_VENTA_PORCENTAJE = 20;

/** Bono escalonado por hitos de clientes propios referidos (por Partner individual). */
export const HITOS_COMISION_OFICIALES = [
  { hito: 5, bonoPorcentaje: 10 },
  { hito: 20, bonoPorcentaje: 10 },
  { hito: 50, bonoPorcentaje: 15 },
  { hito: 100, bonoPorcentaje: 20 },
] as const;

export interface ProgresoHitosPartner {
  /** Clientes propios acumulados (registros del Partner). */
  clientes: number;
  /** Último hito alcanzado (0 si aún no llega a 5). */
  hitoActual: number;
  /** % de bono correspondiente al hito actual (0 si ninguno). */
  bonoActual: number;
  /** Siguiente hito a alcanzar. */
  hitoSiguiente: number;
  /** Clientes que faltan para el siguiente hito. */
  faltantes: number;
  /** Progreso 0–1 hacia el siguiente hito. */
  progreso: number;
}

/**
 * Calcula el hito actual/siguiente de un Partner según §5.1: a partir de 100
 * clientes el bono se mantiene fijo en 20% (techo permanente), pero los
 * hitos de reconocimiento siguen marcándose cada 50 (150, 200, 250…).
 */
export function calcularProgresoHitos(clientes: number): ProgresoHitosPartner {
  let hitoActual = 0;
  let bonoActual = 0;
  for (const h of HITOS_COMISION_OFICIALES) {
    if (clientes >= h.hito) {
      hitoActual = h.hito;
      bonoActual = h.bonoPorcentaje;
    }
  }
  if (clientes >= 100) {
    hitoActual = 100 + Math.floor((clientes - 100) / 50) * 50;
    bonoActual = 20;
  }

  let hitoSiguiente: number;
  if (clientes < 5) hitoSiguiente = 5;
  else if (clientes < 20) hitoSiguiente = 20;
  else if (clientes < 50) hitoSiguiente = 50;
  else if (clientes < 100) hitoSiguiente = 100;
  else hitoSiguiente = hitoActual + 50;

  const base = hitoActual;
  const rango = hitoSiguiente - base;
  const avance = clientes - base;
  const progreso = rango > 0 ? Math.min(1, Math.max(0, avance / rango)) : 0;

  return {
    clientes,
    hitoActual,
    bonoActual,
    hitoSiguiente,
    faltantes: Math.max(0, hitoSiguiente - clientes),
    progreso,
  };
}

export const PARTNERS_STORAGE_KEY = "darivo_partners_registry_v1";
