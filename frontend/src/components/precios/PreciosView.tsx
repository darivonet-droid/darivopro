"use client";
import Link from "next/link";
import { useState } from "react";
import {
  PLANES,
  fmtPrecio,
  type CicloPrecio,
  type Plan,
} from "@/lib/planes";
import { CheckoutPlanButton } from "@/components/pagos/CheckoutPlanButton";
import { T } from "@/lib/theme";

function FeatureRow({ texto, incluido, invertido }: { texto: string; incluido: boolean; invertido?: boolean }) {
  const color = invertido
    ? "rgba(255,255,255,0.92)"
    : incluido
    ? T.text
    : T.textLight;
  return (
    <li className="flex items-start gap-2.5 text-sm" style={{ color }}>
      <span className="mt-0.5 shrink-0 text-base leading-none">{incluido ? "✅" : "❌"}</span>
      <span className={incluido ? "font-medium" : ""}>{texto}</span>
    </li>
  );
}

function PlanCard({ plan, ciclo, extraTop }: { plan: Plan; ciclo: CicloPrecio; extraTop?: boolean }) {
  const precio = ciclo === "mensual" ? plan.precioMensual : plan.precioAnual;
  const periodo = ciclo === "mensual" ? "/mes" : "/año";
  const invertido = plan.destacado;

  const cardStyle = invertido
    ? {
        background: T.blue,
        boxShadow: "0 8px 32px rgba(37,99,235,0.45)",
        border: "none",
      }
    : {
        background: T.white,
        boxShadow: "0 2px 16px rgba(10,22,40,0.08)",
        border: `1.5px solid ${T.slateD}`,
      };

  const tituloColor = invertido ? T.white : T.text;
  const precioColor = invertido ? T.white : T.blue;

  const btnClass =
    "block w-full rounded-2xl py-3.5 text-center text-sm font-bold transition-all active:scale-[0.98]";

  const btnStyle = invertido
    ? { background: T.white, color: T.blue }
    : plan.ctaOutline
    ? { background: "transparent", color: T.blue, border: `2px solid ${T.blue}` }
    : { background: T.blue, color: T.white };

  const ctaInner = plan.cta;

  return (
    <article className={`relative rounded-2xl p-5${extraTop ? " mt-2" : ""}`} style={cardStyle}>
      {plan.badge && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wide"
          style={{ background: T.white, color: T.blue }}
        >
          {plan.badge}
        </span>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-black" style={{ color: tituloColor }}>
          {plan.nombre}
        </h2>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-3xl font-black" style={{ color: precioColor }}>
            S/{fmtPrecio(precio)}
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: invertido ? "rgba(255,255,255,0.75)" : T.textMid }}
          >
            {periodo}
          </span>
        </div>
        {ciclo === "anual" && (
          <span
            className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold"
            style={{
              background: invertido ? "rgba(255,255,255,0.20)" : T.greenPale,
              color: invertido ? T.white : T.greenD,
            }}
          >
            2 meses gratis
          </span>
        )}
      </div>

      <ul className="mb-5 flex flex-col gap-2.5">
        {plan.features.map((f) => (
          <FeatureRow key={f.texto} texto={f.texto} incluido={f.incluido} invertido={invertido} />
        ))}
      </ul>

      {plan.ctaHref.startsWith("mailto:") ? (
        <a href={plan.ctaHref} className={btnClass} style={btnStyle}>
          {ctaInner}
        </a>
      ) : (
        <CheckoutPlanButton
          plan={plan.id}
          ciclo={ciclo}
          label={ctaInner}
          className={btnClass.replace("block ", "")}
          style={btnStyle}
          outline={plan.ctaOutline}
          invertido={invertido}
        />
      )}
    </article>
  );
}

export function PreciosView() {
  const [ciclo, setCiclo] = useState<CicloPrecio>("mensual");

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-black" style={{ color: T.text }}>
          Elige tu plan
        </h1>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: T.textMid }}>
          Cotizaciones y facturas para maestros de obra · Pagos seguros con dLocal
        </p>
      </div>

      {/* Toggle Mensual / Anual */}
      <div
        className="flex rounded-2xl p-1"
        style={{ background: T.white, border: `1.5px solid ${T.slateD}` }}
      >
        {(["mensual", "anual"] as const).map((c) => {
          const activo = ciclo === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCiclo(c)}
              className="relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold capitalize transition-colors"
              style={{
                background: activo ? T.blue : "transparent",
                color: activo ? T.white : T.textMid,
              }}
            >
              {c === "mensual" ? "Mensual" : "Anual"}
              {c === "anual" && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-extrabold leading-none"
                  style={{
                    background: activo ? "rgba(255,255,255,0.25)" : T.greenPale,
                    color: activo ? T.white : T.greenD,
                  }}
                >
                  2 meses gratis
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Apiladas en móvil, lado a lado desde escritorio (lg) */}
      <div className="grid grid-cols-1 gap-5 pt-1 lg:grid-cols-3 lg:items-start lg:gap-6 lg:pt-3">
        {PLANES.map((plan) => (
          <PlanCard key={plan.id} plan={plan} ciclo={ciclo} extraTop={!!plan.badge} />
        ))}
      </div>

      {/* Prueba gratuita al registrarse — no es plan comercial oficial */}
      <div
        className="rounded-2xl px-4 py-4 text-center"
        style={{ background: T.amberPale, border: `1.5px solid ${T.amber}44` }}
      >
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: T.amberD }}>
          Prueba gratuita
        </p>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: T.text }}>
          Solo al registrarte:{" "}
          <span className="font-bold">5 cotizaciones</span> y PDF con marca de agua DARIVO PRO.
        </p>
        <Link
          href="/registro"
          className="mt-3 inline-block text-sm font-bold"
          style={{ color: T.blue }}
        >
          Probar gratis →
        </Link>
      </div>
    </div>
  );
}
