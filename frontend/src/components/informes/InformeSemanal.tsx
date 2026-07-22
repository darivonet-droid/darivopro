"use client";
// DARIVO PRO — Informe Semanal
import { useEffect } from "react";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/theme";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import type { DatosSemana } from "@/hooks/useInformes";

interface Props {
  datos:   DatosSemana | null;
  cargando: boolean;
  onLoad:  () => void;
  /** Empresa desktop (Cierre → Informes) pasa true para que el valor de cada
   * StatCard use ADMIN_COLORS en vez del navy de Fable 5 — Móvil sigue con
   * el navy por defecto (22/07/2026, corrección de la migración parcial de
   * Empresa a ADMIN_COLORS: hallazgo adicional de la tarea de InformesTab). */
  esEmpresa?: boolean;
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
  label, valor, actual, prev, esEmpresa,
}: { label: string; valor: string; actual: number; prev: number; esEmpresa?: boolean }) {
  return (
    <div
      className="flex flex-col gap-1 rounded-2xl px-4 py-4"
      style={{ background: T.white, boxShadow: "0 2px 12px rgba(10,22,40,0.07)" }}
    >
      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
        {label}
      </span>
      <div className="flex items-baseline">
        <span className="text-xl font-black" style={{ color: esEmpresa ? ADMIN_COLORS.text : T.navy }}>{valor}</span>
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

export function InformeSemanal({ datos, cargando, onLoad, esEmpresa }: Props) {
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
        <StatCard label="Total cotizado"   valor={fmtPEN(cotizado)}  actual={cotizado}  prev={cotizadoPrev} esEmpresa={esEmpresa} />
        <StatCard label="Total facturado"  valor={fmtPEN(facturado)} actual={facturado} prev={facturadoPrev} esEmpresa={esEmpresa} />
        <StatCard label="Total cobrado"    valor={fmtPEN(cobrado)}   actual={cobrado}   prev={cobradoPrev} esEmpresa={esEmpresa} />
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
