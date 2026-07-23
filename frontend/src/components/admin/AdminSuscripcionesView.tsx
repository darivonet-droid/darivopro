"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminBadge, AdminTabs, AdminNotice } from "@/components/admin/AdminTabs";
import { AdminCard, AdminTable, AdminErrorBanner } from "@/components/admin/AdminUi";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { descargarCsv } from "@/lib/csv-export";
import type { PRECIOS_OFICIALES } from "@/lib/roles-planes-oficial";
import type { PlanCatalogoRow } from "@/lib/planes-catalogo";
import { actualizarPlanCatalogoAction, cambiarPlanCuentaAction } from "@/app/admin/suscripciones/actions";
import { fmtPEN } from "@/lib/utils";
import type { PlanTipoPersistido } from "@/lib/roles-planes-oficial";
import type { AdminPerfilRow } from "@/lib/admin-queries";
import type { PlanAuditoriaRow } from "@/lib/plan-cuenta";

const TABS = ["Planes", "Cuentas", "Historial de cambios"] as const;
const ORDEN_PLAN: Array<keyof typeof PRECIOS_OFICIALES> = ["basico", "pro", "business"];
const PLAN_ICON: Record<string, string> = { basico: "🔹", pro: "⭐", business: "🏢" };

/** Planes asignables a una cuenta — incluye "gratis", que no es un plan del catálogo de venta. */
const PLANES_CUENTA: PlanTipoPersistido[] = ["gratis", "basico", "pro", "business"];

/** Matriz oficial de funcionalidades por plan — 04-PANEL-ADMIN-SUSCRIPCIONES.md §6, texto fijo (no se infiere de BD). */
const MATRIZ = [
  { label: "Cotizaciones", basico: true, pro: true, business: true },
  { label: "Clientes", basico: true, pro: true, business: true },
  { label: "Catálogo Maestro", basico: true, pro: true, business: true },
  { label: "Facturación", basico: false, pro: true, business: true },
  { label: "IA para cotizaciones", basico: "Limitada", pro: "Amplia", business: "Amplia" },
  { label: "IA para facturas", basico: false, pro: true, business: true },
  { label: "IA para cierre/gastos", basico: false, pro: true, business: true },
  {
    label: "Usuarios",
    basico: "1 (Gerente = Técnico)",
    pro: "1 (Gerente = Técnico)",
    business: "1 Gerente + 5 Técnicos",
  },
] as const;

function celda(v: boolean | string) {
  if (v === true) return <span style={{ color: ADMIN_COLORS.greenD }}>✓</span>;
  if (v === false) return <span style={{ color: ADMIN_COLORS.textLight }}>—</span>;
  return <span style={{ color: ADMIN_COLORS.text }}>{v}</span>;
}

interface AdminSuscripcionesViewProps {
  planesOficiales: typeof PRECIOS_OFICIALES;
  /**
   * Catálogo administrativo editable (`planes_catalogo`, Etapa 7,
   * 21/07/2026, decisión 7) — DISTINTO de `planesOficiales`. Ver el banner
   * de advertencia renderizado abajo: editar aquí NO cambia el precio real
   * de checkout ni los límites aplicados hoy.
   */
  planesCatalogo: PlanCatalogoRow[];
  usuariosPorPlan: { basico: number; pro: number; business: number; gratis: number };
  /**
   * Cuentas de la plataforma con su plan actual — pestaña "Cuentas"
   * (Tarea 3 FASE A, 23/07/2026). Identidad + plan únicamente: ninguna
   * cotización, cliente ni factura suya (`01-VISION-DEL-PRODUCTO.md` §4.1).
   */
  cuentas: AdminPerfilRow[];
  /** Log append-only de cambios de plan — pestaña "Historial de cambios". */
  auditoria: PlanAuditoriaRow[];
}

