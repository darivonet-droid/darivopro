"use client";

import { useState } from "react";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { CerrarSesionButton } from "@/components/CerrarSesionButton";
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

function iniciales(nombre: string): string {
  return nombre
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "P";
}

/** Card contenedor — mismo radio/borde/fondo que el resto de Admin (`ADMIN_COLORS`). */
function Card({
  icon,
  title,
  subtitle,
  children,
  className,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl p-5 ${className ?? ""}`}
      style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
    >
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
      <div className="mt-4">{children}</div>
    </section>
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

  // Solo PEN se suma directo — si algún día hay comisiones en otra moneda,
  // mostrarlas por separado en vez de sumar montos de monedas distintas.
  const sumaPorEstado = (estado: "pendiente" | "pagada") =>
    comisiones
      .filter((c) => c.estado === estado && c.moneda === "PEN")
      .reduce((acc, c) => acc + c.monto, 0);
  const totalPendiente = sumaPorEstado("pendiente");
  const totalPagado = sumaPorEstado("pagada");

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
        className="flex items-center justify-between px-6 py-4"
        style={{ background: ADMIN_COLORS.headerBg, borderBottom: `1px solid ${ADMIN_COLORS.headerBorder}` }}
      >
        <div className="flex items-center gap-2.5">
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
          <div className="text-right">
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
          <CerrarSesionButton className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }} />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-6">
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

        {/* Sección 1 — Mi perfil / Mi enlace (PANEL-PARTNER.md §4) */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card icon="👤" title="Mi perfil">
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
            <dl className="mt-3 flex flex-col gap-2 border-t pt-3 text-sm" style={{ borderColor: ADMIN_COLORS.slateD }}>
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

          <Card icon="🔗" title="Mi enlace" subtitle="Comparte tu enlace personal e invita a más clientes.">
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
            <p className="mt-3 rounded-xl px-3 py-2 text-xs" style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}>
              El enlace es generado y administrado exclusivamente por Darivo Pro.
            </p>
          </Card>
        </div>

        {/* Sección 2 — Registros / Tabla oficial de comisiones (PANEL-PARTNER.md §4) */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card icon="📋" title="Registros" subtitle="Lista de correos registrados mediante tu enlace.">
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

          <Card icon="💰" title="Tabla oficial de comisiones" subtitle="Solo lectura — configurada desde Admin Partners.">
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
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full" style={{ background: ADMIN_COLORS.slate }}>
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
        </div>

        {/* Sección 3 — Mis comisiones (ledger personal, complementa la tabla oficial) */}
        <Card icon="💵" title="Mis comisiones" className="mb-4">
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

          {comisiones.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-2">
              {comisiones.map((c) => (
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
              Aún no tienes comisiones generadas.
            </p>
          )}
        </Card>

        {/* Sección 4 — Tiempos de pago (copy oficial, PANEL-PARTNER.md v1.2 § Tiempos de pago) */}
        <Card icon="⏱️" title="Tiempos de pago" className="mb-4">
          {/* Copy oficial — no modificar sin aprobación */}
          <p className="text-sm leading-relaxed" style={{ color: ADMIN_COLORS.textMid }}>
            Las comisiones se calculan sobre facturas ya cobradas a tus clientes referidos. Cada
            comisión pasa por un ciclo de verificación de pago antes de estar disponible para
            retiro — habitualmente entre 15 y 30 días desde que se generó. Una vez el pago esté
            listo, se transferirá a tu cuenta bancaria registrada en dLocal.
          </p>
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
      </div>
    </div>
  );
}
