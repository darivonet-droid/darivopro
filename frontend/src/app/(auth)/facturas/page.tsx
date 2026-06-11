// DARIVO PRO — Facturas (Server Component)
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { FacturasList } from "@/components/facturacion/FacturasList";
import { createServerClient } from "@/lib/supabase/server";
import { T } from "@/lib/theme";
import type { Factura } from "@/types";

export default async function FacturasPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("facturas")
    .select("*")
    .order("created_at", { ascending: false });

  const facturas: Factura[] = (data ?? []).map((row) => ({
    invId: row.inv_id,
    tenant_id: row.user_id,
    invNum: row.inv_num,
    invDate: row.inv_date,
    invStatus: row.inv_status,
    clientName: row.client_name,
    clientRuc: row.client_ruc ?? undefined,
    clientDir: row.client_dir ?? undefined,
    moneda: row.moneda ?? "PEN",
    sym: row.sym ?? "S/",
    items: row.items ?? [],
    subtotalBase: Number(row.subtotal_base ?? 0),
    igvAmount: Number(row.igv_amount ?? 0),
    totalFinal: Number(row.total_final ?? 0),
    fromQuoteId: row.from_quote_id ?? undefined,
    bizData: row.biz_data ?? { razonSocial: "", ruc: "", direccion: "", moneda: "PEN", simbolo: "S/" },
  }));

  return (
    <div>
      <PageHeader
        titulo="Facturas"
        subtitulo={`${facturas.length} emitidas`}
        accion={
          <Link
            href="/facturas/nueva"
            className="rounded-xl px-4 py-2.5 text-sm font-bold"
            style={{ background: T.blue, color: T.white }}
          >
            + Nueva
          </Link>
        }
      />
      <main className="px-4 py-4">
        <FacturasList iniciales={facturas} />
      </main>
    </div>
  );
}
