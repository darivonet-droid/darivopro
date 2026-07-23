"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminBadge, AdminTabs, AdminNotice } from "@/components/admin/AdminTabs";
import { AdminCard, AdminTable, AdminErrorBanner } from "@/components/admin/AdminUi";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { descargarCsv } from "@/lib/csv-export";
import { ImportarCsvBoton } from "@/components/admin/ImportarCsvBoton";
import { fmtPEN } from "@/lib/utils";
import type {
  AdminCategoriaMaestroRow,
  AdminPartidaMaestroRow,
  AdminSectorRow,
} from "@/lib/admin-queries";
import {
  crearCategoriaAction,
  editarCategoriaAction,
  eliminarCategoriaAction,
  crearPartidaAction,
  editarPartidaAction,
  eliminarPartidaAction,
} from "@/app/admin/catalogo/actions";

const TABS = ["Categorías", "Subcategorías", "Partidas", "Precios sugeridos", "Historial de cambios"] as const;
const SECTOR_CONSTRUCCION_SLUG = "construccion";
const CALC_TYPES = [
  { value: "m2", label: "Por m²" },
  { value: "unit", label: "Por unidad" },
  { value: "hour", label: "Por hora" },
  { value: "fixed", label: "Fijo" },
] as const;

interface AdminCatalogoViewProps {
  productoId: string;
  sectores: AdminSectorRow[];
  categoriasIniciales: AdminCategoriaMaestroRow[];
  partidasIniciales: AdminPartidaMaestroRow[];
}