export function AdminSuscripcionesView({
  planesOficiales,
  planesCatalogo,
  usuariosPorPlan,
  cuentas,
  auditoria,
}: AdminSuscripcionesViewProps) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Planes");
  const [buscar, setBuscar] = useState("");
  const [orden, setOrden] = useState<"catalogo" | "precio" | "nombre">("catalogo");
  const [vista, setVista] = useState<"tarjetas" | "tabla">("tarjetas");
  const [panelId, setPanelId] = useState<keyof typeof PRECIOS_OFICIALES | null>(null);
  const [pending, startTransition] = useTransition();
  const [editando, setEditando] = useState<PlanCatalogoRow | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editMensual, setEditMensual] = useState("");
  const [editAnual, setEditAnual] = useState("");
  const [editActivo, setEditActivo] = useState(true);
  const [editLimitesTexto, setEditLimitesTexto] = useState("");
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);

  // Pestaña "Cuentas" — cambio de plan de una cuenta concreta.
  const [buscarCuenta, setBuscarCuenta] = useState("");
  const [cuentaEditando, setCuentaEditando] = useState<AdminPerfilRow | null>(null);
  const [planNuevo, setPlanNuevo] = useState<PlanTipoPersistido>("gratis");
  const [motivo, setMotivo] = useState("");
  const [errorCuenta, setErrorCuenta] = useState<string | null>(null);

  const labelPlanCuenta = (plan: string | null | undefined) =>
    plan === "basico" || plan === "pro" || plan === "business"
      ? planesOficiales[plan].nombre
      : "Gratis";

  const abrirCambioPlan = (cuenta: AdminPerfilRow) => {
    setErrorCuenta(null);
    setCuentaEditando(cuenta);
    setPlanNuevo((cuenta.plan_tipo as PlanTipoPersistido | null) ?? "gratis");
    setMotivo("");
  };

  const guardarCambioPlan = () => {
    if (!cuentaEditando) return;
    if (!motivo.trim()) {
      setErrorCuenta("Indica el motivo del cambio — queda registrado en el historial.");
      return;
    }
    setErrorCuenta(null);
    startTransition(async () => {
      const result = await cambiarPlanCuentaAction(cuentaEditando.id, planNuevo, motivo.trim());
      if (!result.ok) {
        setErrorCuenta(result.error);
        return;
      }
      setCuentaEditando(null);
      setMotivo("");
      router.refresh();
    });
  };

  const cuentasFiltradas = useMemo(() => {
    const q = buscarCuenta.trim().toLowerCase();
    if (!q) return cuentas;
    return cuentas.filter(
      (c) =>
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.razon_social ?? "").toLowerCase().includes(q)
    );
  }, [cuentas, buscarCuenta]);

  const catalogoDe = (id: keyof typeof PRECIOS_OFICIALES) => planesCatalogo.find((p) => p.slug === id);

  const abrirEdicion = (id: keyof typeof PRECIOS_OFICIALES) => {
    const fila = catalogoDe(id);
    if (!fila) {
      setErrorEdicion(
        "Este plan todavía no existe en planes_catalogo — ejecuta la migración de datos oficiales (Etapa 7) en Supabase antes de editar."
      );
      return;
    }
    setErrorEdicion(null);
    setEditando(fila);
    setEditNombre(fila.nombre);
    setEditMensual(String(fila.precioMensual));
    setEditAnual(String(fila.precioAnual));
    setEditActivo(fila.activo);
    setEditLimitesTexto(JSON.stringify(fila.limites, null, 2));
  };

  const guardarEdicion = () => {
    if (!editando) return;
    const mensual = parseFloat(editMensual.replace(",", "."));
    const anual = parseFloat(editAnual.replace(",", "."));
    if (!Number.isFinite(mensual) || mensual < 0 || !Number.isFinite(anual) || anual < 0) {
      setErrorEdicion("Precio mensual/anual inválido");
      return;
    }
    let limites: Record<string, number | boolean | null>;
    try {
      limites = JSON.parse(editLimitesTexto);
    } catch {
      setErrorEdicion("El JSON de límites no es válido");
      return;
    }
    setErrorEdicion(null);
    startTransition(async () => {
      const result = await actualizarPlanCatalogoAction(editando.id, {
        nombre: editNombre.trim(),
        precioMensual: mensual,
        precioAnual: anual,
        activo: editActivo,
        limites,
      });
      if (!result.ok) {
        setErrorEdicion(result.error);
        return;
      }
      setEditando(null);
      router.refresh();
    });
  };

  const planes = useMemo(() => {
    let ids = [...ORDEN_PLAN];
    const q = buscar.trim().toLowerCase();
    if (q) ids = ids.filter((id) => planesOficiales[id].nombre.toLowerCase().includes(q));
    if (orden === "precio") ids.sort((a, b) => planesOficiales[a].mensual - planesOficiales[b].mensual);
    if (orden === "nombre") ids.sort((a, b) => planesOficiales[a].nombre.localeCompare(planesOficiales[b].nombre));
    return ids;
  }, [planesOficiales, buscar, orden]);

  const usuariosDe = (id: keyof typeof PRECIOS_OFICIALES) => usuariosPorPlan[id];
  const seleccionado = panelId ? { id: panelId, ...planesOficiales[panelId] } : null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <AdminCard>
            <p className="text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>Total de planes</p>
            <p className="mt-2 text-2xl font-black" style={{ color: ADMIN_COLORS.text }}>3</p>
          </AdminCard>
          <AdminCard>
            <p className="text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>Planes activos</p>
            <p className="mt-2 text-2xl font-black" style={{ color: ADMIN_COLORS.text }}>3</p>
          </AdminCard>
          <AdminCard>
            <p className="text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>Planes inactivos</p>
            <p className="mt-2 text-2xl font-black" style={{ color: ADMIN_COLORS.text }}>0</p>
          </AdminCard>
        </div>

        <AdminTabs tabs={[...TABS]} active={tab} onChange={(t) => setTab(t as (typeof TABS)[number])} />

        {tab === "Planes" && (
          <>
            <div
              className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ background: ADMIN_COLORS.redPale, color: ADMIN_COLORS.red }}
            >
              ⚠️ Editar un plan aquí actualiza solo este catálogo administrativo — <strong>no cambia
              todavía</strong> el precio real que se cobra en checkout ni los límites que de verdad se
              aplican (cotizaciones, facturas, IA). Esos siguen leyendo la constante oficial del código.
              Hasta que se conecte esa segunda fase, un cambio aquí es visual/administrativo, sin efecto
              real en el producto.
            </div>
            {errorEdicion && !editando && <AdminErrorBanner mensaje={errorEdicion} />}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <input
                type="search"
                placeholder="Buscar plan…"
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                className="min-w-[160px] flex-1 rounded-xl border px-4 py-2 text-sm"
                style={{ borderColor: ADMIN_COLORS.slateD }}
              />
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as typeof orden)}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: ADMIN_COLORS.slateD, color: ADMIN_COLORS.text }}
              >
                <option value="catalogo">Orden del catálogo</option>
                <option value="precio">Precio</option>
                <option value="nombre">Nombre (A–Z)</option>
              </select>
              <button
                type="button"
                onClick={() =>
                  descargarCsv(
                    "planes.csv",
                    [
                      ["plan", "precio_mensual", "precio_anual", "usuarios_activos"],
                      ...planes.map((id) => [
                        planesOficiales[id].nombre,
                        String(planesOficiales[id].mensual),
                        String(planesOficiales[id].anual),
                        String(usuariosDe(id)),
                      ]),
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
                  onClick={() => setVista("tarjetas")}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold"
                  style={{ background: vista === "tarjetas" ? ADMIN_COLORS.white : "transparent", color: ADMIN_COLORS.text }}
                >
                  Tarjetas
                </button>
                <button
                  type="button"
                  onClick={() => setVista("tabla")}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold"
                  style={{ background: vista === "tabla" ? ADMIN_COLORS.white : "transparent", color: ADMIN_COLORS.text }}
                >
                  Tabla
                </button>
              </div>
            </div>

            {vista === "tarjetas" ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {planes.map((id) => {
                  const plan = planesOficiales[id];
                  const destacado = id === "pro";
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPanelId(id)}
                      className="rounded-2xl p-5 text-left"
                      style={{
                        background: ADMIN_COLORS.white,
                        border: `2px solid ${destacado ? ADMIN_COLORS.purple : panelId === id ? ADMIN_COLORS.purple : ADMIN_COLORS.slateD}`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{PLAN_ICON[id]}</span>
                        {destacado && <AdminBadge label="Recomendado" tone="warning" />}
                      </div>
                      <p className="mt-3 text-sm font-black uppercase" style={{ color: ADMIN_COLORS.text }}>
                        {plan.nombre}
                      </p>
                      <p className="mt-1 text-2xl font-black" style={{ color: ADMIN_COLORS.purple }}>
                        {fmtPEN(plan.mensual)}
                        <span className="text-sm font-bold" style={{ color: ADMIN_COLORS.textMid }}>
                          /mes
                        </span>
                      </p>
                      <p className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                        {fmtPEN(plan.anual)}/año
                      </p>
                      <p className="mt-3 text-xs" style={{ color: ADMIN_COLORS.textMid }}>
                        {usuariosDe(id)} usuarios activos
                      </p>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          abrirEdicion(id);
                        }}
                        className="mt-3 inline-block text-xs font-bold"
                        style={{ color: ADMIN_COLORS.purple }}
                      >
                        Editar plan
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <AdminTable
                headers={["Plan", "Precio mensual", "Precio anual", "Estado", "Orden", "Acciones"]}
                vacio="Sin planes"
                filaActivaIndex={planes.findIndex((id) => id === panelId)}
                onRowClick={(i) => setPanelId(planes[i])}
                rows={planes.map((id, i) => [
                  planesOficiales[id].nombre,
                  fmtPEN(planesOficiales[id].mensual),
                  fmtPEN(planesOficiales[id].anual),
                  <AdminBadge key="e" label={catalogoDe(id)?.activo === false ? "Inactivo" : "Activo"} tone={catalogoDe(id)?.activo === false ? "danger" : "success"} />,
                  String(i + 1),
                  <div key="a" className="flex gap-2" onClick={(ev) => ev.stopPropagation()}>
                    <span className="text-xs font-bold" style={{ color: ADMIN_COLORS.purple }}>
                      Ver detalle
                    </span>
                    <button type="button" onClick={() => abrirEdicion(id)} className="text-xs font-bold" style={{ color: ADMIN_COLORS.amberD }}>
                      Editar
                    </button>
                  </div>,
                ])}
              />
            )}

            <AdminNotice>
              &ldquo;Nuevo plan&rdquo; no aplica — el catálogo está fijado a los 3 planes oficiales
              (Básico/Pro/Business), no se inventan planes adicionales. Desde el 21/07/2026 (Etapa 7)
              cada uno de los 3 es editable (nombre/precio/límites/activo) desde el botón
              &ldquo;Editar&rdquo; — ver la advertencia de alcance arriba. &ldquo;Importar planes&rdquo;
              y &ldquo;Publicar cambios&rdquo; siguen sin construir. &ldquo;Exportar&rdquo; está
              disponible arriba.
            </AdminNotice>
          </>
        )}

        {tab === "Cuentas" && (
          <>
            <AdminNotice>
              El plan de una cuenta es un metadato de facturación y se administra aquí. Esta pestaña
              muestra únicamente identidad y plan — nunca cotizaciones, clientes ni facturas de la
              cuenta. Todo cambio exige un motivo y queda registrado en &ldquo;Historial de
              cambios&rdquo;.
            </AdminNotice>

            {errorCuenta && !cuentaEditando && <AdminErrorBanner mensaje={errorCuenta} />}

            <div className="my-4">
              <input
                type="search"
                placeholder="Buscar cuenta por correo o razón social…"
                value={buscarCuenta}
                onChange={(e) => setBuscarCuenta(e.target.value)}
                className="w-full rounded-xl border px-4 py-2 text-sm"
                style={{ borderColor: ADMIN_COLORS.slateD }}
              />
            </div>

            {cuentaEditando && (
              <AdminCard title={`Cambiar plan — ${cuentaEditando.email || cuentaEditando.id}`} className="mb-4">
                {errorCuenta && <AdminErrorBanner mensaje={errorCuenta} />}
                <p className="mb-3 text-sm" style={{ color: ADMIN_COLORS.textMid }}>
                  Plan actual:{" "}
                  <strong style={{ color: ADMIN_COLORS.text }}>{labelPlanCuenta(cuentaEditando.plan_tipo)}</strong>
                </p>
                <label className="mb-1 block text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>
                  Plan nuevo
                </label>
                <select
                  value={planNuevo}
                  onChange={(e) => setPlanNuevo(e.target.value as PlanTipoPersistido)}
                  className="mb-3 w-full rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: ADMIN_COLORS.slateD, color: ADMIN_COLORS.text }}
                >
                  {PLANES_CUENTA.map((p) => (
                    <option key={p} value={p}>
                      {labelPlanCuenta(p)}
                    </option>
                  ))}
                </select>
                <label className="mb-1 block text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>
                  Motivo (obligatorio)
                </label>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej.: cortesía acordada con el cliente, corrección de cobro…"
                  className="mb-3 w-full rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: ADMIN_COLORS.slateD }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={guardarCambioPlan}
                    className="rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                    style={{ background: ADMIN_COLORS.purple }}
                  >
                    {pending ? "Guardando…" : "Guardar cambio"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCuentaEditando(null)}
                    className="rounded-xl px-4 py-2 text-sm font-bold"
                    style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
                  >
                    Cancelar
                  </button>
                </div>
              </AdminCard>
            )}

            <AdminTable
              headers={["Cuenta", "Razón social", "Plan actual", "Acción"]}
              vacio="Sin cuentas"
              rows={cuentasFiltradas.map((c) => [
                c.email || c.id,
                c.razon_social ?? "—",
                <AdminBadge
                  key="p"
                  label={labelPlanCuenta(c.plan_tipo)}
                  tone={c.plan_tipo && c.plan_tipo !== "gratis" ? "success" : "neutral"}
                />,
                <button
                  key="a"
                  type="button"
                  onClick={() => abrirCambioPlan(c)}
                  className="text-xs font-bold"
                  style={{ color: ADMIN_COLORS.purple }}
                >
                  Cambiar plan
                </button>,
              ])}
            />
          </>
        )}

        {tab === "Historial de cambios" && (
          <>
            <AdminNotice>
              Registro permanente de los cambios de plan por cuenta: solo se añade, nunca se
              modifica ni se borra — ni siquiera desde el Panel Admin.
            </AdminNotice>
            <div className="mt-4">
              <AdminTable
                headers={["Fecha", "Administrador", "Cuenta", "Cambio", "Motivo"]}
                vacio="Todavía no se ha registrado ningún cambio de plan."
                rows={auditoria.map((a) => [
                  new Date(a.created_at).toLocaleString("es-PE"),
                  a.admin_email,
                  a.cuenta_email,
                  `${labelPlanCuenta(a.plan_anterior)} → ${labelPlanCuenta(a.plan_nuevo)}`,
                  a.motivo,
                ])}
              />
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        {seleccionado ? (
          <AdminCard
            title={seleccionado.nombre}
            action={
              <button type="button" onClick={() => setPanelId(null)} className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
                ✕
              </button>
            }
          >
            <p className="text-2xl font-black" style={{ color: ADMIN_COLORS.purple }}>
              {fmtPEN(seleccionado.mensual)}
              <span className="text-sm font-bold" style={{ color: ADMIN_COLORS.textMid }}>
                /mes
              </span>
            </p>
            <p className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>
              {fmtPEN(seleccionado.anual)}/año
            </p>
            <p className="mt-2 text-sm" style={{ color: ADMIN_COLORS.textMid }}>
              {usuariosDe(seleccionado.id)} usuarios activos en este plan
            </p>

            <p className="mb-2 mt-4 text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>
              Funcionalidades incluidas
            </p>
            <ul className="space-y-1.5 text-sm">
              {MATRIZ.map((m) => (
                <li key={m.label} className="flex items-center justify-between">
                  <span style={{ color: ADMIN_COLORS.textMid }}>{m.label}</span>
                  {celda(m[seleccionado.id as "basico" | "pro" | "business"])}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => abrirEdicion(seleccionado.id)}
              className="mt-4 w-full rounded-lg px-3 py-2 text-sm font-bold"
              style={{ background: ADMIN_COLORS.amberPale, color: ADMIN_COLORS.amberD }}
            >
              Editar plan (nombre / precio / límites)
            </button>
          </AdminCard>
        ) : (
          <>
            <AdminCard title="Información">
              <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>
                Fuente única del catálogo oficial de planes. Los 3 planes tienen precio
                definitivo confirmado por el propietario 17/07/2026 (Básico S/49/mes, Pro S/89/mes,
                Business S/130/mes — precio anual = mensual × 10, sin descuento adicional).
              </p>
            </AdminCard>

            <AdminCard title="Acciones rápidas">
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() =>
                    descargarCsv(
                      "planes.csv",
                      [
                        ["plan", "precio_mensual", "precio_anual", "usuarios_activos"],
                        ...ORDEN_PLAN.map((id) => [
                          planesOficiales[id].nombre,
                          String(planesOficiales[id].mensual),
                          id === "business" ? String(planesOficiales[id].anual) : "Pendiente",
                          String(usuariosDe(id)),
                        ]),
                      ]
                    )
                  }
                  className="rounded-lg px-3 py-2 text-left text-sm font-bold"
                  style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
                >
                  Exportar planes (CSV)
                </button>
              </div>
              <p className="mt-3 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                &ldquo;Importar planes&rdquo; y &ldquo;Guía de uso&rdquo; no están construidas todavía.
              </p>
            </AdminCard>
          </>
        )}
      </div>

      {editando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10,22,40,0.5)" }}
        >
          <div className="w-full max-w-md rounded-2xl p-5" style={{ background: ADMIN_COLORS.white }}>
            <h2 className="mb-1 text-sm font-bold" style={{ color: ADMIN_COLORS.text }}>
              Editar plan — {editando.slug}
            </h2>
            <p className="mb-3 text-xs" style={{ color: ADMIN_COLORS.red }}>
              ⚠️ No cambia el precio real de checkout ni los límites aplicados hoy — solo este catálogo.
            </p>

            <label className="mb-1 block text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>Nombre</label>
            <input
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
              className="mb-2 w-full rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: ADMIN_COLORS.slateD }}
            />

            <div className="mb-2 grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>Precio mensual (S/)</label>
                <input
                  value={editMensual}
                  onChange={(e) => setEditMensual(e.target.value)}
                  inputMode="decimal"
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: ADMIN_COLORS.slateD }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>Precio anual (S/)</label>
                <input
                  value={editAnual}
                  onChange={(e) => setEditAnual(e.target.value)}
                  inputMode="decimal"
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: ADMIN_COLORS.slateD }}
                />
              </div>
            </div>

            <label className="mb-2 flex items-center gap-2 text-sm" style={{ color: ADMIN_COLORS.text }}>
              <input type="checkbox" checked={editActivo} onChange={(e) => setEditActivo(e.target.checked)} />
              Plan activo
            </label>

            <label className="mb-1 block text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
              Límites (JSON — mismos campos de LIMITES_PLAN)
            </label>
            <textarea
              value={editLimitesTexto}
              onChange={(e) => setEditLimitesTexto(e.target.value)}
              rows={6}
              className="mb-2 w-full rounded-xl border px-3 py-2 font-mono text-xs"
              style={{ borderColor: ADMIN_COLORS.slateD }}
            />

            {errorEdicion && (
              <p className="mb-2 text-xs font-semibold" style={{ color: ADMIN_COLORS.red }}>
                {errorEdicion}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setEditando(null); setErrorEdicion(null); }}
                className="flex-1 rounded-xl py-2 text-sm font-bold"
                style={{ border: `1px solid ${ADMIN_COLORS.slateD}`, color: ADMIN_COLORS.textMid }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={guardarEdicion}
                className="flex-[2] rounded-xl py-2 text-sm font-bold text-white disabled:opacity-60"
                style={{ background: ADMIN_COLORS.purple }}
              >
                {pending ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
