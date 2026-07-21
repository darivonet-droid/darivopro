// DARIVO PRO — Resolución de rol para la restricción de dispositivo (Etapa 7
// — continuación, 21/07/2026). Separado de `restriccion-dispositivo.ts` (que
// sí es seguro para bundle de cliente) porque esta función depende de
// `acceso-producto.ts`, que a su vez importa `next/headers` — solo se usa
// desde middleware.ts (servidor/edge), nunca desde un client component.
//
// Reutiliza el mismo criterio ya usado por `destino-post-login.ts`
// (`esGerenteDeEmpresa`) y `rol-empleado.ts` (`obtenerContextoAcceso`): un
// Técnico y un usuario "solo Móvil" comparten exactamente la misma
// restricción de dispositivo (Solo Móvil), así que no hace falta
// distinguirlos aquí con una consulta extra a `empresa_empleados` (que
// además un Técnico no puede leer con el cliente de sesión, solo el Gerente
// vía RLS — ver nota en rol-empleado.ts): basta con `perfiles.empresa_id` no
// nulo + no ser el gerente de esa empresa.

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { esAdministradorDarivo, esPartnerAutorizado } from "@/lib/acceso-producto";
import type { RolDispositivo } from "@/lib/restriccion-dispositivo";

/** Resuelve el rol real del usuario logueado, a efectos únicamente de la
 * restricción de dispositivo (no reemplaza `obtenerContextoAcceso()` ni
 * `resolverDestinoPostLogin()`, que resuelven más matices para otros fines). */
export async function resolverRolDispositivo(
  supabase: SupabaseClient,
  user: User
): Promise<RolDispositivo> {
  if (await esAdministradorDarivo(user.email)) return "admin";
  if (await esPartnerAutorizado(user.email, supabase)) return "partner";

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("empresa_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!perfil?.empresa_id) return "movil"; // Móvil independiente, sin empresa

  const { data: empresa } = await supabase
    .from("empresas")
    .select("gerente_user_id")
    .eq("id", perfil.empresa_id)
    .maybeSingle();

  if (empresa?.gerente_user_id === user.id) return "gerente";
  return "movil"; // Técnico
}
