"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

type Resultado = { ok: true } | { ok: false; error: string };

/** slug ASCII simple para cat_id/svc_id — sin tildes, minúsculas, guiones. */
function slugificar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Crea categoría/subcategoría (Doc 10 §6, mismo formulario para ambas — las
 * "subcategorías" son categorías normales con sector=Construcción, Doc 21
 * §15: "no crean un nuevo nivel en la base de datos").
 */
export async function crearCategoriaAction(input: {
  sectorId: string;
  productoId: string;
  nombre: string;
  emoji?: string;
  color?: string;
}): Promise<Resultado> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }
  if (!input.nombre.trim() || !input.sectorId || !input.productoId) {
    return { ok: false, error: "Sector, producto y nombre son obligatorios" };
  }

  const { error } = await admin.from("catalogo_categorias_maestro").insert({
    sector_id: input.sectorId,
    producto_id: input.productoId,
    cat_id: `${slugificar(input.nombre)}-${Math.random().toString(36).slice(2, 6)}`,
    nombre: input.nombre.trim(),
    emoji: input.emoji?.trim() || "🔧",
    color: input.color?.trim() || "#7C3AED",
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/catalogo");
  return { ok: true };
}

export async function editarCategoriaAction(
  id: string,
  input: { nombre?: string; emoji?: string; color?: string; activo?: boolean }
): Promise<Resultado> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }

  const patch: Record<string, unknown> = {};
  if (input.nombre !== undefined) patch.nombre = input.nombre.trim();
  if (input.emoji !== undefined) patch.emoji = input.emoji.trim();
  if (input.color !== undefined) patch.color = input.color.trim();
  if (input.activo !== undefined) patch.activo = input.activo;

  const { error } = await admin.from("catalogo_categorias_maestro").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/catalogo");
  return { ok: true };
}

export async function eliminarCategoriaAction(id: string): Promise<Resultado> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }

  const { error } = await admin.from("catalogo_categorias_maestro").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/catalogo");
  return { ok: true };
}

/** Crea partida (Doc 10 §6). calc_type debe ser uno de los 4 valores oficiales (Doc 21). */
export async function crearPartidaAction(input: {
  categoriaMaestroId: string;
  nombre: string;
  calcType: "m2" | "unit" | "hour" | "fixed";
  precioTarifaPro: number;
  unidad?: string;
}): Promise<Resultado> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }
  if (!input.nombre.trim() || !input.categoriaMaestroId) {
    return { ok: false, error: "Categoría y nombre son obligatorios" };
  }
  if (!Number.isFinite(input.precioTarifaPro) || input.precioTarifaPro < 0) {
    return { ok: false, error: "Precio inválido" };
  }

  const { error } = await admin.from("catalogo_partidas_maestro").insert({
    categoria_maestro_id: input.categoriaMaestroId,
    svc_id: `${slugificar(input.nombre)}-${Math.random().toString(36).slice(2, 6)}`,
    nombre: input.nombre.trim(),
    calc_type: input.calcType,
    tipo_precio: "tarifa_pro",
    precio_tarifa_pro: input.precioTarifaPro,
    unidad: input.unidad?.trim() || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/catalogo");
  return { ok: true };
}

export async function editarPartidaAction(
  id: string,
  input: {
    nombre?: string;
    calcType?: "m2" | "unit" | "hour" | "fixed";
    precioTarifaPro?: number;
    unidad?: string;
    activo?: boolean;
  }
): Promise<Resultado> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }
  if (input.precioTarifaPro !== undefined && (!Number.isFinite(input.precioTarifaPro) || input.precioTarifaPro < 0)) {
    return { ok: false, error: "Precio inválido" };
  }

  const patch: Record<string, unknown> = {};
  if (input.nombre !== undefined) patch.nombre = input.nombre.trim();
  if (input.calcType !== undefined) patch.calc_type = input.calcType;
  if (input.precioTarifaPro !== undefined) patch.precio_tarifa_pro = input.precioTarifaPro;
  if (input.unidad !== undefined) patch.unidad = input.unidad.trim() || null;
  if (input.activo !== undefined) patch.activo = input.activo;

  const { error } = await admin.from("catalogo_partidas_maestro").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/catalogo");
  return { ok: true };
}

export async function eliminarPartidaAction(id: string): Promise<Resultado> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }

  const { error } = await admin.from("catalogo_partidas_maestro").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/catalogo");
  return { ok: true };
}
