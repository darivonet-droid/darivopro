"use client";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { InformesTab } from "@/components/informes/InformesTab";
import { T } from "@/lib/theme";

/** UI real de Informes (Móvil) — extraída de app/(auth)/mas/informes/page.tsx
 * para que ese archivo pueda ser un Server Component (gating de rol Técnico,
 * Tarea 2 CLAUDE.md 17/07/2026) sin perder el estado/interactividad de aquí. */
export function InformesMasPageClient() {
  return (
    <div>
      <PageHeader titulo="Informes" subtitulo="Semana · Mes · Anual" />
      <main className="px-4 py-4">
        <InformesTab />
        <Link href="/mas" className="mt-4 block text-center text-sm font-bold" style={{ color: T.blue }}>
          ← Volver a Más
        </Link>
      </main>
    </div>
  );
}
