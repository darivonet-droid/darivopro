/**
 * Traspaso ÚNICO de Partners del JSON interim (data/ecosystem-partners.json,
 * INC-A02) a las tablas reales de Supabase `partners` + `partner_referidos`
 * (supabase/migrations/20260705120000_baseline_v2.sql).
 *
 * NO SE HA EJECUTADO. Preparado para revisión — requiere confirmación
 * explícita del propietario antes de correr contra la BD real (regla
 * CLAUDE.md: cualquier escritura de datos en Supabase para para confirmar).
 *
 * Uso (una sola vez, tras confirmación):
 *   cd frontend && npx tsx scripts/migrate-partners-json-to-supabase.ts
 *
 * Requiere en el entorno: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 *
 * Comportamiento:
 * - Lee data/ecosystem-partners.json.
 * - Por cada partner: upsert en `partners` por `email` (evita duplicados si
 *   se corre más de una vez).
 * - Por cada registro dentro de `partner.registros`: upsert en
 *   `partner_referidos` (partner_id + email + fecha) — sin duplicados en
 *   reintentos, vía comprobación previa de existencia.
 * - No borra ni modifica el JSON original (se conserva como respaldo hasta
 *   confirmar que la migración fue correcta).
 * - Estado actual del JSON (verificado 09/07/2026): `{ "partners": [] }` —
 *   0 partners registrados. La ejecución de este script hoy sería un no-op,
 *   pero se deja listo por si se registran partners antes de migrar BD.
 */
import { promises as fs } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

interface PartnerReferidoJson {
  email: string;
  fecha: string;
}

interface PartnerJson {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  codigo: string;
  enlace: string;
  estado: "Activo" | "Pendiente" | "Suspendido";
  registros: PartnerReferidoJson[];
  createdAt: string;
}

interface PartnersStoreFile {
  partners: PartnerJson[];
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el entorno.");
    process.exit(1);
  }

  const dataPath = path.join(process.cwd(), "data", "ecosystem-partners.json");
  const raw = await fs.readFile(dataPath, "utf-8");
  const store = JSON.parse(raw) as PartnersStoreFile;

  if (store.partners.length === 0) {
    console.log("Nada que migrar: data/ecosystem-partners.json no tiene partners.");
    return;
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });

  let migrados = 0;
  let referidosMigrados = 0;

  for (const p of store.partners) {
    const { data: existente, error: buscarError } = await admin
      .from("partners")
      .select("id")
      .eq("email", p.email.toLowerCase())
      .maybeSingle();

    if (buscarError) {
      console.error(`Error buscando partner ${p.email}:`, buscarError.message);
      continue;
    }

    let partnerId = existente?.id as string | undefined;

    if (!partnerId) {
      const { data: insertado, error: insertError } = await admin
        .from("partners")
        .insert({
          nombre: p.nombre,
          email: p.email.toLowerCase(),
          telefono: p.telefono ?? null,
          codigo: p.codigo,
          enlace: p.enlace,
          estado: p.estado,
          created_at: p.createdAt,
        })
        .select("id")
        .single();

      if (insertError || !insertado) {
        console.error(`Error insertando partner ${p.email}:`, insertError?.message);
        continue;
      }
      partnerId = insertado.id as string;
      migrados++;
      console.log(`Partner creado: ${p.email} -> ${partnerId}`);
    } else {
      console.log(`Partner ya existía en BD, se omite insert: ${p.email}`);
    }

    for (const r of p.registros) {
      const { data: refExistente } = await admin
        .from("partner_referidos")
        .select("id")
        .eq("partner_id", partnerId)
        .eq("email", r.email.toLowerCase())
        .eq("fecha", r.fecha)
        .maybeSingle();

      if (refExistente) continue;

      const { error: refError } = await admin.from("partner_referidos").insert({
        partner_id: partnerId,
        email: r.email.toLowerCase(),
        fecha: r.fecha,
      });

      if (refError) {
        console.error(`Error insertando referido ${r.email} de ${p.email}:`, refError.message);
        continue;
      }
      referidosMigrados++;
    }
  }

  console.log(`Listo. Partners nuevos: ${migrados}. Referidos nuevos: ${referidosMigrados}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
