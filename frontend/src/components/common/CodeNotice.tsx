"use client";

import { ERROR_CATALOG, type CodeSeverity } from "@/lib/error-catalog";

const TONE: Record<CodeSeverity, { bg: string; text: string; code: string }> = {
  error: { bg: "#FEE2E2", text: "#B91C1C", code: "#B91C1C" },
  pending: { bg: "#FFFBEB", text: "#92400E", code: "#D97706" },
};

interface CodeNoticeProps {
  /** Código del catálogo, ej. "PEND-001", "ERR-004", "INC-A01". Ver CATALOGO-DE-ERRORES.md. */
  code: string;
  /** Muestra también la segunda línea (contexto técnico corto) del catálogo. */
  detalle?: boolean;
  className?: string;
}

/**
 * Nota reutilizable para errores reales o funcionalidad pendiente. Solo
 * recibe un código — nunca un mensaje de error dinámico ni datos técnicos
 * en vivo — y resuelve el texto a mostrar contra ERROR_CATALOG, para no
 * exponer nunca información sensible del sistema.
 */
export function CodeNotice({ code, detalle = false, className }: CodeNoticeProps) {
  const entry = ERROR_CATALOG[code];
  const tone = TONE[entry?.severidad ?? "pending"];

  return (
    <div
      className={`rounded-xl px-4 py-3 text-xs${className ? ` ${className}` : ""}`}
      style={{ background: tone.bg, color: tone.text }}
    >
      <p>
        <span className="font-mono font-bold" style={{ color: tone.code }}>
          {code}
        </span>
        {" · "}
        {entry?.mensaje ?? "Código sin registrar en el catálogo."}
      </p>
      {detalle && entry?.detalle && <p className="mt-1 opacity-80">{entry.detalle}</p>}
    </div>
  );
}
