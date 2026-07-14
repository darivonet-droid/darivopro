// DIAG TEMPORAL 14/07/2026 — verificar plan_tipo/empresa_id de una cuenta
// de prueba en el proyecto Supabase correcto (vyrtokggypcmpforglch), tras
// la corrección de las 3 env vars. Respuesta pública SOLO {ok: true/false}
// -- el detalle real (plan_tipo, empresa_id, si existe fila en empresas)
// va a console.error (solo Vercel Runtime Logs), nunca al body HTTP.
// Retirar tras confirmar.
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_A_VERIFICAR = "darivonet@gmail.com";

export async function GET() {
  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error("DIAG6 createAdminClient EXCEPTION:", e instanceof Error ? e.message : String(e));
    return NextResponse.json({ ok: false });
  }

  try {
    const { data: authData, error: authErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (authErr) {
      console.error("DIAG6 listUsers FAIL:", JSON.stringify({ message: authErr.message }));
      return NextResponse.json({ ok: false });
    }

    const user = authData?.users?.find((u) => u.email === EMAIL_A_VERIFICAR);
    if (!user) {
      console.error("DIAG6 usuario no encontrado en auth.users:", EMAIL_A_VERIFICAR);
      return NextResponse.json({ ok: true });
    }

    const { data: perfil, error: perfilErr } = await admin
      .from("perfiles")
      .select("plan_tipo, empresa_id, onboarding_done")
      .eq("id", user.id)
      .maybeSingle();

    if (perfilErr) {
      console.error("DIAG6 perfiles query FAIL:", JSON.stringify({ message: perfilErr.message }));
      return NextResponse.json({ ok: false });
    }

    let empresaRow: { id: string; razon_social: string; activo: boolean } | null = null;
    if (perfil?.empresa_id) {
      const { data: emp } = await admin
        .from("empresas")
        .select("id, razon_social, activo")
        .eq("id", perfil.empresa_id)
        .maybeSingle();
      empresaRow = emp ?? null;
    }

    console.error("DIAG6 perfil de", EMAIL_A_VERIFICAR, ":", JSON.stringify({
      userId: user.id,
      plan_tipo: perfil?.plan_tipo ?? null,
      empresa_id: perfil?.empresa_id ?? null,
      onboarding_done: perfil?.onboarding_done ?? null,
      empresaRow,
    }));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DIAG6 EXCEPTION:", e instanceof Error ? e.message : String(e));
    return NextResponse.json({ ok: false });
  }
}
