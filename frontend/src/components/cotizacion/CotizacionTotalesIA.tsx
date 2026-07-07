"use client";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/theme";
import type { IACotizacionItem } from "@/lib/cotizacion-ia";

interface Props {
  items: IACotizacionItem[];
  subtotal: number;
  igv: number;
  total: number;
  onChangeItem: (index: number, field: keyof IACotizacionItem, value: string | number) => void;
}

export function CotizacionTotalesIA({
  items,
  subtotal,
  igv,
  total,
  onChangeItem,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-extrabold" style={{ color: T.text }}>
          Partidas (editables)
        </h3>
        <div className="flex flex-col gap-3">
          {items.map((it, i) => (
            <div
              key={i}
              className="rounded-xl p-3"
              style={{ background: "#F8FAFF", border: `1px solid ${T.slateD}` }}
            >
              <input
                value={it.descripcion}
                onChange={(e) => onChangeItem(i, "descripcion", e.target.value)}
                className="mb-2 w-full rounded-lg px-2 py-1.5 text-sm font-semibold outline-none"
                style={{ background: T.white, color: T.text, border: `1px solid ${T.slateD}` }}
              />
              <div className="grid grid-cols-3 gap-2">
                <label className="text-[10px] font-bold" style={{ color: T.textMid }}>
                  Cant.
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={it.cantidad}
                    onChange={(e) => onChangeItem(i, "cantidad", Number(e.target.value))}
                    className="mt-0.5 w-full rounded-lg px-2 py-1.5 text-sm outline-none"
                    style={{ background: T.white, border: `1px solid ${T.slateD}` }}
                  />
                </label>
                <label className="text-[10px] font-bold" style={{ color: T.textMid }}>
                  P. unit.
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={it.precio_unit}
                    onChange={(e) => onChangeItem(i, "precio_unit", Number(e.target.value))}
                    className="mt-0.5 w-full rounded-lg px-2 py-1.5 text-sm outline-none"
                    style={{ background: T.white, border: `1px solid ${T.slateD}` }}
                  />
                </label>
                <div className="flex flex-col justify-end">
                  <span className="text-[10px] font-bold" style={{ color: T.textMid }}>Total</span>
                  <span className="text-sm font-black" style={{ color: T.blue }}>
                    {fmtPEN(it.total)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex justify-between text-sm">
          <span style={{ color: T.textMid }}>Subtotal</span>
          <span className="font-bold" style={{ color: T.text }}>{fmtPEN(subtotal)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span style={{ color: T.textMid }}>IGV (18%)</span>
          <span className="font-bold" style={{ color: T.text }}>{fmtPEN(igv)}</span>
        </div>
        <div
          className="mt-3 flex justify-between border-t pt-3 text-lg font-black"
          style={{ borderColor: T.slateD, color: T.navy }}
        >
          <span>TOTAL</span>
          <span style={{ color: T.blue }}>{fmtPEN(total)}</span>
        </div>
      </div>
    </div>
  );
}
