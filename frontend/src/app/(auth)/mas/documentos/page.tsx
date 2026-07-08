import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { createServerClient } from "@/lib/supabase/server";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/theme";

export default async function DocumentosPage() {
  const supabase = createServerClient();
  const [{ data: pres }, { data: facs }] = await Promise.all([
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
    <div>
      <PageHeader titulo="Documentos" subtitulo="Facturas y cotizaciones por período" />
      <main className="px-4 py-4">
        <h2 className="mb-2 text-sm font-extrabold" style={{ color: T.text }}>
          Cotizaciones recientes
        </h2>
        <DocList
          items={(pres ?? []).map((p) => ({
            id: p.id,
            titulo: p.client_name,
            monto: fmtPEN(Number(p.total_final ?? 0)),
            fecha: new Date(p.created_at).toLocaleDateString("es-PE"),
            estado: p.status,
          }))}
          vacio="Sin cotizaciones"
        />
        <h2 className="mb-2 mt-6 text-sm font-extrabold" style={{ color: T.text }}>
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
        <Link href="/mas" className="mt-6 block text-center text-sm font-bold" style={{ color: T.blue }}>
          ← Volver a Más
        </Link>
      </main>
    </div>
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
      <p className="rounded-2xl py-8 text-center text-sm" style={{ color: T.textMid, background: T.slate }}>
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
          style={{ background: T.white, border: `1px solid ${T.slateD}` }}
        >
          <div>
            <p className="text-sm font-bold" style={{ color: T.text }}>
              {it.titulo}
            </p>
            <p className="text-xs" style={{ color: T.textMid }}>
              {it.fecha} · {it.estado}
            </p>
          </div>
          <span className="text-sm font-extrabold" style={{ color: T.blue }}>
            {it.monto}
          </span>
        </div>
      ))}
    </div>
  );
}
