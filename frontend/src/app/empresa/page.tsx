import { redirect } from "next/navigation";
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { EmpresaInicioView } from "@/components/empresa/EmpresaInicioView";
import { empresaModulo } from "@/lib/empresa-modules";
import { createServerClient } from "@/lib/supabase/server";

export default async function EmpresaInicioPage() {
  const mod = empresaModulo("inicio");
  const supabase = createServerClient();

  const [
    { data: { user } },
    { data: perfil },
    { data: statsRaw },
    { data: presRaw },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("perfiles").select("razon_social, onboarding_done").single(),
    supabase.from("presupuestos").select("id, status, total_final"),
    supabase
      .from("presupuestos")
      .select("id, status, total_final, client_name, created_at, presupuesto_items(count)")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  if (!perfil?.onboarding_done) redirect("/onboarding/1");

  const stats = statsRaw ?? [];
  const aprobados = stats.filter((p) => p.status === "Aprobado").length;
  const pendientes = stats.filter((p) => p.status === "Pendiente de firma").length;
  const ingresos = stats
    .filter((p) => p.status === "Aprobado")
    .reduce((s, p) => s + Number(p.total_final ?? 0), 0);

  const nombre =
    perfil?.razon_social ?? user?.email?.split("@")[0] ?? "Gerente";

  const recientes = (presRaw ?? []).map((p) => ({
    id: p.id,
    client_name: p.client_name,
    total_final: p.total_final,
    status: p.status,
    created_at: p.created_at,
    itemCount:
      (p as { presupuesto_items?: { count: number }[] }).presupuesto_items?.[0]?.count ?? 0,
  }));

  return (
    <EmpresaShell titulo={mod.label}>
      <EmpresaInicioView
        nombre={nombre}
        aprobados={aprobados}
        pendientes={pendientes}
        ingresos={ingresos}
        recientes={recientes}
      />
    </EmpresaShell>
  );
}
