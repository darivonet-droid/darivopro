// DARIVO PRO — Gestión de categorías editables (Config → Categorías)
"use client";
import { useState } from "react";
import { useCatalogo } from "@/hooks/useCatalogo";
import { useCategorias } from "@/hooks/useCategorias";
import { useAppStore } from "@/store/useAppStore";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/theme";
import type { Capitulo, Partida } from "@/types";

/** Solo dígitos y un separador decimal mientras se escribe */
function sanitizePrecio(raw: string): string {
  const v = raw.replace(/[^\d.,]/g, "");
  if (!v) return "";
  const sep = v.search(/[.,]/);
  if (sep === -1) return v;
  return v.slice(0, sep) + v[sep] + v.slice(sep + 1).replace(/[.,]/g, "");
}
function parsePrecio(raw: string): number {
  if (!raw.trim()) return 0;
  const n = parseFloat(raw.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function CategoriasManager() {
  const { catalogo, recargar } = useCatalogo();
  const { editarNombreCategoria, editarPrecioPartida, crearCategoria } = useCategorias();
  const mostrarToast = useAppStore((s) => s.mostrarToast);

  const [expandido, setExpandido] = useState<string | null>(null);
  const [añadiendo, setAñadiendo] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");

  const coloresUsados = catalogo.map((c) => c.color);

  const guardarNuevaCategoria = async () => {
    if (nuevoNombre.trim().length < 2) {
      mostrarToast("Escribe un nombre válido", "error");
      return;
    }
    const ok = await crearCategoria(nuevoNombre, coloresUsados);
    if (ok) {
      mostrarToast("Categoría creada ✓");
      setNuevoNombre("");
      setAñadiendo(false);
      recargar();
    } else {
      mostrarToast("No se pudo crear la categoría", "error");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {catalogo.map((cap) => (
        <CategoriaItem
          key={cap.id}
          cap={cap}
          abierto={expandido === cap.id}
          onToggle={() => setExpandido(expandido === cap.id ? null : cap.id)}
          onGuardarNombre={async (nombre) => {
            const ok = await editarNombreCategoria(cap, nombre);
            mostrarToast(ok ? "Nombre actualizado ✓" : "No se pudo guardar", ok ? "ok" : "error");
            if (ok) recargar();
          }}
          onGuardarPrecio={async (partida, precio) => {
            const ok = await editarPrecioPartida(partida, precio);
            mostrarToast(ok ? "Precio actualizado ✓" : "No se pudo guardar", ok ? "ok" : "error");
            if (ok) recargar();
          }}
        />
      ))}

      {/* Añadir categoría */}
      {añadiendo ? (
        <div className="flex flex-col gap-2 rounded-xl px-4 py-3.5" style={{ background: T.navyLight }}>
          <input
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Nombre de la categoría"
            autoFocus
            className="w-full rounded-lg px-3 py-2.5 text-sm font-medium outline-none"
            style={{ background: T.navy, color: T.white, border: `1.5px solid ${T.blue}` }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={guardarNuevaCategoria}
              className="flex-1 rounded-lg py-2.5 text-xs font-bold"
              style={{ background: T.blue, color: T.white }}
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => {
                setAñadiendo(false);
                setNuevoNombre("");
              }}
              className="rounded-lg px-4 py-2.5 text-xs font-bold"
              style={{ color: T.textLight }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAñadiendo(true)}
          className="mt-1 w-full rounded-xl py-3 text-sm font-bold"
          style={{ background: T.blue, color: T.white }}
        >
          + Añadir categoría
        </button>
      )}
    </div>
  );
}

/* ─── Item de categoría (fila + edición desplegable) ───────── */
function CategoriaItem({
  cap,
  abierto,
  onToggle,
  onGuardarNombre,
  onGuardarPrecio,
}: {
  cap: Capitulo;
  abierto: boolean;
  onToggle: () => void;
  onGuardarNombre: (nombre: string) => void;
  onGuardarPrecio: (partida: Partida, precio: number) => void;
}) {
  const [nombre, setNombre] = useState(cap.nombre);

  return (
    <div className="rounded-xl" style={{ background: T.navyLight }}>
      {/* Fila: toda clickeable */}
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl text-base"
          style={{ background: `${cap.color}22` }}
        >
          {cap.emoji}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: T.white }}>{cap.nombre}</p>
          <p className="text-[11px]" style={{ color: T.textLight }}>
            {cap.partidas.length} partida{cap.partidas.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="h-2.5 w-2.5 rounded-full" style={{ background: cap.color }} />
      </button>

      {/* Panel de edición */}
      {abierto && (
        <div className="fi flex flex-col gap-3 border-t px-4 pb-4 pt-3" style={{ borderColor: T.navy }}>
          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: T.textLight }}>
              Nombre de la categoría
            </span>
            <div className="flex gap-2">
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="flex-1 rounded-lg px-3 py-2 text-sm font-medium outline-none"
                style={{ background: T.navy, color: T.white, border: `1.5px solid ${T.navy}` }}
              />
              <button
                type="button"
                onClick={() => onGuardarNombre(nombre)}
                disabled={nombre.trim().length < 2 || nombre.trim() === cap.nombre}
                className="rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-40"
                style={{ background: T.blue, color: T.white }}
              >
                Guardar
              </button>
            </div>
          </div>

          {/* Partidas con precio editable */}
          {cap.partidas.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: T.textLight }}>
                Partidas y precios
              </span>
              {cap.partidas.map((p) => (
                <PartidaPrecioRow key={p.id} partida={p} onGuardar={(precio) => onGuardarPrecio(p, precio)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Fila de partida con precio editable (guarda al perder foco) ─── */
function PartidaPrecioRow({ partida, onGuardar }: { partida: Partida; onGuardar: (precio: number) => void }) {
  const [raw, setRaw] = useState(String(partida.precio));

  const commit = () => {
    const precio = parsePrecio(raw);
    if (precio > 0 && precio !== partida.precio) onGuardar(precio);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2" style={{ background: T.navy }}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium" style={{ color: T.white }}>{partida.nombre}</p>
        <p className="text-[10px]" style={{ color: T.textLight }}>
          {fmtPEN(partida.precio)} / {partida.unidad}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs font-bold" style={{ color: T.textLight }}>S/</span>
        <input
          type="text"
          inputMode="decimal"
          value={raw}
          onChange={(e) => setRaw(sanitizePrecio(e.target.value))}
          onBlur={commit}
          className="w-20 rounded-lg px-2 py-1.5 text-center text-xs font-bold outline-none"
          style={{ background: T.navyLight, color: T.white }}
        />
      </div>
    </div>
  );
}
