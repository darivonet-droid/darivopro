"use client";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { T } from "@/lib/theme";

export default function IAPreferenciasPage() {
  return (
    <div>
      <PageHeader titulo="IA — Preferencias" subtitulo="Ajustes del asistente" />
      <main className="px-4 py-4">
        <div
          className="rounded-2xl p-5"
          style={{ background: T.purplePale, border: `1px solid ${T.purple}33` }}
        >
          <p className="text-sm" style={{ color: T.text }}>
            El asistente IA se accede desde el módulo <strong>IA</strong> de la navegación principal.
            Cotizaciones por voz y texto usan OpenAI (Tarea 07).
          </p>
          <Link
            href="/ia"
            className="mt-3 inline-block text-sm font-bold"
            style={{ color: T.purple }}
          >
            Ir al módulo IA →
          </Link>
        </div>
        <Link href="/mas" className="mt-6 block text-center text-sm font-bold" style={{ color: T.blue }}>
          ← Volver a Más
        </Link>
      </main>
    </div>
  );
}
