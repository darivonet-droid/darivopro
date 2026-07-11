/**
 * Persistencia Partners — tablas reales de Supabase (`partners`,
 * `partner_referidos`), migradas desde el archivo JSON interim
 * (`data/ecosystem-partners.json`, INC-A02).
 *
 * Nota: `partner_comisiones` (baseline_v2) NO se usa aquí — es el modelo
 * VIEJO por tramos de registros, derogado oficialmente por
 * `06-PANEL-ADMIN-PARTNERS.md` §5.1 ("queda oficialmente eliminada, no
 * debe volver a documentarse ni configurarse"). El modelo real (20% + hitos)
 * vive en `partner_comisiones_config` desde el 13/07/2026 (editable desde
 * Admin — antes era una constante hardcodeada en `partners-types.ts`).
 *
 * Escrituras (crear partner, cambiar estado) usan siempre el cliente con
 * service role (`createAdminClient`), igual que el resto del panel Admin.
 * La lectura del propio Partner (`getPartnerByEmail`) acepta un cliente ya
 * autenticado (server component de `/partner`) para respetar RLS
 * (`partners_own`) sin necesitar service role.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { activarPlanUsuario, revocarBusinessSiFueRegaloPartner } from "@/lib/activar-plan";
import { enviarBienvenidaPartner } from "@/lib/email/send";
import type { ComisionConfigRow, EstadoPartner, PartnerRegistro } from "@/lib/partners-types";

interface PartnerRow {
  id: string;
  user_id: string | null;
  nombre: string;
  email: string;
  telefono: string | null;
  codigo: string;
  enlace: string;
  estado: EstadoPartner;
  created_at: string;
}

interface ReferidoRow {
  email: string;
  fecha: string;
}

interface ComisionHistorialRow {
  id: string;
  tipo: "venta" | "hito";
  monto: number | string;
  moneda: string;
  estado: "pendiente" | "pagada";
  pagada_at: string | null;
  created_at: string;
}

function generarCodigo() {
  return `DRV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/** Cookie de tracking de referido — /ref/[codigo] la setea, /registro la consume. */
export const REF_COOKIE_NAME = "darivo_ref";
export const REF_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 días (estándar de programas de afiliados)

async function mapPartner(
  supabase: SupabaseClient,
  row: PartnerRow
): Promise<PartnerRegistro> {
  const [{ data: referidos }, { data: comisiones }] = await Promise.all([
    supabase
      .from("partner_referidos")
      .select("email, fecha")
      .eq("partner_id", row.id)
      .order("fecha", { ascending: false }),
    supabase
      .from("partner_comisiones_historial")
      .select("id, tipo, monto, moneda, estado, pagada_at, created_at")
      .eq("partner_id", row.id)
      .order("created_at", { ascending: false }),
  ]);

  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    telefono: row.telefono ?? undefined,
    codigo: row.codigo,
    enlace: row.enlace,
    estado: row.estado,
    registros: ((referidos ?? []) as ReferidoRow[]).map((r) => ({
      email: r.email,
      fecha: r.fecha,
    })),
    comisiones: ((comisiones ?? []) as ComisionHistorialRow[]).map((c) => ({
      id: c.id,
      tipo: c.tipo,
      monto: Number(c.monto),
      moneda: c.moneda,
      estado: c.estado,
      pagadaAt: c.pagada_at ?? undefined,
      createdAt: c.created_at,
    })),
    createdAt: row.created_at,
  };
}

/** Listado completo — uso Admin (service role). */
export async function listPartners(): Promise<PartnerRegistro[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("partners")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return Promise.all(((data ?? []) as PartnerRow[]).map((row) => mapPartner(admin, row)));
}

/**
 * Búsqueda por email — usada por el propio Panel Partner.
 * Pasa el cliente autenticado del server component (`createServerClient()`)
 * como `supabase` para que la lectura respete RLS `partners_own`
 * (`user_id = auth.uid() OR email = jwt.email`). Si se omite, usa service
 * role (uso Admin / scripts internos).
 */
export async function getPartnerByEmail(
  email: string,
  supabase?: SupabaseClient
): Promise<PartnerRegistro | null> {
  const client = supabase ?? createAdminClient();
  const { data, error } = await client
    .from("partners")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error || !data) return null;
  return mapPartner(client, data as PartnerRow);
}

