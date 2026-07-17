"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { PaginacionLista } from "@/components/ui/PaginacionLista";
import { guardarListaCache, leerListaCache } from "@/lib/offline-cache";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/theme";
import type { Cliente, Cotizacion } from "@/types";

const FILTROS = ["Todas", "Emitidas", "Cobradas", "Pendientes"] as const;
type Filtro = (typeof FILTROS)[number];

export type ClienteConFacturas = Cliente & {
  facturas: { invId: string; invNum: string; invStatus: string; totalFinal: number; sym: string }[];
};

interface FacturasViewProps {
  clientes: ClienteConFacturas[];
  rucEmpresa: string;
  aprobados: Cotizacion[];
}

/** Un cliente "cumple" el filtro si alguna de sus facturas está en ese estado. */
function cumpleFiltro(c: ClienteConFacturas, filtro: Filtro): boolean {
  if (filtro === "Todas") return true;
  if (filtro === "Emitidas") return c.facturas.some((f) => f.invStatus === "Emitida" || f.invStatus === "Cobrada");
  if (filtro === "Cobradas") return c.facturas.some((f) => f.invStatus === "Cobrada");
  return c.facturas.some((f) => f.invStatus === "Emitida"); // Pendientes
}

export function FacturasView({ clientes: iniciales, rucEmpresa, aprobados }: FacturasViewProps) {
  const router = useRouter();
  const [clientes, setClientes] = useState(() => {
    if (iniciales.length > 0) return iniciales;
    return leerListaCache<ClienteConFacturas>("facturas-clientes") ?? iniciales;
  });
  const [filtro, setFiltro] = useState<Filtro>("Todas");

  useEffect(() => {
    if (iniciales.length > 0) {
      setClientes(iniciales);
      guardarListaCache("facturas-clientes", iniciales);
    }
  }, [iniciales]);

  const filtrados = useMemo(() => clientes.filter((c) => cumpleFiltro(c, filtro)), [clientes, filtro]);
  const { slice, hayMas, cargarMas, total, visible } = usePaginatedList(filtrados);

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

        {/* Chips filtro — por cliente que tenga al menos una factura en ese estado */}
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
        {/* Banner cotizaciones aprobados */}
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
                    onClick={() => router.push(`/facturas/nueva?cotizacion=${p.id}`)}
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

        {/* CTA Nueva factura — elegir tipo de comprobante primero */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/facturas/nueva?tipo=boleta"
            className="flex flex-col items-center gap-1 rounded-2xl py-4 text-center"
            style={{ background: T.green, boxShadow: "0 6px 24px rgba(16,185,129,0.35)" }}
          >
            <span className="text-2xl">👤</span>
            <p className="text-sm font-extrabold leading-tight" style={{ color: T.white }}>Boleta</p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.75)" }}>Sin RUC</p>
          </Link>
          <Link
            href="/facturas/nueva?tipo=factura"
            className="flex flex-col items-center gap-1 rounded-2xl py-4 text-center"
            style={{ background: T.blue, boxShadow: "0 6px 24px rgba(37,99,235,0.40)" }}
          >
            <span className="text-2xl">🏢</span>
            <p className="text-sm font-extrabold leading-tight" style={{ color: T.white }}>Factura</p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.75)" }}>Con RUC</p>
          </Link>
        </div>

        {/* Lista de clientes con factura */}
        {filtrados.length === 0 ? (
          <div className="rounded-2xl bg-white py-12 text-center shadow-sm">
            <p className="text-sm font-semibold" style={{ color: T.textMid }}>
              No hay clientes con facturas en este filtro
            </p>
          </div>
        ) : (
          slice.map((c) => {
            const totalFacturado = c.facturas.reduce((s, f) => s + f.totalFinal, 0);
            const cobradas = c.facturas.filter((f) => f.invStatus === "Cobrada").length;
            return (
              <div
                key={c.id}
                onClick={() => router.push(`/clientes/${c.id}`)}
                className="cursor-pointer rounded-2xl bg-white px-4 py-4 shadow-sm transition-transform active:scale-[0.98]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black"
                      style={{ background: T.bluePale, color: T.blue }}
                    >
                      {c.nombre.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: T.text }}>{c.nombre}</div>
                      <div className="text-xs" style={{ color: T.textMid }}>
                        {c.facturas.length} factura{c.facturas.length === 1 ? "" : "s"}
                        {" · "}{cobradas} cobrada{cobradas === 1 ? "" : "s"}
                        {" · "}{fmtPEN(totalFacturado)}
                      </div>
                    </div>
                  </div>
                  <span className="text-lg" style={{ color: T.textLight }}>›</span>
                </div>
              </div>
            );
          })
        )}
        <PaginacionLista visible={visible} total={total} hayMas={hayMas} onCargarMas={cargarMas} />
      </main>
    </div>
  );
}
