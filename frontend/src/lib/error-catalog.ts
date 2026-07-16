/**
 * Diccionario fuente de verdad para <CodeNotice />. Cada código de acá debe
 * existir también en CATALOGO-DE-ERRORES.md (raíz del repo) — ese .md es
 * para consulta humana, nunca se lee en runtime ni se sirve al navegador.
 *
 * Prefijos:
 * - ERR-XXX: error real capturado (crash, excepción, fallo de servicio externo).
 * - PEND-XXX: funcionalidad que el usuario puede encontrar y todavía no existe.
 * - INC-XXX / DT-XX-XX: códigos de deuda técnica/incidencias bloqueadas ya
 *   definidos en los MD oficiales de `.cursor/rules/` — este diccionario solo
 *   espeja el mensaje corto para poder mostrarlos con el mismo componente;
 *   la fuente de verdad de su existencia sigue siendo el MD del módulo.
 */

export type CodeSeverity = "error" | "pending";

export interface CodeCatalogEntry {
  severidad: CodeSeverity;
  /** Línea corta, segura para cualquier panel (Admin o cliente final). */
  mensaje: string;
  /** Línea adicional opcional, solo se muestra si el caller pide detalle. */
  detalle?: string;
}

export const ERROR_CATALOG: Record<string, CodeCatalogEntry> = {
  "PEND-001": {
    severidad: "pending",
    mensaje: "Editar un gasto ya guardado todavía no está disponible.",
    detalle:
      "Por ahora puedes ver el detalle, pero no modificarlo — el guardado (useGastos.ts) solo admite registrar gastos nuevos.",
  },
};

/** Línea de una sola oración "CODIGO · mensaje", para usos de texto plano (ej. hint de una KpiCard). */
export function codeLine(code: string): string {
  const entry = ERROR_CATALOG[code];
  return entry ? `${code} · ${entry.mensaje}` : code;
}
