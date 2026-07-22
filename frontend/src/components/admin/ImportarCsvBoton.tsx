"use client";

import { useRef, useState } from "react";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import {
  csvAObjetos,
  leerArchivoTexto,
  type ResultadoImportacion,
  resumenImportacion,
} from "@/lib/csv-import";

/**
 * Botón compartido "Importar (CSV)" de los módulos Admin (Etapa 6, 21/07/2026).
 * Parsea el archivo en el cliente y procesa cada fila vía la Server Action que
 * le pase el módulo (mismo guard de Admin y misma validación que la creación
 * manual). Procesamiento secuencial a propósito — cada fila puede disparar una
 * invitación de correo real; en paralelo saturaría el rate-limit de Supabase.
 */
export function ImportarCsvBoton({
  label,
  columnas,
  procesarFila,
  onTerminado,
  notaExtra,
}: {
  label: string;
  /** Cabeceras esperadas de la plantilla (se muestran como ayuda). */
  columnas: string[];
  procesarFila: (fila: Record<string, string>) => Promise<{ ok: boolean; error?: string }>;
  onTerminado?: (resultado: ResultadoImportacion) => void;
  notaExtra?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [procesando, setProcesando] = useState(false);
  const [progreso, setProgreso] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);

  async function onArchivo(archivo: File) {
    setResultado(null);
    setProcesando(true);
    try {
      const texto = await leerArchivoTexto(archivo);
      const filas = csvAObjetos(texto);
      const r: ResultadoImportacion = { total: filas.length, ok: 0, errores: [] };
      if (filas.length === 0) {
        r.errores.push({ fila: 0, detalle: "El archivo no tiene filas de datos (¿falta la cabecera o está vacío?)" });
      }
      for (let i = 0; i < filas.length; i++) {
        setProgreso(`Procesando fila ${i + 1} de ${filas.length}…`);
        try {
          const res = await procesarFila(filas[i]);
          if (res.ok) r.ok++;
          else r.errores.push({ fila: i + 2, detalle: res.error ?? "Error desconocido" });
        } catch (e) {
          r.errores.push({ fila: i + 2, detalle: e instanceof Error ? e.message : "Error inesperado" });
        }
      }
      setResultado(r);
      onTerminado?.(r);
    } catch (e) {
      setResultado({
        total: 0,
        ok: 0,
        errores: [{ fila: 0, detalle: e instanceof Error ? e.message : "No se pudo leer el archivo" }],
      });
    } finally {
      setProgreso(null);
      setProcesando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onArchivo(f);
        }}
      />
      <button
        type="button"
        disabled={procesando}
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold disabled:opacity-60"
        style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
      >
        {procesando ? progreso ?? "Importando…" : label}
      </button>
      <p className="mt-1 text-[11px] leading-snug" style={{ color: ADMIN_COLORS.textLight }}>
        CSV con cabecera: <span className="font-mono">{columnas.join(", ")}</span>. Desde Excel:
        &ldquo;Guardar como → CSV&rdquo;.{notaExtra ? ` ${notaExtra}` : ""}
      </p>
      {resultado && (
        <div
          className="mt-2 rounded-lg px-3 py-2 text-xs font-semibold"
          style={{
            background: resultado.errores.length === 0 ? ADMIN_COLORS.greenPale : ADMIN_COLORS.amberPale,
            color: resultado.errores.length === 0 ? ADMIN_COLORS.greenD : ADMIN_COLORS.amberD,
          }}
        >
          <p>{resumenImportacion(resultado)}</p>
          {resultado.errores.slice(0, 5).map((er) => (
            <p key={`${er.fila}-${er.detalle}`} className="mt-1 font-normal">
              Fila {er.fila}: {er.detalle}
            </p>
          ))}
          {resultado.errores.length > 5 && (
            <p className="mt-1 font-normal">…y {resultado.errores.length - 5} errores más.</p>
          )}
        </div>
      )}
    </div>
  );
}
