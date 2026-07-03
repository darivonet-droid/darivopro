"use client";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { T } from "@/lib/theme";

export default function PreferenciasPage() {
  return (
    <div>
      <PageHeader titulo="Preferencias generales" subtitulo="Idioma, notificaciones y moneda" />
      <main className="px-4 py-4">
        <div
          className="rounded-2xl p-5"
          style={{ background: T.white, border: `1.5px solid ${T.slateD}` }}
        >
          <Row label="Idioma" valor="Español (Perú)" />
          <Row label="Moneda por defecto" valor="PEN (S/)" />
          <Row label="Notificaciones" valor="Activadas" />
        </div>
        <p className="mt-3 text-xs text-center" style={{ color: T.textLight }}>
          Edición persistente — integración Admin pendiente
        </p>
        <Link href="/mas" className="mt-6 block text-center text-sm font-bold" style={{ color: T.blue }}>
          ← Volver a Más
        </Link>
      </main>
    </div>
  );
}

function Row({ label, valor }: { label: string; valor: string }) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: `1px solid ${T.slateD}` }}
    >
      <span className="text-sm font-semibold" style={{ color: T.textMid }}>
        {label}
      </span>
      <span className="text-sm font-bold" style={{ color: T.text }}>
        {valor}
      </span>
    </div>
  );
}
