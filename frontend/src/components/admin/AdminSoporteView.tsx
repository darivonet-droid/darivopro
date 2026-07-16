"use client";

import { useMemo, useState, useTransition } from "react";
import { AdminErrorBanner, AdminKpiCard, AdminTable } from "@/components/admin/AdminUi";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import type { AdminSoporteTicketRow } from "@/lib/admin-queries";
import type { EstadoTicket } from "@/lib/soporte-types";
import { cambiarEstadoTicketAction } from "@/app/admin/soporte/actions";

const ESTADOS: EstadoTicket[] = ["Abierto", "En progreso", "Resuelto", "Cerrado"];
const ESTADO_COLOR: Record<EstadoTicket, { bg: string; color: string }> = {
  Abierto: { bg: ADMIN_COLORS.redPale, color: ADMIN_COLORS.red },
  "En progreso": { bg: ADMIN_COLORS.amberPale, color: ADMIN_COLORS.amberD },
  Resuelto: { bg: ADMIN_COLORS.greenPale, color: ADMIN_COLORS.greenD },
  Cerrado: { bg: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid },
};

interface AdminSoporteViewProps {
  tickets: AdminSoporteTicketRow[];
}

export function AdminSoporteView({ tickets: ticketsIniciales }: AdminSoporteViewProps) {
  const [tickets, setTickets] = useState(ticketsIniciales);
  const [filtroEstado, setFiltroEstado] = useState<"todos" | EstadoTicket>("todos");
  const [filtroPlan, setFiltroPlan] = useState("todos");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const planes = useMemo(
    () => Array.from(new Set(tickets.map((t) => t.plan || "gratis"))),
    [tickets]
  );

  const filtrados = useMemo(
    () =>
      tickets.filter(
        (t) =>
          (filtroEstado === "todos" || t.estado === filtroEstado) &&
          (filtroPlan === "todos" || (t.plan || "gratis") === filtroPlan)
      ),
    [tickets, filtroEstado, filtroPlan]
  );

  const resumen = useMemo(
    () => ({
      abiertos: tickets.filter((t) => t.estado === "Abierto").length,
      enProgreso: tickets.filter((t) => t.estado === "En progreso").length,
      resueltos: tickets.filter((t) => t.estado === "Resuelto").length,
    }),
    [tickets]
  );

  const cambiarEstado = (id: string, estado: EstadoTicket) => {
    setError(null);
    startTransition(async () => {
      const result = await cambiarEstadoTicketAction(id, estado);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, estado } : t)));
    });
  };

  return (
    <div>
      {error && <AdminErrorBanner mensaje={error} />}

      <div className="mb-4 grid grid-cols-3 gap-3">
        <AdminKpiCard label="Abiertos" value={resumen.abiertos} />
        <AdminKpiCard label="En progreso" value={resumen.enProgreso} />
        <AdminKpiCard label="Resueltos" value={resumen.resueltos} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as "todos" | EstadoTicket)}
          className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
          style={{ borderColor: ADMIN_COLORS.slateD, color: ADMIN_COLORS.text }}
        >
          <option value="todos">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <select
          value={filtroPlan}
          onChange={(e) => setFiltroPlan(e.target.value)}
          className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
          style={{ borderColor: ADMIN_COLORS.slateD, color: ADMIN_COLORS.text }}
        >
          <option value="todos">Todos los planes</option>
          {planes.map((p) => (
            <option key={p} value={p}>
              {p.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <AdminTable
        headers={["Usuario", "Plan", "Asunto", "Estado", "Creado", "Cambiar estado"]}
        vacio="No hay casos de soporte con estos filtros"
        rows={filtrados.map((t) => {
          const tono = ESTADO_COLOR[t.estado];
          return [
            <div key="u">
              <p className="text-sm font-bold" style={{ color: ADMIN_COLORS.text }}>
                {t.userNombre || t.userEmail || "Sin nombre"}
              </p>
              <p className="text-xs" style={{ color: ADMIN_COLORS.textMid }}>
                {t.userEmail}
              </p>
            </div>,
            <span key="p" className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
              {(t.plan || "gratis").toUpperCase()}
            </span>,
            <div key="a">
              <p className="text-sm font-bold" style={{ color: ADMIN_COLORS.text }}>
                {t.asunto}
              </p>
              <p className="mt-0.5 max-w-xs text-xs" style={{ color: ADMIN_COLORS.textMid }}>
                {t.descripcion}
              </p>
            </div>,
            <span
              key="e"
              className="inline-block shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: tono.bg, color: tono.color }}
            >
              {t.estado}
            </span>,
            <span key="c" className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>
              {new Date(t.createdAt).toLocaleDateString("es-PE")}
            </span>,
            <select
              key="s"
              value={t.estado}
              disabled={isPending}
              onChange={(ev) => cambiarEstado(t.id, ev.target.value as EstadoTicket)}
              className="rounded-lg border px-2 py-1 text-xs font-bold"
              style={{ borderColor: ADMIN_COLORS.slateD, color: ADMIN_COLORS.text }}
            >
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>,
          ];
        })}
      />
    </div>
  );
}
