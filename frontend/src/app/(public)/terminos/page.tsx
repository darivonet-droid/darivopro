import { readFileSync } from "fs";
import { join } from "path";
import { MarkdownLegal } from "@/components/legal/MarkdownLegal";

export const dynamic = "force-static";
export const metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso de Darivo Pro.",
};

export default function TerminosPage() {
  // Documento legal publicado tal cual (borrador pendiente de revisión legal);
  // los marcadores [pendiente] dentro de las cláusulas se mantienen visibles a
  // propósito (decisión legal previa, no tocada). El bloque "Changelog" +
  // "Fin del documento" del .md sí se quitó 20/07/2026 — citaba archivos .md
  // internos por nombre y es una nota de trabajo, no contenido legal (ver
  // REGLA PERMANENTE en CLAUDE.md).
  const source = readFileSync(join(process.cwd(), "src/content/legal/terminos.md"), "utf8");
  return (
    <article className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 20px rgba(10,22,40,0.09)" }}>
      <MarkdownLegal source={source} />
    </article>
  );
}
