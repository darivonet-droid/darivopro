"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { PaginacionLista } from "@/components/ui/PaginacionLista";
import { PresupuestoCard } from "@/components/presupuesto/PresupuestoCard";
import { usePresupuesto } from "@/hooks/usePresupuesto";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useAppStore } from "@/store/useAppStore";
import { guardarListaCache, leerListaCache } from "@/lib/offline-cache";
import { T } from "@/lib/theme";
import type { Presupuesto } from "@/types";

const SIGUIENTE_ESTADO: Record<Presupuesto["status"], Presupuesto["status"] | null> = {
  Borrador: "Pendiente de firma",
  "Pendiente de firma": "Aprobado",
  Aprobado: null,
};

export function PresupuestosList({ iniciales }: { iniciales: Presupuesto[] }) {
  const [presupuestos, setPresupuestos] = useState(() => {
    if (iniciales.length > 0) return iniciales;
    return leerListaCache<Presupuesto>("presupuestos") ?? iniciales;
  });
  const [abierto, setAbierto] = useState<string | null>(null);
  const { slice, hayMas, cargarMas, total, visible } = usePaginatedList(presupuestos);
  const { actualizarEstado, eliminar, generarPDF } = usePresupuesto();
  const mostrarToast = useAppStore((s) => s.mostrarToast);

  useEffect(() => {
    if (iniciales.length > 0) {
      setPresupuestos(iniciales);
      guardarListaCache("presupuestos", iniciales);
    }
  }, [iniciales]);

  if (presupuestos.length === 0) {
    return (
      <EmptyState
        emoji="📋"
        titulo="Sin presupuestos todavía"
        descripcion="Crea tu primer presupuesto en menos de 60 segundos."
      >
        <Link href="/presupuestos/nuevo">
          <Button>Nuevo presupuesto</Button>
        </Link>
      </EmptyState>
    );
  }

  const avanzarEstado = async (p: Presupuesto) => {
    const siguiente = SIGUIENTE_ESTADO[p.status];
    if (!siguiente) return;
    const ok = await actualizarEstado(p.id, siguiente);
    if (ok) {
      setPresupuestos((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, status: siguiente } : x))
      );
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
      {slice.map((p) => {
        const expandido = abierto === p.id;
        return (
          <PresupuestoCard
            key={p.id}
            presupuesto={p}
            onClick={() => setAbierto(expandido ? null : p.id)}
            footer={
              expandido ? (
                <div
                  className="fi mt-3 flex gap-2 border-t pt-3"
                  style={{ borderColor: T.slateD }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {SIGUIENTE_ESTADO[p.status] && (
                    <Button
                      variant="success"
                      className="flex-1 !px-2 !py-2.5 !text-xs"
                      onClick={() => avanzarEstado(p)}
                    >
                      → {SIGUIENTE_ESTADO[p.status]}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="flex-1 !px-2 !py-2.5 !text-xs"
                    onClick={() => descargarPDF(p.id)}
                  >
                    PDF
                  </Button>
                  <Button
                    variant="danger"
                    className="!px-3 !py-2.5 !text-xs"
                    onClick={() => borrar(p.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              ) : undefined
            }
          />
        );
      })}
      <PaginacionLista visible={visible} total={total} hayMas={hayMas} onCargarMas={cargarMas} />
    </div>
  );
}
