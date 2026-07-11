"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/lib/design-system/icons";
import { CIERRE_ACCENT, GRADIENTS, MOBILE_MAX_WIDTH, SHADOWS, T } from "@/lib/design-system/tokens";

/** Navegación oficial — 16-SISTEMA-DE-DISEÑO-FABLE5.md §6.7 · §7 */
const TABS_IZQ: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Inicio", icon: "home" },
  { href: "/clientes", label: "Clientes", icon: "users" },
];
const TABS_DER: { href: string; label: string; icon: IconName; match?: string[] }[] = [
  { href: "/facturas", label: "Facturas", icon: "receipt" },
  { href: "/cierre", label: "Cierre", icon: "brief" },
  { href: "/mas", label: "Más", icon: "gear", match: ["/mas", "/ajustes"] },
];

// Rutas de wizard a pantalla completa — el botón circular flotante (-top-5)
// se solapa con el FloatBar del wizard (bottom:20, zIndex:200). Ver auditoría
// del bug de overlap en /cotizaciones/nuevo (10/07/2026).
const RUTAS_SIN_NAV = ["/cotizaciones/nuevo"];

export function BottomNav() {
  const pathname = usePathname();
  if (RUTAS_SIN_NAV.some((r) => pathname.startsWith(r))) return null;

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex w-full -translate-x-1/2 items-end justify-between border-t px-0.5 pb-[env(safe-area-inset-bottom)]"
      style={{
        maxWidth: MOBILE_MAX_WIDTH,
        background: T.white,
        borderColor: T.slateD,
        boxShadow: SHADOWS.nav,
        paddingTop: 8,
        paddingBottom: 20,
      }}
    >
      <div className="flex flex-1 justify-around">
        {TABS_IZQ.map((t) => (
          <TabItem key={t.href} pathname={pathname} accent={T.blue} {...t} />
        ))}
      </div>

      <Link
        href="/ia"
        className="relative -top-5 mx-1 flex h-[56px] w-[56px] shrink-0 flex-col items-center justify-center rounded-full"
        style={{
          background: GRADIENTS.ia,
          boxShadow: `0 4px 20px ${T.purple}55`,
        }}
        aria-label="Asistente IA"
      >
        <Icon name="sparkle" size={20} color={T.white} />
        <span
          className="mt-0.5 text-[7px] font-extrabold tracking-wider"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          IA
        </span>
      </Link>

      <div className="flex flex-1 justify-around">
        {TABS_DER.map((t) => (
          <TabItem
            key={t.href}
            pathname={pathname}
            accent={t.href === "/cierre" ? CIERRE_ACCENT : T.blue}
            {...t}
          />
        ))}
      </div>
    </nav>
  );
}

function TabItem({
  href,
  label,
  icon,
  pathname,
  match,
  accent,
}: {
  href: string;
  label: string;
  icon: IconName;
  pathname: string;
  match?: string[];
  accent: string;
}) {
  const prefixes = match ?? [href];
  const activo = prefixes.some((p) => pathname.startsWith(p));
  const color = activo ? accent : T.textLight;
  return (
    <Link href={href} className="relative flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2">
      {activo && (
        <span
          className="absolute -top-2 rounded-sm"
          style={{ width: 28, height: 3, background: accent, borderRadius: 2 }}
        />
      )}
      <Icon name={icon} size={20} color={color} strokeWidth={activo ? 2.2 : 1.9} />
      <span
        className="text-[8px] leading-none"
        style={{ color, fontWeight: activo ? 800 : 500 }}
      >
        {label}
      </span>
    </Link>
  );
}
