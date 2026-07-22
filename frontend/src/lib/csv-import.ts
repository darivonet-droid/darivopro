/**
 * DARIVO PRO — Import CSV 100% cliente (Etapa 6, 21/07/2026).
 *
 * Contraparte de `csv-export.ts`: parsea el archivo en el navegador y cada
 * fila se procesa vía las Server Actions ya existentes del módulo (mismo guard
 * de Admin, misma validación) — sin endpoints nuevos ni tablas nuevas.
 *
 * Alcance honesto: se acepta CSV (UTF-8, separador coma o punto y coma,
 * campos entre comillas soportados). Los MD dicen "Excel/CSV" — un .xlsx
 * binario NO se parsea aquí; Excel guarda como CSV con "Guardar como", y la
 * plantilla descargable de cada módulo ya es CSV. Documentado en la UI.
 */

/** Parsea texto CSV completo → filas de celdas. Soporta comillas, "" escapado, CRLF y BOM. */
export function parsearCsv(texto: string): string[][] {
  const limpio = texto.replace(/^﻿/, "");
  // Detecta separador: si la primera línea tiene más ";" que ",", usa ";".
  const primeraLinea = limpio.split(/\r?\n/, 1)[0] ?? "";
  const sep = (primeraLinea.match(/;/g)?.length ?? 0) > (primeraLinea.match(/,/g)?.length ?? 0) ? ";" : ",";

  const filas: string[][] = [];
  let fila: string[] = [];
  let celda = "";
  let enComillas = false;

  for (let i = 0; i < limpio.length; i++) {
    const ch = limpio[i];
    if (enComillas) {
      if (ch === '"') {
        if (limpio[i + 1] === '"') {
          celda += '"';
          i++;
        } else {
          enComillas = false;
        }
      } else {
        celda += ch;
      }
    } else if (ch === '"') {
      enComillas = true;
    } else if (ch === sep) {
      fila.push(celda);
      celda = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && limpio[i + 1] === "\n") i++;
      fila.push(celda);
      celda = "";
      filas.push(fila);
      fila = [];
    } else {
      celda += ch;
    }
  }
  if (celda !== "" || fila.length > 0) {
    fila.push(celda);
    filas.push(fila);
  }
  // Descarta filas completamente vacías.
  return filas.filter((f) => f.some((c) => c.trim() !== ""));
}

/**
 * Interpreta la primera fila como cabecera y devuelve objetos por fila.
 * Las claves se normalizan a minúsculas sin tildes ni espacios.
 */
export function csvAObjetos(texto: string): Array<Record<string, string>> {
  const filas = parsearCsv(texto);
  if (filas.length < 2) return [];
  const claves = filas[0].map((h) =>
    h
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
  );
  return filas.slice(1).map((f) => {
    const obj: Record<string, string> = {};
    claves.forEach((k, i) => {
      if (k) obj[k] = (f[i] ?? "").trim();
    });
    return obj;
  });
}

/** Lee un File del input como texto (UTF-8). */
export function leerArchivoTexto(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("No se pudo leer el archivo"));
    reader.readAsText(archivo, "utf-8");
  });
}

export interface ResultadoImportacion {
  total: number;
  ok: number;
  errores: Array<{ fila: number; detalle: string }>;
}

export function resumenImportacion(r: ResultadoImportacion): string {
  const base = `${r.ok} de ${r.total} filas importadas`;
  if (r.errores.length === 0) return `✓ ${base}`;
  return `${base} — ${r.errores.length} con error`;
}
