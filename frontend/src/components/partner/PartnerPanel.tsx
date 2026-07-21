"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ADMIN_COLORS, ADMIN_LAYOUT } from "@/lib/design-system/admin-tokens";
import { CerrarSesionButton } from "@/components/CerrarSesionButton";
import { SoporteTicketsView } from "@/components/soporte/SoporteTicketsView";
import { fmtPEN } from "@/lib/utils";
import {
  calcularProgresoHitos,
  type ComisionConfigRow,
  type PartnerRegistro,
} from "@/lib/partners-types";

interface PartnerPanelProps {
  nombre: string;
  email: string;
  telefono?: string;
  /** Registro sincronizado desde Admin (INC-A02 · servidor) */
  partner: PartnerRegistro | null;
  /** Plan de comisiones vigente — 06-PANEL-ADMIN-PARTNERS.md §5.1, editable desde Admin */
  comisionesConfig: ComisionConfigRow[];
}

const ESTADO_COLOR: Record<string, string> = {
  Activo: ADMIN_COLORS.greenD,
  Suspendido: ADMIN_COLORS.red,
  Pendiente: ADMIN_COLORS.amberD,
};

/** Navegación del Panel Partner — es una sola página (PANEL-PARTNER.md §4:
 *  "No existen menús internos ni módulos adicionales"), así que esto son
 *  anclas dentro de esa única página, no rutas nuevas. Orden reconfirmado por
 *  el propietario 17/07/2026: "Registro de referidos" pasa a ser la primera
 *  sección (antes iba 3ª); el resto conserva su orden relativo. "Tiempos de
 *  pago" se mantiene como última sección aunque no estaba en la lista
 *  original del 15/07/2026 porque el propio MD la exige como copy
 *  obligatorio de cara al usuario. */
const NAV_ITEMS = [
  { id: "registros", label: "Registro de referidos", icon: "📋" },
  { id: "mi-perfil", label: "Mi perfil", icon: "👤" },
  { id: "mi-enlace", label: "Mi enlace", icon: "🔗" },
  { id: "tabla-comisiones", label: "Tabla de comisiones", icon: "💰" },
  { id: "mis-comisiones", label: "Mis comisiones", icon: "💵" },
  { id: "tiempos-pago", label: "Tiempos de pago", icon: "⏱️" },
  // Etapa 7 (21/07/2026, decisión 5): extiende el sistema real de tickets ya
  // usado en Móvil/Empresa (soporte_tickets/soporte_mensajes, sin tabla ni
  // sistema nuevo) — el Panel Partner no tenía ninguna sección propia.
  { id: "soporte", label: "Soporte", icon: "🆘" },
] as const;

function iniciales(nombre: string): string {
  return (
    nombre
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "P"
  );
}

/** Card contenedor — mismo radio/borde/fondo que el resto de Admin (`ADMIN_COLORS`). */
function Card({
  id,
  icon,
  title,
  subtitle,
  children,
  className,
  headerExtra,
}: {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerExtra?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-nav-section={id}
      className={`scroll-mt-20 rounded-2xl p-5 ${className ?? ""}`}
      style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
            style={{ background: ADMIN_COLORS.purplePale }}
          >
            {icon}
          </span>
          <div>
            <h2 className="text-sm font-extrabold" style={{ color: ADMIN_COLORS.text }}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs" style={{ color: ADMIN_COLORS.textMid }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {headerExtra}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Rótulo de grupo — separa visualmente bloques de secciones relacionadas
 *  (ej. "Tu cuenta", "Comisiones") para que el panel se escanee por partes
 *  en vez de verse como una sola lista continua de tarjetas. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-2.5 px-1 text-[11px] font-extrabold uppercase tracking-wide"
      style={{ color: ADMIN_COLORS.textLight }}
    >
      {children}
    </p>
  );
}

