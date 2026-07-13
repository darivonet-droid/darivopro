"use client";

import { useMemo, useState } from "react";
import { AdminBadge, AdminTabs } from "@/components/admin/AdminTabs";
import { AdminKpiCard, AdminTable } from "@/components/admin/AdminUi";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import type { AdminEmpleadoInternoRow } from "@/lib/admin-queries";

const TABS = ["Empleados", "Invitaciones", "Actividad", "Historial"] as const;

interface AdminEmpleadosInternosViewProps {
  empleados: AdminEmpleadoInternoRow[];
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
        (e.nombre ?? "").toLowerCase().includes(q) ||
        (e.cargo ?? "").toLowerCase().includes(q) ||
        (e.departamento ?? "").toLowerCase().includes(q)
    );
  }, [empleados, buscar]);

  const activos = empleados.filter((e) => e.activo).length;

  return (
    <div>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <AdminKpiCard label="Total empleados" value={empleados.length} />
        <AdminKpiCard label="Activos" value={activos} />
        <AdminKpiCard label="Inactivos" value={empleados.length - activos} />
        <AdminKpiCard label="Invitaciones pendientes" value={0} hint="Sin flujo de invitación propio todavía" />
      </div>

      <AdminTabs tabs={[...TABS]} active={tab} onChange={(t) => setTab(t as (typeof TABS)[number])} />

      {tab === "Empleados" && (
        <>
          <input
            type="search"
            placeholder="Buscar por correo, nombre, cargo o departamento…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="mb-4 w-full max-w-md rounded-xl border px-4 py-2.5 text-sm"
            style={{ borderColor: ADMIN_COLORS.slateD }}
          />
          <AdminTable
            headers={["Empleado", "Cargo", "Departamento", "Estado", "Alta", "Último acceso"]}
            vacio="Sin empleados internos registrados en darivo_admin_empleados"
            rows={filtrados.map((e) => [
              <div key="n">
                <p className="font-semibold" style={{ color: ADMIN_COLORS.text }}>{e.nombre || e.email}</p>
                {e.nombre && <p className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>{e.email}</p>}
              </div>,
              e.cargo || "—",
              e.departamento || "—",
              e.activo
                ? <AdminBadge key="s" label="Activo" tone="success" />
                : <AdminBadge key="s" label="Inactivo" tone="neutral" />,
              new Date(e.created_at).toLocaleDateString("es-PE"),
              e.lastSignInAt ? new Date(e.lastSignInAt).toLocaleDateString("es-PE") : "Nunca",
            ])}
          />
          <p className="mt-3 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
            Fuente: <span className="font-mono">darivo_admin_empleados</span> (Supabase) — misma
            tabla que usa <span className="font-mono">is_darivo_admin()</span> para RLS. Editar
            empleado/cargo/departamento y Reenviar invitación (Doc 07 §8) siguen pendientes.
          </p>
        </>
      )}

      {(tab === "Invitaciones" || tab === "Actividad" || tab === "Historial") && (
        <div
          className="rounded-2xl p-8 text-center text-sm"
          style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}
        >
          {tab} — pendiente de construir (Doc 07 §5, §8).
        </div>
      )}
    </div>
  );
}
