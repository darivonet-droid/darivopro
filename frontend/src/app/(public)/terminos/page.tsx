import { readFileSync } from "fs";
import { join } from "path";
import { MarkdownLegal } from "@/components/legal/MarkdownLegal";

export const dynamic = "force-static";
export const metadata = {
  title: "Términos y Condiciones — Darivo Pro",
  description: "Términos y condiciones de uso de Darivo Pro.",
};

export default function TerminosPage() {
  // Documento legal publicado tal cual (borrador pendiente de revisión legal);
  // los marcadores [pendiente] se mantienen visibles a propósito.
  const source = readFileSync(join(process.cwd(), "src/content/legal/terminos.md"), "utf8");
  return (
    <article className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 20px rgba(10,22,40,0.09)" }}>
      <MarkdownLegal source={source} />
    </article>
  );
}
