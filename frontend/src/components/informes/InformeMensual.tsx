"use client";
// DARIVO PRO — Informe Mensual
import { useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/theme";
import type { DatosMes } from "@/hooks/useInformes";

interface Props {
  datos:    DatosMes | null;
  cargando: boolean;
  onLoad:   () => void;
}

export function InformeMensual({ datos, cargando, onLoad }: Props) {
  useEffect(() => { onLoad(); }, [onLoad]);

  if (cargando) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-48 rounded-2xl" style={{ background: T.slate }} />
        {[1,2].map(i => <div key={i} className="h-20 rounded-2xl" style={{ background: T.slate }} />)}
      </div>
    );
  }

  if (!datos) return null;

  const { barras, totalMes, totalPrev, topClientes, igvAcum } = datos;

  const pct = totalPrev > 0
    ? Math.round(((totalMes - totalPrev) / totalPrev) * 100)
    : null;
  const arriba = pct !== null && pct >= 0;

  const mesActual = new Date().toLocaleString("es-PE", { month: "long" });
  const mesPrev   = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
    .toLocaleString("es-PE", { month: "long" });

  return (
    <div className="flex flex-col gap-4">

      {/* Header comparativa */}
      <div
        className="rounded-2xl px-4 py-4"
        style={{ background: T.white, boxShadow: "0 2px 12px rgba(10,22,40,0.07)" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
          Facturado en {mesActual}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-black" style={{ color: T.navy }}>{fmtPEN(totalMes)}</span>
          {pct !== null && (
            <span
              className="text-sm font-bold"
              style={{ color: arriba ? T.green : T.red }}
            >
              {arriba ? "+" : ""}{pct}% vs {mesPrev}
            </span>
          )}
        </div>
      </div>

      {/* Gráfico de barras */}
      <div
        className="rounded-2xl px-2 py-4"
        style={{ background: T.white, boxShadow: "0 2px 12px rgba(10,22,40,0.07)" }}
      >
        <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
          Facturado por semana
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={barras} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="semana" tick={{ fontSize: 10, fill: T.textMid }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: T.textMid }} axisLine={false} tickLine={false}
              tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
            <Tooltip
              formatter={(v) => [fmtPEN(Number(v)), "Facturado"]}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", background: T.navy, color: T.white }}
              labelStyle={{ color: T.textLight }}
              cursor={{ fill: T.bluePale }}
            />
            <Bar dataKey="monto" fill={T.blue} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* IGV acumulado */}
      <div
        className="flex items-center justify-between rounded-2xl px-4 py-4"
        style={{ background: T.white, boxShadow: "0 2px 12px rgba(10,22,40,0.07)" }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>IGV acumulado (18%)</p>
          <p className="mt-0.5 text-lg font-black" style={{ color: T.navy }}>{fmtPEN(igvAcum)}</p>
        </div>
        <span className="text-2xl">🧾</span>
      </div>

      {/* Top 3 clientes */}
      {topClientes.length > 0 && (
        <div
          className="rounded-2xl px-4 py-4"
          style={{ background: T.white, boxShadow: "0 2px 12px rgba(10,22,40,0.07)" }}
        >
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
            Top 3 clientes del mes
          </p>
          <div className="flex flex-col gap-2">
            {topClientes.map((c, i) => (
              <div key={c.nombre} className="flex items-center gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold"
                  style={{
                    background: i === 0 ? T.amber : i === 1 ? T.slateDD : T.slate,
                    color: i === 0 ? T.white : T.textMid,
                  }}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium truncate" style={{ color: T.text }}>{c.nombre}</span>
                <span className="text-sm font-black" style={{ color: T.blue }}>{fmtPEN(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
