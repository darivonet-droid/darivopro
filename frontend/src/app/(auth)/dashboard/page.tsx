// DARIVO PRO — Dashboard (Server Component)
import Link from "next/link";
import { fmtPEN } from "@/lib/utils";
import { createServerClient } from "@/lib/supabase/server";
import { T } from "@/lib/theme";

export default async function DashboardPage() {
  const supabase = createServerClient();

  const [presupuestos, facturas] = await Promise.all([
    supabase.from("presupuestos").select("id, status, total_final, client_name, created_at").order("created_at", { ascending: false }),
    supabase.from("facturas").select("inv_id, inv_status, total_final"),
  ]);

  const pres = presupuestos.data ?? [];
  const facs = facturas.data ?? [];

  const pendientes = pres.filter((p) => p.status !== "Aprobado").length;
  const cobrado    = facs.filter((f) => f.inv_status === "Cobrada").reduce((s, f) => s + Number(f.total_final ?? 0), 0);
  const porCobrar  = facs.filter((f) => f.inv_status !== "Cobrada").reduce((s, f) => s + Number(f.total_final ?? 0), 0);
  const recientes  = pres.slice(0, 3);

  return (
    <div>
      <header className="px-4 pb-16 pt-7" style={{ background: T.navy }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: T.textLight }}>
          DARIVO PRO
        </p>
        <h1 className="mt-1 text-2xl font-black" style={{ color: T.white }}>
          Hola 👋
        </h1>
        <p className="text-sm" style={{ color: T.slateDD }}>
          ¿Listo para tu próximo presupuesto?
        </p>
      </header>

      <div className="-mt-10 px-4">
        <Link
          href="/presupuestos/nuevo"
          className="pi flex items-center justify-between rounded-2xl p-5 shadow-lg"
          style={{ background: T.blue }}
        >
          <div>
            <div className="text-base font-extrabold" style={{ color: T.white }}>Nuevo presupuesto</div>
            <div className="text-xs" style={{ color: T.bluePale }}>Listo en menos de 60 segundos</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full text-2xl font-black" style={{ background: T.blueDark, color: T.white }}>
            +
          </div>
        </Link>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="su rounded-2xl p-3.5 shadow-sm" style={{ background: T.white }}>
            <div className="text-xl font-black" style={{ color: T.amber }}>{pendientes}</div>
            <div className="mt-0.5 text-[10px] font-bold uppercase" style={{ color: T.textMid }}>Pendientes</div>
          </div>
          <div className="su rounded-2xl p-3.5 shadow-sm" style={{ background: T.white }}>
            <div className="text-sm font-black" style={{ color: T.green }}>{fmtPEN(cobrado)}</div>
            <div className="mt-0.5 text-[10px] font-bold uppercase" style={{ color: T.textMid }}>Cobrado</div>
          </div>
          <div className="su rounded-2xl p-3.5 shadow-sm" style={{ background: T.white }}>
            <div className="text-sm font-black" style={{ color: T.blue }}>{fmtPEN(porCobrar)}</div>
            <div className="mt-0.5 text-[10px] font-bold uppercase" style={{ color: T.textMid }}>Por cobrar</div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-sm font-extrabold" style={{ color: T.text }}>Presupuestos recientes</h2>
          <Link href="/presupuestos" className="text-xs font-bold" style={{ color: T.blue }}>Ver todos →</Link>
        </div>

        <div className="mt-3 flex flex-col gap-2.5">
          {recientes.length === 0 && (
            <p className="fi py-6 text-center text-sm" style={{ color: T.textMid }}>
              Aún no tienes presupuestos. ¡Crea el primero!
            </p>
          )}
          {recientes.map((p) => (
            <div key={p.id} className="su flex items-center justify-between rounded-2xl p-4 shadow-sm" style={{ background: T.white }}>
              <div>
                <div className="text-sm font-bold" style={{ color: T.text }}>{p.client_name}</div>
                <div className="text-xs" style={{ color: T.textMid }}>{p.status}</div>
              </div>
              <div className="text-sm font-black" style={{ color: T.navy }}>{fmtPEN(Number(p.total_final ?? 0))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
