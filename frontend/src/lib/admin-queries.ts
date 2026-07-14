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
  /** `auth.users.banned_until` — futuro = usuario bloqueado (Admin §5 "Bloquear usuario") */
  bannedUntil?: string | null;
  lastSignInAt?: string | null;
  /** Primer proveedor de auth.users.identities — "email" | "google" | etc. */
  metodoAcceso?: string;
};

function adminClientOrNull() {
  try {
    return createAdminClient();
  } catch (e) {
    // No silenciar: sin esto, un fallo real de createAdminClient() (env var
    // vacía en un runtime específico, etc.) se ve idéntico a "no configurado"
    // en los logs, indistinguible de una config local incompleta.
    console.error("adminClientOrNull(): createAdminClient() falló", e);
    return null;
  }
}

export function adminServiceRoleDisponible(): boolean {
  return adminClientOrNull() !== null;
}

/** Serie diaria para el bloque "Actividad de la plataforma" — 00-PANEL-ADMIN-DASHBOARD.md §5/§6. */
export type AdminActividadDia = {
  fecha: string; // "DD/MM"
  registros: number;
  cotizaciones: number;
  facturas: number;
};

export async function fetchAdminDashboard(diasActividad: 7 | 30 | 90 = 30) {
  const admin = adminClientOrNull();
  if (!admin) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY no configurada" as const };
  }

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const isoMes = inicioMes.toISOString();

  const inicioActividad = new Date();
  inicioActividad.setDate(inicioActividad.getDate() - (diasActividad - 1));
  inicioActividad.setHours(0, 0, 0, 0);
  const isoActividad = inicioActividad.toISOString();

  const [
    { count: totalUsuarios },
    { data: perfiles },
    { data: facturasMes },
    { data: recientes },
    { data: cotizacionesActividad },
    { data: facturasActividad },
  ] = await Promise.all([
    admin.from("perfiles").select("*", { count: "exact", head: true }),
    admin.from("perfiles").select("id, plan_tipo, onboarding_done, created_at"),
    admin.from("facturas").select("total_final, inv_status, created_at").gte("created_at", isoMes),
    admin
      .from("cotizaciones")
      .select("client_name, total_final, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    admin.from("cotizaciones").select("created_at").gte("created_at", isoActividad),
    admin.from("facturas").select("created_at").gte("created_at", isoActividad),
  ]);

  const rows = perfiles ?? [];
  const usuariosActivos = rows.filter((p) => p.onboarding_done).length;
  const suscripcionesActivas = rows.filter(
    (p) => p.plan_tipo === "basico" || p.plan_tipo === "pro" || p.plan_tipo === "business"
  ).length;
  const nuevosRegistros = rows.filter((p) => new Date(p.created_at) >= inicioMes).length;
  const ingresosMes = (facturasMes ?? [])
    .filter((f) => f.inv_status === "Cobrada")
    .reduce((s, f) => s + Number(f.total_final ?? 0), 0);

  /** INC-A01: pipeline soporte detenido — KPI no disponible hasta DOC-01 */
  const ticketsAbiertos: string | number = "—";

  const actividad = construirSerieActividad(
    diasActividad,
    rows.map((p) => p.created_at),
    (cotizacionesActividad ?? []).map((c) => c.created_at),
    (facturasActividad ?? []).map((f) => f.created_at)
  );

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
      actividad,
      distribucion: {
        basico: rows.filter((p) => p.plan_tipo === "basico").length,
        pro: rows.filter((p) => p.plan_tipo === "pro").length,
        business: rows.filter((p) => p.plan_tipo === "business").length,
        gratis: rows.filter((p) => !p.plan_tipo || p.plan_tipo === "gratis").length,
      },
    },
  };
}

function construirSerieActividad(
  dias: number,
  fechasRegistros: string[],
  fechasCotizaciones: string[],
  fechasFacturas: string[]
): AdminActividadDia[] {
  const claveDia = (iso: string) => iso.slice(0, 10); // "YYYY-MM-DD"
  const contarPorDia = (fechas: string[]) => {
    const mapa = new Map<string, number>();
    for (const f of fechas) {
      const k = claveDia(f);
      mapa.set(k, (mapa.get(k) ?? 0) + 1);
    }
    return mapa;
  };

  const registrosPorDia = contarPorDia(fechasRegistros);
  const cotizacionesPorDia = contarPorDia(fechasCotizaciones);
  const facturasPorDia = contarPorDia(fechasFacturas);

  const serie: AdminActividadDia[] = [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    serie.push({
      fecha: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      registros: registrosPorDia.get(iso) ?? 0,
      cotizaciones: cotizacionesPorDia.get(iso) ?? 0,
      facturas: facturasPorDia.get(iso) ?? 0,
    });
  }
  return serie;
}

