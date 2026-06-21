"use client";
// DARIVO PRO — Lista de facturas con acciones rápidas
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { useFactura } from "@/hooks/useFactura";
import { useAppStore } from "@/store/useAppStore";
import { fmtPEN } from "@/lib/utils";
import { INV_STATUS_COLORS, T } from "@/lib/theme";
import type { Factura } from "@/types";

const SIGUIENTE_ESTADO: Record<Factura["invStatus"], Factura["invStatus"] | null> = {
  "Pendiente": "Emitida",
  "Emitida": "Cobrada",
  "Cobrada": null,
};

export function FacturasList({ iniciales }: { iniciales: Factura[] }) {
  const [facturas, setFacturas] = useState(iniciales);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [telefono, setTelefono] = useState("");
  const { actualizarEstado, enviarWhatsApp, generarPDF } = useFactura();
  const mostrarToast = useAppStore((s) => s.mostrarToast);

  if (facturas.length === 0) {
    return (
      <EmptyState
        emoji="🧾"
        titulo="Sin facturas todavía"
        descripcion="Emite tu primera factura desde una cotización aprobada o desde cero."
      />
    );
  }

  const avanzar = async (f: Factura) => {
    const siguiente = SIGUIENTE_ESTADO[f.invStatus];
    if (!siguiente) return;
    const ok = await actualizarEstado(f.invId, siguiente);
    if (ok) {
      setFacturas((prev) => prev.map((x) => (x.invId === f.invId ? { ...x, invStatus: siguiente } : x)));
      mostrarToast(`Factura → ${siguiente}`);
    } else {
      mostrarToast("No se pudo actualizar", "error");
    }
  };

  const descargarPDF = async (invId: string) => {
    mostrarToast("Generando PDF…");
    const url = await generarPDF(invId);
    if (url) window.open(url, "_blank");
    else mostrarToast("No se pudo generar el PDF", "error");
  };

  const mandarWhatsApp = async (f: Factura) => {
    const numero = telefono.replace(/\D/g, "");
    if (numero.length < 9) {
      mostrarToast("Ingresa un número válido con código de país", "error");
      return;
    }
    mostrarToast("Preparando enlace de WhatsApp…");
    const pdfUrl = await generarPDF(f.invId);
    if (!pdfUrl) {
      mostrarToast("No se pudo generar el PDF", "error");
      return;
    }
    const waUrl = await enviarWhatsApp(f, numero, pdfUrl);
    window.open(waUrl, "_blank", "noopener,noreferrer");
    mostrarToast("Abriendo WhatsApp…", "ok");
  };

  return (
    <div className="flex flex-col gap-2.5">
      {facturas.map((f) => {
        const expandida = abierta === f.invId;
        return (
          <Card key={f.invId} onClick={() => { setAbierta(expandida ? null : f.invId); setTelefono(""); }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-black" style={{ color: T.blue }}>{f.invNum}</div>
                <div className="text-sm font-bold" style={{ color: T.text }}>{f.clientName}</div>
                <div className="text-xs" style={{ color: T.textMid }}>{f.invDate}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black" style={{ color: T.navy }}>{fmtPEN(f.totalFinal, f.sym)}</div>
                <div className="mt-1">
                  <Pill label={f.invStatus} color={INV_STATUS_COLORS[f.invStatus] ?? T.textMid} />
                </div>
              </div>
            </div>

            {expandida && (
              <div className="fi mt-3 flex flex-col gap-2.5 border-t pt-3" style={{ borderColor: T.slateD }} onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2">
                  {SIGUIENTE_ESTADO[f.invStatus] && (
                    <Button variant="success" className="flex-1 !px-2 !py-2.5 !text-xs" onClick={() => avanzar(f)}>
                      → {SIGUIENTE_ESTADO[f.invStatus]}
                    </Button>
                  )}
                  <Button variant="ghost" className="flex-1 !px-2 !py-2.5 !text-xs" onClick={() => descargarPDF(f.invId)}>
                    PDF
                  </Button>
                </div>
                <div className="flex gap-2">
                  <input
                    placeholder="WhatsApp: 51999999999"
                    inputMode="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="min-w-0 flex-1 rounded-xl px-3 py-2 text-xs font-medium outline-none"
                    style={{ background: T.slate, color: T.text }}
                  />
                  <Button variant="primary" className="!px-3 !py-2 !text-xs" onClick={() => mandarWhatsApp(f)}>
                    Enviar
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
