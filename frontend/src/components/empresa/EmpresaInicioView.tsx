import Link from "next/link";
import { CATEGORIAS } from "@/lib/catalog";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/design-system/tokens";

type PresupuestoReciente = {
  id: string;
  client_name: string;
  total_final: number | null;
  status: string;
  created_at: string;
  itemCount: number;
};

interface Props {
  nombre: string;
  aprobados: number;
  pendientes: number;
  ingresos: number;
  recientes: PresupuestoReciente[];
}

const CHIP: Record<string, { bg: string; color: string }> = {
  albanileria: { bg: "#FEF3C7", color: "#92400E" },
  fontaneria: { bg: "#D1FAE5", color: "#065F46" },
  electricidad: { bg: "#FEF9C3", color: "#854D0E" },
  pintura: { bg: "#FCE7F3", color: "#9D174D" },
  carpinteria: { bg: "#FEF0E7", color: "#7C2D12" },
  climatizacion: { bg: "#EFF6FF", color: "#1E40AF" },
};

/** 02-MODULO-INICIO-EMPRESA.md — misma lógica Móvil, presentación escritorio */
export function EmpresaInicioView({
  nombre,
  aprobados,
  pendientes,
  ingresos,
  recientes,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold" style={{ color: T.textMid }}>
          ¡Hola de nuevo!
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-black" style={{ color: T.text }}>
            {nombre}
          </h2>
          <span
            className="rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wider text-white"
            style={{ background: T.blue }}
          >
            DARIVO PRO
          </span>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Aprobados" value={aprobados} color={T.green} />
        <KpiCard label="Pendientes" value={pendientes} color={T.amber} />
        <KpiCard label="Ingresos S/" value={fmtPEN(ingresos)} color={T.blue} small />
      </div>

      <Link
        href="/presupuestos/nuevo"
        className="flex items-center gap-4 rounded-2xl p-5"
        style={{ background: `linear-gradient(135deg, ${T.blue}, ${T.blueL})` }}
      >
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          ⚡
        </div>
        <div className="flex-1">
          <p className="text-base font-extrabold text-white">Nueva cotización</p>
          <p className="text-xs text-white/70">Combina partidas · menos de 60 seg</p>
        </div>
      </Link>

      <div className="grid gap-3 md:grid-cols-2">
        <QuickLink href="/empresa/clientes" label="Clientes" emoji="👥" />
        <QuickLink href="/empresa/cotizaciones" label="Cotizaciones" emoji="📋" />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-extrabold" style={{ color: T.text }}>
          Capítulos de obra
        </h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((cat) => {
            const chip = CHIP[cat.id] ?? { bg: T.slate, color: T.textMid };
            return (
              <Link
                key={cat.id}
                href={`/presupuestos/nuevo?cat=${cat.id}`}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
                style={{ background: chip.bg, color: chip.color }}
              >
                <span>{cat.emoji}</span>
                {cat.nombre}
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-extrabold" style={{ color: T.text }}>
            Últimas cotizaciones
          </h3>
          <Link href="/empresa/clientes" className="text-xs font-bold" style={{ color: T.blue }}>
            Ver todos →
          </Link>
        </div>
        {recientes.length === 0 ? (
          <p className="rounded-2xl py-8 text-center text-sm" style={{ color: T.textMid, background: T.slate }}>
            Aún no tienes cotizaciones
          </p>
        ) : (
          <AdminStyleTable recientes={recientes} />
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  color,
  small,
}: {
  label: string;
  value: string | number;
  color: string;
  small?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: T.white, border: `1px solid ${T.slateD}` }}
    >
      <p className="text-xs font-bold uppercase" style={{ color: T.textMid }}>
        {label}
      </p>
      <p
        className={`mt-2 font-black ${small ? "text-lg" : "text-2xl"}`}
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}

function QuickLink({ href, label, emoji }: { href: string; label: string; emoji: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl px-4 py-4"
      style={{ background: T.white, border: `1px solid ${T.slateD}` }}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-sm font-extrabold" style={{ color: T.text }}>
        {label}
      </span>
    </Link>
  );
}

function AdminStyleTable({ recientes }: { recientes: PresupuestoReciente[] }) {
  return (
    <div className="overflow-hidden rounded-2xl" style={{ border: `1px solid ${T.slateD}` }}>
      <table className="w-full text-left text-sm">
        <thead style={{ background: T.navyLight }}>
          <tr>
            {["Cliente", "Resumen", "Importe S/", "Estado"].map((h) => (
              <th key={h} className="px-4 py-3 text-xs font-bold text-white">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ background: T.white }}>
          {recientes.map((p) => (
            <tr key={p.id} style={{ borderTop: `1px solid ${T.slateD}` }}>
              <td className="px-4 py-3 font-bold" style={{ color: T.text }}>
                {p.client_name}
              </td>
              <td className="px-4 py-3" style={{ color: T.textMid }}>
                {p.itemCount > 0
                  ? `${p.itemCount} partida${p.itemCount !== 1 ? "s" : ""}`
                  : new Date(p.created_at).toLocaleDateString("es-PE")}
              </td>
              <td className="px-4 py-3 font-extrabold" style={{ color: T.blue }}>
                {fmtPEN(Number(p.total_final ?? 0))}
              </td>
              <td className="px-4 py-3">
                <StatusPill status={p.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    Aprobado: { bg: T.greenPale, color: T.greenD, label: "Aprobado" },
    "Pendiente de firma": { bg: T.amberPale, color: T.amberD, label: "Pendiente" },
    Borrador: { bg: T.slate, color: T.textMid, label: "Borrador" },
  };
  const s = map[status] ?? map.Borrador;
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
