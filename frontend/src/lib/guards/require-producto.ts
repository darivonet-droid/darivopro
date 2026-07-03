import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import {
  verificarAccesoProducto,
  type ProductoProtegido,
} from "@/lib/acceso-producto";

/** Guard server-side para layouts Admin / Empresa / Partner */
export async function requireProducto(producto: ProductoProtegido) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const acceso = verificarAccesoProducto(producto, user);
  if (!acceso.ok) {
    redirect(`/dashboard?acceso=${acceso.razon}`);
  }
  return user!;
}
