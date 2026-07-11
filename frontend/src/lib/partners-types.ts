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
  comisiones: ComisionPartner[];
  createdAt: string;
}

export interface PartnerReferido {
  email: string;
  fecha: string;
}

/** Fila real de `partner_comisiones_historial` — el Partner solo ve el
 *  resultado (pendiente/pagada), nunca el mecanismo de revisión interno
 *  (PANEL-PARTNER.md § Tiempos de pago). */
export interface ComisionPartner {
  id: string;
  tipo: "venta" | "hito";
  monto: number;
  moneda: string;
  estado: "pendiente" | "pagada";
  pagadaAt?: string;
  createdAt: string;
}

/**
 * Plan de comisiones — 06-PANEL-ADMIN-PARTNERS.md §5.1 (aprobado por el
 * propietario 07/07/2026). Sustituye y deroga la tabla anterior por tramo de
 * registros (S/6–S/12) — esa tabla queda oficialmente eliminada, no debe
 * volver a documentarse ni configurarse.
 *
 * Editable desde Admin (§5/§8 "Configurar tabla de comisiones") — persistido
 * en `partner_comisiones_config` desde el 13/07/2026, ya NO es una constante
 * de código. Usar `obtenerComisionesConfig()` (ecosystem-store.ts) para leer
 * los valores vigentes; este archivo ya no define el plan, solo sus tipos.
 */
export interface ComisionConfigRow {
  id: string;
  tipo: "venta" | "hito";
  /** null solo para tipo="venta" (comisión única, no por tramo) */
  hito: number | null;
  porcentaje: number;
}

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
 * Calcula el hito actual/siguiente de un Partner según §5.1: a partir del
 * último hito configurado el bono se mantiene fijo (techo permanente), pero
 * los hitos de reconocimiento siguen marcándose cada (paso = distancia entre
 * los 2 últimos hitos configurados).
 *
 * Los UMBRALES de hito (5/20/50/100 clientes propios) son estructurales, no
 * editables desde Admin — solo los `bonoPorcentaje` vienen de
 * `partner_comisiones_config` (§ "Configurar tabla de comisiones"). `hitos`
 * debe venir ordenado ascendente por `hito`.
 */
export function calcularProgresoHitos(
  clientes: number,
  hitos: { hito: number; bonoPorcentaje: number }[]
): ProgresoHitosPartner {
  let hitoActual = 0;
  let bonoActual = 0;
  for (const h of hitos) {
    if (clientes >= h.hito) {
      hitoActual = h.hito;
      bonoActual = h.bonoPorcentaje;
    }
  }

  const ultimo = hitos[hitos.length - 1];
  const penultimo = hitos[hitos.length - 2];
  const paso = ultimo && penultimo ? ultimo.hito - penultimo.hito : 0;

  if (ultimo && clientes >= ultimo.hito && paso > 0) {
    hitoActual = ultimo.hito + Math.floor((clientes - ultimo.hito) / paso) * paso;
    bonoActual = ultimo.bonoPorcentaje;
  }

  let hitoSiguiente = hitos.find((h) => clientes < h.hito)?.hito;
  if (hitoSiguiente === undefined) {
    hitoSiguiente = paso > 0 ? hitoActual + paso : hitoActual;
  }

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