/**
 * Empresas — Panel Admin (Módulo 02, `02-PANEL-ADMIN-EMPRESAS.md`).
 * Fuente principal: tabla `empresas` (baseline_v2). Se hace JOIN con `perfiles`
 * (por `gerente_user_id` = `perfiles.id`) solo para exponer plan y estado de
 * onboarding, y con `auth.users` para el email de contacto — `empresas` no
 * almacena plan ni email directamente.
 */
export type AdminEmpresaRow = {
  id: string;
  gerente_user_id: string;
  razon_social: string;
  ruc: string | null;
  direccion: string | null;
  telefono: string | null;
  created_at: string;
  plan_tipo: string | null;
  /** Columna dedicada `empresas.activo` (migración 20260709180000). */
  activa: boolean;
  email: string;
  /** "Última actividad" (Doc 02 §6) — proxy real: último acceso del gerente. */
  lastSignInAt: string | null;
};

export async function fetchAdminEmpresas(): Promise<
  { data: AdminEmpresaRow[] } | { error: string }
> {
  const admin = adminClientOrNull();
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };

  const { data: empresas, error } = await admin
    .from("empresas")
    .select("id, gerente_user_id, razon_social, ruc, direccion, telefono, created_at, activo")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  const gerenteIds = (empresas ?? []).map((e) => e.gerente_user_id);

  const [{ data: perfiles }, { data: authData }] = await Promise.all([
    gerenteIds.length
      ? admin.from("perfiles").select("id, plan_tipo").in("id", gerenteIds)
      : Promise.resolve({ data: [] as Array<{ id: string; plan_tipo: string | null }> }),
    admin.auth.admin.listUsers({ perPage: 200 }),
  ]);

  const perfilById = new Map((perfiles ?? []).map((p) => [p.id, p]));
  const authById = new Map((authData?.users ?? []).map((u) => [u.id, u]));

  const data: AdminEmpresaRow[] = (empresas ?? []).map((e) => {
    const perfil = perfilById.get(e.gerente_user_id);
    const authUser = authById.get(e.gerente_user_id);
    return {
      id: e.id,
      gerente_user_id: e.gerente_user_id,
      razon_social: e.razon_social,
      ruc: e.ruc,
      direccion: e.direccion,
      telefono: e.telefono,
      created_at: e.created_at,
      plan_tipo: perfil?.plan_tipo ?? null,
      activa: e.activo,
      email: authUser?.email ?? "",
      lastSignInAt: authUser?.last_sign_in_at ?? null,
    };
  });

  return { data };
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

  const authById = new Map((authData?.users ?? []).map((u) => [u.id, u]));

  const data: AdminPerfilRow[] = (perfiles ?? []).map((p) => {
    const u = authById.get(p.id);
    return {
      ...p,
      email: u?.email ?? "",
      bannedUntil: u?.banned_until ?? null,
      lastSignInAt: u?.last_sign_in_at ?? null,
      metodoAcceso: u?.identities?.[0]?.provider ?? "email",
    };
  });

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

export type AdminEmpleadoInternoRow = {
  id: string;
  user_id: string;
  email: string;
  nombre: string | null;
  cargo: string | null;
  departamento: string | null;
  activo: boolean;
  created_at: string;
  lastSignInAt?: string | null;
};

/** Empleados internos Darivo — fuente real `darivo_admin_empleados` (Doc 07 §6, §9). */
export async function fetchAdminEmpleadosInternos(): Promise<
  { data: AdminEmpleadoInternoRow[] } | { error: string }
> {
  const admin = adminClientOrNull();
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };

  const [{ data: empleados }, { data: authData }] = await Promise.all([
    admin
      .from("darivo_admin_empleados")
      .select("id, user_id, email, nombre, cargo, departamento, activo, created_at")
      .order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 200 }),
  ]);

  const authById = new Map((authData?.users ?? []).map((u) => [u.id, u]));

  const data: AdminEmpleadoInternoRow[] = (empleados ?? []).map((e) => ({
    ...e,
    lastSignInAt: authById.get(e.user_id)?.last_sign_in_at ?? null,
  }));

  return { data };
}

export type AdminSectorRow = { id: string; slug: string; nombre: string; emoji: string | null; orden: number };

