// DARIVO PRO — Marca `empresa_empleados.ultima_actividad` en cada login real.
// Antes esa columna existía en BD pero nadie la escribía nunca — la tabla de
// Empleados de Empresa mostraba `created_at` bajo el nombre "Alta" en su
// lugar. Un Técnico no tiene RLS propio sobre `empresa_empleados` (solo el
// Gerente/Admin), así que esto necesita el cliente admin (service role).
// Se llama desde login/page.tsx (password) y desde auth/callback/route.ts
// (Google OAuth + aceptar invitación) — siempre best-effort, nunca bloquea
// el login si falla.
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  try {
    const admin = createAdminClient();
    await admin
      .from("empresa_empleados")
      .update({ ultima_actividad: new Date().toISOString() })
      .eq("user_id", user.id);
  } catch {
    // Best-effort — no es crítico, nunca debe romper el login.
  }

  return NextResponse.json({ ok: true });
}