export function AdminCatalogoView({
  productoId,
  sectores,
  categoriasIniciales,
  partidasIniciales,
}: AdminCatalogoViewProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [categorias, setCategorias] = useState(categoriasIniciales);
  const [partidas, setPartidas] = useState(partidasIniciales);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Categorías");
  const [buscar, setBuscar] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<"todos" | "activos" | "inactivos">("todos");
  const [orden, setOrden] = useState<"nombre" | "alta">("nombre");
  const [vista, setVista] = useState<"tabla" | "tarjetas">("tabla");
  const [panel, setPanel] = useState<{ tipo: "categoria" | "partida"; id: string } | null>(null);
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false);
  const [mostrarNuevaPartida, setMostrarNuevaPartida] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const sectorConstruccion = sectores.find((s) => s.slug === SECTOR_CONSTRUCCION_SLUG);

  function limpiarAvisos() {
    setError(null);
    setAviso(null);
  }

  // ── Categorías / Subcategorías ──────────────────────────────────────────
  const categoriasBase = useMemo(
    () => categorias.filter((c) => (tab === "Subcategorías" ? c.sector_id === sectorConstruccion?.id : c.sector_id !== sectorConstruccion?.id)),
    [categorias, tab, sectorConstruccion]
  );
  const categoriasFiltradas = useMemo(() => {
    let list = categoriasBase;
    if (estadoFiltro === "activos") list = list.filter((c) => c.activo);
    if (estadoFiltro === "inactivos") list = list.filter((c) => !c.activo);
    const q = buscar.trim().toLowerCase();
    if (q) list = list.filter((c) => c.nombre.toLowerCase().includes(q));
    const sorted = [...list];
    if (orden === "nombre") sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (orden === "alta") sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return sorted;
  }, [categoriasBase, estadoFiltro, buscar, orden]);

  function guardarCategoria(id: string, input: { nombre?: string; emoji?: string; color?: string; activo?: boolean }) {
    limpiarAvisos();
    const anterior = categorias.find((c) => c.id === id);
    if (!anterior) return;
    setCategorias((prev) => prev.map((c) => (c.id === id ? { ...c, ...input } : c)));
    startTransition(async () => {
      const r = await editarCategoriaAction(id, input);
      if (!r.ok) {
        setCategorias((prev) => prev.map((c) => (c.id === id ? anterior : c)));
        setError(r.error);
      }
    });
  }

  function toggleActivaCategoria(id: string, activo: boolean) {
    guardarCategoria(id, { activo });
  }

  function eliminarCategoria(id: string) {
    if (!confirm("¿Eliminar esta categoría? También se eliminarán sus partidas.")) return;
    limpiarAvisos();
    startTransition(async () => {
      const r = await eliminarCategoriaAction(id);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      setPartidas((prev) => prev.filter((p) => p.categoria_maestro_id !== id));
      setPanel(null);
    });
  }

  const [fCatNombre, setFCatNombre] = useState("");
  const [fCatSector, setFCatSector] = useState("");
  const [fCatEmoji, setFCatEmoji] = useState("🔧");

  function crearCategoria() {
    limpiarAvisos();
    const sectorId = tab === "Subcategorías" ? sectorConstruccion?.id : fCatSector;
    if (!sectorId || !fCatNombre.trim()) {
      setError("Sector y nombre son obligatorios");
      return;
    }
    startTransition(async () => {
      const r = await crearCategoriaAction({ sectorId, productoId, nombre: fCatNombre, emoji: fCatEmoji });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setAviso(`${tab === "Subcategorías" ? "Subcategoría" : "Categoría"} creada`);
      setFCatNombre("");
      setFCatSector("");
      setMostrarNuevaCategoria(false);
      router.refresh();
    });
  }

  // ── Partidas / Precios sugeridos ────────────────────────────────────────
  const partidasFiltradas = useMemo(() => {
    let list = partidas;
    if (estadoFiltro === "activos") list = list.filter((p) => p.activo);
    if (estadoFiltro === "inactivos") list = list.filter((p) => !p.activo);
    const q = buscar.trim().toLowerCase();
    if (q) list = list.filter((p) => p.nombre.toLowerCase().includes(q) || p.categoriaNombre.toLowerCase().includes(q));
    const sorted = [...list];
    if (orden === "nombre") sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (orden === "alta") sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return sorted;
  }, [partidas, estadoFiltro, buscar, orden]);

  function guardarPartida(id: string, input: Parameters<typeof editarPartidaAction>[1]) {
    limpiarAvisos();
    const anterior = partidas.find((p) => p.id === id);
    if (!anterior) return;
    setPartidas((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...(input.nombre !== undefined ? { nombre: input.nombre } : {}),
              ...(input.calcType !== undefined ? { calc_type: input.calcType } : {}),
              ...(input.precioTarifaPro !== undefined ? { precio_tarifa_pro: input.precioTarifaPro } : {}),
              ...(input.unidad !== undefined ? { unidad: input.unidad } : {}),
              ...(input.activo !== undefined ? { activo: input.activo } : {}),
            }
          : p
      )
    );
    startTransition(async () => {
      const r = await editarPartidaAction(id, input);
      if (!r.ok) {
        setPartidas((prev) => prev.map((p) => (p.id === id ? anterior : p)));
        setError(r.error);
      }
    });
  }

  function eliminarPartida(id: string) {
    if (!confirm("¿Eliminar esta partida?")) return;
    limpiarAvisos();
    startTransition(async () => {
      const r = await eliminarPartidaAction(id);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setPartidas((prev) => prev.filter((p) => p.id !== id));
      setPanel(null);
    });
  }

  const [fParNombre, setFParNombre] = useState("");
  const [fParCategoria, setFParCategoria] = useState("");
  const [fParCalcType, setFParCalcType] = useState<(typeof CALC_TYPES)[number]["value"]>("unit");
  const [fParPrecio, setFParPrecio] = useState("");
  const [fParUnidad, setFParUnidad] = useState("");

  function crearPartida() {
    limpiarAvisos();
    const precio = parseFloat(fParPrecio.replace(",", "."));
    if (!fParCategoria || !fParNombre.trim() || !Number.isFinite(precio)) {
      setError("Categoría, nombre y precio son obligatorios");
      return;
    }
    startTransition(async () => {
      const r = await crearPartidaAction({
        categoriaMaestroId: fParCategoria,
        nombre: fParNombre,
        calcType: fParCalcType,
        precioTarifaPro: precio,
        unidad: fParUnidad,
      });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setAviso("Partida creada");
      setFParNombre("");
      setFParPrecio("");
      setFParUnidad("");
      setMostrarNuevaPartida(false);
      router.refresh();
    });
  }

  const categoriaSeleccionada = panel?.tipo === "categoria" ? categorias.find((c) => c.id === panel.id) : null;
  const partidaSeleccionada = panel?.tipo === "partida" ? partidas.find((p) => p.id === panel.id) : null;

  const esTabCategorias = tab === "Categorías" || tab === "Subcategorías";
  const esTabPartidas = tab === "Partidas" || tab === "Precios sugeridos";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {error && <AdminErrorBanner mensaje={error} />}
        {aviso && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: ADMIN_COLORS.greenPale, color: ADMIN_COLORS.greenD }}>
            {aviso}
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <AdminCard>
            <p className="text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>Categorías</p>
            <p className="mt-2 text-2xl font-black" style={{ color: ADMIN_COLORS.text }}>
              {categorias.filter((c) => c.sector_id !== sectorConstruccion?.id).length}
            </p>
          </AdminCard>
          <AdminCard>
            <p className="text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>Subcategorías</p>
            <p className="mt-2 text-2xl font-black" style={{ color: ADMIN_COLORS.text }}>
              {categorias.filter((c) => c.sector_id === sectorConstruccion?.id).length}
            </p>
          </AdminCard>
          <AdminCard>
            <p className="text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>Partidas</p>
            <p className="mt-2 text-2xl font-black" style={{ color: ADMIN_COLORS.text }}>{partidas.length}</p>
          </AdminCard>
          <AdminCard>
            <p className="text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>Cambios pendientes</p>
            <p className="mt-2 text-2xl font-black" style={{ color: ADMIN_COLORS.textLight }}>—</p>
          </AdminCard>
        </div>

        <AdminTabs tabs={[...TABS]} active={tab} onChange={(t) => { setTab(t as (typeof TABS)[number]); setPanel(null); }} />

        {(esTabCategorias || esTabPartidas) && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => (esTabCategorias ? setMostrarNuevaCategoria(true) : setMostrarNuevaPartida(true))}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-white"
              style={{ background: ADMIN_COLORS.purple }}
            >
              {esTabCategorias ? (tab === "Subcategorías" ? "+ Nueva subcategoría" : "+ Nueva categoría") : "+ Nueva partida"}
            </button>
            <input
              type="search"
              placeholder="Buscar…"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              className="min-w-[160px] flex-1 rounded-xl border px-4 py-2 text-sm"
              style={{ borderColor: ADMIN_COLORS.slateD }}
            />
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value as typeof estadoFiltro)}
              className="rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: ADMIN_COLORS.slateD, color: ADMIN_COLORS.text }}
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as typeof orden)}
              className="rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: ADMIN_COLORS.slateD, color: ADMIN_COLORS.text }}
            >
              <option value="nombre">Nombre (A–Z)</option>
              <option value="alta">Más recientes</option>
            </select>
            <button
              type="button"
              onClick={() =>
                esTabCategorias
                  ? descargarCsv("categorias.csv", [
                      ["nombre", "sector", "partidas", "estado"],
                      ...categoriasFiltradas.map((c) => [c.nombre, c.sectorNombre, String(c.partidasCount), c.activo ? "Activo" : "Inactivo"]),
                    ])
                  : descargarCsv("partidas.csv", [
                      ["nombre", "categoria", "tipo_calculo", "precio_tarifa_pro", "unidad", "estado"],
                      ...partidasFiltradas.map((p) => [p.nombre, p.categoriaNombre, p.calc_type, String(p.precio_tarifa_pro), p.unidad ?? "", p.activo ? "Activo" : "Inactivo"]),
                    ])
              }
              className="rounded-xl px-3 py-2 text-sm font-bold"
              style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
            >
              Exportar
            </button>
            <div className="flex gap-1 rounded-xl p-1" style={{ background: ADMIN_COLORS.slate }}>
              <button type="button" onClick={() => setVista("tabla")} className="rounded-lg px-3 py-1.5 text-xs font-bold" style={{ background: vista === "tabla" ? ADMIN_COLORS.white : "transparent", color: ADMIN_COLORS.text }}>
                Tabla
              </button>
              <button type="button" onClick={() => setVista("tarjetas")} className="rounded-lg px-3 py-1.5 text-xs font-bold" style={{ background: vista === "tarjetas" ? ADMIN_COLORS.white : "transparent", color: ADMIN_COLORS.text }}>
                Tarjetas
              </button>
            </div>
          </div>
        )}

        {mostrarNuevaCategoria && esTabCategorias && (
          <div className="mb-4 rounded-2xl p-4" style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input placeholder="Nombre *" value={fCatNombre} onChange={(e) => setFCatNombre(e.target.value)} className="rounded-xl border px-3 py-2 text-sm sm:col-span-2" style={{ borderColor: ADMIN_COLORS.slateD }} />
              <input placeholder="Emoji" value={fCatEmoji} onChange={(e) => setFCatEmoji(e.target.value)} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: ADMIN_COLORS.slateD }} />
              {tab !== "Subcategorías" && (
                <select value={fCatSector} onChange={(e) => setFCatSector(e.target.value)} className="rounded-xl border px-3 py-2 text-sm sm:col-span-3" style={{ borderColor: ADMIN_COLORS.slateD }}>
                  <option value="">Sector *</option>
                  {sectores.filter((s) => s.id !== sectorConstruccion?.id).map((s) => (
                    <option key={s.id} value={s.id}>{s.emoji} {s.nombre}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => setMostrarNuevaCategoria(false)} className="flex-1 rounded-xl py-2 text-sm font-bold" style={{ border: `1px solid ${ADMIN_COLORS.slateD}`, color: ADMIN_COLORS.textMid }}>Cancelar</button>
              <button type="button" onClick={crearCategoria} className="flex-[2] rounded-xl py-2 text-sm font-bold text-white" style={{ background: ADMIN_COLORS.purple }}>Crear</button>
            </div>
          </div>
        )}

        {mostrarNuevaPartida && esTabPartidas && (
          <div className="mb-4 rounded-2xl p-4" style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input placeholder="Nombre *" value={fParNombre} onChange={(e) => setFParNombre(e.target.value)} className="rounded-xl border px-3 py-2 text-sm sm:col-span-2" style={{ borderColor: ADMIN_COLORS.slateD }} />
              <select value={fParCategoria} onChange={(e) => setFParCategoria(e.target.value)} className="rounded-xl border px-3 py-2 text-sm sm:col-span-2" style={{ borderColor: ADMIN_COLORS.slateD }}>
                <option value="">Categoría *</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.nombre} ({c.sectorNombre})</option>
                ))}
              </select>
              <select value={fParCalcType} onChange={(e) => setFParCalcType(e.target.value as typeof fParCalcType)} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: ADMIN_COLORS.slateD }}>
                {CALC_TYPES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <input placeholder="Precio Tarifa Pro (S/) *" value={fParPrecio} onChange={(e) => setFParPrecio(e.target.value)} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: ADMIN_COLORS.slateD }} />
              <input placeholder="Unidad (ej. m², hora)" value={fParUnidad} onChange={(e) => setFParUnidad(e.target.value)} className="rounded-xl border px-3 py-2 text-sm sm:col-span-2" style={{ borderColor: ADMIN_COLORS.slateD }} />
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => setMostrarNuevaPartida(false)} className="flex-1 rounded-xl py-2 text-sm font-bold" style={{ border: `1px solid ${ADMIN_COLORS.slateD}`, color: ADMIN_COLORS.textMid }}>Cancelar</button>
              <button type="button" onClick={crearPartida} className="flex-[2] rounded-xl py-2 text-sm font-bold text-white" style={{ background: ADMIN_COLORS.purple }}>Crear</button>
            </div>
          </div>
        )}

        {esTabCategorias && (
          vista === "tabla" ? (
            <AdminTable
              headers={["Categoría", "Partidas", "Estado", "Última actualización", "Acciones"]}
              vacio={`Sin ${tab.toLowerCase()}`}
              filaActivaIndex={categoriasFiltradas.findIndex((c) => panel?.tipo === "categoria" && c.id === panel.id)}
              onRowClick={(i) => setPanel({ tipo: "categoria", id: categoriasFiltradas[i].id })}
              rows={categoriasFiltradas.map((c) => [
                <div key="n"><span className="mr-1">{c.emoji}</span>{c.nombre}</div>,
                c.partidasCount,
                c.activo ? <AdminBadge key="e" label="Activa" tone="success" /> : <AdminBadge key="e" label="Inactiva" tone="neutral" />,
                new Date(c.created_at).toLocaleDateString("es-PE"),
                <button key="d" type="button" onClick={(ev) => { ev.stopPropagation(); eliminarCategoria(c.id); }} className="text-xs font-bold" style={{ color: ADMIN_COLORS.red }}>Eliminar</button>,
              ])}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {categoriasFiltradas.map((c) => (
                <button key={c.id} type="button" onClick={() => setPanel({ tipo: "categoria", id: c.id })} className="rounded-2xl p-4 text-left" style={{ background: ADMIN_COLORS.white, border: `1px solid ${panel?.id === c.id ? ADMIN_COLORS.purple : ADMIN_COLORS.slateD}` }}>
                  <p className="font-bold" style={{ color: ADMIN_COLORS.text }}>{c.emoji} {c.nombre}</p>
                  <p className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>{c.partidasCount} partidas</p>
                  <div className="mt-2">{c.activo ? <AdminBadge label="Activa" tone="success" /> : <AdminBadge label="Inactiva" tone="neutral" />}</div>
                </button>
              ))}
              {categoriasFiltradas.length === 0 && <p className="col-span-full py-10 text-center text-sm" style={{ color: ADMIN_COLORS.textMid }}>Sin resultados</p>}
            </div>
          )
        )}

        {tab === "Partidas" && (
          vista === "tabla" ? (
            <AdminTable
              headers={["Partida", "Categoría", "Cálculo", "Precio Tarifa Pro", "Estado", "Acciones"]}
              vacio="Sin partidas"
              filaActivaIndex={partidasFiltradas.findIndex((p) => panel?.tipo === "partida" && p.id === panel.id)}
              onRowClick={(i) => setPanel({ tipo: "partida", id: partidasFiltradas[i].id })}
              rows={partidasFiltradas.map((p) => [
                p.nombre,
                p.categoriaNombre,
                CALC_TYPES.find((c) => c.value === p.calc_type)?.label ?? p.calc_type,
                fmtPEN(p.precio_tarifa_pro),
                p.activo ? <AdminBadge key="e" label="Activa" tone="success" /> : <AdminBadge key="e" label="Inactiva" tone="neutral" />,
                <button key="d" type="button" onClick={(ev) => { ev.stopPropagation(); eliminarPartida(p.id); }} className="text-xs font-bold" style={{ color: ADMIN_COLORS.red }}>Eliminar</button>,
              ])}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {partidasFiltradas.map((p) => (
                <button key={p.id} type="button" onClick={() => setPanel({ tipo: "partida", id: p.id })} className="rounded-2xl p-4 text-left" style={{ background: ADMIN_COLORS.white, border: `1px solid ${panel?.id === p.id ? ADMIN_COLORS.purple : ADMIN_COLORS.slateD}` }}>
                  <p className="font-bold" style={{ color: ADMIN_COLORS.text }}>{p.nombre}</p>
                  <p className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>{p.categoriaNombre}</p>
                  <p className="mt-1 text-sm font-bold" style={{ color: ADMIN_COLORS.purple }}>{fmtPEN(p.precio_tarifa_pro)}</p>
                </button>
              ))}
              {partidasFiltradas.length === 0 && <p className="col-span-full py-10 text-center text-sm" style={{ color: ADMIN_COLORS.textMid }}>Sin resultados</p>}
            </div>
          )
        )}

        {tab === "Precios sugeridos" && (
          <AdminTable
            headers={["Partida", "Categoría", "Precio Tarifa Pro actual", "Nuevo precio"]}
            vacio="Sin partidas"
            rows={partidasFiltradas.map((p) => [
              p.nombre,
              p.categoriaNombre,
              fmtPEN(p.precio_tarifa_pro),
              <PrecioRapido key={p.id} valorInicial={p.precio_tarifa_pro} onGuardar={(nuevo) => guardarPartida(p.id, { precioTarifaPro: nuevo })} />,
            ])}
          />
        )}

        {(esTabCategorias || esTabPartidas) && (
          <AdminNotice>
            &ldquo;Importar categorías (CSV)&rdquo; está en el panel lateral (Acciones rápidas).
            &ldquo;Exportar&rdquo; está disponible arriba. &ldquo;Publicar cambios&rdquo; no está
            construido — los cambios aquí se aplican directamente (no hay estado
            borrador/publicado), pendiente de definición.
          </AdminNotice>
        )}

        {tab === "Historial de cambios" && (
          <div className="rounded-2xl p-8 text-center" style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}>
            <p className="text-sm">No hay historial de cambios disponible todavía.</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {categoriaSeleccionada ? (
          <AdminCard
            title={`${categoriaSeleccionada.emoji} ${categoriaSeleccionada.nombre}`}
            action={<button type="button" onClick={() => setPanel(null)} className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>✕</button>}
          >
            <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>Sector: {categoriaSeleccionada.sectorNombre}</p>
            <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>{categoriaSeleccionada.partidasCount} partidas</p>
            <EditarCategoriaForm categoria={categoriaSeleccionada} onGuardar={(input) => guardarCategoria(categoriaSeleccionada.id, input)} />
            <div className="mt-3 flex flex-col gap-2">
              <button type="button" onClick={() => toggleActivaCategoria(categoriaSeleccionada.id, !categoriaSeleccionada.activo)} className="rounded-lg px-3 py-2 text-sm font-bold" style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}>
                {categoriaSeleccionada.activo ? "Desactivar" : "Activar"}
              </button>
              <button type="button" onClick={() => eliminarCategoria(categoriaSeleccionada.id)} className="rounded-lg px-3 py-2 text-sm font-bold" style={{ background: ADMIN_COLORS.redPale, color: ADMIN_COLORS.red }}>
                Eliminar categoría
              </button>
            </div>
          </AdminCard>
        ) : partidaSeleccionada ? (
          <AdminCard
            title={partidaSeleccionada.nombre}
            action={<button type="button" onClick={() => setPanel(null)} className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>✕</button>}
          >
            <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>{partidaSeleccionada.categoriaNombre}</p>
            <EditarPartidaForm partida={partidaSeleccionada} onGuardar={(input) => guardarPartida(partidaSeleccionada.id, input)} />
            <div className="mt-3 flex flex-col gap-2">
              <button type="button" onClick={() => guardarPartida(partidaSeleccionada.id, { activo: !partidaSeleccionada.activo })} className="rounded-lg px-3 py-2 text-sm font-bold" style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}>
                {partidaSeleccionada.activo ? "Desactivar" : "Activar"}
              </button>
              <button type="button" onClick={() => eliminarPartida(partidaSeleccionada.id)} className="rounded-lg px-3 py-2 text-sm font-bold" style={{ background: ADMIN_COLORS.redPale, color: ADMIN_COLORS.red }}>
                Eliminar partida
              </button>
            </div>
          </AdminCard>
        ) : (
          <>
            <AdminCard title="Trabajo en equipo">
              <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>
                &ldquo;Usuarios editando el catálogo&rdquo; no está disponible todavía.
              </p>
            </AdminCard>
            <AdminCard title="Acciones rápidas">
              <div className="flex flex-col gap-2">
                <ImportarCsvBoton
                  label="Importar categorías (CSV)"
                  columnas={["nombre", "sector", "emoji"]}
                  notaExtra="El sector debe existir (ej. Electricidad, Pintura); con sector Construcción la fila se crea como subcategoría."
                  procesarFila={async (f) => {
                    if (!f.nombre) return { ok: false, error: "Columna nombre vacía" };
                    if (!f.sector) return { ok: false, error: "Columna sector vacía" };
                    const buscado = f.sector
                      .normalize("NFD")
                      .replace(/[̀-ͯ]/g, "")
                      .toLowerCase();
                    const sector = sectores.find(
                      (s) =>
                        s.slug === buscado ||
                        s.nombre
                          .normalize("NFD")
                          .replace(/[̀-ͯ]/g, "")
                          .toLowerCase() === buscado
                    );
                    if (!sector) return { ok: false, error: `Sector "${f.sector}" no existe en el catálogo` };
                    return crearCategoriaAction({
                      sectorId: sector.id,
                      productoId,
                      nombre: f.nombre,
                      emoji: f.emoji,
                    });
                  }}
                  onTerminado={(r) => {
                    if (r.ok > 0) {
                      setAviso(`${r.ok} categoría(s) importada(s)`);
                      router.refresh();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => descargarCsv("plantilla-categorias.csv", [["nombre", "sector", "emoji"], ["", "", ""]])}
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

function EditarCategoriaForm({
  categoria,
  onGuardar,
}: {
  categoria: AdminCategoriaMaestroRow;
  onGuardar: (input: { nombre?: string; emoji?: string; color?: string }) => void;
}) {
  const [nombre, setNombre] = useState(categoria.nombre);
  const [emoji, setEmoji] = useState(categoria.emoji ?? "");
  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-2">
        <input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="w-16 rounded-lg border px-2 py-2 text-center text-sm" style={{ borderColor: ADMIN_COLORS.slateD }} />
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="flex-1 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: ADMIN_COLORS.slateD }} />
      </div>
      <button type="button" onClick={() => onGuardar({ nombre, emoji })} className="w-full rounded-lg px-3 py-2 text-sm font-bold text-white" style={{ background: ADMIN_COLORS.purple }}>
        Guardar cambios
      </button>
    </div>
  );
}

function EditarPartidaForm({
  partida,
  onGuardar,
}: {
  partida: AdminPartidaMaestroRow;
  onGuardar: (input: { nombre?: string; calcType?: (typeof CALC_TYPES)[number]["value"]; precioTarifaPro?: number; unidad?: string }) => void;
}) {
  const [nombre, setNombre] = useState(partida.nombre);
  const [calcType, setCalcType] = useState(partida.calc_type);
  const [precio, setPrecio] = useState(String(partida.precio_tarifa_pro));
  const [unidad, setUnidad] = useState(partida.unidad ?? "");
  return (
    <div className="mt-3 space-y-2">
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: ADMIN_COLORS.slateD }} />
      <select value={calcType} onChange={(e) => setCalcType(e.target.value as typeof calcType)} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: ADMIN_COLORS.slateD }}>
        {CALC_TYPES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
      <input value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Precio" className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: ADMIN_COLORS.slateD }} />
      <input value={unidad} onChange={(e) => setUnidad(e.target.value)} placeholder="Unidad" className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: ADMIN_COLORS.slateD }} />
      <button
        type="button"
        onClick={() => {
          const p = parseFloat(precio.replace(",", "."));
          onGuardar({ nombre, calcType, precioTarifaPro: Number.isFinite(p) ? p : undefined, unidad });
        }}
        className="w-full rounded-lg px-3 py-2 text-sm font-bold text-white"
        style={{ background: ADMIN_COLORS.purple }}
      >
        Guardar cambios
      </button>
    </div>
  );
}

function PrecioRapido({ valorInicial, onGuardar }: { valorInicial: number; onGuardar: (v: number) => void }) {
  const [valor, setValor] = useState(String(valorInicial));
  const [tocado, setTocado] = useState(false);
  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <input
        value={valor}
        onChange={(e) => { setValor(e.target.value); setTocado(true); }}
        className="w-24 rounded-lg border px-2 py-1 text-xs font-bold"
        style={{ borderColor: ADMIN_COLORS.slateD }}
      />
      {tocado && (
        <button
          type="button"
          onClick={() => {
            const p = parseFloat(valor.replace(",", "."));
            if (Number.isFinite(p)) {
              onGuardar(p);
              setTocado(false);
            }
          }}
          className="text-xs font-bold"
          style={{ color: ADMIN_COLORS.greenD }}
        >
          Guardar
        </button>
      )}
    </div>
  );
}
