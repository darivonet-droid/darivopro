"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { PaginacionLista } from "@/components/ui/PaginacionLista";
import { PresupuestoCard } from "@/components/presupuesto/PresupuestoCard";
import { usePresupuesto } from "@/hooks/usePresupuesto";
import { useFactura } from "@/hooks/useFactura";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useAppStore } from "@/store/useAppStore";
import { guardarListaCache, leerListaCache } from "@/lib/offline-cache";
import { compartirPDF } from "@/lib/share";
import { T } from "@/lib/theme";
import type { Presupuesto } from "@/types";

const SIGUIENTE_ESTADO: Record<Presupuesto["status"], Presupuesto["status"] | null> = {
  Borrador: "Pendiente de firma",
  "Pendiente de firma": "Aprobado",
  Aprobado: null,
};

interface PresupuestosListProps {
  iniciales: Presupuesto[];
  /**
   * "directo"   → convierte la cotización en boleta al instante (comportamiento por defecto).
   * "preguntar" → abre el formulario de factura para elegir Empresa (RUC) o Particular (DNI).
   */
  facturarMode?: "directo" | "preguntar";
}

export function PresupuestosList({ iniciales, facturarMode = "directo" }: PresupuestosListProps) {
  const router = useRouter();
  const [presupuestos, setPresupuestos] = useState(() => {
    if (iniciales.length > 0) return iniciales;
    return leerListaCache<Presupuesto>("presupuestos") ?? iniciales;
  });
  const [abierto, setAbierto] = useState<string | null>(null);
  const { slice, hayMas, cargarMas, total, visible } = usePaginatedList(presupuestos);
  const { actualizarEstado, eliminar, generarPDF } = usePresupuesto();
  const { convertirDesdePresupuesto } = useFactura();
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const mostrarUpgrade = useAppStore((s) => s.mostrarUpgrade);

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
        titulo="Sin cotizaciones todavía"
        descripcion="Crea tu primera cotización en menos de 60 segundos."
      >
        <Link href="/presupuestos/nuevo">
          <Button>Nueva cotización</Button>
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
      mostrarToast(`Cotización → ${siguiente}`);
    } else {
      mostrarToast("No se pudo actualizar el estado", "error");
    }
  };

  const borrar = async (id: string) => {
    const ok = await eliminar(id);
    if (ok) {
      setPresupuestos((prev) => prev.filter((x) => x.id !== id));
      mostrarToast("Cotización eliminada");
    } else {
      mostrarToast("No se pudo eliminar", "error");
    }
  };

  const hacerFactura = async (p: Presupuesto) => {
    // Modo "preguntar": el usuario elige Empresa (RUC) o Particular (DNI) en el formulario
    if (facturarMode === "preguntar") {
      router.push(`/facturas/nueva?presupuesto=${p.id}`);
      return;
    }
    mostrarToast("Creando factura…");
    const factura = await convertirDesdePresupuesto(p, mostrarUpgrade);
    if (factura) {
      mostrarToast(`${factura.invNum} creada ✓`);
    } else {
      mostrarToast("No se pudo crear la factura", "error");
    }
  };

  const compartir = async (p: Presupuesto) => {
    mostrarToast("Preparando PDF…");
    const url = p.pdfUrl || (await generarPDF(p.id));
    if (!url) { mostrarToast("No se pudo generar el PDF", "error"); return; }
    const titulo = `Cotización ${p.cotNum ?? ""} — ${p.clientName}`;
    const r = await compartirPDF(url, titulo);
    if (r.method === "clipboard") mostrarToast("Enlace copiado al portapapeles ✓");
    else if (r.method === "error") window.open(url, "_blank");
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
                  className="mt-3 flex flex-col gap-2 border-t pt-3"
                  style={{ borderColor: T.slateD }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Fila 1: Editar · Re-cotizar · → Factura */}
                  <div className="flex w-full gap-2">
                    <Link
                      href={`/presupuestos/nuevo?editar=${p.id}`}
                      className="flex flex-1 items-center justify-center rounded-xl px-2 py-2.5 text-xs font-bold"
                      style={{ background: T.amberPale, color: T.amberD }}
                    >
                      ✏️ Editar
                    </Link>
                    <Link
                      href={`/presupuestos/nuevo?from=${p.id}`}
                      className="flex flex-1 items-center justify-center rounded-xl px-2 py-2.5 text-xs font-bold"
                      style={{ background: T.bluePale, color: T.blue }}
                    >
                      Re-cotizar
                    </Link>
                    <button
                      className="flex flex-1 items-center justify-center rounded-xl px-2 py-2.5 text-xs font-bold"
                      style={{ background: "#F0FDF4", color: "#15803D" }}
                      onClick={() => hacerFactura(p)}
                    >
                      → Factura
                    </button>
                  </div>
                  {/* Fila 2: → Estado · Compartir · Eliminar */}
                  <div className="flex w-full gap-2">
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
                      onClick={() => compartir(p)}
                    >
                      📤 Compartir
                    </Button>
                    <Button
                      variant="danger"
                      className="!px-3 !py-2.5 !text-xs"
                      onClick={() => borrar(p.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
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
