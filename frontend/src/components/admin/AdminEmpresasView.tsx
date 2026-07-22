"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminBadge, AdminNotice, AdminTabs } from "@/components/admin/AdminTabs";
import { AdminErrorBanner, AdminKpiCard, AdminTable, AdminCard } from "@/components/admin/AdminUi";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { descargarCsv } from "@/lib/csv-export";
import { ImportarCsvBoton } from "@/components/admin/ImportarCsvBoton";
import type { AdminEmpresaRow } from "@/lib/admin-queries";
import { PRECIOS_OFICIALES, type PlanTipoPersistido } from "@/lib/roles-planes-oficial";
import { cambiarPlanEmpresaAction, setEmpresaActivaAction, crearEmpresaAction } from "@/app/admin/empresas/actions";

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
  const router = useRouter();
  const [empresas, setEmpresas] = useState(empresasIniciales);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Empresas");
  const [buscar, setBuscar] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<"todas" | "activas" | "suspendidas">("todas");
  const [orden, setOrden] = useState<"nombre" | "alta" | "plan">("alta");
  const [vista, setVista] = useState<"tabla" | "tarjetas">("tabla");
  const [isPending, startTransition] = useTransition();
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [panelId, setPanelId] = useState<string | null>(null);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [fRazonSocial, setFRazonSocial] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fRuc, setFRuc] = useState("");
  const [fTelefono, setFTelefono] = useState("");

  const filtradas = useMemo(() => {
    let list = empresas;
    if (estadoFiltro === "activas") list = list.filter((e) => e.activa);
    if (estadoFiltro === "suspendidas") list = list.filter((e) => !e.activa);
    const q = buscar.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.razon_social.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          (e.ruc ?? "").includes(q)
      );
    }
    const sorted = [...list];
    if (orden === "nombre") sorted.sort((a, b) => a.razon_social.localeCompare(b.razon_social));
    if (orden === "alta") sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    if (orden === "plan") sorted.sort((a, b) => (a.plan_tipo ?? "").localeCompare(b.plan_tipo ?? ""));
    return sorted;
  }, [empresas, estadoFiltro, buscar, orden]);

  const activas = empresas.filter((e) => e.activa).length;
  const seleccionada = empresas.find((e) => e.id === panelId) ?? null;

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

  const crearEmpresa = () => {
    setErrorAccion(null);
    setAviso(null);
    if (!fRazonSocial.trim() || !fEmail.trim()) {
      setErrorAccion("Razón social y correo del gerente son obligatorios");
      return;
    }
    startTransition(async () => {
      const result = await crearEmpresaAction({
        razonSocial: fRazonSocial,
        email: fEmail,
        ruc: fRuc,
        telefono: fTelefono,
      });
      if (!result.ok) {
        setErrorAccion(result.error);
        return;
      }
      setAviso(`Empresa creada — invitación enviada a ${fEmail}`);
      setFRazonSocial("");
      setFEmail("");
      setFRuc("");
      setFTelefono("");
      setMostrarNuevo(false);
      router.refresh();
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {errorAccion && <AdminErrorBanner mensaje={errorAccion} />}
        {aviso && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: ADMIN_COLORS.greenPale, color: ADMIN_COLORS.greenD }}>
            {aviso}
          </div>
        )}
        {/* 02-PANEL-ADMIN-EMPRESAS.md §7 documenta 6 KPIs (Total/Autónomos/Empresas/
            Activas/Suspendidas/Inactivas); `empresas.activo` solo distingue 2 estados
            hoy, así que "Autónomos" e "Inactivas" no se pueden calcular todavía sin
            una columna/lógica nueva. */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <AdminKpiCard label="Total empresas" value={empresas.length} />
          <AdminKpiCard label="Activas" value={activas} />
          <AdminKpiCard label="Suspendidas" value={empresas.length - activas} />
        </div>

        <AdminTabs tabs={[...TABS]} active={tab} onChange={(t) => setTab(t as (typeof TABS)[number])} />

        {tab === "Empresas" && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMostrarNuevo(true)}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-white"
                style={{ background: ADMIN_COLORS.purple }}
              >
                + Nueva empresa
              </button>
              <input
                type="search"
                placeholder="Buscar empresa…"
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                className="min-w-[180px] flex-1 rounded-xl border px-4 py-2.5 text-sm"
                style={{ borderColor: ADMIN_COLORS.slateD }}
              />
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value as typeof estadoFiltro)}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: ADMIN_COLORS.slateD, color: ADMIN_COLORS.text }}
              >
                <option value="todas">Todos los estados</option>
                <option value="activas">Activas</option>
                <option value="suspendidas">Suspendidas</option>
              </select>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as typeof orden)}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: ADMIN_COLORS.slateD, color: ADMIN_COLORS.text }}
              >
                <option value="alta">Más recientes</option>
                <option value="nombre">Nombre (A–Z)</option>
                <option value="plan">Plan</option>
              </select>
              <button
                type="button"
                onClick={() =>
                  descargarCsv(
                    "empresas.csv",
                    [
                      ["razon_social", "email", "ruc", "plan", "estado", "alta"],
                      ...filtradas.map((e) => [
                        e.razon_social,
                        e.email,
                        e.ruc ?? "",
                        labelPlan(e.plan_tipo),
                        e.activa ? "Activa" : "Suspendida",
                        e.created_at,
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

            {mostrarNuevo && (
              <div className="mb-4 rounded-2xl p-4" style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input placeholder="Razón social *" value={fRazonSocial} onChange={(e) => setFRazonSocial(e.target.value)} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: ADMIN_COLORS.slateD }} />
                  <input placeholder="Correo del gerente *" value={fEmail} onChange={(e) => setFEmail(e.target.value)} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: ADMIN_COLORS.slateD }} />
                  <input placeholder="RUC" value={fRuc} onChange={(e) => setFRuc(e.target.value)} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: ADMIN_COLORS.slateD }} />
                  <input placeholder="Teléfono" value={fTelefono} onChange={(e) => setFTelefono(e.target.value)} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: ADMIN_COLORS.slateD }} />
                </div>
                <p className="mt-2 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                  Se envía invitación real al gerente y la empresa queda en plan Business (editable después) para que pueda acceder al producto Empresa de inmediato.
                </p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => setMostrarNuevo(false)} className="flex-1 rounded-xl py-2 text-sm font-bold" style={{ border: `1px solid ${ADMIN_COLORS.slateD}`, color: ADMIN_COLORS.textMid }}>
                    Cancelar
                  </button>
                  <button type="button" onClick={crearEmpresa} disabled={isPending} className="flex-[2] rounded-xl py-2 text-sm font-bold text-white" style={{ background: ADMIN_COLORS.purple }}>
                    Crear empresa
                  </button>
                </div>
              </div>
            )}

            {vista === "tabla" ? (
              <AdminTable
                headers={["Empresa", "Plan", "Estado", "RUC", "Contacto", "Alta", "Última actividad", "Acciones"]}
                vacio="Sin empresas registradas"
                filaActivaIndex={filtradas.findIndex((e) => e.id === panelId)}
                onRowClick={(i) => setPanelId(filtradas[i].id)}
                rows={filtradas.map((e) => [
                  e.razon_social || "—",
                  <select
                    key="plan"
                    value={e.plan_tipo ?? "gratis"}
                    disabled={isPending}
                    onClick={(ev) => ev.stopPropagation()}
                    onChange={(ev) => cambiarPlan(e.id, e.gerente_user_id, ev.target.value as PlanTipoPersistido)}
                    className="rounded-lg border px-2 py-1 text-xs font-bold"
                    style={{ borderColor: ADMIN_COLORS.slateD }}
                  >
                    {PLANES_SELECCIONABLES.map((p) => (
                      <option key={p} value={p}>
                        {labelPlan(p)}
                      </option>
                    ))}
                  </select>,
                  e.activa ? <AdminBadge key="a" label="Activa" tone="success" /> : <AdminBadge key="p" label="Suspendida" tone="warning" />,
                  e.ruc || "—",
                  e.email || e.telefono || "—",
                  new Date(e.created_at).toLocaleDateString("es-PE"),
                  e.lastSignInAt ? new Date(e.lastSignInAt).toLocaleDateString("es-PE") : "Nunca",
                  <button
                    key="toggle"
                    type="button"
                    disabled={isPending}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      toggleActiva(e.id, !e.activa);
                    }}
                    className="text-xs font-bold"
                    style={{ color: e.activa ? ADMIN_COLORS.red : ADMIN_COLORS.greenD }}
                  >
                    {e.activa ? "Desactivar" : "Activar"}
                  </button>,
                ])}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filtradas.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setPanelId(e.id)}
                    className="rounded-2xl p-4 text-left"
                    style={{ background: ADMIN_COLORS.white, border: `1px solid ${panelId === e.id ? ADMIN_COLORS.purple : ADMIN_COLORS.slateD}` }}
                  >
                    <p className="font-bold" style={{ color: ADMIN_COLORS.text }}>{e.razon_social}</p>
                    <p className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>{labelPlan(e.plan_tipo)} · {e.ruc || "sin RUC"}</p>
                    <div className="mt-2">
                      {e.activa ? <AdminBadge label="Activa" tone="success" /> : <AdminBadge label="Suspendida" tone="warning" />}
                    </div>
                  </button>
                ))}
                {filtradas.length === 0 && (
                  <p className="col-span-full py-10 text-center text-sm" style={{ color: ADMIN_COLORS.textMid }}>
                    Sin empresas registradas
                  </p>
                )}
              </div>
            )}

            <AdminNotice>
              Importar (CSV) está en el panel lateral (Acciones rápidas); &ldquo;Exportar&rdquo;
              (CSV de la vista actual) y la plantilla también están disponibles. &ldquo;Publicar
              cambios&rdquo; y &ldquo;Guía de uso&rdquo; no están construidos — pendientes de
              definición. &ldquo;Solicitar eliminación&rdquo; tampoco — es un procedimiento
              administrativo aparte, no un borrado directo, y ese procedimiento no está definido
              todavía.
            </AdminNotice>
            <p className="mt-3 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
              Fuente: tabla <span className="font-mono">empresas</span> (Supabase) — el estado
              activo/suspendida vive en <span className="font-mono">empresas.activo</span>, el plan
              en <span className="font-mono">perfiles.plan_tipo</span> vía{" "}
              <span className="font-mono">gerente_user_id</span>. &ldquo;Última actividad&rdquo; es
              el último acceso real del gerente.
            </p>
          </>
        )}

        {tab === "Solicitudes" && (
          <div className="rounded-2xl p-8 text-center" style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}>
            <p className="text-sm">No hay solicitudes de empresa pendientes.</p>
          </div>
        )}

        {tab === "Historial" && (
          <div className="rounded-2xl p-8 text-center" style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}>
            <p className="text-sm">Historial de cambios — pendiente auditoría BD.</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {seleccionada ? (
          <AdminCard
            title="Información de la empresa"
            action={
              <button type="button" onClick={() => setPanelId(null)} className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
                ✕
              </button>
            }
          >
            <p className="font-bold" style={{ color: ADMIN_COLORS.text }}>{seleccionada.razon_social}</p>
            <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>{seleccionada.email}</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>Plan</dt>
                <dd style={{ color: ADMIN_COLORS.text }}>{labelPlan(seleccionada.plan_tipo)}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>RUC</dt>
                <dd style={{ color: ADMIN_COLORS.text }}>{seleccionada.ruc || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>Dirección</dt>
                <dd style={{ color: ADMIN_COLORS.text }}>{seleccionada.direccion || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>Teléfono</dt>
                <dd style={{ color: ADMIN_COLORS.text }}>{seleccionada.telefono || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>Fecha de alta</dt>
                <dd style={{ color: ADMIN_COLORS.text }}>{new Date(seleccionada.created_at).toLocaleDateString("es-PE")}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>Última actividad</dt>
                <dd style={{ color: ADMIN_COLORS.text }}>
                  {seleccionada.lastSignInAt ? new Date(seleccionada.lastSignInAt).toLocaleDateString("es-PE") : "Nunca"}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              disabled={isPending}
              onClick={() => toggleActiva(seleccionada.id, !seleccionada.activa)}
              className="mt-4 w-full rounded-lg px-3 py-2 text-sm font-bold"
              style={{
                background: seleccionada.activa ? ADMIN_COLORS.redPale : ADMIN_COLORS.greenPale,
                color: seleccionada.activa ? ADMIN_COLORS.red : ADMIN_COLORS.greenD,
              }}
            >
              {seleccionada.activa ? "Desactivar empresa" : "Activar empresa"}
            </button>
          </AdminCard>
        ) : (
          <>
            <AdminCard title="Resumen de empresas">
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span style={{ color: ADMIN_COLORS.textMid }}>Total de empresas</span>
                  <span className="font-bold" style={{ color: ADMIN_COLORS.text }}>{empresas.length}</span>
                </li>
                <li className="flex justify-between">
                  <span style={{ color: ADMIN_COLORS.textMid }}>Autónomos</span>
                  <span className="font-bold" style={{ color: ADMIN_COLORS.textLight }}>—</span>
                </li>
                <li className="flex justify-between">
                  <span style={{ color: ADMIN_COLORS.textMid }}>Empresas activas</span>
                  <span className="font-bold" style={{ color: ADMIN_COLORS.text }}>{activas}</span>
                </li>
                <li className="flex justify-between">
                  <span style={{ color: ADMIN_COLORS.textMid }}>Empresas suspendidas</span>
                  <span className="font-bold" style={{ color: ADMIN_COLORS.text }}>{empresas.length - activas}</span>
                </li>
                <li className="flex justify-between">
                  <span style={{ color: ADMIN_COLORS.textMid }}>Empresas inactivas</span>
                  <span className="font-bold" style={{ color: ADMIN_COLORS.textLight }}>—</span>
                </li>
              </ul>
              <p className="mt-3 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                &ldquo;Autónomos&rdquo; e &ldquo;Inactivas&rdquo; no son calculables todavía —
                <span className="font-mono"> empresas.activo</span> solo distingue 2 estados.
              </p>
            </AdminCard>

            <AdminCard title="Trabajo en equipo">
              <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>
                Actividad de los administradores sobre empresas: no disponible todavía.
              </p>
            </AdminCard>

            <AdminCard title="Acciones rápidas">
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarNuevo(true)}
                  className="rounded-lg px-3 py-2 text-left text-sm font-bold text-white"
                  style={{ background: ADMIN_COLORS.purple }}
                >
                  Nueva empresa
                </button>
                <ImportarCsvBoton
                  label="Importar empresas (CSV)"
                  columnas={["razon_social", "email_gerente", "ruc", "telefono"]}
                  notaExtra="Cada fila crea la empresa e invita a su gerente por correo real (misma validación que + Nueva empresa)."
                  procesarFila={async (f) => {
                    if (!f.razon_social || !f.email_gerente) {
                      return { ok: false, error: "razon_social y email_gerente son obligatorios" };
                    }
                    return crearEmpresaAction({
                      razonSocial: f.razon_social,
                      email: f.email_gerente,
                      ruc: f.ruc,
                      telefono: f.telefono,
                    });
                  }}
                  onTerminado={(r) => {
                    if (r.ok > 0) {
                      setAviso(`${r.ok} empresa(s) importada(s)`);
                      router.refresh();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => descargarCsv("plantilla-empresas.csv", [["razon_social", "email_gerente", "ruc", "telefono"], ["", "", "", ""]])}
                  className="rounded-lg px-3 py-2 text-left text-sm font-bold"
                  style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
                >
                  Descargar plantilla de importación (CSV)
                </button>
              </div>
              <p className="mt-3 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                &ldquo;Guía de uso&rdquo; no está construida todavía.
              </p>
            </AdminCard>
          </>
        )}
      </div>
    </div>
  );
}
