"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { T } from "@/lib/theme";

// Orden: Inicio | Clientes | [IA] | Facturas | Config
const TABS_IZQ = [
  { href: "/dashboard", label: "Inicio",   icono: IconoInicio   },
  { href: "/clientes",  label: "Clientes", icono: IconoClientes },
];
const TABS_DER = [
  { href: "/facturas",  label: "Facturas", icono: IconoFacturas },
  { href: "/ajustes",   label: "Config",   icono: IconoConfig   },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex w-full -translate-x-1/2 items-center justify-around border-t px-1 pb-[env(safe-area-inset-bottom)]"
      style={{
        maxWidth:    390,
        background:  T.white,
        borderColor: T.slateD,
        boxShadow:   "0 -2px 16px rgba(10,22,40,0.07)",
      }}
    >
      {TABS_IZQ.map((t) => (
        <TabItem key={t.href} pathname={pathname} {...t} />
      ))}

      {/* ── Botón IA central circular elevado ────────────── */}
      <Link
        href="/ia"
        className="relative -top-5 flex h-[58px] w-[58px] shrink-0 flex-col items-center justify-center rounded-full"
        style={{
          background:  `linear-gradient(135deg, ${T.blue}, ${T.blueL})`,
          boxShadow:   `0 4px 20px ${T.blue}55`,
        }}
        aria-label="Asistente IA"
      >
        <IconoIA />
        <span
          className="mt-0.5 text-[8px] font-extrabold tracking-wider"
          style={{ color: "rgba(255,255,255,0.80)" }}
        >
          IA
        </span>
      </Link>

      {TABS_DER.map((t) => (
        <TabItem key={t.href} pathname={pathname} {...t} />
      ))}
    </nav>
  );
}

/* ── Tab individual ─────────────────────────────────────────── */
function TabItem({
  href, label, icono: Icono, pathname,
}: {
  href:     string;
  label:    string;
  icono:    React.FC<IconoProps>;
  pathname: string;
}) {
  const activo = pathname.startsWith(href);
  const color  = activo ? T.blue : T.textLight;
  return (
    <Link href={href} className="flex flex-1 flex-col items-center gap-0.5 py-2.5">
      <Icono color={color} />
      <span className="text-[9px] font-bold" style={{ color }}>{label}</span>
    </Link>
  );
}

/* ── Iconos SVG ─────────────────────────────────────────────── */
interface IconoProps { color: string }
const SVG = {
  width: 21, height: 21, viewBox: "0 0 24 24", fill: "none",
  strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};

function IconoInicio({ color }: IconoProps) {
  return (
    <svg {...SVG} stroke={color}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
function IconoClientes({ color }: IconoProps) {
  return (
    <svg {...SVG} stroke={color}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" />
    </svg>
  );
}
function IconoFacturas({ color }: IconoProps) {
  return (
    <svg {...SVG} stroke={color}>
      <path d="M5 3h14v18l-2.3-1.5L14.4 21l-2.4-1.5L9.6 21l-2.3-1.5L5 21Z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}
function IconoConfig({ color }: IconoProps) {
  return (
    <svg {...SVG} stroke={color}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12c0-.4 0-.8-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.5a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.5h4l.4-2.5a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
    </svg>
  );
}
function IconoIA() {
  return (
    <svg
      width="22" height="22" viewBox="0 0 24 24"
      fill="none" stroke="white" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
    </svg>
  );
}
