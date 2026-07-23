"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import type { AdminActividadDia } from "@/lib/admin-queries";

/** "Actividad de la plataforma" — 00-PANEL-ADMIN-DASHBOARD.md §5/§6. */
export function AdminActividadChart({ data }: { data: AdminActividadDia[] }) {
  const soloAlgunosTicks = data.length > 14;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={ADMIN_COLORS.slateD} vertical={false} />
        <XAxis
          dataKey="fecha"
          tick={{ fontSize: 11, fill: ADMIN_COLORS.textMid }}
          interval={soloAlgunosTicks ? Math.ceil(data.length / 10) : 0}
          axisLine={{ stroke: ADMIN_COLORS.slateD }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: ADMIN_COLORS.textMid }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: `1px solid ${ADMIN_COLORS.slateD}`,
            fontSize: 12,
          }}
        />
        {/* Sin serie "Cotizaciones": Admin no lee la tabla `cotizaciones` (dato
            operativo de cliente), ni siquiera como conteo agregado. */}
        <Bar dataKey="registros" name="Registros" stackId="a" fill={ADMIN_COLORS.purple} radius={[0, 0, 0, 0]} />
        <Bar
          dataKey="facturas"
          name="Facturas"
          stackId="a"
          fill={ADMIN_COLORS.amber}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
