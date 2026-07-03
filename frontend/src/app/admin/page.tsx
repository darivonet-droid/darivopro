import { AdminShell } from "@/components/admin/AdminShell";
import { AdminKpiCard, AdminKpiGrid, AdminServiceRoleNotice, AdminTable } from "@/components/admin/AdminUi";
import { fetchAdminDashboard } from "@/lib/admin-queries";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/theme";

export default async function AdminDashboardPage() {
  const result = await fetchAdminDashboard();

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
    <AdminShell titulo="Dashboard">
      <AdminKpiGrid>
        <AdminKpiCard label="Usuarios activos" value={d.usuariosActivos} />
        <AdminKpiCard label="Suscripciones activas" value={d.suscripcionesActivas} />
        <AdminKpiCard label="Ingresos (mes)" value={fmtPEN(d.ingresosMes)} />
        <AdminKpiCard label="Nuevos registros" value={d.nuevosRegistros} />
        <AdminKpiCard
          label="Tickets abiertos"
          value={d.ticketsAbiertos}
          hint={d.ticketsAbiertosHint}
        />
      </AdminKpiGrid>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div
          className="rounded-2xl p-5"
          style={{ background: T.white, border: `1px solid ${T.slateD}` }}
        >
          <p className="text-sm font-extrabold" style={{ color: T.text }}>
            Distribución de suscripciones
          </p>
          <ul className="mt-3 space-y-2 text-sm" style={{ color: T.textMid }}>
            <li>Básico: {d.distribucion.basico}</li>
            <li>Pro: {d.distribucion.pro}</li>
            <li>Gratis / sin plan: {d.distribucion.gratis}</li>
          </ul>
        </div>
        <div
          className="rounded-2xl p-5"
          style={{ background: T.white, border: `1px solid ${T.slateD}` }}
        >
          <p className="text-sm font-extrabold" style={{ color: T.text }}>
            Total usuarios registrados
          </p>
          <p className="mt-2 text-3xl font-black" style={{ color: T.blue }}>
            {d.totalUsuarios}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-extrabold" style={{ color: T.text }}>
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
    </AdminShell>
  );
}
