"use client";

import { useMemo, useState } from "react";
import { AdminBadge, AdminTabs } from "@/components/admin/AdminTabs";
import { AdminKpiCard, AdminTable } from "@/components/admin/AdminUi";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import type { AdminPerfilRow } from "@/lib/admin-queries";

const TABS = ["Empleados", "Invitaciones", "Actividad", "Historial"] as const;

interface AdminEmpleadosInternosViewProps {
  empleados: AdminPerfilRow[];
}

export function AdminEmpleadosInternosView({ empleados }: AdminEmpleadosInternosViewProps) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Empleados");
  const [buscar, setBuscar] = useState("");

  const filtrados = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    if (!q) return empleados;
    return empleados.filter(
      (e) =>
        (e.email ?? "").toLowerCase().includes(q) ||
        (e.razon_social ?? "").toLowerCase().includes(q)
    );
  }, [empleados, buscar]);

  return (
    <div>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <AdminKpiCard label="Total empleados" value={empleados.length} />
        <AdminKpiCard label="Activos" value={empleados.length} />
        <AdminKpiCard label="Invitaciones" value={0} />
        <AdminKpiCard label="Departamentos" value="—" hint="Pendiente BD" />
      </div>

      <AdminTabs tabs={[...TABS]} active={tab} onChange={(t) => setTab(t as (typeof TABS)[number])} />

      {tab === "Empleados" && (
        <>
          <input
            type="search"
            placeholder="Buscar empleado…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="mb-4 w-full max-w-md rounded-xl border px-4 py-2.5 text-sm"
            style={{ borderColor: ADMIN_COLORS.slateD }}
          />
          <AdminTable
            headers={["Empleado", "Correo", "Estado", "Alta", "Acciones"]}
            vacio="Sin empleados internos — configure DARIVO_ADMIN_EMAILS"
            rows={filtrados.map((e) => [
              e.razon_social || e.email || "—",
              e.email || "—",
              <AdminBadge key="s" label="Activo" tone="success" />,
              new Date(e.created_at).toLocaleDateString("es-PE"),
              "—",
            ])}
          />
          <p className="mt-3 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
            Empleados internos Darivo — tabla dedicada pendiente BD (Doc 07 §9).
          </p>
        </>
      )}

      {(tab === "Invitaciones" || tab === "Actividad" || tab === "Historial") && (
        <div
          className="rounded-2xl p-8 text-center text-sm"
          style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}
        >
          {tab} — pendiente tabla empleados internos BD.
        </div>
      )}
    </div>
  );
}
