"use client";
// DARIVO PRO — Navegación inferior (mobile-first)
import Link from "next/link";
import { usePathname } from "next/navigation";
import { T } from "@/lib/theme";

const TABS = [
  { href: "/dashboard",    label: "Inicio",       icono: IconoInicio },
  { href: "/presupuestos", label: "Presupuestos", icono: IconoPresupuesto },
  { href: "/facturas",     label: "Facturas",     icono: IconoFactura },
  { href: "/clientes",     label: "Clientes",     icono: IconoClientes },
  { href: "/ajustes",      label: "Ajustes",      icono: IconoAjustes },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex w-full -translate-x-1/2 items-stretch justify-around border-t px-1 pb-[env(safe-area-inset-bottom)]"
      style={{ maxWidth: 390, background: T.white, borderColor: T.slateD }}
    >
      {TABS.map(({ href, label, icono: Icono }) => {
        const activo = pathname.startsWith(href);
        const color = activo ? T.blue : T.textLight;
        return (
          <Link key={href} href={href} className="flex flex-1 flex-col items-center gap-0.5 py-2.5">
            <Icono color={color} />
            <span className="text-[9px] font-bold" style={{ color }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

interface IconoProps { color: string }
const base = { width: 21, height: 21, fill: "none", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function IconoInicio({ color }: IconoProps) {
  return <svg {...base} viewBox="0 0 24 24" stroke={color}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /></svg>;
}
function IconoPresupuesto({ color }: IconoProps) {
  return <svg {...base} viewBox="0 0 24 24" stroke={color}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></svg>;
}
function IconoFactura({ color }: IconoProps) {
  return <svg {...base} viewBox="0 0 24 24" stroke={color}><path d="M5 3h14v18l-2.3-1.5L14.4 21l-2.4-1.5L9.6 21l-2.3-1.5L5 21Z" /><path d="M9 8h6M9 12h6" /></svg>;
}
function IconoClientes({ color }: IconoProps) {
  return <svg {...base} viewBox="0 0 24 24" stroke={color}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" /></svg>;
}
function IconoAjustes({ color }: IconoProps) {
  return <svg {...base} viewBox="0 0 24 24" stroke={color}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.5a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.5h4l.4-2.5a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" /></svg>;
}
