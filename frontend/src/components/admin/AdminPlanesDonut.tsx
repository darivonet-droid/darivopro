"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";

/** Donut "Distribución de suscripciones" — 00-PANEL-ADMIN-DASHBOARD.md §5/§6. */
export function AdminPlanesDonut({
  distribucion,
}: {
  distribucion: { basico: number; pro: number; business: number; gratis: number };
}) {
  const data = [
    { name: "Básico", value: distribucion.basico, color: ADMIN_COLORS.purple },
    { name: "Pro", value: distribucion.pro, color: ADMIN_COLORS.purpleDark },
    { name: "Business", value: distribucion.business, color: ADMIN_COLORS.amber },
    { name: "Gratis / sin plan", value: distribucion.gratis, color: ADMIN_COLORS.textLight },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <p className="py-10 text-center text-sm" style={{ color: ADMIN_COLORS.textMid }}>
        Sin usuarios registrados todavía
      </p>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="55%" height={160}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={42} outerRadius={64} paddingAngle={2}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${ADMIN_COLORS.slateD}`, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex-1 space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2" style={{ color: ADMIN_COLORS.textMid }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
              {d.name}
            </span>
            <span className="font-bold" style={{ color: ADMIN_COLORS.text }}>
              {d.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
