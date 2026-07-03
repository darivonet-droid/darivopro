import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { RolesPermisosView } from "@/components/empresa/RolesPermisosView";
import { empresaModulo } from "@/lib/empresa-modules";
import { createServerClient } from "@/lib/supabase/server";
import type { PlanTipoPersistido } from "@/lib/roles-planes-oficial";

export default async function EmpresaRolesPage() {
  const supabase = createServerClient();
  const { data: perfil } = await supabase.from("perfiles").select("plan_tipo").single();
  const mod = empresaModulo("roles");
  const plan = (perfil?.plan_tipo ?? "gratis") as PlanTipoPersistido;

  return (
    <EmpresaShell titulo={mod.label}>
      <RolesPermisosView planTipo={plan} />
    </EmpresaShell>
  );
}
