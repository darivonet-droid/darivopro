"use client";
import { useState } from "react";
import { T } from "@/lib/theme";
import { TabPillSelector } from "@/components/design-system/TabPillSelector";
import { AjustesForm } from "@/components/ajustes/AjustesForm";
import { CategoriasManager } from "@/components/ajustes/CategoriasManager";
import { MasOpcionesList } from "@/components/mas/MasOpcionesList";
import { useCatalogo } from "@/hooks/useCatalogo";
import { useCategorias } from "@/hooks/useCategorias";
import { useAppStore } from "@/store/useAppStore";
import type { EmpresaForm } from "@/lib/validations";

/** Pestañas oficiales — 07-MODULO-MAS.md §2 */
type Tab = "categorias" | "tarifas" | "empresa";

interface MasTabsProps {
  email: string;
  inicial: EmpresaForm;
  esBusiness?: boolean;
  /** Empresa desktop (07-MODULO-MAS-EMPRESA.md §4) renderiza "Más opciones"
   * como panel fijo aparte, no apilado debajo del contenido — Móvil sigue
   * con el comportamiento por defecto (incluido acá). */
  ocultarOpciones?: boolean;
}

export function MasTabs({ email, inicial, esBusiness, ocultarOpciones }: MasTabsProps) {
  const [tab, setTab] = useState<Tab>("categorias");

  const TABS: { id: Tab; label: string }[] = [
    { id: "categorias", label: "Categorías" },
    { id: "tarifas", label: "Mis Tarifas" },
    { id: "empresa", label: "Empresa" },
  ];

  return (
    <div>
      <TabPillSelector tabs={TABS} active={tab} onChange={setTab} />
      <div className="mt-[18px]">
        {tab === "categorias" && (
          <div>
            <p className="mb-3.5 text-[13px]" style={{ color: T.textMid }}>
              Activa capítulos y añade tus propias partidas
            </p>
            <CategoriasManager />
          </div>
        )}
        {tab === "tarifas" && <TarifasEditTab />}
        {tab === "empresa" && <AjustesForm email={email} inicial={inicial} />}

        {!ocultarOpciones && <MasOpcionesList esBusiness={esBusiness} />}
      </div>
    </div>
  );
}

function TarifasEditTab() {
  const { catalogo } = useCatalogo();
  const { editarPrecioPartida } = useCategorias();
  const mostrarToast = useAppStore((s) => s.mostrarToast);

  type EditingItem = {
    svcId: string;
    catLabel: string;
    catColor: string;
    catEmoji: string;
    nombre: string;
    calcType: string;
    unidad: string;
    precio: number;
  };
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
      {editing && (
        <div
          className="fixed inset-0 z-[400] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.65)" }}
        >
          <div
            className="w-full max-w-[390px] rounded-t-[22px] px-5 pb-11 pt-6"
            style={{ background: T.white }}
          >
            <div className="mb-4 flex items-center gap-2.5">
              <span className="text-[26px]">{editing.catEmoji}</span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
                  {editing.catLabel}
                </p>
                <p className="text-[17px] font-black" style={{ color: T.text }}>
                  {editing.nombre}
                </p>
              </div>
            </div>
            <div className="relative mb-5">
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                value={tempVal}
                onChange={(e) => setTempVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && savePrice()}
                className="w-full rounded-[14px] border-[2.5px] py-4 pl-[18px] pr-[52px] text-[32px] font-black outline-none"
                style={{ borderColor: editing.catColor, color: T.text }}
              />
              <span
                className="absolute right-[17px] top-1/2 -translate-y-1/2 text-xl font-extrabold"
                style={{ color: T.textMid }}
              >
                S/
              </span>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setTempVal("");
                }}
                className="flex-1 rounded-[13px] border py-3.5 text-[15px] font-bold"
                style={{ borderColor: T.slateD, color: T.textMid }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={savePrice}
                className="flex-[2] rounded-[13px] py-3.5 text-[15px] font-extrabold text-white"
                style={{ background: `linear-gradient(135deg,${T.blue},${T.blueL})` }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mb-3.5 text-[13px]" style={{ color: T.textMid }}>
        Toca para editar · Enter para guardar
      </p>
      {catalogo.map((cap) => (
        <div key={cap.id} className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[17px]">{cap.emoji}</span>
            <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: T.textMid }}>
              {cap.nombre}
            </p>
          </div>
          <div
            className="overflow-hidden rounded-[14px] border"
            style={{ borderColor: T.slateD, background: T.white }}
          >
            {cap.partidas.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setEditing({
                    svcId: p.id,
                    catLabel: cap.nombre,
                    catColor: cap.color,
                    catEmoji: cap.emoji,
                    nombre: p.nombre,
                    calcType: p.calcType,
                    unidad: p.unidad,
                    precio: p.precio,
                  });
                  setTempVal(String(p.precio));
                }}
                className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
                style={{
                  borderBottom: i < cap.partidas.length - 1 ? `1px solid ${T.slateD}` : "none",
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold" style={{ color: T.text }}>
                    {p.nombre}
                  </p>
                  <p className="text-[11px]" style={{ color: T.textMid }}>
                    {p.calcType === "fixed" ? "Precio cerrado" : `Por ${p.unidad}`}
                  </p>
                </div>
                <span className="shrink-0 text-[17px] font-black" style={{ color: cap.color }}>
                  S/ {p.precio}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
