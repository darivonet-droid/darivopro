"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminBadge, AdminNotice, AdminTabs } from "@/components/admin/AdminTabs";
import { AdminKpiCard, AdminTable } from "@/components/admin/AdminUi";
import { T } from "@/lib/design-system/tokens";
import {
  COMISION_VENTA_PORCENTAJE,
  HITOS_COMISION_OFICIALES,
  type EstadoPartner,
  type PartnerRegistro,
} from "@/lib/partners-types";
import { createPartnerAction, setPartnerEstadoAction } from "@/app/admin/partners/actions";

const TABS = ["Todos", "Activos", "Pendientes", "Suspendidos"] as const;

interface AdminPartnersViewProps {
  initialPartners: PartnerRegistro[];
}

export function AdminPartnersView({ initialPartners }: AdminPartnersViewProps) {
  const router = useRouter();
  const [partners, setPartners] = useState(initialPartners);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Todos");

  useEffect(() => {
    setPartners(initialPartners);
  }, [initialPartners]);
  const [buscar, setBuscar] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtrados = useMemo(() => {
    let list = partners;
    if (tab === "Activos") list = list.filter((p) => p.estado === "Activo");
    if (tab === "Pendientes") list = list.filter((p) => p.estado === "Pendiente");
    if (tab === "Suspendidos") list = list.filter((p) => p.estado === "Suspendido");
    const q = buscar.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.codigo.toLowerCase().includes(q)
      );
    }
    return list;
  }, [partners, tab, buscar]);

  const refresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const crearPartner = () => {
    if (!nombre.trim() || !email.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createPartnerAction(nombre, email);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPartners((prev) => [result.partner, ...prev]);
      setNombre("");
      setEmail("");
      setMostrarForm(false);
      refresh();
    });
  };

  const cambiarEstado = (id: string, estado: EstadoPartner) => {
    startTransition(async () => {
      await setPartnerEstadoAction(id, estado);
      setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, estado } : p)));
      refresh();
    });
  };

  const kpis = {
    total: partners.length,
    activos: partners.filter((p) => p.estado === "Activo").length,
    pendientes: partners.filter((p) => p.estado === "Pendiente").length,
    suspendidos: partners.filter((p) => p.estado === "Suspendido").length,
  };

  return (
    <div>
      <AdminNotice>
        Registro en tabla real <span className="font-mono">partners</span> (Supabase) —
        sincronizado con Panel Partner vía Server Actions (INC-A02 resuelto).
      </AdminNotice>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <AdminKpiCard label="Total Partners" value={kpis.total} />
        <AdminKpiCard label="Activos" value={kpis.activos} />
        <AdminKpiCard label="Pendientes" value={kpis.pendientes} />
        <AdminKpiCard label="Suspendidos" value={kpis.suspendidos} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMostrarForm(true)}
          disabled={pending}
          className="rounded-xl px-4 py-2.5 text-sm font-bold text-white"
          style={{ background: T.blue }}
        >
          + Nuevo partner
        </button>
        <input
          type="search"
          placeholder="Buscar partner…"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="min-w-[180px] flex-1 rounded-xl border px-4 py-2 text-sm"
          style={{ borderColor: T.slateD }}
        />
      </div>

      {mostrarForm && (
        <div
          className="mb-4 rounded-2xl p-4"
          style={{ background: T.white, border: `1px solid ${T.slateD}` }}
        >
          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mb-2 w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: T.slateD }}
          />
          <input
            placeholder="Correo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3 w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: T.slateD }}
          />
          {error && (
            <p className="mb-2 text-xs" style={{ color: T.red }}>
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              className="flex-1 rounded-xl py-2 text-sm font-bold"
              style={{ border: `1px solid ${T.slateD}`, color: T.textMid }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={crearPartner}
              disabled={pending}
              className="flex-[2] rounded-xl py-2 text-sm font-bold text-white"
              style={{ background: T.blue }}
            >
              Crear partner
            </button>
          </div>
        </div>
      )}

      <AdminTabs tabs={[...TABS]} active={tab} onChange={(t) => setTab(t as (typeof TABS)[number])} />

      <AdminTable
        headers={["Partner", "Código", "Enlace", "Registros", "Estado", "Acciones"]}
        vacio="Sin partners registrados"
        rows={filtrados.map((p) => [
          <div key={p.id}>
            <p className="font-semibold">{p.nombre}</p>
            <p className="text-xs" style={{ color: T.textLight }}>
              {p.email}
            </p>
          </div>,
          p.codigo,
          <span key="l" className="font-mono text-xs break-all">
            {p.enlace}
          </span>,
          p.registros.length,
          <AdminBadge
            key="e"
            label={p.estado}
            tone={
              p.estado === "Activo"
                ? "success"
                : p.estado === "Suspendido"
                  ? "danger"
                  : "warning"
            }
          />,
          <div key="a" className="flex flex-wrap gap-1">
            {p.estado !== "Activo" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => cambiarEstado(p.id, "Activo")}
                className="text-xs font-bold"
                style={{ color: T.greenD }}
              >
                Activar
              </button>
            )}
            {p.estado !== "Suspendido" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => cambiarEstado(p.id, "Suspendido")}
                className="text-xs font-bold"
                style={{ color: T.red }}
              >
                Suspender
              </button>
            )}
          </div>,
        ])}
      />

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-extrabold" style={{ color: T.text }}>
          Plan oficial de comisiones (Doc 06 §5.1)
        </h2>
        <p className="mb-3 text-xs" style={{ color: T.textLight }}>
          Comisión por venta: <strong>{COMISION_VENTA_PORCENTAJE}% pago único</strong> sobre el
          primer pago del cliente referido. Además, bono escalonado por hitos de clientes propios
          (calculado por Partner individual, nunca de forma agregada).
        </p>
        <AdminTable
          headers={["Hito (clientes propios)", "Bono sobre ese tramo"]}
          rows={HITOS_COMISION_OFICIALES.map((h) => [
            h.hito === 100 ? `${h.hito} y cada 50 siguientes (150, 200, 250…)` : String(h.hito),
            `${h.bonoPorcentaje}%${h.hito === 100 ? " — techo permanente" : ""}`,
          ])}
        />
      </section>
    </div>
  );
}
