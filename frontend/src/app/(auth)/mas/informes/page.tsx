"use client";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { InformesTab } from "@/components/informes/InformesTab";
import { T } from "@/lib/theme";

/** Informes desde Más — 07-MODULO-MAS.md §6 (Semana / Mes / Anual) */
export default function InformesMasPage() {
  return (
    <div>
      <PageHeader titulo="Informes" subtitulo="Semana · Mes · Anual" />
      <main className="px-4 py-4">
        <InformesTab />
        <p className="mt-2 text-center text-[10px]" style={{ color: T.textLight }}>
          Informe anual consolidado: ver pestaña Trimestral (evolución por trimestres)
        </p>
        <Link href="/mas" className="mt-4 block text-center text-sm font-bold" style={{ color: T.blue }}>
          ← Volver a Más
        </Link>
      </main>
    </div>
  );
}
