"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminBadge, AdminNotice, AdminTabs } from "@/components/admin/AdminTabs";
import { AdminErrorBanner, AdminKpiCard, AdminTable } from "@/components/admin/AdminUi";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import {
  type ComisionConfigRow,
  type EstadoPartner,
  type PartnerRegistro,
} from "@/lib/partners-types";
import {
  actualizarComisionConfigAction,
  createPartnerAction,
  setPartnerEstadoAction,
} from "@/app/admin/partners/actions";

const TABS = ["Todos", "Activos", "Pendientes", "Suspendidos"] as const;

interface AdminPartnersViewProps {
  initialPartners: PartnerRegistro[];
  comisionesConfig: ComisionConfigRow[];
}

export function AdminPartnersView({ initialPartners, comisionesConfig }: AdminPartnersViewProps) {
  const router = useRouter();
  const [partners, setPartners] = useState(initialPartners);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Todos");
  const [comisiones, setComisiones] = useState(comisionesConfig);
  const [editandoComisionId, setEditandoComisionId] = useState<string | null>(null);
  const [comisionTemp, setComisionTemp] = useState("");
  const [errorComision, setErrorComision] = useState<string | null>(null);

  useEffect(() => {
    setPartners(initialPartners);
  }, [initialPartners]);
  useEffect(() => {
    setComisiones(comisionesConfig);
  }, [comisionesConfig]);
  const [buscar, setBuscar] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const ventaConfig = comisiones.find((c) => c.tipo === "venta");
  const hitosConfig = comisiones
    .filter((c): c is ComisionConfigRow & { hito: number } => c.tipo === "hito" && c.hito !== null)
    .sort((a, b) => a.hito - b.hito);

  const guardarComision = (id: string) => {
    const pct = parseFloat(comisionTemp.replace(",", "."));
    if (!Number.isFinite(pct) || pct <= 0) {
      setErrorComision("Ingresa un porcentaje válido");
      return;
    }
    setErrorComision(null);
    startTransition(async () => {
      const result = await actualizarComisionConfigAction(id, pct);
      if (!result.ok) {
        setErrorComision(result.error);
        return;
      }
      setComisiones((prev) => prev.map((c) => (c.id === id ? { ...c, porcentaje: pct } : c)));
      setEditandoComisionId(null);
    });
  };

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
    setError(null);
    startTransition(async () => {
      const result = await setPartnerEstadoAction(id, estado);
      if (!result.ok) {
        setError("No se pudo actualizar el estado del partner");
        return;
      }
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

      {error && !mostrarForm && <AdminErrorBanner mensaje={error} />}

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
          style={{ background: ADMIN_COLORS.purple }}
        >
          + Nuevo partner
        </button>
        <input
          type="search"
          placeholder="Buscar partner…"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="min-w-[180px] flex-1 rounded-xl border px-4 py-2 text-sm"
          style={{ borderColor: ADMIN_COLORS.slateD }}
        />
      </div>

      {mostrarForm && (
        <div
          className="mb-4 rounded-2xl p-4"
          style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
        >
          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mb-2 w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: ADMIN_COLORS.slateD }}
          />
          <input
            placeholder="Correo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3 w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: ADMIN_COLORS.slateD }}
          />
          {error && (
            <p className="mb-2 text-xs" style={{ color: ADMIN_COLORS.red }}>
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              className="flex-1 rounded-xl py-2 text-sm font-bold"
              style={{ border: `1px solid ${ADMIN_COLORS.slateD}`, color: ADMIN_COLORS.textMid }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={crearPartner}
              disabled={pending}
              className="flex-[2] rounded-xl py-2 text-sm font-bold text-white"
              style={{ background: ADMIN_COLORS.purple }}
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
            <p className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>
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
                style={{ color: ADMIN_COLORS.greenD }}
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
                style={{ color: ADMIN_COLORS.red }}
              >
                Suspender
              </button>
            )}
          </div>,
        ])}
      />

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-extrabold" style={{ color: ADMIN_COLORS.text }}>
          Configurar tabla de comisiones (Doc 06 §5.1)
        </h2>
        <p className="mb-3 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
          Comisión por venta: pago único sobre el primer pago del cliente referido. Además, bono
          escalonado por hitos de clientes propios (calculado por Partner individual, nunca de
          forma agregada). Los porcentajes son editables aquí — los umbrales de hito (clientes
          propios necesarios) no lo son.
        </p>
        {errorComision && <AdminErrorBanner mensaje={errorComision} />}

        {ventaConfig && (
          <div
            className="mb-3 flex items-center justify-between rounded-xl px-4 py-3"
            style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
          >
            <span className="text-sm font-semibold" style={{ color: ADMIN_COLORS.text }}>
              Comisión por venta (pago único)
            </span>
            <ComisionEditor
              config={ventaConfig}
              editando={editandoComisionId === ventaConfig.id}
              valor={comisionTemp}
              pending={pending}
              onEditar={() => { setEditandoComisionId(ventaConfig.id); setComisionTemp(String(ventaConfig.porcentaje)); }}
              onCambiar={setComisionTemp}
              onGuardar={() => guardarComision(ventaConfig.id)}
              onCancelar={() => { setEditandoComisionId(null); setErrorComision(null); }}
            />
          </div>
        )}

        <AdminTable
          headers={["Hito (clientes propios)", "Bono sobre ese tramo", "Acción"]}
          rows={hitosConfig.map((h, i) => [
            h.hito === hitosConfig[hitosConfig.length - 1]?.hito
              ? `${h.hito} y cada ${h.hito - (hitosConfig[i - 1]?.hito ?? 0)} siguientes`
              : String(h.hito),
            h.hito === hitosConfig[hitosConfig.length - 1]?.hito
              ? `${h.porcentaje}% — techo permanente`
              : `${h.porcentaje}%`,
            <ComisionEditor
              key={h.id}
              config={h}
              editando={editandoComisionId === h.id}
              valor={comisionTemp}
              pending={pending}
              onEditar={() => { setEditandoComisionId(h.id); setComisionTemp(String(h.porcentaje)); }}
              onCambiar={setComisionTemp}
              onGuardar={() => guardarComision(h.id)}
              onCancelar={() => { setEditandoComisionId(null); setErrorComision(null); }}
            />,
          ])}
        />
      </section>
    </div>
  );
}

function ComisionEditor({
  config,
  editando,
  valor,
  pending,
  onEditar,
  onCambiar,
  onGuardar,
  onCancelar,
}: {
  config: ComisionConfigRow;
  editando: boolean;
  valor: string;
  pending: boolean;
  onEditar: () => void;
  onCambiar: (v: string) => void;
  onGuardar: () => void;
  onCancelar: () => void;
}) {
  if (!editando) {
    return (
      <button
        type="button"
        onClick={onEditar}
        className="text-xs font-bold"
        style={{ color: ADMIN_COLORS.purple }}
      >
        Editar {config.porcentaje}%
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        inputMode="decimal"
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        className="w-16 rounded-lg border px-2 py-1 text-xs font-bold"
        style={{ borderColor: ADMIN_COLORS.slateD }}
        autoFocus
      />
      <button type="button" disabled={pending} onClick={onGuardar} className="text-xs font-bold" style={{ color: ADMIN_COLORS.greenD }}>
        Guardar
      </button>
      <button type="button" onClick={onCancelar} className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
        Cancelar
      </button>
    </div>
  );
}
