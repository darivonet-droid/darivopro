// DARIVO PRO EMPRESA — Documentos (07-MODULO-MAS-EMPRESA.md §5.4). Entrada
// directa del sidebar (posición 11) desde 22/07/2026 — antes vivía como
// ítem del panel "Más opciones" apuntando literalmente a la ruta Móvil
// (Visión §16 excepción de navegación Empresa). Misma consulta que Móvil
// (app/(auth)/mas/documentos/page.tsx) — últimas 20 cotizaciones y últimas
// 20 facturas — solo cambia la presentación a ADMIN_COLORS + EmpresaShell.
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { empresaModulo } from "@/lib/empresa-modules";
import { createServerClient } from "@/lib/supabase/server";
import { fmtPEN } from "@/lib/utils";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";

export default async function EmpresaDocumentosPage() {
  const mod = empresaModulo("documentos");
  const supabase = createServerClient();
  const [{ data: cots }, { data: facs }] = await Promise.all([
    supabase
      .from("cotizaciones")
      .select("id, client_name, total_final, created_at, status")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("facturas")
      .select("inv_id, client_name, total_final, created_at, inv_status")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <EmpresaShell titulo={mod.label}>
      <p className="mb-4 text-sm" style={{ color: ADMIN_COLORS.textMid }}>
        Facturas y cotizaciones por período
      </p>
      <div className="grid max-w-4xl gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-extrabold" style={{ color: ADMIN_COLORS.text }}>
            Cotizaciones recientes
          </h2>
          <DocList
            items={(cots ?? []).map((c) => ({
              id: c.id,
              titulo: c.client_name,
              monto: fmtPEN(Number(c.total_final ?? 0)),
              fecha: new Date(c.created_at).toLocaleDateString("es-PE"),
              estado: c.status,
            }))}
            vacio="Sin cotizaciones"
          />
        </div>
        <div>
          <h2 className="mb-2 text-sm font-extrabold" style={{ color: ADMIN_COLORS.text }}>
            Facturas recientes
          </h2>
          <DocList
            items={(facs ?? []).map((f) => ({
              id: f.inv_id,
              titulo: f.client_name,
              monto: fmtPEN(Number(f.total_final ?? 0)),
              fecha: new Date(f.created_at).toLocaleDateString("es-PE"),
              estado: f.inv_status,
            }))}
            vacio="Sin facturas"
          />
        </div>
      </div>
    </EmpresaShell>
  );
}

function DocList({
  items,
  vacio,
}: {
  items: { id: string; titulo: string; monto: string; fecha: string; estado: string }[];
  vacio: string;
}) {
  if (!items.length) {
    return (
      <p
        className="rounded-2xl py-8 text-center text-sm"
        style={{ color: ADMIN_COLORS.textMid, background: ADMIN_COLORS.slate }}
      >
        {vacio}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((it) => (
        <div
          key={it.id}
          className="flex items-center justify-between rounded-2xl px-4 py-3"
          style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
        >
          <div>
            <p className="text-sm font-bold" style={{ color: ADMIN_COLORS.text }}>
              {it.titulo}
            </p>
            <p className="text-xs" style={{ color: ADMIN_COLORS.textMid }}>
              {it.fecha} · {it.estado}
            </p>
          </div>
          <span className="text-sm font-extrabold" style={{ color: ADMIN_COLORS.purple }}>
            {it.monto}
          </span>
        </div>
      ))}
    </div>
  );
}
