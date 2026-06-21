"use client";
// DARIVO PRO — Informe Semanal
import { useEffect } from "react";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/theme";
import type { DatosSemana } from "@/hooks/useInformes";

interface Props {
  datos:   DatosSemana | null;
  cargando: boolean;
  onLoad:  () => void;
}

function delta(actual: number, prev: number) {
  if (prev === 0) return null;
  const pct = Math.round(((actual - prev) / prev) * 100);
  return pct;
}

function Flecha({ actual, prev }: { actual: number; prev: number }) {
  const pct = delta(actual, prev);
  if (pct === null) return null;
  const arriba = pct >= 0;
  return (
    <span
      className="ml-1 text-[11px] font-bold"
      style={{ color: arriba ? T.green : T.red }}
    >
      {arriba ? "↑" : "↓"} {Math.abs(pct)}%
    </span>
  );
}

function StatCard({
  label, valor, actual, prev,
}: { label: string; valor: string; actual: number; prev: number }) {
  return (
    <div
      className="flex flex-col gap-1 rounded-2xl px-4 py-4"
      style={{ background: T.white, boxShadow: "0 2px 12px rgba(10,22,40,0.07)" }}
    >
      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
        {label}
      </span>
      <div className="flex items-baseline">
        <span className="text-xl font-black" style={{ color: T.navy }}>{valor}</span>
        <Flecha actual={actual} prev={prev} />
      </div>
      {prev > 0 && (
        <span className="text-[10px]" style={{ color: T.textLight }}>
          Semana ant.: {fmtPEN(prev)}
        </span>
      )}
    </div>
  );
}

export function InformeSemanal({ datos, cargando, onLoad }: Props) {
  useEffect(() => { onLoad(); }, [onLoad]);

  if (cargando) {
    return (
      <div className="flex flex-col gap-3 animate-pulse">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-20 rounded-2xl" style={{ background: T.slate }} />
        ))}
      </div>
    );
  }

  if (!datos) return null;

  const { cotizado, facturado, cobrado, pendiente, cotizadoPrev, facturadoPrev, cobradoPrev } = datos;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold" style={{ color: T.textLight }}>
        Esta semana — comparativa con la semana anterior
      </p>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total cotizado"   valor={fmtPEN(cotizado)}  actual={cotizado}  prev={cotizadoPrev} />
        <StatCard label="Total facturado"  valor={fmtPEN(facturado)} actual={facturado} prev={facturadoPrev} />
        <StatCard label="Total cobrado"    valor={fmtPEN(cobrado)}   actual={cobrado}   prev={cobradoPrev} />
        <div
          className="flex flex-col gap-1 rounded-2xl px-4 py-4"
          style={{ background: "#FFFBEB", boxShadow: "0 2px 12px rgba(10,22,40,0.07)" }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: T.amberD }}>
            Pendiente cobro
          </span>
          <span className="text-xl font-black" style={{ color: T.amberD }}>{fmtPEN(pendiente)}</span>
        </div>
      </div>
    </div>
  );
}
