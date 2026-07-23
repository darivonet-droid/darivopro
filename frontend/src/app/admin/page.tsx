import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminKpiCard, AdminKpiGrid, AdminServiceRoleNotice, AdminCard } from "@/components/admin/AdminUi";
import { AdminDashboardToolbar } from "@/components/admin/AdminDashboardToolbar";
import { AdminActividadChart } from "@/components/admin/AdminActividadChart";
import { AdminPlanesDonut } from "@/components/admin/AdminPlanesDonut";
import { IconUsers, IconCreditCard, IconCash, IconUserPlus, IconTicket } from "@/components/admin/AdminIcons";
import { fetchAdminDashboard } from "@/lib/admin-queries";
import { fmtPEN } from "@/lib/utils";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { createServerClient } from "@/lib/supabase/server";

const ACCIONES_RAPIDAS = [
  { label: "Nuevo usuario", href: "/admin/usuarios", icon: "👤" },
  { label: "Nueva suscripción", href: "/admin/suscripciones", icon: "💳" },
  { label: "Nuevo ticket", href: "/admin/soporte", icon: "🎧" },
  { label: "Ver métricas", href: "#actividad-plataforma", icon: "📈" },
  { label: "Catálogo maestro", href: "/admin/catalogo", icon: "📚" },
  { label: "Configuración", href: "/admin/configuracion", icon: "⚙️" },
  { label: "Ver Partners", href: "/admin/partners", icon: "🤝" },
] as const;

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { dias?: string };
}) {
  const dias = searchParams.dias === "7" || searchParams.dias === "90" ? Number(searchParams.dias) : 30;
  const [result, supabase] = [await fetchAdminDashboard(dias as 7 | 30 | 90), createServerClient()];
  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser();

  if ("error" in result) {
    return (
      <AdminShell titulo="Dashboard">
        <AdminServiceRoleNotice />
        <AdminKpiGrid>
          {["Usuarios activos", "Suscripciones activas", "Ingresos (mes)", "Nuevos registros", "Tickets abiertos"].map(
            (k) => (
              <AdminKpiCard key={k} label={k} value="—" hint="Requiere service role" />
            )
          )}
        </AdminKpiGrid>
      </AdminShell>
    );
  }

  const d = result.data;

  return (
    <AdminShell
      titulo="Dashboard"
      headerExtra={<AdminDashboardToolbar adminNombre={adminUser?.email ?? "Administrador"} />}
    >
      <AdminKpiGrid>
        <AdminKpiCard label="Usuarios activos" value={d.usuariosActivos} icon={<IconUsers size={16} />} />
        <AdminKpiCard
          label="Suscripciones activas"
          value={d.suscripcionesActivas}
          icon={<IconCreditCard size={16} />}
        />
        <AdminKpiCard label="Ingresos (mes)" value={fmtPEN(d.ingresosMes)} icon={<IconCash size={16} />} />
        <AdminKpiCard label="Nuevos registros" value={d.nuevosRegistros} icon={<IconUserPlus size={16} />} />
        <AdminKpiCard
          label="Tickets abiertos"
          value={d.ticketsAbiertos}
          icon={<IconTicket size={16} />}
        />
      </AdminKpiGrid>

      <div id="actividad-plataforma" className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AdminCard title="Actividad de la plataforma" className="lg:col-span-2">
          <AdminActividadChart data={d.actividad} />
        </AdminCard>

        <AdminCard title="Estado de soporte">
          <ul className="space-y-3 text-sm">
            {[
              { label: "Abiertos", value: d.ticketsAbiertos },
              { label: "En progreso", value: d.ticketsEnProgreso },
              { label: "Resueltos (30 días)", value: d.ticketsResueltos30d },
            ].map(({ label, value }) => (
              <li key={label} className="flex items-center justify-between">
                <span style={{ color: ADMIN_COLORS.textMid }}>{label}</span>
                <span className="font-bold" style={{ color: ADMIN_COLORS.text }}>
                  {value}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/admin/soporte"
            className="mt-3 inline-block text-xs font-bold"
            style={{ color: ADMIN_COLORS.purple }}
          >
            Ver todos los casos →
          </Link>
        </AdminCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AdminCard title="Distribución de suscripciones" className="lg:col-span-2">
          <AdminPlanesDonut distribucion={d.distribucion} />
        </AdminCard>

        <AdminCard title="Total usuarios registrados">
          <p className="text-4xl font-black" style={{ color: ADMIN_COLORS.purple }}>
            {d.totalUsuarios}
          </p>
        </AdminCard>
      </div>

      {/* Eliminado el bloque "Actividad reciente (cotizaciones)" (23/07/2026):
          exponía cliente/importe/estado de cotizaciones de cuentas de cliente
          dentro de Admin. Admin no consulta esa tabla — ver la nota de
          aislamiento en `fetchAdminDashboard()`. */}

      <AdminCard title="Acciones rápidas" className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ACCIONES_RAPIDAS.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="flex flex-col items-center gap-1.5 rounded-xl py-4 text-center text-xs font-bold transition-colors"
              style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
            >
              <span className="text-lg">{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </AdminCard>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 pb-2 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
        <span>Darivo Pro Admin</span>
        <span>Datos agregados en tiempo real — Supabase</span>
      </footer>
    </AdminShell>
  );
}
