"use client";

import { useMemo, useState } from "react";
import { AdminBadge, AdminTabs } from "@/components/admin/AdminTabs";
import { AdminKpiCard, AdminTable } from "@/components/admin/AdminUi";
import { T } from "@/lib/design-system/tokens";
import type { AdminPerfilRow } from "@/lib/admin-queries";

const TABS = ["Empresas", "Solicitudes", "Historial"] as const;

interface AdminEmpresasViewProps {
  perfiles: AdminPerfilRow[];
}

export function AdminEmpresasView({ perfiles }: AdminEmpresasViewProps) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Empresas");
  const [buscar, setBuscar] = useState("");

  const empresas = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    return perfiles.filter((p) => {
      if (!q) return true;
      return (
        (p.razon_social ?? "").toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q) ||
        (p.ruc ?? "").includes(q)
      );
    });
  }, [perfiles, buscar]);

  const activas = perfiles.filter((p) => p.onboarding_done).length;
  const suspendidas = 0;

  return (
    <div>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <AdminKpiCard label="Total empresas" value={perfiles.length} />
        <AdminKpiCard label="Activas" value={activas} />
        <AdminKpiCard label="Suspendidas" value={suspendidas} hint="Gestión pendiente BD" />
        <AdminKpiCard label="Onboarding pendiente" value={perfiles.length - activas} />
      </div>

      <AdminTabs tabs={[...TABS]} active={tab} onChange={(t) => setTab(t as (typeof TABS)[number])} />

      {tab === "Empresas" && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <input
              type="search"
              placeholder="Buscar empresa…"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              className="min-w-[200px] flex-1 rounded-xl border px-4 py-2.5 text-sm"
              style={{ borderColor: T.slateD }}
            />
          </div>
          <AdminTable
            headers={["Empresa", "Plan", "Estado", "RUC", "Contacto", "Alta"]}
            vacio="Sin empresas registradas"
            rows={empresas.map((e) => [
              e.razon_social || "—",
              e.plan_tipo ?? "gratis",
              e.onboarding_done ? (
                <AdminBadge key="a" label="Activa" tone="success" />
              ) : (
                <AdminBadge key="p" label="Onboarding" tone="warning" />
              ),
              e.ruc || "—",
              e.email || e.telefono || "—",
              new Date(e.created_at).toLocaleDateString("es-PE"),
            ])}
          />
          <p className="mt-3 text-xs" style={{ color: T.textLight }}>
            Listado desde perfiles Supabase — tabla empresas dedicada pendiente BD (Doc 02 §9).
          </p>
        </>
      )}

      {tab === "Solicitudes" && (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: T.slate, color: T.textMid }}
        >
          <p className="text-sm">No hay solicitudes de empresa pendientes.</p>
          <p className="mt-2 text-xs" style={{ color: T.textLight }}>
            Flujo solicitudes — pendiente BD empresas (Doc 02 §9).
          </p>
        </div>
      )}

      {tab === "Historial" && (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: T.slate, color: T.textMid }}
        >
          <p className="text-sm">Historial de cambios — pendiente auditoría BD.</p>
        </div>
      )}
    </div>
  );
}
