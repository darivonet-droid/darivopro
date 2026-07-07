/**
 * Prueba local: genera PDF de cotizacion de ejemplo en disco.
 * Uso: npm run test:pdf
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { CotizacionPdfDocument } from "../src/lib/pdf/CotizacionPdfDocument";
import { COTIZACION_EJEMPLO } from "../src/lib/pdf/generate";

async function main() {
  const buffer = await renderToBuffer(
    React.createElement(CotizacionPdfDocument, {
      data: COTIZACION_EJEMPLO,
      fechaGeneracion: new Date().toLocaleDateString("es-PE"),
    })
  );

  const outDir = join(process.cwd(), "test-output");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "cotizacion-ejemplo.pdf");
  writeFileSync(outPath, buffer);

  const header = buffer.subarray(0, 5).toString("utf8");
  if (header !== "%PDF-") {
    console.error("FAIL: archivo generado no es un PDF válido");
    process.exit(1);
  }

  console.log("OK: PDF generado correctamente");
  console.log("Ruta:", outPath);
  console.log("Tamaño:", buffer.length, "bytes");
}

main().catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});
