"use client";
// DARIVO PRO — Lista de presupuestos con acciones rápidas
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { usePresupuesto } from "@/hooks/usePresupuesto";
import { useAppStore } from "@/store/useAppStore";
import { fmtPEN } from "@/lib/utils";
import { STATUS_COLORS, T } from "@/lib/theme";
import type { Presupuesto } from "@/types";

const SIGUIENTE_ESTADO: Record<Presupuesto["status"], Presupuesto["status"] | null> = {
  "Borrador": "Pendiente de firma",
  "Pendiente de firma": "Aprobado",
  "Aprobado": null,
};

export function PresupuestosList({ iniciales }: { iniciales: Presupuesto[] }) {
  const [presupuestos, setPresupuestos] = useState(iniciales);
  const [abierto, setAbierto] = useState<string | null>(null);
  const { actualizarEstado, eliminar, generarPDF } = usePresupuesto();
  const mostrarToast = useAppStore((s) => s.mostrarToast);

  if (presupuestos.length === 0) {
    return (
      <EmptyState
        emoji="📋"
        titulo="Sin presupuestos todavía"
        descripcion="Crea tu primer presupuesto en menos de 60 segundos."
      />
    );
  }

  const avanzarEstado = async (p: Presupuesto) => {
    const siguiente = SIGUIENTE_ESTADO[p.status];
    if (!siguiente) return;
    const ok = await actualizarEstado(p.id, siguiente);
    if (ok) {
      setPresupuestos((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: siguiente } : x)));
      mostrarToast(`Presupuesto → ${siguiente}`);
    } else {
      mostrarToast("No se pudo actualizar el estado", "error");
    }
  };

  const borrar = async (id: string) => {
    const ok = await eliminar(id);
    if (ok) {
      setPresupuestos((prev) => prev.filter((x) => x.id !== id));
      mostrarToast("Presupuesto eliminado");
    } else {
      mostrarToast("No se pudo eliminar", "error");
    }
  };

  const descargarPDF = async (id: string) => {
    mostrarToast("Generando PDF…");
    const url = await generarPDF(id);
    if (url) window.open(url, "_blank");
    else mostrarToast("No se pudo generar el PDF", "error");
  };

  return (
    <div className="flex flex-col gap-2.5">
      {presupuestos.map((p) => {
        const expandido = abierto === p.id;
        return (
          <Card key={p.id} onClick={() => setAbierto(expandido ? null : p.id)}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold" style={{ color: T.text }}>{p.clientName}</div>
                <div className="mt-0.5 text-xs" style={{ color: T.textMid }}>
                  {p.items.length} partida{p.items.length === 1 ? "" : "s"}
                  {p.city ? ` · ${p.city}` : ""}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black" style={{ color: T.navy }}>{fmtPEN(p.totalFinal)}</div>
                <div className="mt-1">
                  <Pill label={p.status} color={STATUS_COLORS[p.status] ?? T.textMid} />
                </div>
              </div>
            </div>

            {expandido && (
              <div className="fi mt-3 flex gap-2 border-t pt-3" style={{ borderColor: T.slateD }}>
                {SIGUIENTE_ESTADO[p.status] && (
                  <Button
                    variant="success"
                    className="flex-1 !px-2 !py-2.5 !text-xs"
                    onClick={(e) => { e.stopPropagation(); avanzarEstado(p); }}
                  >
                    → {SIGUIENTE_ESTADO[p.status]}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="flex-1 !px-2 !py-2.5 !text-xs"
                  onClick={(e) => { e.stopPropagation(); descargarPDF(p.id); }}
                >
                  PDF
                </Button>
                <Button
                  variant="danger"
                  className="!px-3 !py-2.5 !text-xs"
                  onClick={(e) => { e.stopPropagation(); borrar(p.id); }}
                >
                  Eliminar
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
