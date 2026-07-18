"use client";

import { useMemo, useState } from "react";
import { AdminBadge, AdminTabs, AdminNotice } from "@/components/admin/AdminTabs";
import { AdminCard, AdminTable } from "@/components/admin/AdminUi";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { descargarCsv } from "@/lib/csv-export";
import type { PRECIOS_OFICIALES } from "@/lib/roles-planes-oficial";
import { fmtPEN } from "@/lib/utils";

const TABS = ["Planes", "Historial de cambios"] as const;
const ORDEN_PLAN: Array<keyof typeof PRECIOS_OFICIALES> = ["basico", "pro", "business"];
const PLAN_ICON: Record<string, string> = { basico: "🔹", pro: "⭐", business: "🏢" };

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
  usuariosPorPlan: { basico: number; pro: number; business: number; gratis: number };
}

export function AdminSuscripcionesView({ planesOficiales, usuariosPorPlan }: AdminSuscripcionesViewProps) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Planes");
  const [buscar, setBuscar] = useState("");
  const [orden, setOrden] = useState<"catalogo" | "precio" | "nombre">("catalogo");
  const [vista, setVista] = useState<"tarjetas" | "tabla">("tarjetas");
  const [panelId, setPanelId] = useState<keyof typeof PRECIOS_OFICIALES | null>(null);

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
                  <AdminBadge key="e" label="Activo" tone="success" />,
                  String(i + 1),
                  <span key="v" className="text-xs font-bold" style={{ color: ADMIN_COLORS.purple }}>
                    Ver detalle
                  </span>,
                ])}
              />
            )}

            <AdminNotice>
              Catálogo de solo lectura por diseño (Doc 04 §10 — sin tabla propia todavía; el precio
              &ldquo;editable&rdquo; que describe el MD requeriría esa tabla, no construida). &ldquo;Nuevo
              plan&rdquo; no aplica — el catálogo está fijado a los 3 planes oficiales (Básico/Pro/
              Business), no se inventan planes adicionales. &ldquo;Importar planes&rdquo; y &ldquo;Publicar
              cambios&rdquo; tampoco están construidos por el mismo motivo. &ldquo;Exportar&rdquo; sí está
              disponible arriba.
            </AdminNotice>
          </>
        )}

        {tab === "Historial de cambios" && (
          <div className="rounded-2xl p-8 text-center" style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}>
            <p className="text-sm">Historial de cambios — pendiente auditoría BD.</p>
            <p className="mt-2 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
              Solo tiene sentido una vez que el precio sea editable (Doc 04 §6/§10).
            </p>
          </div>
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
          </AdminCard>
        ) : (
          <>
            <AdminCard title="Información">
              <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>
                Fuente única del catálogo oficial de planes (Doc 04 §6). Los 3 planes tienen precio
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
                &ldquo;Importar planes&rdquo; y &ldquo;Guía de uso&rdquo; no están construidas todavía
                (Doc 04 §8).
              </p>
            </AdminCard>
          </>
        )}
      </div>
    </div>
  );
}
