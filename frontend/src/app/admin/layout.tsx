import { requireProducto } from "@/lib/guards/require-producto";
import { createServerClient } from "@/lib/supabase/server";
import { AvisoDispositivoBanner } from "@/components/dispositivo/AvisoDispositivoBanner";
import { resolverRolDispositivo } from "@/lib/restriccion-dispositivo-server";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireProducto("admin");
  const supabase = createServerClient();
  const rolDispositivo = await resolverRolDispositivo(supabase, user);

  return (
    <>
      {/* Aviso informativo por dispositivo (reversión 21/07/2026) — nunca
          bloquea, solo informa. Admin en móvil. */}
      <AvisoDispositivoBanner rol={rolDispositivo} />
      {children}
    </>
  );
}
