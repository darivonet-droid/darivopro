"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminBadge, AdminNotice, AdminTabs } from "@/components/admin/AdminTabs";
import { AdminErrorBanner, AdminKpiCard, AdminTable, AdminCard } from "@/components/admin/AdminUi";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { descargarCsv } from "@/lib/csv-export";
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
const POR_PAGINA = 10;

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
  const [orden, setOrden] = useState<"nombre" | "registros" | "estado">("nombre");
  const [vista, setVista] = useState<"tabla" | "tarjetas">("tabla");
  const [pagina, setPagina] = useState(1);
  const [panelId, setPanelId] = useState<string | null>(null);

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
    const sorted = [...list];
    if (orden === "nombre") sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (orden === "registros") sorted.sort((a, b) => b.registros.length - a.registros.length);
    if (orden === "estado") sorted.sort((a, b) => a.estado.localeCompare(b.estado));
    return sorted;
  }, [partners, tab, buscar, orden]);

  useEffect(() => {
    setPagina(1);
  }, [tab, buscar]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginados = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const seleccionado = partners.find((p) => p.id === panelId) ?? null;

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
    <div className="grid gap-4 lg:grid-cols-3">
    <div className="lg:col-span-2">
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

      <div className="mb-4 flex flex-wrap items-center gap-2">
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
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value as typeof orden)}
          className="rounded-xl border px-3 py-2 text-sm"
          style={{ borderColor: ADMIN_COLORS.slateD, color: ADMIN_COLORS.text }}
        >
          <option value="nombre">Nombre (A–Z)</option>
          <option value="registros">Más registros</option>
          <option value="estado">Estado</option>
        </select>
        <button
          type="button"
          onClick={() =>
            descargarCsv(
              "partners.csv",
              [
                ["nombre", "email", "codigo", "enlace", "registros", "estado"],
                ...filtrados.map((p) => [p.nombre, p.email, p.codigo, p.enlace, String(p.registros.length), p.estado]),
              ]
            )
          }
          className="rounded-xl px-3 py-2 text-sm font-bold"
          style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
        >
          Exportar
        </button>
        <div className="flex gap-1 rounded-xl p-1" style={{ background: ADMIN_COLORS.slate }}>
          <button
            type="button"
            onClick={() => setVista("tabla")}
            className="rounded-lg px-3 py-1.5 text-xs font-bold"
            style={{ background: vista === "tabla" ? ADMIN_COLORS.white : "transparent", color: ADMIN_COLORS.text }}
          >
            Tabla
          </button>
          <button
            type="button"
            onClick={() => setVista("tarjetas")}
            className="rounded-lg px-3 py-1.5 text-xs font-bold"
            style={{ background: vista === "tarjetas" ? ADMIN_COLORS.white : "transparent", color: ADMIN_COLORS.text }}
          >
            Tarjetas
          </button>
        </div>
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

      {vista === "tabla" ? (
        <AdminTable
          headers={["Partner", "Código", "Enlace", "Registros", "Estado", "Acciones"]}
          vacio="Sin partners registrados"
          filaActivaIndex={paginados.findIndex((p) => p.id === panelId)}
          onRowClick={(i) => setPanelId(paginados[i].id)}
          rows={paginados.map((p) => [
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
            <div key="a" className="flex flex-wrap gap-1" onClick={(ev) => ev.stopPropagation()}>
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
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {paginados.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPanelId(p.id)}
              className="rounded-2xl p-4 text-left"
              style={{
                background: ADMIN_COLORS.white,
                border: `1px solid ${panelId === p.id ? ADMIN_COLORS.purple : ADMIN_COLORS.slateD}`,
              }}
            >
              <p className="font-bold" style={{ color: ADMIN_COLORS.text }}>
                {p.nombre}
              </p>
              <p className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                {p.codigo} · {p.registros.length} registros
              </p>
              <div className="mt-2">
                <AdminBadge
                  label={p.estado}
                  tone={p.estado === "Activo" ? "success" : p.estado === "Suspendido" ? "danger" : "warning"}
                />
              </div>
            </button>
          ))}
          {paginados.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm" style={{ color: ADMIN_COLORS.textMid }}>
              Sin partners registrados
            </p>
          )}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            disabled={pagina === 1}
            onClick={() => setPagina((p) => p - 1)}
            className="rounded-lg px-3 py-1.5 font-bold disabled:opacity-40"
            style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
          >
            ← Anterior
          </button>
          <span style={{ color: ADMIN_COLORS.textMid }}>
            Página {pagina} de {totalPaginas}
          </span>
          <button
            type="button"
            disabled={pagina === totalPaginas}
            onClick={() => setPagina((p) => p + 1)}
            className="rounded-lg px-3 py-1.5 font-bold disabled:opacity-40"
            style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
          >
            Siguiente →
          </button>
        </div>
      )}

      <section id="tabla-comisiones" className="mt-8">
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

    <div className="space-y-4">
      {seleccionado ? (
        <AdminCard
          title="Información del partner"
          action={
            <button type="button" onClick={() => setPanelId(null)} className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
              ✕
            </button>
          }
        >
          <p className="font-bold" style={{ color: ADMIN_COLORS.text }}>{seleccionado.nombre}</p>
          <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>{seleccionado.email}</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>Código</dt>
              <dd className="font-mono" style={{ color: ADMIN_COLORS.text }}>{seleccionado.codigo}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>Enlace</dt>
              <dd className="break-all font-mono text-xs" style={{ color: ADMIN_COLORS.text }}>{seleccionado.enlace}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>Alta</dt>
              <dd style={{ color: ADMIN_COLORS.text }}>{new Date(seleccionado.createdAt).toLocaleDateString("es-PE")}</dd>
            </div>
          </dl>

          <p className="mb-2 mt-4 text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>
            Registros asociados ({seleccionado.registros.length})
          </p>
          {seleccionado.registros.length === 0 ? (
            <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>Sin registros todavía.</p>
          ) : (
            <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
              {seleccionado.registros.map((r, i) => (
                <li key={i} className="flex justify-between" style={{ color: ADMIN_COLORS.text }}>
                  <span>{r.email}</span>
                  <span style={{ color: ADMIN_COLORS.textLight }}>{new Date(r.fecha).toLocaleDateString("es-PE")}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex flex-col gap-2">
            {seleccionado.estado !== "Activo" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => cambiarEstado(seleccionado.id, "Activo")}
                className="rounded-lg px-3 py-2 text-left text-sm font-bold"
                style={{ background: ADMIN_COLORS.greenPale, color: ADMIN_COLORS.greenD }}
              >
                Activar partner
              </button>
            )}
            {seleccionado.estado !== "Suspendido" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => cambiarEstado(seleccionado.id, "Suspendido")}
                className="rounded-lg px-3 py-2 text-left text-sm font-bold"
                style={{ background: ADMIN_COLORS.redPale, color: ADMIN_COLORS.red }}
              >
                Suspender partner
              </button>
            )}
          </div>
        </AdminCard>
      ) : (
        <>
          <AdminCard title="Resumen">
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span style={{ color: ADMIN_COLORS.textMid }}>Total Partners</span>
                <span className="font-bold" style={{ color: ADMIN_COLORS.text }}>{kpis.total}</span>
              </li>
              <li className="flex justify-between">
                <span style={{ color: ADMIN_COLORS.textMid }}>Activos</span>
                <span className="font-bold" style={{ color: ADMIN_COLORS.text }}>{kpis.activos}</span>
              </li>
              <li className="flex justify-between">
                <span style={{ color: ADMIN_COLORS.textMid }}>Pendientes</span>
                <span className="font-bold" style={{ color: ADMIN_COLORS.text }}>{kpis.pendientes}</span>
              </li>
              <li className="flex justify-between">
                <span style={{ color: ADMIN_COLORS.textMid }}>Suspendidos</span>
                <span className="font-bold" style={{ color: ADMIN_COLORS.text }}>{kpis.suspendidos}</span>
              </li>
            </ul>
          </AdminCard>

          <AdminCard title="Información">
            <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>
              Cada Partner activo recibe código y enlace únicos generados automáticamente, y
              acceso gratuito al Plan Business mientras permanezca activo (Doc 06 §5.1). El
              Panel Administrador es la única fuente autorizada para administrar Partners.
            </p>
          </AdminCard>

          <AdminCard title="Acciones rápidas">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setMostrarForm(true)}
                className="rounded-lg px-3 py-2 text-left text-sm font-bold text-white"
                style={{ background: ADMIN_COLORS.purple }}
              >
                Nuevo partner
              </button>
              <a
                href="#tabla-comisiones"
                className="rounded-lg px-3 py-2 text-left text-sm font-bold"
                style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
              >
                Configurar tabla de comisiones
              </a>
            </div>
            <p className="mt-3 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
              &ldquo;Guía de uso&rdquo; no está construida todavía (Doc 06 §7). &ldquo;Consultar
              registros asociados&rdquo; y Activar/Suspender están disponibles al seleccionar un
              partner de la tabla.
            </p>
          </AdminCard>
        </>
      )}
    </div>
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
