/**
 * Consultas Admin — service role (solo Server Components bajo /admin).
 * Sin cambios de esquema BD; lectura agregada para V1 funcional.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { PRECIOS_OFICIALES } from "@/lib/roles-planes-oficial";

export type AdminPerfilRow = {
  id: string;
  razon_social: string | null;
  ruc: string | null;
  telefono: string | null;
  plan_tipo: string | null;
  onboarding_done: boolean | null;
  created_at: string;
  email?: string;
};

function adminClientOrNull() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

export function adminServiceRoleDisponible(): boolean {
  return adminClientOrNull() !== null;
}

export async function fetchAdminDashboard() {
  const admin = adminClientOrNull();
  if (!admin) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY no configurada" as const };
  }

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const isoMes = inicioMes.toISOString();

  const [
    { count: totalUsuarios },
    { data: perfiles },
    { data: facturasMes },
    { data: recientes },
  ] = await Promise.all([
    admin.from("perfiles").select("*", { count: "exact", head: true }),
    admin.from("perfiles").select("id, plan_tipo, onboarding_done, created_at"),
    admin.from("facturas").select("total_final, inv_status, created_at").gte("created_at", isoMes),
    admin
      .from("presupuestos")
      .select("client_name, total_final, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const rows = perfiles ?? [];
  const usuariosActivos = rows.filter((p) => p.onboarding_done).length;
  const suscripcionesActivas = rows.filter(
    (p) => p.plan_tipo === "basico" || p.plan_tipo === "pro"
  ).length;
  const nuevosRegistros = rows.filter((p) => new Date(p.created_at) >= inicioMes).length;
  const ingresosMes = (facturasMes ?? [])
    .filter((f) => f.inv_status === "Cobrada")
    .reduce((s, f) => s + Number(f.total_final ?? 0), 0);

  /** INC-A01: pipeline soporte detenido — KPI no disponible hasta DOC-01 */
  const ticketsAbiertos: string | number = "—";

  return {
    data: {
      totalUsuarios: totalUsuarios ?? 0,
      usuariosActivos,
      suscripcionesActivas,
      ingresosMes,
      nuevosRegistros,
      ticketsAbiertos,
      ticketsAbiertosHint: "INC-A01 · DOC-01 pendiente",
      recientes: recientes ?? [],
      distribucion: {
        basico: rows.filter((p) => p.plan_tipo === "basico").length,
        pro: rows.filter((p) => p.plan_tipo === "pro").length,
        gratis: rows.filter((p) => !p.plan_tipo || p.plan_tipo === "gratis").length,
      },
    },
  };
}

export async function fetchAdminUsuarios(): Promise<
  { data: AdminPerfilRow[] } | { error: string }
> {
  const admin = adminClientOrNull();
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };

  const [{ data: authData }, { data: perfiles }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 200 }),
    admin.from("perfiles").select(
      "id, razon_social, ruc, telefono, plan_tipo, onboarding_done, created_at"
    ),
  ]);

  const emailById = new Map(
    (authData?.users ?? []).map((u) => [u.id, u.email ?? ""])
  );

  const data: AdminPerfilRow[] = (perfiles ?? []).map((p) => ({
    ...p,
    email: emailById.get(p.id) ?? "",
  }));

  return { data };
}

export async function fetchAdminSuscripciones() {
  const admin = adminClientOrNull();
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY no configurada" as const };

  const { data: perfiles } = await admin.from("perfiles").select("plan_tipo");
  const rows = perfiles ?? [];

  return {
    data: {
      planesOficiales: PRECIOS_OFICIALES,
      usuariosPorPlan: {
        basico: rows.filter((p) => p.plan_tipo === "basico").length,
        pro: rows.filter((p) => p.plan_tipo === "pro").length,
        gratis: rows.filter((p) => !p.plan_tipo || p.plan_tipo === "gratis").length,
        business: rows.filter((p) => p.plan_tipo === "business").length,
      },
    },
  };
}

export async function fetchAdminEmpleadosInternos(): Promise<
  { data: AdminPerfilRow[] } | { error: string }
> {
  const usuarios = await fetchAdminUsuarios();
  if ("error" in usuarios) return usuarios;

  const adminEmails = new Set(
    (process.env.DARIVO_ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );

  if (adminEmails.size === 0) {
    return { data: [] };
  }

  return {
    data: usuarios.data.filter((u) => adminEmails.has((u.email ?? "").toLowerCase())),
  };
}

export async function fetchAdminCatalogo() {
  const admin = adminClientOrNull();
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY no configurada" as const };

  const [{ data: productos }, { data: categorias }] = await Promise.all([
    admin.from("productos_master").select("slug, nombre, descripcion").order("nombre"),
    admin.from("catalogo_categorias_maestro").select("cat_id, nombre").order("nombre"),
  ]);

  return { data: { productos: productos ?? [], categorias: categorias ?? [] } };
}
