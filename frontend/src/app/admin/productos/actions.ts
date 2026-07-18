"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorSiNoEsAdmin } from "@/lib/acceso-producto";

/**
 * Edita un producto existente de `productos_master` (Módulo Admin 05).
 * Solo actualiza campos descriptivos (nombre, descripcion, activo) de una fila
 * ya existente. No crea ni elimina filas (05-PANEL-ADMIN-EDICION-DE-PRODUCTOS.md §6, §12).
 * El `slug` NO se edita: es clave funcional única referenciada por los guards de
 * producto y las FK del Catálogo Maestro.
 */
export async function updateProductoAction(
  id: string,
  campos: { nombre: string; descripcion: string | null; activo: boolean }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const errorAuth = await errorSiNoEsAdmin();
  if (errorAuth) return { ok: false, error: errorAuth };
  if (!campos.nombre.trim()) {
    return { ok: false, error: "El nombre es obligatorio" };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurada" };
  }

  const { error } = await admin
    .from("productos_master")
    .update({
      nombre: campos.nombre.trim(),
      descripcion: campos.descripcion?.trim() || null,
      activo: campos.activo,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/productos");
  return { ok: true };
}
