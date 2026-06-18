"use client";
import { useState } from "react";
import { T } from "@/lib/theme";
import type { Capitulo, LineaPresupuesto } from "@/types";

type CalcChip = "m2" | "unit" | "hour" | "fixed";

const CHIPS: { id: CalcChip; label: string }[] = [
  { id: "m2",    label: "m²"     },
  { id: "unit",  label: "unidad" },
  { id: "hour",  label: "horas"  },
  { id: "fixed", label: "fijo"   },
];

const UNIT_LABEL: Record<CalcChip, string> = {
  m2:    "€/M²",
  unit:  "€/UND",
  hour:  "€/H",
  fixed: "€",
};

interface NuevaPartidaModalProps {
  open: boolean;
  categoria: Capitulo;
  onClose: () => void;
  onAdd: (linea: LineaPresupuesto) => void;
}

export function NuevaPartidaModal({
  open,
  categoria,
  onClose,
  onAdd,
}: NuevaPartidaModalProps) {
  const [nombre, setNombre]       = useState("");
  const [calcType, setCalcType]   = useState<CalcChip>("m2");
  const [precio, setPrecio]       = useState("");
  const [focused, setFocused]     = useState<"nombre" | "precio" | null>(null);

  if (!open) return null;

  const precioNum = parseFloat(precio.replace(",", ".")) || 0;
  const unitMap: Record<CalcChip, string> = {
    m2: "m²", unit: "und", hour: "h", fixed: "fijo",
  };

  const añadir = () => {
    if (!nombre.trim() || precioNum <= 0) return;
    onAdd({
      svcId: `custom-${Date.now()}`,
      catLabel: categoria.nombre,
      svcLabel: nombre.trim(),
      calcType,
      basePrice: precioNum,
      unit: unitMap[calcType],
      qty: 1,
      unitPrice: precioNum,
      subtotal: precioNum,
    });
    setNombre("");
    setPrecio("");
    setCalcType("m2");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(10,22,40,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] rounded-t-3xl"
        style={{ background: "#F8FAFF" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header navy */}
        <header className="rounded-t-3xl px-5 pb-5 pt-6" style={{ background: T.navy }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoria.emoji}</span>
            <div>
              <h2 className="text-lg font-black" style={{ color: T.white }}>
                Nueva partida
              </h2>
              <p className="text-xs" style={{ color: T.textLight }}>
                Ej: Demolición de alicatado, Pintura plástica…
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-5 px-5 py-5">
          {/* Nombre */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold tracking-wide" style={{ color: T.textMid }}>
              NOMBRE DE LA PARTIDA
            </span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onFocus={() => setFocused("nombre")}
              onBlur={() => setFocused(null)}
              placeholder="Ej: Demolición de alicatado"
              className="w-full rounded-xl px-4 py-3.5 text-sm font-medium outline-none"
              style={{
                background: T.white,
                color: T.text,
                border: `2px solid ${focused === "nombre" ? T.amber : T.slateD}`,
              }}
            />
          </label>

          {/* Tipo cálculo */}
          <div>
            <span className="mb-2 block text-[11px] font-bold tracking-wide" style={{ color: T.textMid }}>
              TIPO DE CÁLCULO
            </span>
            <div className="grid grid-cols-4 gap-2">
              {CHIPS.map((c) => {
                const activo = calcType === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCalcType(c.id)}
                    className="rounded-xl py-2.5 text-xs font-bold transition-all active:scale-95"
                    style={{
                      background: activo ? "#FEF3C7" : T.white,
                      color: activo ? T.amberD : T.textMid,
                      border: `2px solid ${activo ? T.amber : T.slateD}`,
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Precio */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold tracking-wide" style={{ color: T.textMid }}>
              PRECIO {UNIT_LABEL[calcType]}
            </span>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={0.01}
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                onFocus={() => setFocused("precio")}
                onBlur={() => setFocused(null)}
                placeholder="0.00"
                className="w-full rounded-xl py-4 pl-4 pr-12 text-xl font-black outline-none"
                style={{
                  background: T.white,
                  color: T.text,
                  border: `2px solid ${focused === "precio" ? T.amber : T.slateD}`,
                }}
              />
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold"
                style={{ color: T.textMid }}
              >
                S/
              </span>
            </div>
          </label>

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl py-3.5 text-sm font-bold"
              style={{ background: T.slate, color: T.textMid }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={añadir}
              disabled={!nombre.trim() || precioNum <= 0}
              className="flex-[1.4] rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${T.amber} 0%, ${T.blue} 100%)`,
              }}
            >
              + Añadir partida
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
