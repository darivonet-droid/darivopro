"use client";
// DARIVO PRO — Config tabs (diseño Fable 5 exacto)
import { useState } from "react";
import { T } from "@/lib/theme";
import { AjustesForm } from "./AjustesForm";
import { CategoriasManager } from "./CategoriasManager";
import { InformesTab } from "@/components/informes/InformesTab";
import { useCatalogo } from "@/hooks/useCatalogo";
import { useCategorias } from "@/hooks/useCategorias";
import { useAppStore } from "@/store/useAppStore";
import type { EmpresaForm } from "@/lib/validations";

type Tab = "caps" | "tarifas" | "empresa" | "informes";

interface ConfigTabsProps {
  email:    string;
  inicial:  EmpresaForm;
  tarifas:  { svc_id: string; precio: number }[];
}

export function ConfigTabs({ email, inicial }: ConfigTabsProps) {
  const [tab, setTab] = useState<Tab>("empresa");

  const TABS: { id: Tab; label: string }[] = [
    { id: "empresa",  label: "Empresa"    },
    { id: "caps",     label: "Capítulos"  },
    { id: "tarifas",  label: "Tarifas"    },
    { id: "informes", label: "📊"         },
  ];

  return (
    <div>
      {/* Tab pill selector — style from reference */}
      <div style={{ display: "flex", background: T.slateD, borderRadius: 14, padding: 4, marginBottom: 18 }}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            style={{
              flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
              background: tab === id ? T.white : "none",
              fontSize: 13, fontWeight: tab === id ? 800 : 600,
              color: tab === id ? T.text : T.textMid,
              boxShadow: tab === id ? "0 1px 5px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "empresa"  && <AjustesForm email={email} inicial={inicial} />}
      {tab === "caps"     && <CapitulosTab />}
      {tab === "tarifas"  && <TarifasEditTab />}
      {tab === "informes" && <InformesTab />}
    </div>
  );
}

// ─── SVG helper ───────────────────────────────────────────────────────────────
function Ic({ d, size = 16, color = "currentColor" }: { d: string | string[]; size?: number; color?: string }) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}
const editPath  = ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"];
const plusPath  = "M12 5v14 M5 12h14";
const chevPath  = "M9 18l6-6-6-6";

// ─── Tab: Capítulos (accordion style from reference) ─────────────────────────
function CapitulosTab() {
  return (
    <div className="fi">
      <p style={{ fontSize: 13, color: T.textMid, marginBottom: 14 }}>Activa capítulos y gestiona sus partidas</p>
      <CategoriasManager />
    </div>
  );
}

// ─── Tab: Tarifas (per-category with edit modal — exact reference style) ──────
function TarifasEditTab() {
  const { catalogo } = useCatalogo();
  const { editarPrecioPartida } = useCategorias();
  const mostrarToast = useAppStore((s) => s.mostrarToast);

  type EditingItem = { svcId: string; catLabel: string; catColor: string; catEmoji: string; nombre: string; calcType: string; unidad: string; precio: number };
  const [editing, setEditing] = useState<EditingItem | null>(null);
  const [tempVal, setTempVal] = useState("");

  const savePrice = async () => {
    if (!editing || tempVal === "") return;
    const partida = catalogo.flatMap((c) => c.partidas).find((p) => p.id === editing.svcId);
    if (!partida) return;
    const ok = await editarPrecioPartida(partida, parseFloat(tempVal) || 0);
    mostrarToast(ok ? "Precio actualizado ✓" : "No se pudo guardar", ok ? "ok" : "error");
    setEditing(null);
    setTempVal("");
  };

  return (
    <>
      {/* Price edit modal — slides from bottom */}
      {editing && (
        <div className="fi" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 400, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div className="su" style={{ background: T.white, borderRadius: "22px 22px 0 0", padding: "24px 20px 44px", width: "100%", maxWidth: 390 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 26 }}>{editing.catEmoji}</span>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5 }}>{editing.catLabel}</p>
                <p style={{ fontSize: 17, fontWeight: 900, color: T.text }}>{editing.nombre}</p>
              </div>
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Precio {editing.calcType === "fixed" ? "cerrado" : `por ${editing.unidad}`}
            </p>
            <div style={{ position: "relative", marginBottom: 20 }}>
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                value={tempVal}
                onChange={(e) => setTempVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && savePrice()}
                style={{ width: "100%", padding: "16px 52px 16px 18px", borderRadius: 14, fontSize: 32, fontWeight: 900, border: `2.5px solid ${editing.catColor}`, outline: "none", color: T.text, fontFamily: "inherit" }}
              />
              <span style={{ position: "absolute", right: 17, top: "50%", transform: "translateY(-50%)", fontSize: 20, fontWeight: 800, color: T.textMid }}>S/</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => { setEditing(null); setTempVal(""); }} style={{ flex: 1, padding: 14, borderRadius: 13, border: `1.5px solid ${T.slateD}`, background: T.white, cursor: "pointer", fontSize: 15, fontWeight: 700, color: T.textMid }}>Cancelar</button>
              <button type="button" onClick={savePrice} style={{ flex: 2, padding: 14, borderRadius: 13, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${T.blue},${T.blueL})`, color: T.white, fontSize: 15, fontWeight: 800 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      <div className="fi">
        <p style={{ fontSize: 13, color: T.textMid, marginBottom: 14 }}>Toca para editar · Enter para guardar</p>
        {catalogo.map((cap) => (
          <div key={cap.id} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 17 }}>{cap.emoji}</span>
                <p style={{ fontSize: 12, fontWeight: 800, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5 }}>{cap.nombre}</p>
              </div>
            </div>
            <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.slateD}`, overflow: "hidden" }}>
              {cap.partidas.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setEditing({ svcId: p.id, catLabel: cap.nombre, catColor: cap.color, catEmoji: cap.emoji, nombre: p.nombre, calcType: p.calcType, unidad: p.unidad, precio: p.precio }); setTempVal(String(p.precio)); }}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: i < cap.partidas.length - 1 ? `1px solid ${T.slateD}` : "none", background: "none", cursor: "pointer", textAlign: "left", gap: 8 }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nombre}</p>
                    <p style={{ fontSize: 11, color: T.textMid, marginTop: 1 }}>{p.calcType === "fixed" ? "Precio cerrado" : `Por ${p.unidad}`}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 17, fontWeight: 900, color: cap.color }}>S/ {p.precio}</span>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: T.slate, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Ic d={editPath} color={T.textMid} size={13} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
