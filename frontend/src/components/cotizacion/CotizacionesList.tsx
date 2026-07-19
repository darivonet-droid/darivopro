"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { PaginacionLista } from "@/components/ui/PaginacionLista";
import { CotizacionCard } from "@/components/cotizacion/CotizacionCard";
import { useCotizacion } from "@/hooks/useCotizacion";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useAppStore } from "@/store/useAppStore";
import { guardarListaCache, leerListaCache } from "@/lib/offline-cache";
import { compartirPDF } from "@/lib/share";
import { T } from "@/lib/theme";
import type { Cotizacion } from "@/types";

const SIGUIENTE_ESTADO: Record<Cotizacion["status"], Cotizacion["status"] | null> = {
  Borrador: "Pendiente de firma",
  "Pendiente de firma": "Aprobado",
  Aprobado: null,
};

interface CotizacionesListProps {
  iniciales: Cotizacion[];
  /**
   * true → modo ficha de cliente: oculta Eliminar y el EmptyState con botón "Nueva cotización"
   * (el padre ya tiene su propio botón "+ Nueva cotización para este cliente").
   */
  soloHistorial?: boolean;
  /** Base del wizard de cotización (Editar/Re-cotizar/EmptyState). Empresa la
   * sustituye por "/empresa/cotizaciones/nuevo" (capa de presentación de escritorio,
   * 05-MODULO-COTIZACIONES-EMPRESA.md) — Móvil sigue usando la ruta por defecto. */
  nuevaCotizacionHref?: string;
  /** Base del editor de facturas ("Convertir a Factura", cotizaciones Aprobado).
   * Empresa la sustituye por "/empresa/facturas/nueva" (06-MODULO-FACTURAS-EMPRESA.md)
   * — Móvil sigue usando la ruta por defecto. */
  nuevaFacturaHref?: string;
}

export function CotizacionesList({ iniciales, soloHistorial = false, nuevaCotizacionHref = "/cotizaciones/nuevo", nuevaFacturaHref = "/facturas/nueva" }: CotizacionesListProps) {
  const router = useRouter();
  const [cotizaciones, setCotizaciones] = useState(() => {
    if (iniciales.length > 0) return iniciales;
    return leerListaCache<Cotizacion>("cotizaciones") ?? iniciales;
  });
  const [abierto, setAbierto] = useState<string | null>(null);
  const { slice, hayMas, cargarMas, total, visible } = usePaginatedList(cotizaciones);
  const { actualizarEstado, eliminar, generarPDF } = useCotizacion();
  const mostrarToast = useAppStore((s) => s.mostrarToast);

  useEffect(() => {
    if (iniciales.length > 0) {
      setCotizaciones(iniciales);
      guardarListaCache("cotizaciones", iniciales);
    }
  }, [iniciales]);

  if (cotizaciones.length === 0) {
    if (soloHistorial) {
      return (
        <div className="rounded-2xl bg-white py-6 text-center shadow-sm">
          <p className="text-sm font-semibold" style={{ color: T.textMid }}>Sin cotizaciones todavía</p>
        </div>
      );
    }
    return (
      <EmptyState
        emoji="📋"
        titulo="Sin cotizaciones todavía"
        descripcion="Crea tu primera cotización en menos de 60 segundos."
      >
        <Link href={nuevaCotizacionHref}>
          <Button>Nueva cotización</Button>
        </Link>
      </EmptyState>
    );
  }

  const avanzarEstado = async (p: Cotizacion) => {
    const siguiente = SIGUIENTE_ESTADO[p.status];
    if (!siguiente) return;
    const ok = await actualizarEstado(p.id, siguiente);
    if (ok) {
      setCotizaciones((prev) =>
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
      setCotizaciones((prev) => prev.filter((x) => x.id !== id));
      mostrarToast("Cotización eliminada");
    } else {
      mostrarToast("No se pudo eliminar", "error");
    }
  };

  // Convertir a Factura (05-MODULO-COTIZACIONES.md — flujo con revisión
  // obligatoria, 19/07/2026): nunca emite directo — siempre abre el
  // formulario de Nueva factura pre-llenado con los datos de esta cotización
  // (cliente, ítems, cantidades, precios), donde el usuario revisa/edita todo
  // libremente y solo al guardar ahí se emite la factura real. La cotización
  // original nunca se modifica (el formulario solo lee de ella, no escribe).
  const convertirAFactura = (p: Cotizacion) => {
    router.push(`${nuevaFacturaHref}?cotizacion=${p.id}`);
  };

  const compartir = async (p: Cotizacion) => {
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
          <CotizacionCard
            key={p.id}
            cotizacion={p}
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
                      href={`${nuevaCotizacionHref}?editar=${p.id}`}
                      className="flex flex-1 items-center justify-center rounded-xl px-2 py-2.5 text-xs font-bold"
                      style={{ background: T.amberPale, color: T.amberD }}
                    >
                      ✏️ Editar
                    </Link>
                    <Link
                      href={`${nuevaCotizacionHref}?from=${p.id}`}
                      className="flex flex-1 items-center justify-center rounded-xl px-2 py-2.5 text-xs font-bold"
                      style={{ background: T.bluePale, color: T.blue }}
                    >
                      Re-cotizar
                    </Link>
                    {p.status === "Aprobado" && (
                      <button
                        className="flex flex-1 items-center justify-center rounded-xl px-2 py-2.5 text-xs font-bold"
                        style={{ background: "#F0FDF4", color: "#15803D" }}
                        onClick={() => convertirAFactura(p)}
                      >
                        Convertir a Factura
                      </button>
                    )}
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
                    {!soloHistorial && (
                      <Button
                        variant="danger"
                        className="!px-3 !py-2.5 !text-xs"
                        onClick={() => borrar(p.id)}
                      >
                        Eliminar
                      </Button>
                    )}
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
