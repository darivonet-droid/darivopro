import { redirect } from "next/navigation";
import { requireProducto } from "@/lib/guards/require-producto";
import { createServerClient } from "@/lib/supabase/server";

export default async function EmpresaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireProducto("empresa");

  const supabase = createServerClient();
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("onboarding_done")
    .single();

  if (!perfil?.onboarding_done) redirect("/onboarding/1");

  return <>{children}</>;
}