export async function createPartnerRecord(
  nombre: string,
  email: string
): Promise<PartnerRegistro> {
  const admin = createAdminClient();
  const codigo = generarCodigo();
  const { data, error } = await admin
    .from("partners")
    .insert({
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      codigo,
      enlace: `https://darivopro.com/ref/${codigo}`,
      estado: "Pendiente",
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapPartner(admin, data as PartnerRow);
}

/**
 * Cada Partner activo recibe Plan Business gratis mientras permanezca activo
 * (06-PANEL-ADMIN-PARTNERS.md §5.1 "Plan regalado"). Al dejar de estar activo,
 * se revoca — pero solo si el Business vino de este otorgamiento y el usuario
 * no tiene un pago real propio (ver `revocarBusinessSiFueRegaloPartner`).
 */
export async function updatePartnerEstado(
  id: string,
  estado: EstadoPartner
): Promise<PartnerRegistro | null> {
  const admin = createAdminClient();

  const { data: antes } = await admin
    .from("partners")
    .select("estado")
    .eq("id", id)
    .maybeSingle();
  const estadoAnterior = (antes as { estado: EstadoPartner } | null)?.estado;

  const { data, error } = await admin
    .from("partners")
    .update({ estado })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) return null;

  const partner = data as PartnerRow;
  if (partner.user_id) {
    if (estado === "Activo") {
      await activarPlanUsuario(partner.user_id, "business", { origenPartnerId: partner.id });
    } else {
      await revocarBusinessSiFueRegaloPartner(partner.id, partner.user_id);
    }
  }

  // Email de Bienvenida Partner — solo en la transición real a Activo, no en
  // cada guardado repetido del mismo estado.
  if (estado === "Activo" && estadoAnterior !== "Activo") {
    await enviarBienvenidaPartner(partner.email, {
      nombre: partner.nombre,
      codigo: partner.codigo,
      enlace: partner.enlace,
    });
  }

  return mapPartner(admin, partner);
}

/**
 * Busca un partner por código de enlace (/ref/[codigo]). Solo devuelve el id
 * — es la única columna que necesita el flujo de tracking de referidos.
 * Usa service role: se invoca desde /ref/[codigo] y desde el registro, antes
 * de que exista sesión de usuario, así que no hay RLS de partner que aplicar.
 */
export async function findPartnerByCodigo(codigo: string): Promise<{ id: string } | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("partners")
    .select("id")
    .eq("codigo", codigo.trim().toUpperCase())
    .maybeSingle();

  if (error || !data) return null;
  return { id: (data as { id: string }).id };
}

/**
 * Registra un referido en partner_referidos si el código sigue siendo válido
 * en este momento (re-consulta partners, no confía en un valor cacheado).
 * Nunca lanza — un código inválido o expirado simplemente no inserta nada,
 * el registro del usuario nunca debe bloquearse por esto.
 * Evita duplicados: si este referred_user_id ya tiene una fila, no inserta otra.
 */
export async function registrarReferidoSiCorresponde(
  codigo: string,
  email: string,
  referredUserId: string
): Promise<void> {
  const partner = await findPartnerByCodigo(codigo);
  if (!partner) return;

  const admin = createAdminClient();

  const { data: existente } = await admin
    .from("partner_referidos")
    .select("id")
    .eq("referred_user_id", referredUserId)
    .maybeSingle();
  if (existente) return;

  await admin.from("partner_referidos").insert({
    partner_id: partner.id,
    email: email.trim().toLowerCase(),
    referred_user_id: referredUserId,
  });
}

/**
 * Plan de comisiones vigente — 06-PANEL-ADMIN-PARTNERS.md §5.1/§5
 * "Configurar tabla de comisiones". Lectura vía RLS (`_select`, cualquier
 * autenticado) — el propio Partner también necesita ver su plan.
 */
export async function obtenerComisionesConfig(
  supabase: SupabaseClient
): Promise<ComisionConfigRow[]> {
  const { data, error } = await supabase
    .from("partner_comisiones_config")
    .select("id, tipo, hito, porcentaje")
    .order("orden", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as { id: string; tipo: "venta" | "hito"; hito: number | null; porcentaje: number | string }[]).map(
    (r) => ({ id: r.id, tipo: r.tipo, hito: r.hito, porcentaje: Number(r.porcentaje) })
  );
}

/** Edita el porcentaje de un tramo — solo Admin (RLS `_admin`, service role aquí). */
export async function actualizarComisionConfig(
  id: string,
  porcentaje: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("partner_comisiones_config")
    .update({ porcentaje })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
