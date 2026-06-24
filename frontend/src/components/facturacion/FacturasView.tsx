"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { PaginacionLista } from "@/components/ui/PaginacionLista";
import { FacturaCard } from "@/components/facturacion/FacturaCard";
import { filtrarFacturas, type FiltroFactura } from "@/lib/factura-utils";
import { guardarListaCache, leerListaCache } from "@/lib/offline-cache";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/theme";
import type { Factura, Presupuesto } from "@/types";

const FILTROS: FiltroFactura[] = ["Todas", "Emitidas", "Cobradas", "Pendientes"];

interface FacturasViewProps {
  facturas: Factura[];
  rucEmpresa: string;
  aprobados: Presupuesto[];
}

export function FacturasView({ facturas: iniciales, rucEmpresa, aprobados }: FacturasViewProps) {
  const router = useRouter();
  const [facturas, setFacturas] = useState(() => {
    if (iniciales.length > 0) return iniciales;
    return leerListaCache<Factura>("facturas") ?? iniciales;
  });
  const [filtro, setFiltro] = useState<FiltroFactura>("Todas");

  useEffect(() => {
    if (iniciales.length > 0) {
      setFacturas(iniciales);
      guardarListaCache("facturas", iniciales);
    }
  }, [iniciales]);

  const filtradas = useMemo(() => filtrarFacturas(facturas, filtro), [facturas, filtro]);
  const { slice, hayMas, cargarMas, total, visible } = usePaginatedList(filtradas);

  return (
    <div className="min-h-screen pb-4" style={{ background: "#F8FAFF" }}>
      {/* Header navy */}
      <header className="px-5 pb-4 pt-6" style={{ background: T.navy }}>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-black" style={{ color: T.white }}>
            Facturación
          </h1>
          {rucEmpresa && (
            <span
              className="rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wide"
              style={{ background: T.greenPale, color: T.greenD, border: `1px solid ${T.green}44` }}
            >
              {rucEmpresa}
            </span>
          )}
        </div>

        {/* Chips filtro */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {FILTROS.map((f) => {
            const activo = filtro === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFiltro(f)}
                className="relative shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors"
                style={{
                  background: activo ? T.blue : T.navyLight,
                  color: activo ? T.white : T.textLight,
                }}
              >
                {f}
                {activo && (
                  <span
                    className="absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full"
                    style={{ background: T.blueL }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex flex-col gap-4 px-4 py-4">
        {/* Banner presupuestos aprobados */}
        {aprobados.length > 0 && (
          <div
            className="rounded-2xl p-4"
            style={{ background: "#FFFBEB", border: `1.5px solid ${T.amber}` }}
          >
            <p className="text-xs font-extrabold tracking-wide" style={{ color: T.amberD }}>
              ⚡ COTIZACIONES APROBADAS — CONVERTIR EN FACTURA
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {aprobados.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-3 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-bold" style={{ color: T.text }}>{p.clientName}</p>
                    <p className="text-xs" style={{ color: T.textMid }}>
                      {new Date(p.createdAt).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
                      {" · "}{fmtPEN(p.totalFinal)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/facturas/nueva?presupuesto=${p.id}`)}
                    className="shrink-0 rounded-xl px-3 py-2 text-xs font-bold text-white"
                    style={{ background: T.green }}
                  >
                    ↺ Facturar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Nueva factura */}
        <Link
          href="/facturas/nueva"
          className="flex items-center gap-4 rounded-2xl p-5"
          style={{
            background: T.blue,
            boxShadow: `0 6px 24px rgba(37,99,235,0.40)`,
          }}
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            📋
          </div>
          <div className="flex-1">
            <p className="text-base font-extrabold leading-tight" style={{ color: T.white }}>
              Nueva factura
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.70)" }}>
              Crear desde cero en 60 seg
            </p>
          </div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.7 }}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        {/* Lista */}
        {filtradas.length === 0 ? (
          <div className="rounded-2xl bg-white py-12 text-center shadow-sm">
            <p className="text-sm font-semibold" style={{ color: T.textMid }}>
              No hay facturas en este filtro
            </p>
          </div>
        ) : (
          slice.map((f) => <FacturaCard key={f.invId} factura={f} />)
        )}
        <PaginacionLista visible={visible} total={total} hayMas={hayMas} onCargarMas={cargarMas} />
      </main>
    </div>
  );
}
