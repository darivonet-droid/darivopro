// DARIVO PRO — Capítulos & Categorías (diseño Fable 5 exacto)
"use client";
import { useState } from "react";
import { useCatalogo } from "@/hooks/useCatalogo";
import { useCategorias } from "@/hooks/useCategorias";
import { useAppStore } from "@/store/useAppStore";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/theme";
import type { Capitulo, Partida } from "@/types";

// ─── SVG helper ───────────────────────────────────────────────────────────────
function Ic({ d, size = 15, color = "currentColor" }: { d: string | string[]; size?: number; color?: string }) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}
const plusPath  = "M12 5v14 M5 12h14";
const chevPath  = "M9 18l6-6-6-6";
const trashPath = ["M3 6h18","M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6","M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"];

/** Only digits + one decimal separator */
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

// ─── Add-service modal (slides from bottom) ───────────────────────────────────
interface NuevoSvcModalProps {
  cap: Capitulo;
  onClose: () => void;
  onSave: (label: string, calcType: Partida["calcType"], precio: number) => void;
}
function NuevoSvcModal({ cap, onClose, onSave }: NuevoSvcModalProps) {
  const [label, setLabel]     = useState("");
  const [calcType, setCalcType] = useState<Partida["calcType"]>("m2");
  const [precio, setPrecio]   = useState("");

  const TIPOS: [Partida["calcType"], string][] = [["m2","m²"],["unit","unidad"],["hour","horas"],["fixed","fijo"]];
  const UNIT_FOR: Record<Partida["calcType"], string> = { m2: "m²", unit: "und", hour: "h", fixed: "" };

  const save = () => {
    if (!label.trim() || precio === "") { return; }
    onSave(label.trim(), calcType, parsePrecio(precio));
  };

  return (
    <div className="fi" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 400, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="su" style={{ background: T.white, borderRadius: "22px 22px 0 0", padding: "24px 20px 44px", width: "100%", maxWidth: 390 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 26 }}>{cap.emoji}</span>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5 }}>{cap.nombre}</p>
            <p style={{ fontSize: 17, fontWeight: 900, color: T.text }}>Nueva partida</p>
          </div>
        </div>
        <p style={{ fontSize: 12, color: T.textMid, marginBottom: 18 }}>Ej: &quot;Muro de ladrillo&quot;, &quot;Punto de agua&quot;…</p>

        <p style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Nombre de la partida</p>
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Nombre del servicio…"
          style={{ width: "100%", padding: "14px 16px", borderRadius: 13, fontSize: 15, fontWeight: 600, border: `2px solid ${cap.color}40`, outline: "none", color: T.text, marginBottom: 16, fontFamily: "inherit" }}
        />

        <p style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Tipo de cálculo</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
          {TIPOS.map(([tp, l]) => (
            <button key={tp} type="button" onClick={() => setCalcType(tp)} style={{ padding: "11px 4px", borderRadius: 11, border: `2px solid ${calcType === tp ? cap.color : T.slateD}`, background: calcType === tp ? cap.color + "10" : "none", cursor: "pointer", fontSize: 12, fontWeight: 800, color: calcType === tp ? cap.color : T.textMid, textAlign: "center" }}>
              {l}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
          Precio {calcType === "fixed" ? "cerrado" : calcType === "m2" ? "S//m²" : calcType === "unit" ? "S//und" : "S//hora"}
        </p>
        <div style={{ position: "relative", marginBottom: 20 }}>
          <input
            type="text"
            inputMode="decimal"
            value={precio}
            onChange={(e) => setPrecio(sanitizePrecio(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="0"
            style={{ width: "100%", padding: "14px 52px 14px 18px", borderRadius: 14, fontSize: 28, fontWeight: 900, border: `2.5px solid ${cap.color}`, outline: "none", color: T.text, fontFamily: "inherit" }}
          />
          <span style={{ position: "absolute", right: 17, top: "50%", transform: "translateY(-50%)", fontSize: 18, fontWeight: 800, color: T.textMid }}>S/</span>
        </div>

        {label && precio && (
          <div className="pi" style={{ background: cap.color + "0D", borderRadius: 12, padding: "11px 14px", marginBottom: 18, border: `1.5px solid ${cap.color}25`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: cap.color }}>{label}</p>
              <p style={{ fontSize: 11, color: T.textMid }}>{cap.nombre}</p>
            </div>
            <p style={{ fontSize: 15, fontWeight: 900, color: cap.color }}>
              S/ {precio}{calcType !== "fixed" ? `/${UNIT_FOR[calcType]}` : ""}
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: 14, borderRadius: 13, border: `1.5px solid ${T.slateD}`, background: T.white, cursor: "pointer", fontSize: 15, fontWeight: 700, color: T.textMid }}>Cancelar</button>
          <button type="button" onClick={save} disabled={!label.trim() || !precio} style={{ flex: 2, padding: 14, borderRadius: 13, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${cap.color},${T.blueL})`, color: T.white, fontSize: 15, fontWeight: 800, opacity: !label.trim() || !precio ? 0.5 : 1 }}>
            + Añadir partida
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CategoriasManager ────────────────────────────────────────────────────────
export function CategoriasManager() {
  const { catalogo, recargar } = useCatalogo();
  const { editarNombreCategoria, crearPartidaPropia, crearCategoria } = useCategorias();
  const mostrarToast = useAppStore((s) => s.mostrarToast);

  const [expandido, setExpandido]   = useState<string | null>(null);
  const [añadiendo, setAñadiendo]   = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [addingSvc, setAddingSvc]   = useState<string | null>(null); // catId when adding service
  const [editingNombre, setEditingNombre] = useState<string | null>(null); // catId when editing name

  const coloresUsados = catalogo.map((c) => c.color);

  const addCatData = addingSvc ? catalogo.find((c) => c.id === addingSvc) ?? null : null;

  const guardarNuevaCategoria = async () => {
    if (nuevoNombre.trim().length < 2) { mostrarToast("Escribe un nombre válido", "error"); return; }
    const ok = await crearCategoria(nuevoNombre, coloresUsados);
    if (ok) {
      mostrarToast("Categoría creada ✓"); setNuevoNombre(""); setAñadiendo(false); recargar();
    } else {
      mostrarToast("No se pudo crear la categoría", "error");
    }
  };

  return (
    <>
      {/* Add-service modal */}
      {addCatData && (
        <NuevoSvcModal
          cap={addCatData}
          onClose={() => setAddingSvc(null)}
          onSave={async (label, calcType, precio) => {
            // Partida nueva → INSERT real en partidas_propias (antes solo se
            // intentaba un UPDATE sobre un id que no existía — nunca persistía).
            const unidad = calcType === "m2" ? "m²" : calcType === "hour" ? "h" : calcType === "unit" ? "und" : "";
            const ok = await crearPartidaPropia(addCatData!.id, label, calcType, precio, unidad);
            mostrarToast(ok ? `"${label}" añadida ✓` : "No se pudo guardar", ok ? "ok" : "error");
            setAddingSvc(null);
            if (ok) recargar();
          }}
        />
      )}

      {catalogo.map((cap) => {
        const isOpen = expandido === cap.id;
        return (
          <div
            key={cap.id}
            style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.slateD}`, marginBottom: 10, overflow: "hidden" }}
          >
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 16px", borderBottom: isOpen ? `1px solid ${T.slateD}` : "none" }}>
              <span style={{ fontSize: 22 }}>{cap.emoji}</span>
              {editingNombre === cap.id ? (
                <NombreEditor
                  cap={cap}
                  onSave={async (nombre) => {
                    const ok = await editarNombreCategoria(cap, nombre);
                    mostrarToast(ok ? "Nombre actualizado ✓" : "No se pudo guardar", ok ? "ok" : "error");
                    setEditingNombre(null);
                    if (ok) recargar();
                  }}
                  onCancel={() => setEditingNombre(null)}
                />
              ) : (
                <>
                  <p style={{ fontSize: 15, fontWeight: 800, color: T.text, flex: 1 }}>{cap.nombre}</p>
                  <span style={{ fontSize: 11, color: T.textMid, marginRight: 8 }}>{cap.partidas.length} partidas</span>
                  <button
                    type="button"
                    onClick={() => setExpandido(isOpen ? null : cap.id)}
                    style={{ width: 28, height: 28, borderRadius: 8, background: isOpen ? cap.color + "15" : T.slate, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                  >
                    <span style={{ display: "block", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>
                      <Ic d={chevPath} color={isOpen ? cap.color : T.textMid} size={16} />
                    </span>
                  </button>
                </>
              )}
            </div>

            {/* Expanded: services + add */}
            {isOpen && (
              <div style={{ padding: "8px 16px 12px" }}>
                {cap.partidas.map((p) => {
                  return (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.slate}`, gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 13, color: T.textMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nombre}</span>
                        {p.esPropia && (
                          <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, color: T.purple, background: T.purple + "18", whiteSpace: "nowrap" }}>Propia</span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: cap.color, fontWeight: 800 }}>
                          {p.calcType === "fixed" ? `S/ ${p.precio}` : `S/ ${p.precio}/${p.unidad}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setAddingSvc(cap.id)}
                  style={{ width: "100%", marginTop: 10, padding: 11, borderRadius: 11, border: `2px dashed ${cap.color}40`, background: cap.color + "08", cursor: "pointer", fontSize: 13, fontWeight: 800, color: cap.color, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
                >
                  <Ic d={plusPath} color={cap.color} size={15} />
                  Añadir partida a {cap.nombre}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add new category */}
      {añadiendo ? (
        <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.slateD}`, padding: "16px" }}>
          <input
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Nombre de la categoría"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && guardarNuevaCategoria()}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 11, fontSize: 15, fontWeight: 600, border: `2px solid ${T.blue}40`, outline: "none", color: T.text, marginBottom: 12, fontFamily: "inherit" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={guardarNuevaCategoria} style={{ flex: 2, padding: 12, borderRadius: 11, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${T.blue},${T.blueL})`, color: T.white, fontSize: 14, fontWeight: 800 }}>
              Guardar
            </button>
            <button type="button" onClick={() => { setAñadiendo(false); setNuevoNombre(""); }} style={{ flex: 1, padding: 12, borderRadius: 11, border: `1.5px solid ${T.slateD}`, background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: T.textMid }}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAñadiendo(true)}
          style={{ width: "100%", marginTop: 4, padding: 13, borderRadius: 14, border: `2px dashed ${T.blue}40`, background: T.blue + "08", cursor: "pointer", fontSize: 13, fontWeight: 800, color: T.blue, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
        >
          <Ic d={plusPath} color={T.blue} size={15} />
          + Añadir categoría
        </button>
      )}
    </>
  );
}

// ─── Inline nombre editor ─────────────────────────────────────────────────────
function NombreEditor({ cap, onSave, onCancel }: { cap: Capitulo; onSave: (nombre: string) => void; onCancel: () => void }) {
  const [nombre, setNombre] = useState(cap.nombre);
  return (
    <div style={{ display: "flex", gap: 8, flex: 1 }}>
      <input
        autoFocus
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSave(nombre); if (e.key === "Escape") onCancel(); }}
        style={{ flex: 1, padding: "6px 10px", borderRadius: 8, fontSize: 14, fontWeight: 700, border: `1.5px solid ${cap.color}`, outline: "none", color: T.text, fontFamily: "inherit" }}
      />
      <button type="button" onClick={() => onSave(nombre)} disabled={nombre.trim().length < 2} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: T.blue, color: T.white, fontSize: 12, fontWeight: 800, cursor: "pointer", opacity: nombre.trim().length < 2 ? 0.4 : 1 }}>OK</button>
      <button type="button" onClick={onCancel} style={{ padding: "6px 8px", borderRadius: 8, border: `1px solid ${T.slateD}`, background: "none", cursor: "pointer", fontSize: 12, color: T.textMid }}>✕</button>
    </div>
  );
}
