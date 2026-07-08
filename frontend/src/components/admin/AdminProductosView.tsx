"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminBadge, AdminNotice } from "@/components/admin/AdminTabs";
import { AdminKpiCard, AdminServiceRoleNotice, AdminTable } from "@/components/admin/AdminUi";
import { T } from "@/lib/design-system/tokens";
import type { AdminProductoRow } from "@/lib/admin-queries";
import { updateProductoAction } from "@/app/admin/productos/actions";

interface AdminProductosViewProps {
  productos: AdminProductoRow[];
  error: string | null;
}

interface EditForm {
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export function AdminProductosView({ productos, error }: AdminProductosViewProps) {
  const router = useRouter();
  const [items, setItems] = useState(productos);
  const [selId, setSelId] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>({ nombre: "", descripcion: "", activo: true });
  const [buscar, setBuscar] = useState("");
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; texto: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setItems(productos);
  }, [productos]);

  const seleccionado = useMemo(
    () => items.find((p) => p.id === selId) ?? null,
    [items, selId]
  );

  const filtrados = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    );
  }, [items, buscar]);

  const abrirEdicion = (p: AdminProductoRow) => {
    setSelId(p.id);
    setForm({ nombre: p.nombre, descripcion: p.descripcion ?? "", activo: p.activo });
    setMsg(null);
  };

  const cerrarEdicion = () => {
    setSelId(null);
    setMsg(null);
  };

  const guardar = () => {
    if (!seleccionado) return;
    if (!form.nombre.trim()) {
      setMsg({ tone: "err", texto: "El nombre es obligatorio" });
      return;
    }
    const id = seleccionado.id;
    startTransition(async () => {
      const res = await updateProductoAction(id, {
        nombre: form.nombre,
        descripcion: form.descripcion,
        activo: form.activo,
      });
      if (!res.ok) {
        setMsg({ tone: "err", texto: res.error });
        return;
      }
      setItems((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                nombre: form.nombre.trim(),
                descripcion: form.descripcion.trim() || null,
                activo: form.activo,
              }
            : p
        )
      );
      setMsg({ tone: "ok", texto: "Cambios guardados" });
      router.refresh();
    });
  };

  // Sin service role no hay datos de plataforma (mismo patrón que el resto del Admin).
  if (error) {
    return error.includes("SERVICE_ROLE") ? (
      <AdminServiceRoleNotice />
    ) : (
      <AdminNotice>{error}</AdminNotice>
    );
  }

  const activos = items.filter((p) => p.activo).length;

  return (
    <div>
      <AdminNotice>
        Solo se editan los productos ya definidos en la Visión del Producto (§3). No se
        crean ni eliminan filas desde este panel (05-PANEL-ADMIN-EDICION-DE-PRODUCTOS.md §6, §12).
        El <span className="font-mono text-xs">slug</span> es de solo lectura (clave funcional).
      </AdminNotice>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <AdminKpiCard label="Productos" value={items.length} />
        <AdminKpiCard label="Activos" value={activos} />
        <AdminKpiCard label="Inactivos" value={items.length - activos} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Buscar producto…"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="min-w-[180px] flex-1 rounded-xl border px-4 py-2 text-sm"
          style={{ borderColor: T.slateD }}
        />
      </div>

      <AdminTable
        headers={["Producto", "Slug", "Categorías", "Estado", "Acciones"]}
        vacio="Sin productos registrados"
        rows={filtrados.map((p) => [
          <div key="n">
            <p className="font-semibold">{p.nombre}</p>
            {p.descripcion && (
              <p className="text-xs" style={{ color: T.textLight }}>
                {p.descripcion}
              </p>
            )}
          </div>,
          <span key="s" className="font-mono text-xs">
            {p.slug}
          </span>,
          p.categorias,
          <AdminBadge
            key="e"
            label={p.activo ? "Activo" : "Inactivo"}
            tone={p.activo ? "success" : "neutral"}
          />,
          <button
            key="a"
            type="button"
            disabled={pending}
            onClick={() => abrirEdicion(p)}
            className="text-xs font-bold"
            style={{ color: T.blue }}
          >
            Editar
          </button>,
        ])}
      />

      {seleccionado && (
        <section
          className="mt-6 rounded-2xl p-5"
          style={{ background: T.white, border: `1px solid ${T.slateD}` }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-extrabold" style={{ color: T.text }}>
              Editar producto
            </h2>
            <span className="font-mono text-xs" style={{ color: T.textLight }}>
              {seleccionado.slug}
            </span>
          </div>

          <label className="mb-1 block text-xs font-bold" style={{ color: T.textMid }}>
            Nombre
          </label>
          <input
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            className="mb-3 w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: T.slateD }}
          />

          <label className="mb-1 block text-xs font-bold" style={{ color: T.textMid }}>
            Descripción
          </label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            rows={3}
            className="mb-3 w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: T.slateD }}
          />

          <label className="mb-4 flex items-center gap-2 text-sm" style={{ color: T.text }}>
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
            />
            Producto activo
          </label>

          <dl className="mb-4 grid grid-cols-2 gap-2 text-xs" style={{ color: T.textMid }}>
            <div>
              <dt className="font-bold">Categorías asociadas</dt>
              <dd>{seleccionado.categorias}</dd>
            </div>
            <div>
              <dt className="font-bold">Creado</dt>
              <dd>{new Date(seleccionado.created_at).toLocaleDateString("es-PE")}</dd>
            </div>
          </dl>

          {msg && (
            <p
              className="mb-3 text-xs font-semibold"
              style={{ color: msg.tone === "ok" ? T.greenD : T.red }}
            >
              {msg.texto}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={cerrarEdicion}
              disabled={pending}
              className="flex-1 rounded-xl py-2 text-sm font-bold"
              style={{ border: `1px solid ${T.slateD}`, color: T.textMid }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardar}
              disabled={pending}
              className="flex-[2] rounded-xl py-2 text-sm font-bold text-white"
              style={{ background: T.blue }}
            >
              {pending ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-extrabold" style={{ color: T.text }}>
          Historial de cambios
        </h2>
        <AdminNotice>
          El esquema real de <span className="font-mono text-xs">productos_master</span> no
          incluye columnas de auditoría (<span className="font-mono text-xs">updated_at</span>,
          usuario). El historial de cambios (§5) queda pendiente de definir esas columnas en BD.
        </AdminNotice>
      </section>
    </div>
  );
}