export function PartnerPanel({ nombre, email, telefono, partner, comisionesConfig }: PartnerPanelProps) {
  const enlace = partner?.enlace ?? "https://darivopro.com/ref/—";
  const codigo = partner?.codigo ?? "—";
  const registros = partner?.registros ?? [];
  const comisiones = partner?.comisiones ?? [];
  const ventaConfig = comisionesConfig.find((c) => c.tipo === "venta");
  const hitosConfig = comisionesConfig
    .filter((c): c is ComisionConfigRow & { hito: number } => c.tipo === "hito" && c.hito !== null)
    .sort((a, b) => a.hito - b.hito)
    .map((c) => ({ hito: c.hito, bonoPorcentaje: c.porcentaje }));
  const progresoHitos = calcularProgresoHitos(registros.length, hitosConfig);
  const [copiado, setCopiado] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarCondiciones, setMostrarCondiciones] = useState(false);
  const [activeId, setActiveId] = useState<string>(NAV_ITEMS[0].id);
  const [periodo, setPeriodo] = useState<"mes" | "historico">("mes");

  // Resalta la sección visible en el sidebar mientras se hace scroll.
  useEffect(() => {
    const secciones = NAV_ITEMS.map((n) => document.getElementById(n.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (secciones.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );
    secciones.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const irASeccion = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuAbierto(false);
  };

  // Solo PEN se suma directo — si algún día hay comisiones en otra moneda,
  // mostrarlas por separado en vez de sumar montos de monedas distintas.
  const ahora = useRef(new Date()).current;
  const esEsteMes = (iso: string) => {
    const d = new Date(iso);
    return d.getFullYear() === ahora.getFullYear() && d.getMonth() === ahora.getMonth();
  };
  const comisionesPeriodo = useMemo(
    () => (periodo === "mes" ? comisiones.filter((c) => esEsteMes(c.createdAt)) : comisiones),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [comisiones, periodo]
  );
  const sumaPorEstado = (lista: typeof comisiones, estado: "pendiente" | "pagada") =>
    lista.filter((c) => c.estado === estado && c.moneda === "PEN").reduce((acc, c) => acc + c.monto, 0);
  const totalPendiente = sumaPorEstado(comisionesPeriodo, "pendiente");
  const totalPagado = sumaPorEstado(comisionesPeriodo, "pagada");

  const copiar = async () => {
    if (!partner) return;
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const primerNombre = nombre.split(" ")[0] || nombre;

  return (
    <div className="min-h-screen" style={{ background: ADMIN_COLORS.contentBg }}>
      {/* Header — mismo patrón visual que Admin/Empresa (logo + acento morado) */}
      <header
        className="flex items-center justify-between px-4 py-4 sm:px-6"
        style={{ background: ADMIN_COLORS.headerBg, borderBottom: `1px solid ${ADMIN_COLORS.headerBorder}` }}
      >
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg md:hidden"
            style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black"
            style={{ background: ADMIN_COLORS.purple, color: ADMIN_COLORS.white }}
          >
            D
          </span>
          <div>
            <p className="text-sm font-black leading-tight" style={{ color: ADMIN_COLORS.text }}>
              Darivo Pro
            </p>
            <p className="text-xs font-bold leading-tight" style={{ color: ADMIN_COLORS.purple }}>
              Partner
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold leading-tight" style={{ color: ADMIN_COLORS.text }}>
              {nombre}
            </p>
            {partner && (
              <p className="text-xs font-bold leading-tight" style={{ color: ESTADO_COLOR[partner.estado] }}>
                Partner {partner.estado.toLowerCase()}
              </p>
            )}
          </div>
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black"
            style={{ background: ADMIN_COLORS.purplePale, color: ADMIN_COLORS.purple }}
          >
            {iniciales(nombre)}
          </span>
          <CerrarSesionButton className="hidden text-xs font-bold sm:inline" style={{ color: ADMIN_COLORS.textMid }} />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar — desktop: fija a la izquierda. Móvil: overlay activado por el botón ☰. */}
        <aside
          className={`${menuAbierto ? "flex" : "hidden"} fixed inset-0 top-[65px] z-30 flex-col gap-1 overflow-y-auto p-4 md:sticky md:top-0 md:flex md:h-screen md:shrink-0`}
          style={{
            width: ADMIN_LAYOUT.sidebarWidth,
            background: ADMIN_COLORS.sidebarBg,
            borderRight: `1px solid ${ADMIN_COLORS.sidebarBorder}`,
          }}
        >
          {NAV_ITEMS.map((item) => {
            const activo = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  irASeccion(item.id);
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  background: activo ? ADMIN_COLORS.sidebarActiveBg : "transparent",
                  color: activo ? ADMIN_COLORS.sidebarActiveText : ADMIN_COLORS.sidebarTextMuted,
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
          <div className="mt-auto pt-6 sm:hidden">
            <CerrarSesionButton className="text-xs font-bold" style={{ color: ADMIN_COLORS.red }} />
          </div>
        </aside>
        {menuAbierto && (
          <div
            className="fixed inset-0 top-[65px] z-20 md:hidden"
            style={{ background: "rgba(15,23,42,0.35)" }}
            onClick={() => setMenuAbierto(false)}
          />
        )}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-5xl">
            {/* Bienvenida */}
            <div className="mb-5">
              <h1 className="text-xl font-black" style={{ color: ADMIN_COLORS.text }}>
                Bienvenido/a, {primerNombre} 👋
              </h1>
              <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>
                Consulta tu información y el rendimiento de tu enlace de invitación.
              </p>
            </div>

            {!partner && (
              <div
                className="mb-5 rounded-2xl px-4 py-3 text-xs font-bold"
                style={{ background: ADMIN_COLORS.amberPale, color: ADMIN_COLORS.amberD }}
              >
                Partner no registrado en Admin — solicite alta en Panel Administrador.
              </div>
            )}

            {/* Registro de referidos — primera sección del panel (pedido explícito
                del propietario 17/07/2026), ancho completo para que destaque. */}
            <Card
              id="registros"
              icon="📋"
              title="Registro de referidos"
              subtitle="Lista de correos registrados mediante tu enlace."
              className="mb-8"
            >
              <div className="rounded-xl px-3 py-2.5" style={{ background: ADMIN_COLORS.purplePale }}>
                <p className="text-[11px] font-bold uppercase" style={{ color: ADMIN_COLORS.purple }}>
                  Total de registros
                </p>
                <p className="text-2xl font-black" style={{ color: ADMIN_COLORS.purple }}>
                  {registros.length}
                </p>
              </div>
              {registros.length > 0 ? (
                <ul className="mt-3 flex max-h-64 flex-col gap-1.5 overflow-y-auto">
                  {registros.map((r, i) => (
                    <li
                      key={`${r.email}-${i}`}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm"
                      style={{ background: ADMIN_COLORS.slate }}
                    >
                      <span style={{ color: ADMIN_COLORS.text }}>{r.email}</span>
                      <span className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                        {r.fecha}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                  Aún no hay registros asociados a tu enlace.
                </p>
              )}
            </Card>

            {/* Tu cuenta: Mi perfil / Mi enlace */}
            <SectionLabel>Tu cuenta</SectionLabel>
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card id="mi-perfil" icon="👤" title="Mi perfil">
                <p className="text-base font-black" style={{ color: ADMIN_COLORS.text }}>
                  {nombre}
                </p>
                {partner && (
                  <span
                    className="mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={{
                      background: partner.estado === "Activo" ? ADMIN_COLORS.greenPale : ADMIN_COLORS.amberPale,
                      color: ESTADO_COLOR[partner.estado],
                    }}
                  >
                    Partner {partner.estado.toLowerCase()}
                  </span>
                )}
                <dl
                  className="mt-3 flex flex-col gap-2 border-t pt-3 text-sm"
                  style={{ borderColor: ADMIN_COLORS.slateD }}
                >
                  <div className="flex items-center gap-2">
                    <span>✉️</span>
                    <dd style={{ color: ADMIN_COLORS.text }}>{email}</dd>
                  </div>
                  {telefono && (
                    <div className="flex items-center gap-2">
                      <span>📱</span>
                      <dd style={{ color: ADMIN_COLORS.text }}>{telefono}</dd>
                    </div>
                  )}
                </dl>
              </Card>

              <Card
                id="mi-enlace"
                icon="🔗"
                title="Mi enlace"
                subtitle="Comparte tu enlace personal e invita a más clientes."
              >
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: ADMIN_COLORS.textMid }}>
                  Código del Partner
                </p>
                <p
                  className="mt-1 inline-block rounded-lg px-3 py-1.5 font-mono text-sm font-bold"
                  style={{ background: ADMIN_COLORS.purplePale, color: ADMIN_COLORS.purple }}
                >
                  {codigo}
                </p>
                <p className="mt-3 text-xs font-bold uppercase tracking-wide" style={{ color: ADMIN_COLORS.textMid }}>
                  Enlace de invitación
                </p>
                <p className="mt-1 break-all font-mono text-sm" style={{ color: ADMIN_COLORS.purple }}>
                  {enlace}
                </p>
                <button
                  type="button"
                  onClick={() => void copiar()}
                  disabled={!partner}
                  className="mt-3 rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50"
                  style={{ background: ADMIN_COLORS.purple, color: ADMIN_COLORS.white }}
                >
                  {copiado ? "Copiado ✓" : "Copiar enlace"}
                </button>
                <p
                  className="mt-3 rounded-xl px-3 py-2 text-xs"
                  style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}
                >
                  El enlace es generado y administrado exclusivamente por Darivo Pro.
                </p>
              </Card>
            </div>

            {/* Comisiones: Tabla de comisiones / Mis comisiones — agrupadas por
                tema (antes Tabla de comisiones iba junto a Registro de referidos,
                sin relación temática real). */}
            <SectionLabel>Comisiones</SectionLabel>
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card
                id="tabla-comisiones"
                icon="💰"
                title="Tabla de comisiones"
                subtitle="Solo lectura — configurada desde Admin Partners."
              >
                <p className="text-sm" style={{ color: ADMIN_COLORS.text }}>
                  Comisión por venta: <strong>{ventaConfig?.porcentaje ?? "—"}%, pago único</strong>, al
                  momento de la venta del cliente referido.
                </p>

                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <p className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
                      Progreso hacia tu próximo hito
                    </p>
                    <p className="text-xs font-bold" style={{ color: ADMIN_COLORS.purple }}>
                      {progresoHitos.clientes} de {progresoHitos.hitoSiguiente} clientes
                    </p>
                  </div>
                  <div
                    className="mt-2 h-2.5 w-full overflow-hidden rounded-full"
                    style={{ background: ADMIN_COLORS.slate }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${progresoHitos.progreso * 100}%`, background: ADMIN_COLORS.purple }}
                    />
                  </div>
                  <p className="mt-2 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                    {progresoHitos.faltantes > 0
                      ? `Te faltan ${progresoHitos.faltantes} clientes propios para tu siguiente bono.`
                      : "¡Hito alcanzado!"}
                  </p>
                </div>

                <table className="mt-4 w-full text-left text-sm">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${ADMIN_COLORS.slateD}` }}>
                      <th className="py-2 text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
                        Hito (clientes propios)
                      </th>
                      <th className="py-2 text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
                        Bono sobre ese tramo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {hitosConfig.map((h, i) => {
                      const esUltimo = i === hitosConfig.length - 1;
                      return (
                        <tr key={h.hito} style={{ borderBottom: `1px solid ${ADMIN_COLORS.slateD}` }}>
                          <td
                            className="py-2"
                            style={{
                              color: progresoHitos.hitoActual >= h.hito ? ADMIN_COLORS.purple : ADMIN_COLORS.text,
                              fontWeight: progresoHitos.hitoActual === h.hito ? 800 : 400,
                            }}
                          >
                            {esUltimo ? `${h.hito} y siguientes` : h.hito}
                            {progresoHitos.hitoActual >= h.hito && !esUltimo ? " ✓" : ""}
                          </td>
                          <td className="py-2 text-xs" style={{ color: ADMIN_COLORS.textMid }}>
                            {h.bonoPorcentaje}%{esUltimo ? " — techo permanente" : ""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>

              {/* Mis comisiones — con filtro de periodo (este mes / histórico) */}
              <Card
                id="mis-comisiones"
                icon="💵"
                title="Mis comisiones"
                subtitle="Detalle de lo ganado por periodo."
                headerExtra={
                <div className="flex gap-1 rounded-lg p-1" style={{ background: ADMIN_COLORS.slate }}>
                  {(["mes", "historico"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriodo(p)}
                      className="rounded-md px-2.5 py-1 text-xs font-bold transition-colors"
                      style={{
                        background: periodo === p ? ADMIN_COLORS.white : "transparent",
                        color: periodo === p ? ADMIN_COLORS.purple : ADMIN_COLORS.textMid,
                        boxShadow: periodo === p ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                      }}
                    >
                      {p === "mes" ? "Este mes" : "Histórico"}
                    </button>
                  ))}
                </div>
                }
              >
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl px-3 py-2.5" style={{ background: ADMIN_COLORS.amberPale }}>
                  <p className="text-[11px] font-bold uppercase" style={{ color: ADMIN_COLORS.amberD }}>
                    Pendiente
                  </p>
                  <p className="text-lg font-black" style={{ color: ADMIN_COLORS.amberD }}>
                    {fmtPEN(totalPendiente)}
                  </p>
                </div>
                <div className="rounded-xl px-3 py-2.5" style={{ background: ADMIN_COLORS.greenPale }}>
                  <p className="text-[11px] font-bold uppercase" style={{ color: ADMIN_COLORS.greenD }}>
                    Pagado
                  </p>
                  <p className="text-lg font-black" style={{ color: ADMIN_COLORS.greenD }}>
                    {fmtPEN(totalPagado)}
                  </p>
                </div>
              </div>

              {comisionesPeriodo.length > 0 ? (
                <ul className="mt-4 flex flex-col gap-2">
                  {comisionesPeriodo.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm"
                      style={{ background: ADMIN_COLORS.slate }}
                    >
                      <div>
                        <span style={{ color: ADMIN_COLORS.text }}>
                          {c.tipo === "venta" ? "Venta referida" : "Bono por hito"}
                        </span>
                        <span className="ml-2 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                          {new Date(c.createdAt).toLocaleDateString("es-PE")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: ADMIN_COLORS.text }}>
                          {c.moneda === "PEN" ? fmtPEN(c.monto) : `${c.moneda} ${c.monto}`}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{
                            background: c.estado === "pagada" ? ADMIN_COLORS.greenPale : ADMIN_COLORS.amberPale,
                            color: c.estado === "pagada" ? ADMIN_COLORS.greenD : ADMIN_COLORS.amberD,
                          }}
                        >
                          {c.estado === "pagada" ? "Pagada" : "Pendiente"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                  {periodo === "mes" ? "Aún no tienes comisiones este mes." : "Aún no tienes comisiones generadas."}
                </p>
              )}
              </Card>
            </div>

            {/* Tiempos de pago (copy oficial, PANEL-PARTNER.md v1.2 § Tiempos de pago) */}
            <Card id="tiempos-pago" icon="⏱️" title="Tiempos de pago" className="mb-8">
              {/* Copy oficial — no modificar sin aprobación */}
              <p className="text-sm leading-relaxed" style={{ color: ADMIN_COLORS.textMid }}>
                Las comisiones se calculan sobre facturas ya cobradas a tus clientes referidos. Cada
                comisión pasa por un ciclo de verificación de pago antes de estar disponible para
                retiro — habitualmente entre 15 y 30 días desde que se generó. Una vez el pago esté
                listo, se transferirá a tu cuenta bancaria registrada en dLocal.
              </p>

              {/* Condiciones y Uso de Partners — privado, solo visible aquí dentro
                  del Panel Partner logueado (Tarea 3, CLAUDE.md 17/07/2026). Nunca
                  una ruta pública, nunca linkeado desde darivopro.com. */}
              <button
                type="button"
                onClick={() => setMostrarCondiciones((v) => !v)}
                className="mt-4 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold"
                style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.purple }}
                aria-expanded={mostrarCondiciones}
              >
                Condiciones y Uso de Partners
                <span style={{ transform: mostrarCondiciones ? "rotate(180deg)" : "none" }}>▾</span>
              </button>

              {mostrarCondiciones && (
                <div
                  className="mt-3 rounded-xl p-4 text-sm leading-relaxed"
                  style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
                >
                  <ul className="flex flex-col gap-2.5" style={{ paddingLeft: 18, listStyle: "disc" }}>
                    <li>Ganas una comisión por cada cliente referido válido que se suscribe a Darivo Pro.</li>
                    <li>El pago se procesa vía dLocal el <strong>día 5 de cada mes</strong>.</li>
                    <li>Se requiere un <strong>mínimo de 3 clientes válidos</strong> para recibir tu primer pago.</li>
                    <li>
                      Un cliente se considera válido cuando está en un plan de pago y su cobro fue
                      procesado correctamente — se excluyen registros duplicados, cuentas canceladas y
                      casos identificados como fraudulentos.
                    </li>
                    <li>Beneficio de incorporación: <strong>S/89 de formación gratuita</strong> al activarte como Partner.</li>
                  </ul>
                  <p className="mt-3 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                    Documento interno, visible solo dentro de tu Panel Partner logueado — no se comparte
                    públicamente. Cualquier duda, escríbenos a partners@darivopro.com.
                  </p>
                </div>
              )}
            </Card>

            {/* Soporte — Etapa 7 (21/07/2026, decisión 5): mismo sistema real
                de tickets ya usado en Móvil/Empresa (soporte_tickets vía
                RLS auth.uid()=user_id, sin restricción de rol/plan). */}
            <SectionLabel>Ayuda</SectionLabel>
            <Card
              id="soporte"
              icon="🆘"
              title="Soporte"
              subtitle="Crea y consulta tus casos con el equipo Darivo."
              className="mb-8"
            >
              <SoporteTicketsView volverHref="#registros" volverLabel="↑ Volver arriba" embedded />
            </Card>

            {/* Banner de sincronización — PANEL-PARTNER.md §5 */}
            <div
              className="flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold"
              style={{ background: ADMIN_COLORS.purplePale, color: ADMIN_COLORS.purple }}
            >
              <span>🛡️</span>
              Toda la información mostrada proviene del Panel Administrador de Partners. Los datos se
              sincronizan automáticamente. No puedes modificar ninguna información.
            </div>

            <div className="mt-4 sm:hidden">
              <CerrarSesionButton className="text-xs font-bold" style={{ color: ADMIN_COLORS.red }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