export type AdminCategoriaMaestroRow = {
  id: string;
  sector_id: string;
  producto_id: string;
  cat_id: string;
  nombre: string;
  emoji: string | null;
  color: string | null;
  activo: boolean;
  created_at: string;
  sectorNombre: string;
  partidasCount: number;
};

export type AdminPartidaMaestroRow = {
  id: string;
  categoria_maestro_id: string;
  svc_id: string;
  nombre: string;
  calc_type: "m2" | "unit" | "hour" | "fixed";
  precio_tarifa_pro: number;
  unidad: string | null;
  activo: boolean;
  created_at: string;
  categoriaNombre: string;
};

/** Catálogo Maestro completo (Doc 10/21) — sectores + categorías + partidas, sin tablas nuevas. */
export async function fetchAdminCatalogo() {
  const admin = adminClientOrNull();
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY no configurada" as const };

  const [prodRes, sectRes, catRes, partRes] = await Promise.all([
    admin.from("productos_master").select("id, slug, nombre, descripcion").order("nombre"),
    admin.from("catalogo_sectores").select("id, slug, nombre, emoji, orden").order("orden"),
    admin
      .from("catalogo_categorias_maestro")
      .select("id, sector_id, producto_id, cat_id, nombre, emoji, color, activo, created_at")
      .order("nombre"),
    admin
      .from("catalogo_partidas_maestro")
      .select("id, categoria_maestro_id, svc_id, nombre, calc_type, precio_tarifa_pro, unidad, activo, created_at")
      .order("nombre"),
  ]);
  // DIAG4 13/07/2026 -- temporal, retirar tras verificar si productos_master también falla con "Invalid API key"
  if (prodRes.error) console.error("DIAG4 productos_master error:", JSON.stringify(prodRes.error));
  if (sectRes.error) console.error("DIAG4 catalogo_sectores error:", JSON.stringify(sectRes.error));
  const { data: productos } = prodRes;
  const { data: sectores } = sectRes;
  const { data: categorias } = catRes;
  const { data: partidas } = partRes;

  const sectoresRows = (sectores ?? []) as AdminSectorRow[];
  const sectorNombreById = new Map(sectoresRows.map((s) => [s.id, s.nombre]));
  const partidasPorCategoria = new Map<string, number>();
  for (const p of partidas ?? []) {
    partidasPorCategoria.set(p.categoria_maestro_id, (partidasPorCategoria.get(p.categoria_maestro_id) ?? 0) + 1);
  }

  const categoriasRows: AdminCategoriaMaestroRow[] = (categorias ?? []).map((c) => ({
    ...c,
    sectorNombre: sectorNombreById.get(c.sector_id) ?? "—",
    partidasCount: partidasPorCategoria.get(c.id) ?? 0,
  }));
  const categoriaNombreById = new Map(categoriasRows.map((c) => [c.id, c.nombre]));

  const partidasRows: AdminPartidaMaestroRow[] = (partidas ?? []).map((p) => ({
    ...p,
    categoriaNombre: categoriaNombreById.get(p.categoria_maestro_id) ?? "—",
  }));

  return {
    data: {
      productos: productos ?? [],
      sectores: sectoresRows,
      categorias: categoriasRows,
      partidas: partidasRows,
    },
  };
}

/**
 * Productos oficiales del ecosistema (Módulo Admin 05 — Edición de Productos).
 * Esquema real de `productos_master` (baseline_v2 §productos_master): id, slug,
 * nombre, descripcion, activo, created_at. NO existen `orden` ni `updated_at`.
 * `categorias` = nº de categorías del Catálogo Maestro asociadas vía producto_id.
 */
export type AdminProductoRow = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
  categorias: number;
};

export async function fetchAdminProductos(): Promise<
  { data: AdminProductoRow[] } | { error: string }
> {
  const admin = adminClientOrNull();
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };

  const { data, error } = await admin
    .from("productos_master")
    .select("id, slug, nombre, descripcion, activo, created_at, catalogo_categorias_maestro(count)")
    .order("nombre");

  if (error) return { error: error.message };

  const productos: AdminProductoRow[] = (data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    nombre: p.nombre,
    descripcion: p.descripcion ?? null,
    activo: p.activo,
    created_at: p.created_at,
    categorias: Array.isArray(p.catalogo_categorias_maestro)
      ? (p.catalogo_categorias_maestro[0]?.count ?? 0)
      : 0,
  }));

  return { data: productos };
}
