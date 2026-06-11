"use client";
// DARIVO PRO — Formulario de nueva factura
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useFactura } from "@/hooks/useFactura";
import { useAppStore } from "@/store/useAppStore";
import { facturaSchema } from "@/lib/validations";
import { calcIGV, fmtPEN, hoy } from "@/lib/utils";
import { T } from "@/lib/theme";
import type { EmpresaData, LineaFactura, Presupuesto } from "@/types";

interface NuevaFacturaFormProps {
  empresa: EmpresaData | null;
  numeroSugerido: string;
  aprobados: Presupuesto[];
}

const LINEA_VACIA: LineaFactura = { desc: "", cantidad: 1, pu: 0, subtotal: 0 };

export function NuevaFacturaForm({ empresa, numeroSugerido, aprobados }: NuevaFacturaFormProps) {
  const router = useRouter();
  const { crear, loading } = useFactura();
  const mostrarToast = useAppStore((s) => s.mostrarToast);

  const [clientName, setClientName] = useState("");
  const [clientRuc, setClientRuc] = useState("");
  const [clientDir, setClientDir] = useState("");
  const [items, setItems] = useState<LineaFactura[]>([{ ...LINEA_VACIA }]);
  const [desdeQuote, setDesdeQuote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const sym = empresa?.simbolo ?? "S/";
  const subtotalBase = useMemo(() => items.reduce((s, it) => s + it.subtotal, 0), [items]);
  const { igv, total } = calcIGV(subtotalBase);

  const importarPresupuesto = (id: string) => {
    setDesdeQuote(id);
    const p = aprobados.find((x) => x.id === id);
    if (!p) return;
    setClientName(p.clientName);
    const lineas: LineaFactura[] = p.items.map((it) => ({
      desc: it.svcLabel,
      cantidad: it.qty,
      pu: it.unitPrice,
      subtotal: it.subtotal,
    }));
    if (p.totalLabor > 0) {
      lineas.push({ desc: `Mano de obra (${p.margin}%)`, cantidad: 1, pu: p.totalLabor, subtotal: p.totalLabor });
    }
    setItems(lineas);
  };

  const cambiarLinea = (i: number, campo: keyof LineaFactura, valor: string) => {
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== i) return it;
        const nueva = { ...it, [campo]: campo === "desc" ? valor : Number(valor) };
        nueva.subtotal = Math.round(nueva.cantidad * nueva.pu * 100) / 100;
        return nueva;
      })
    );
  };

  const emitir = async () => {
    setError(null);
    if (!empresa || !/^\d{11}$/.test(empresa.ruc)) {
      setError("Completa los datos de tu empresa (RUC) en Ajustes antes de facturar");
      return;
    }
    const valido = facturaSchema.safeParse({ clientName, clientRuc, clientDir, items });
    if (!valido.success) {
      setError(valido.error.errors[0]?.message ?? "Revisa los datos");
      return;
    }
    const creada = await crear({
      invNum: numeroSugerido,
      invDate: hoy(),
      invStatus: "Emitida",
      clientName: clientName.trim(),
      clientRuc: clientRuc.trim() || undefined,
      clientDir: clientDir.trim() || undefined,
      moneda: empresa.moneda,
      sym,
      items,
      subtotalBase,
      igvAmount: igv,
      totalFinal: total,
      fromQuoteId: desdeQuote || undefined,
      bizData: empresa,
    });
    if (creada) {
      mostrarToast(`Factura ${numeroSugerido} emitida ✓`);
      router.push("/facturas");
      router.refresh();
    } else {
      mostrarToast("No se pudo emitir la factura", "error");
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: T.navy }}>
        <span className="text-xs font-bold" style={{ color: T.slateDD }}>Número</span>
        <span className="text-sm font-black" style={{ color: T.white }}>{numeroSugerido}</span>
      </div>

      {aprobados.length > 0 && (
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
            Desde presupuesto aprobado (opcional)
          </span>
          <select
            value={desdeQuote}
            onChange={(e) => importarPresupuesto(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none"
            style={{ background: T.white, color: T.text, border: `1.5px solid ${T.slateD}` }}
          >
            <option value="">— Crear desde cero —</option>
            {aprobados.map((p) => (
              <option key={p.id} value={p.id}>
                {p.clientName} · {fmtPEN(p.totalFinal)}
              </option>
            ))}
          </select>
        </label>
      )}

      <Input label="Cliente *" placeholder="Razón social o nombre" value={clientName} onChange={(e) => setClientName(e.target.value)} />
      <Input label="RUC / DNI" placeholder="11 u 8 dígitos" inputMode="numeric" value={clientRuc} onChange={(e) => setClientRuc(e.target.value)} />
      <Input label="Dirección" placeholder="Dirección fiscal" value={clientDir} onChange={(e) => setClientDir(e.target.value)} />

      <div>
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
          Detalle
        </span>
        <div className="flex flex-col gap-2">
          {items.map((it, i) => (
            <div key={i} className="su rounded-2xl p-3 shadow-sm" style={{ background: T.white }}>
              <input
                placeholder="Descripción del servicio"
                value={it.desc}
                onChange={(e) => cambiarLinea(i, "desc", e.target.value)}
                className="w-full rounded-lg px-2.5 py-2 text-sm font-medium outline-none"
                style={{ background: T.slate, color: T.text }}
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="Cant."
                  value={it.cantidad || ""}
                  onChange={(e) => cambiarLinea(i, "cantidad", e.target.value)}
                  className="w-16 rounded-lg px-2 py-2 text-center text-sm font-bold outline-none"
                  style={{ background: T.slate, color: T.text }}
                />
                <input
                  type="number"
                  min={0}
                  placeholder="P. unit."
                  value={it.pu || ""}
                  onChange={(e) => cambiarLinea(i, "pu", e.target.value)}
                  className="w-24 rounded-lg px-2 py-2 text-center text-sm font-bold outline-none"
                  style={{ background: T.slate, color: T.text }}
                />
                <span className="ml-auto text-sm font-black" style={{ color: T.navy }}>{fmtPEN(it.subtotal, sym)}</span>
                {items.length > 1 && (
                  <button
                    onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-black"
                    style={{ background: T.redPale, color: T.red }}
                    aria-label="Eliminar línea"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setItems((prev) => [...prev, { ...LINEA_VACIA }])}
          className="mt-2 w-full rounded-xl border-2 border-dashed py-2.5 text-xs font-bold"
          style={{ borderColor: T.slateDD, color: T.textMid }}
        >
          + Agregar línea
        </button>
      </div>

      <div className="rounded-2xl p-4 shadow-sm" style={{ background: T.white }}>
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span style={{ color: T.textMid }}>Op. Gravada</span>
            <span className="font-bold" style={{ color: T.text }}>{fmtPEN(subtotalBase, sym)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: T.textMid }}>IGV (18%)</span>
            <span className="font-bold" style={{ color: T.text }}>{fmtPEN(igv, sym)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-black" style={{ borderColor: T.slateD, color: T.navy }}>
            <span>TOTAL</span>
            <span>{fmtPEN(total, sym)}</span>
          </div>
        </div>
      </div>

      {error && <p className="pi text-center text-sm font-semibold" style={{ color: T.red }}>{error}</p>}

      <Button full variant="success" disabled={loading} onClick={emitir}>
        {loading ? "Emitiendo…" : `Emitir factura · ${fmtPEN(total, sym)}`}
      </Button>
    </div>
  );
}
