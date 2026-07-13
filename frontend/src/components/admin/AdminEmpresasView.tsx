"use client";

import { useMemo, useState, useTransition } from "react";
import { AdminBadge, AdminTabs } from "@/components/admin/AdminTabs";
import { AdminErrorBanner, AdminKpiCard, AdminTable } from "@/components/admin/AdminUi";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import type { AdminEmpresaRow } from "@/lib/admin-queries";
import { PRECIOS_OFICIALES, type PlanTipoPersistido } from "@/lib/roles-planes-oficial";
import { cambiarPlanEmpresaAction, setEmpresaActivaAction } from "@/app/admin/empresas/actions";

const TABS = ["Empresas", "Solicitudes", "Historial"] as const;
const PLANES_SELECCIONABLES: PlanTipoPersistido[] = ["gratis", "basico", "pro", "business"];

function labelPlan(plan: string | null): string {
  if (plan === "basico") return PRECIOS_OFICIALES.basico.nombre;
  if (plan === "pro") return PRECIOS_OFICIALES.pro.nombre;
  if (plan === "business") return PRECIOS_OFICIALES.business.nombre;
  return "GRATIS";
}

interface AdminEmpresasViewProps {
  empresas: AdminEmpresaRow[];
}

export function AdminEmpresasView({ empresas: empresasIniciales }: AdminEmpresasViewProps) {
  const [empresas, setEmpresas] = useState(empresasIniciales);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Empresas");
  const [buscar, setBuscar] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    return empresas.filter((e) => {
      if (!q) return true;
      return (
        e.razon_social.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.ruc ?? "").includes(q)
      );
    });
  }, [empresas, buscar]);

  const activas = empresas.filter((e) => e.activa).length;

  const cambiarPlan = (id: string, gerenteUserId: string, plan: PlanTipoPersistido) => {
    const anterior = empresas.find((e) => e.id === id)?.plan_tipo ?? null;
    setEmpresas((prev) => prev.map((e) => (e.id === id ? { ...e, plan_tipo: plan } : e)));
    setErrorAccion(null);
    startTransition(async () => {
      const result = await cambiarPlanEmpresaAction(gerenteUserId, plan);
      if (!result.ok) {
        setEmpresas((prev) => prev.map((e) => (e.id === id ? { ...e, plan_tipo: anterior } : e)));
        setErrorAccion(`No se pudo cambiar el plan: ${result.error}`);
      }
    });
  };

  const toggleActiva = (id: string, activa: boolean) => {
    const anterior = empresas.find((e) => e.id === id)?.activa ?? !activa;
    setEmpresas((prev) => prev.map((e) => (e.id === id ? { ...e, activa } : e)));
    setErrorAccion(null);
    startTransition(async () => {
      const result = await setEmpresaActivaAction(id, activa);
      if (!result.ok) {
        setEmpresas((prev) => prev.map((e) => (e.id === id ? { ...e, activa: anterior } : e)));
        setErrorAccion(`No se pudo actualizar el estado: ${result.error}`);
      }
    });
  };

  return (
    <div>
      {errorAccion && <AdminErrorBanner mensaje={errorAccion} />}
      {/* 02-PANEL-ADMIN-EMPRESAS.md §7 documenta 6 KPIs (Total/Autónomos/Empresas/
          Activas/Suspendidas/Inactivas); `empresas.activo` solo distingue 2 estados
          hoy, así que "Autónomos" e "Inactivas" no se pueden calcular todavía sin
          una columna/lógica nueva. Corregido 12/07/2026: la tarjeta "Onboarding
          pendiente" duplicaba exactamente "Suspendidas" con una etiqueta que no
          medía nada real — quitada en vez de dejar un dato engañoso. */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <AdminKpiCard label="Total empresas" value={empresas.length} />
        <AdminKpiCard label="Activas" value={activas} />
        <AdminKpiCard label="Suspendidas" value={empresas.length - activas} />
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
              style={{ borderColor: ADMIN_COLORS.slateD }}
            />
          </div>
          <AdminTable
            headers={["Empresa", "Plan", "Estado", "RUC", "Contacto", "Alta", "Acciones"]}
            vacio="Sin empresas registradas"
            rows={filtradas.map((e) => [
              e.razon_social || "—",
              <select
                key="plan"
                value={e.plan_tipo ?? "gratis"}
                disabled={isPending}
                onChange={(ev) =>
                  cambiarPlan(e.id, e.gerente_user_id, ev.target.value as PlanTipoPersistido)
                }
                className="rounded-lg border px-2 py-1 text-xs font-bold"
                style={{ borderColor: ADMIN_COLORS.slateD }}
              >
                {PLANES_SELECCIONABLES.map((p) => (
                  <option key={p} value={p}>
                    {labelPlan(p)}
                  </option>
                ))}
              </select>,
              e.activa ? (
                <AdminBadge key="a" label="Activa" tone="success" />
              ) : (
                <AdminBadge key="p" label="Suspendida" tone="warning" />
              ),
              e.ruc || "—",
              e.email || e.telefono || "—",
              new Date(e.created_at).toLocaleDateString("es-PE"),
              <button
                key="toggle"
                type="button"
                disabled={isPending}
                onClick={() => toggleActiva(e.id, !e.activa)}
                className="text-xs font-bold"
                style={{ color: e.activa ? ADMIN_COLORS.red : ADMIN_COLORS.greenD }}
              >
                {e.activa ? "Desactivar" : "Activar"}
              </button>,
            ])}
          />
          <p className="mt-3 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
            Fuente: tabla <span className="font-mono">empresas</span> (Supabase) — el estado
            activo/suspendida vive en <span className="font-mono">empresas.activo</span>, el plan
            en <span className="font-mono">perfiles.plan_tipo</span> vía{" "}
            <span className="font-mono">gerente_user_id</span> (Doc 02 §9).
          </p>
        </>
      )}

      {tab === "Solicitudes" && (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}
        >
          <p className="text-sm">No hay solicitudes de empresa pendientes.</p>
          <p className="mt-2 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
            Flujo solicitudes — pendiente definición oficial (Doc 02 §9).
          </p>
        </div>
      )}

      {tab === "Historial" && (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}
        >
          <p className="text-sm">Historial de cambios — pendiente auditoría BD.</p>
        </div>
      )}
    </div>
  );
}
