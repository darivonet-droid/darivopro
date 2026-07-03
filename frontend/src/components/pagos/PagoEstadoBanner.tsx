"use client";

import { T } from "@/lib/theme";

const MENSAJES: Record<string, { titulo: string; desc: string; color: string; bg: string }> = {
  ok: {
    titulo: "Pago recibido",
    desc: "dLocal está confirmando tu suscripción. Tu plan se activará en unos instantes.",
    color: T.greenD,
    bg: T.greenPale,
  },
  cancelado: {
    titulo: "Pago cancelado",
    desc: "No se realizó el cobro. Puedes reintentar cuando quieras — tu plan actual no cambia.",
    color: T.amberD,
    bg: T.amberPale,
  },
  error: {
    titulo: "Error en el pago",
    desc: "El pago no se completó. Reintenta o contacta soporte si el problema persiste.",
    color: "#DC2626",
    bg: "#FEE2E2",
  },
};

export function PagoEstadoBanner({ estado }: { estado?: string }) {
  if (!estado || !MENSAJES[estado]) return null;
  const m = MENSAJES[estado];
  return (
    <div
      className="mb-4 rounded-2xl p-4"
      style={{ background: m.bg, border: `1px solid ${m.color}33` }}
    >
      <p className="text-sm font-extrabold" style={{ color: m.color }}>
        {m.titulo}
      </p>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: T.textMid }}>
        {m.desc}
      </p>
    </div>
  );
}
