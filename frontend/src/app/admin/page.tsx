import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminKpiCard, AdminKpiGrid, AdminServiceRoleNotice, AdminTable, AdminCard } from "@/components/admin/AdminUi";
import { AdminDashboardToolbar } from "@/components/admin/AdminDashboardToolbar";
import { AdminActividadChart } from "@/components/admin/AdminActividadChart";
import { AdminPlanesDonut } from "@/components/admin/AdminPlanesDonut";
import { IconUsers, IconCreditCard, IconCash, IconUserPlus, IconTicket } from "@/components/admin/AdminIcons";
import { CodeNotice } from "@/components/common/CodeNotice";
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
          hint={d.ticketsAbiertosHint}
          icon={<IconTicket size={16} />}
        />
      </AdminKpiGrid>

      <div id="actividad-plataforma" className="mt-6 grid gap-4 lg:grid-cols-3">
        <AdminCard title="Actividad de la plataforma" className="lg:col-span-2">
          <AdminActividadChart data={d.actividad} />
        </AdminCard>

        <AdminCard title="Estado de soporte">
          <ul className="space-y-3 text-sm">
            {["Abiertos", "En proceso", "Resueltos (30 días)"].map((label) => (
              <li key={label} className="flex items-center justify-between">
                <span style={{ color: ADMIN_COLORS.textMid }}>{label}</span>
                <span className="font-bold" style={{ color: ADMIN_COLORS.text }}>
                  —
                </span>
              </li>
            ))}
          </ul>
          <CodeNotice code="INC-A01" className="mt-3" />
        </AdminCard>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <AdminCard title="Distribución de suscripciones" className="lg:col-span-2">
          <AdminPlanesDonut distribucion={d.distribucion} />
        </AdminCard>

        <AdminCard title="Total usuarios registrados">
          <p className="text-4xl font-black" style={{ color: ADMIN_COLORS.purple }}>
            {d.totalUsuarios}
          </p>
        </AdminCard>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-extrabold" style={{ color: ADMIN_COLORS.text }}>
          Actividad reciente (cotizaciones)
        </p>
        <AdminTable
          headers={["Cliente", "Importe", "Estado", "Fecha"]}
          vacio="Sin actividad reciente"
          rows={d.recientes.map((p) => [
            p.client_name,
            fmtPEN(Number(p.total_final ?? 0)),
            p.status,
            new Date(p.created_at).toLocaleDateString("es-PE"),
          ])}
        />
      </div>

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
