"use client";
import Link from "next/link";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/theme";
import type { Presupuesto } from "@/types";

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  Aprobado:           { bg: T.greenPale, color: T.greenD,  label: "Aprobado"  },
  "Pendiente de firma": { bg: T.amberPale, color: T.amberD, label: "Pendiente" },
  Borrador:           { bg: T.slate,     color: T.textMid, label: "Borrador"  },
};

interface PresupuestoCardProps {
  presupuesto: Presupuesto;
  href?: string;
  onClick?: () => void;
  footer?: React.ReactNode;
}

export function PresupuestoCard({ presupuesto: p, href, onClick, footer }: PresupuestoCardProps) {
  const badge = STATUS_BADGE[p.status] ?? STATUS_BADGE.Borrador;
  const fecha = new Date(p.createdAt).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
  });

  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 pr-2">
          <p className="text-sm font-bold leading-snug" style={{ color: T.text }}>
            {p.clientName}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: T.textMid }}>
            {p.items.length} partida{p.items.length !== 1 ? "s" : ""} · {fecha}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-sm font-extrabold" style={{ color: T.blue }}>
            {fmtPEN(p.totalFinal)}
          </span>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
            style={{ background: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
        </div>
      </div>
      {footer}
    </>
  );

  const className = "block rounded-2xl bg-white px-4 py-4 shadow-sm transition-transform active:scale-[0.98]";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={`${className} ${onClick ? "cursor-pointer" : ""}`} onClick={onClick}>
      {content}
    </div>
  );
}
