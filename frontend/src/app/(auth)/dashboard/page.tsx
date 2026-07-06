// DARIVO PRO — Dashboard
import Link from "next/link";
import { redirect } from "next/navigation";
import { fmtPEN } from "@/lib/utils";
import { CATEGORIAS } from "@/lib/catalog";
import { createServerClient } from "@/lib/supabase/server";
import { AccesoDenegadoBanner } from "@/components/acceso/AccesoDenegadoBanner";
import { T } from "@/lib/theme";

/* ─── Datos ─────────────────────────────────────────────────── */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { acceso?: string };
}) {
  const supabase = createServerClient();

  // Primer día del mes actual para filtrar ingresos del mes
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [
    { data: { user } },
    { data: perfil },
    { data: statsRaw },   // todos los presupuestos — solo id+status para conteos exactos
    { data: presRaw },    // últimos 5 para la lista visual
    { data: facsRaw },    // facturas del mes para ingresos
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("perfiles").select("razon_social, onboarding_done").single(),
    supabase.from("presupuestos").select("id, status"),
    supabase
      .from("presupuestos")
      .select("id, status, total_final, client_name, created_at, presupuesto_items(count)")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("facturas")
      .select("inv_status, total_final")
      .gte("created_at", inicioMes.toISOString()),
  ]);

  // Redirigir a onboarding si no lo completó (layout (auth) también lo aplica)
  if (!perfil?.onboarding_done) redirect("/onboarding/1");

  const stats     = statsRaw ?? [];
  const pres      = presRaw  ?? [];
  const facs      = facsRaw  ?? [];
  const nombre    = perfil?.razon_social || user?.email?.split("@")[0] || "Maestro";

  // Conteos calculados sobre el total real, no sobre los 5 de la lista
  const aprobados = stats.filter((p) => p.status === "Aprobado").length;
  const pendientes = stats.filter((p) => p.status === "Pendiente de firma").length;

  // Ingresos = facturas cobradas en el mes actual
  const ingresos  = facs
    .filter((f) => f.inv_status === "Cobrada")
    .reduce((s, f) => s + Number(f.total_final ?? 0), 0);
  const recientes = pres;

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFF" }}>

      {/* ══ HEADER NAVY ═══════════════════════════════════════ */}
      <header
        className="relative px-5 pb-20 pt-6"
        style={{
          background: `linear-gradient(160deg, ${T.navy} 0%, ${T.navyLight} 100%)`,
          borderBottomLeftRadius: 26,
          borderBottomRightRadius: 26,
          zIndex: 0,
        }}
      >
        {/* Badge esquina derecha */}
        <div className="absolute right-5 top-6">
          <span
            className="rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wider"
            style={{ background: T.blue, color: T.white }}
          >
            DARIVO PRO
          </span>
        </div>

        {/* Texto saludo */}
        <p className="text-xs font-semibold" style={{ color: T.textLight }}>
          ¡Hola de nuevo!
        </p>
        <h1 className="mt-1 text-2xl font-black leading-tight" style={{ color: T.white }}>
          {nombre}
        </h1>
        <p className="mt-1 text-2xl">👷‍♂️</p>
      </header>

      {/* ══ CONTENIDO ═════════════════════════════════════════ */}
      <div className="relative -mt-10 px-4" style={{ zIndex: 10 }}>
        <AccesoDenegadoBanner codigo={searchParams?.acceso} />

        {/* ── 3 tarjetas oscuras ─────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard valor={aprobados} label="Aprobados" color={T.green} />
          <StatCard valor={pendientes} label="Pendientes" color={T.amber} />
          <StatCard
            valor={fmtPEN(ingresos)}
            label="Ingresos mes"
            color={T.blueL}
            small
          />
        </div>

        {/* ── CTA azul grande ────────────────────────────────── */}
        <Link
          href="/presupuestos/nuevo"
          className="mt-4 flex items-center gap-4 rounded-2xl p-5"
          style={{
            background: T.blue,
            boxShadow: `0 6px 24px rgba(37,99,235,0.40)`,
          }}
        >
          {/* Ícono rayo */}
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            ⚡
          </div>
          {/* Texto */}
          <div className="flex-1">
            <p className="text-base font-extrabold leading-tight" style={{ color: T.white }}>
              Nueva cotización
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.70)" }}>
              Combina partidas · menos de 60 seg
            </p>
          </div>
          {/* Flecha */}
          <svg
            width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ opacity: 0.7 }}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        {/* Capítulos de obra */}
        <h2 className="mb-3 mt-6 text-sm font-extrabold" style={{ color: T.text }}>
          Capítulos de obra
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {CATEGORIAS.map((cat) => {
            const chip = DASHBOARD_CHIP[cat.id] ?? { bg: T.slate, color: T.textMid };
            return (
            <Link
              key={cat.id}
              href={`/presupuestos/nuevo?cat=${cat.id}`}
              className="flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-transform active:scale-95"
              style={{ background: chip.bg }}
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className="text-sm font-bold" style={{ color: chip.color }}>
                {cat.nombre}
              </span>
            </Link>
            );
          })}
        </div>

        {/* ── Últimos presupuestos ────────────────────────────── */}
        <div className="mb-3 mt-6 flex items-center justify-between">
          <h2 className="text-sm font-extrabold" style={{ color: T.text }}>
            Últimas cotizaciones
          </h2>
          <Link href="/presupuestos" className="text-xs font-bold" style={{ color: T.blue }}>
            Ver todos →
          </Link>
        </div>

        <div className="flex flex-col gap-2.5 pb-6">
          {recientes.length === 0 ? (
            <div className="rounded-2xl bg-white py-10 text-center shadow-sm">
              <p className="text-sm font-semibold" style={{ color: T.textMid }}>
                Aún no tienes cotizaciones
              </p>
              <p className="mt-1 text-xs" style={{ color: T.textLight }}>
                Crea el primero en menos de 60 seg ⚡
              </p>
            </div>
          ) : (
            recientes.map((p) => {
              const itemCount = (p as { presupuesto_items?: { count: number }[] })
                .presupuesto_items?.[0]?.count ?? 0;
              const fecha = new Date(p.created_at).toLocaleDateString("es-PE", {
                day: "numeric", month: "short",
              });
              return (
                <Link
                  key={p.id}
                  href={`/presupuestos`}
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm"
                >
                  <div className="flex-1 pr-3">
                    <p className="text-sm font-bold leading-snug" style={{ color: T.text }}>
                      {p.client_name}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: T.textMid }}>
                      {itemCount > 0 ? `${itemCount} partida${itemCount !== 1 ? "s" : ""}` : fecha}
                      {" · "}{fecha}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-sm font-extrabold" style={{ color: T.blue }}>
                      {fmtPEN(Number(p.total_final ?? 0))}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                </Link>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

/* ─── Componentes internos ─────────────────────────────────── */

function StatCard({
  valor, label, color, small = false,
}: {
  valor: string | number;
  label: string;
  color: string;
  small?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-1 rounded-2xl px-3.5 py-4"
      style={{ background: "#1a2535" }}
    >
      <span
        className={`font-black leading-none ${small ? "text-base" : "text-2xl"}`}
        style={{ color }}
      >
        {valor}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: T.textLight }}>
        {label}
      </span>
    </div>
  );
}

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  "Aprobado":          { bg: T.greenPale,  color: T.greenD,  label: "Aprobado"  },
  "Pendiente de firma":{ bg: T.amberPale,  color: T.amberD,  label: "Pendiente" },
  "Borrador":          { bg: T.slate,      color: T.textMid, label: "Borrador"  },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? STATUS_BADGE["Borrador"];
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

/* ─── Datos de categorías ──────────────────────────────────── */
/** Solo estilos visuales del chip en dashboard; nombres/emojis vienen de catalog.ts */
const DASHBOARD_CHIP: Record<string, { bg: string; color: string }> = {
  albanileria:   { bg: "#FEF3C7", color: "#92400E" },
  fontaneria:    { bg: "#D1FAE5", color: "#065F46" },
  electricidad:  { bg: "#FEF9C3", color: "#854D0E" },
  pintura:       { bg: "#FCE7F3", color: "#9D174D" },
  carpinteria:   { bg: "#FEF0E7", color: "#7C2D12" },
  climatizacion: { bg: "#EFF6FF", color: "#1E40AF" },
};
