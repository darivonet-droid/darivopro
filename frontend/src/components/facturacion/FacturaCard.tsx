"use client";
// DARIVO PRO — Tarjeta de factura (compartida entre lista de Facturas y ficha de Cliente)
// El estado se lee SIEMPRE de la factura recibida por props (fuente: facturas.inv_status).
// Al cambiarlo, se escribe en esa misma columna y se refresca → sin copias desincronizadas.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFactura } from "@/hooks/useFactura";
import { useAppStore } from "@/store/useAppStore";
import { compartirPDF } from "@/lib/share";
import { chipBg } from "@/lib/design-system/tokens";
import { fmtPEN } from "@/lib/utils";
import { INV_STATUS_COLORS, T } from "@/lib/theme";
import type { Factura } from "@/types";

export function FacturaCard({ factura: f }: { factura: Factura }) {
  const router = useRouter();
  const { generarPDF, actualizarEstado } = useFactura();
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const [estado, setEstado] = useState<Factura["invStatus"]>(f.invStatus);
  useEffect(() => { setEstado(f.invStatus); }, [f.invStatus]);

  const compartir = async () => {
    mostrarToast("Preparando PDF…");
    const url = await generarPDF(f.invId);
    if (!url) { mostrarToast("No se pudo generar el PDF", "error"); return; }
    const r = await compartirPDF(url, `${f.invNum} — ${f.clientName}`);
    if (r.method === "clipboard") mostrarToast("Enlace copiado al portapapeles ✓");
    else if (r.method === "error") window.open(url, "_blank");
  };

  const cambiarEstado = async (nuevo: Factura["invStatus"]) => {
    const previo = estado;
    setEstado(nuevo);
    const ok = await actualizarEstado(f.invId, nuevo);
    if (ok) {
      mostrarToast(nuevo === "Cobrada" ? "Factura marcada como cobrada ✓" : "Estado actualizado");
      router.refresh();
    } else {
      setEstado(previo);
      mostrarToast("No se pudo cambiar el estado", "error");
    }
  };

  const colorEstado = INV_STATUS_COLORS[estado] ?? T.textMid;
  const puedeMarcarCobrada = estado === "Emitida";

  return (
    <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black" style={{ color: T.blue }}>{f.invNum}</p>
          <p className="text-sm font-bold" style={{ color: T.text }}>{f.clientName}</p>
          <p className="text-xs" style={{ color: T.textMid }}>{f.invDate}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-extrabold" style={{ color: T.blue }}>
            {fmtPEN(f.totalFinal, f.sym)}
          </p>
          <span
            className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold"
            style={{
              background: chipBg(colorEstado),
              color: colorEstado,
            }}
          >
            {estado}
          </span>
        </div>
      </div>

      <div className="mt-3 flex gap-2 border-t pt-3" style={{ borderColor: T.slateD }}>
        {puedeMarcarCobrada && (
          <button
            type="button"
            onClick={() => cambiarEstado("Cobrada")}
            className="flex-1 rounded-xl py-2.5 text-xs font-bold text-white"
            style={{ background: T.green }}
          >
            Marcar como cobrada
          </button>
        )}
        <button
          type="button"
          onClick={compartir}
          className="flex-1 rounded-xl py-2.5 text-xs font-bold"
          style={{ background: T.navy, color: T.white }}
        >
          📤 Compartir PDF
        </button>
      </div>

      <p className="mt-2 text-center text-[10px] leading-snug" style={{ color: T.textMid }}>
        Las facturas emitidas no se pueden eliminar. Si hay un error, contacta soporte para anular o corregir.
      </p>
    </div>
  );
}
