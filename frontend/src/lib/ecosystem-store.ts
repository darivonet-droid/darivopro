/**
 * Persistencia Partners — tablas reales de Supabase (`partners`,
 * `partner_referidos`), migradas desde el archivo JSON interim
 * (`data/ecosystem-partners.json`, INC-A02).
 *
 * Nota: `partner_comisiones` (baseline_v2) NO se usa aquí — es el modelo
 * VIEJO por tramos de registros, derogado oficialmente por
 * `06-PANEL-ADMIN-PARTNERS.md` §5.1 ("queda oficialmente eliminada, no
 * debe volver a documentarse ni configurarse"). El modelo real (20% + hitos)
 * vive como constantes en `frontend/src/lib/partners-types.ts`, no en BD.
 *
 * Escrituras (crear partner, cambiar estado) usan siempre el cliente con
 * service role (`createAdminClient`), igual que el resto del panel Admin.
 * La lectura del propio Partner (`getPartnerByEmail`) acepta un cliente ya
 * autenticado (server component de `/partner`) para respetar RLS
 * (`partners_own`) sin necesitar service role.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EstadoPartner, PartnerRegistro } from "@/lib/partners-types";

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

function generarCodigo() {
  return `DRV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function mapPartner(
  supabase: SupabaseClient,
  row: PartnerRow
): Promise<PartnerRegistro> {
  const { data: referidos } = await supabase
    .from("partner_referidos")
    .select("email, fecha")
    .eq("partner_id", row.id)
    .order("fecha", { ascending: false });

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

export async function updatePartnerEstado(
  id: string,
  estado: EstadoPartner
): Promise<PartnerRegistro | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("partners")
    .update({ estado })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) return null;
  return mapPartner(admin, data as PartnerRow);
}
