"use client";

import Link from "next/link";
import { useState } from "react";
import { T } from "@/lib/design-system/tokens";
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

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
          Darivo Pro Partner
        </p>
        <h1 className="text-2xl font-black" style={{ color: T.text }}>
          Panel Partner
        </h1>
      </header>

      <section
        className="mb-4 rounded-2xl p-5"
        style={{ background: T.white, border: `1px solid ${T.slateD}` }}
      >
        <h2 className="text-sm font-extrabold" style={{ color: T.text }}>
          Mi perfil
        </h2>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <div>
            <dt className="text-xs font-bold" style={{ color: T.textMid }}>
              Nombre
            </dt>
            <dd style={{ color: T.text }}>{nombre}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold" style={{ color: T.textMid }}>
              Correo
            </dt>
            <dd style={{ color: T.text }}>{email}</dd>
          </div>
          {telefono && (
            <div>
              <dt className="text-xs font-bold" style={{ color: T.textMid }}>
                Teléfono / WhatsApp
              </dt>
              <dd style={{ color: T.text }}>{telefono}</dd>
            </div>
          )}
        </dl>
        {partner ? (
          <p
            className="mt-3 text-xs font-bold"
            style={{
              color:
                partner.estado === "Activo"
                  ? T.greenD
                  : partner.estado === "Suspendido"
                    ? T.red
                    : T.amberD,
            }}
          >
            Estado: {partner.estado} — sincronizado con Admin
          </p>
        ) : (
          <p className="mt-3 text-xs" style={{ color: T.textLight }}>
            Partner no registrado en Admin — solicite alta en Panel Administrador.
          </p>
        )}
      </section>

      <section
        className="mb-4 rounded-2xl p-5"
        style={{ background: T.white, border: `1px solid ${T.slateD}` }}
      >
        <h2 className="text-sm font-extrabold" style={{ color: T.text }}>
          Mi enlace
        </h2>
        <p className="mt-2 text-xs font-bold" style={{ color: T.textMid }}>
          Código: {codigo}
        </p>
        <p className="mt-1 font-mono text-sm break-all" style={{ color: T.blue }}>
          {enlace}
        </p>
        <button
          type="button"
          onClick={() => void copiar()}
          disabled={!partner}
          className="mt-3 rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          style={{ background: T.blue }}
        >
          {copiado ? "Copiado ✓" : "Copiar enlace"}
        </button>
      </section>

      <section
        className="mb-4 rounded-2xl p-5"
        style={{ background: T.white, border: `1px solid ${T.slateD}` }}
      >
        <h2 className="text-sm font-extrabold" style={{ color: T.text }}>
          Registros
        </h2>
        <p className="mt-2 text-2xl font-black" style={{ color: T.text }}>
          {registros.length}
        </p>
        <p className="text-xs" style={{ color: T.textMid }}>
          Total de registros mediante su enlace
        </p>
        {registros.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2">
            {registros.map((r, i) => (
              <li
                key={`${r.email}-${i}`}
                className="rounded-xl px-3 py-2 text-sm"
                style={{ background: T.slate }}
              >
                <span style={{ color: T.text }}>{r.email}</span>
                <span className="ml-2 text-xs" style={{ color: T.textLight }}>
                  {r.fecha}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs" style={{ color: T.textLight }}>
            Aún no hay registros asociados a su enlace.
          </p>
        )}
      </section>

      <section
        className="mb-4 rounded-2xl p-5"
        style={{ background: T.white, border: `1px solid ${T.slateD}` }}
      >
        <h2 className="text-sm font-extrabold" style={{ color: T.text }}>
          Mis comisiones
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl px-3 py-2.5" style={{ background: T.amberPale }}>
            <p className="text-[11px] font-bold uppercase" style={{ color: T.amberD }}>
              Pendiente
            </p>
            <p className="text-lg font-black" style={{ color: T.amberD }}>
              {fmtPEN(totalPendiente)}
            </p>
          </div>
          <div className="rounded-xl px-3 py-2.5" style={{ background: T.greenPale }}>
            <p className="text-[11px] font-bold uppercase" style={{ color: T.greenD }}>
              Pagado
            </p>
            <p className="text-lg font-black" style={{ color: T.greenD }}>
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
                style={{ background: T.slate }}
              >
                <div>
                  <span style={{ color: T.text }}>
                    {c.tipo === "venta" ? "Venta referida" : "Bono por hito"}
                  </span>
                  <span className="ml-2 text-xs" style={{ color: T.textLight }}>
                    {new Date(c.createdAt).toLocaleDateString("es-PE")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: T.text }}>
                    {c.moneda === "PEN" ? fmtPEN(c.monto) : `${c.moneda} ${c.monto}`}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      background: c.estado === "pagada" ? T.greenPale : T.amberPale,
                      color: c.estado === "pagada" ? T.greenD : T.amberD,
                    }}
                  >
                    {c.estado === "pagada" ? "Pagada" : "Pendiente"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs" style={{ color: T.textLight }}>
            Aún no tienes comisiones generadas.
          </p>
        )}
      </section>

      <section
        className="mb-4 rounded-2xl p-5"
        style={{ background: T.white, border: `1px solid ${T.slateD}` }}
      >
        <h2 className="text-sm font-extrabold" style={{ color: T.text }}>
          Plan oficial de comisiones
        </h2>
        <p className="mb-4 text-xs" style={{ color: T.textMid }}>
          Solo lectura — configurado desde Admin Partners (Doc 06 §5.1).
        </p>

        <p className="text-sm" style={{ color: T.text }}>
          Comisión por venta: <strong>{ventaConfig?.porcentaje ?? "—"}%, pago único</strong>, al
          momento de la venta del cliente referido.
        </p>

        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-bold" style={{ color: T.textMid }}>
              Progreso hacia tu próximo hito
            </p>
            <p className="text-xs font-bold" style={{ color: T.blue }}>
              {progresoHitos.clientes} de {progresoHitos.hitoSiguiente} clientes
            </p>
          </div>
          <div
            className="mt-2 h-2.5 w-full overflow-hidden rounded-full"
            style={{ background: T.slate }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${progresoHitos.progreso * 100}%`, background: T.blue }}
            />
          </div>
          <p className="mt-2 text-xs" style={{ color: T.textLight }}>
            {progresoHitos.faltantes > 0
              ? `Te faltan ${progresoHitos.faltantes} clientes propios para tu siguiente bono.`
              : "¡Hito alcanzado!"}
          </p>
        </div>

        <table className="mt-5 w-full text-left text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.slateD}` }}>
              <th className="py-2 text-xs font-bold" style={{ color: T.textMid }}>
                Hito (clientes propios)
              </th>
              <th className="py-2 text-xs font-bold" style={{ color: T.textMid }}>
                Bono sobre ese tramo
              </th>
            </tr>
          </thead>
          <tbody>
            {hitosConfig.map((h, i) => {
              const esUltimo = i === hitosConfig.length - 1;
              return (
                <tr key={h.hito} style={{ borderBottom: `1px solid ${T.slateD}` }}>
                  <td
                    className="py-2"
                    style={{
                      color: progresoHitos.hitoActual >= h.hito ? T.blue : T.text,
                      fontWeight: progresoHitos.hitoActual === h.hito ? 800 : 400,
                    }}
                  >
                    {esUltimo ? `${h.hito} y siguientes` : h.hito}
                    {progresoHitos.hitoActual >= h.hito && !esUltimo ? " ✓" : ""}
                  </td>
                  <td className="py-2 text-xs" style={{ color: T.textMid }}>
                    {h.bonoPorcentaje}%{esUltimo ? " — techo permanente" : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section
        className="mb-4 rounded-2xl p-5"
        style={{ background: T.white, border: `1px solid ${T.slateD}` }}
      >
        <h2 className="text-sm font-extrabold" style={{ color: T.text }}>
          Tiempos de pago
        </h2>
        {/* Copy oficial — PANEL-PARTNER.md v1.2 § Tiempos de pago, no modificar sin aprobación */}
        <p className="mt-2 text-sm leading-relaxed" style={{ color: T.textMid }}>
          Las comisiones se calculan sobre facturas ya cobradas a tus clientes referidos. Cada
          comisión pasa por un ciclo de verificación de pago antes de estar disponible para
          retiro — habitualmente entre 15 y 30 días desde que se generó. Una vez el pago esté
          listo, se transferirá a tu cuenta bancaria registrada en dLocal.
        </p>
      </section>

      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm font-bold" style={{ color: T.blue }}>
          ← Volver a Móvil
        </Link>
        <CerrarSesionButton className="text-sm font-bold" style={{ color: T.red }} />
      </div>
    </div>
  );
}
