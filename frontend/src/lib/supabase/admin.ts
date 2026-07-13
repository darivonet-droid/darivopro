import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con service role — solo en Route Handlers (Storage, operaciones admin).
 * `NEXT_PUBLIC_SUPABASE_URL` se inlinea en tiempo de build; si un chunk queda
 * cacheado desde antes de una migración de proyecto Supabase puede servir una
 * URL vieja emparejada con la service role key actual (síntoma real: "Invalid
 * API key" en Supabase, visto 13/07/2026 en /admin/partners — la key era
 * correcta, la URL baked-in no). `.trim()` no soluciona ese caso, pero deja
 * claro que ambos valores deben leerse siempre del entorno actual, sin caché
 * propia de este módulo.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurada");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
