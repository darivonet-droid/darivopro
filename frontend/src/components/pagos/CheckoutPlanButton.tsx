"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { T } from "@/lib/theme";
import type { PlanSuscripcionOficial } from "@/lib/roles-planes-oficial";
import type { CicloPago } from "@/lib/pagos-suscripcion";

interface CheckoutPlanButtonProps {
  plan: PlanSuscripcionOficial;
  ciclo?: CicloPago;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  outline?: boolean;
  invertido?: boolean;
  onIniciar?: () => void;
}

export function CheckoutPlanButton({
  plan,
  ciclo = "mensual",
  label = "Suscribirme",
  className = "",
  style,
  outline,
  invertido,
  onIniciar,
}: CheckoutPlanButtonProps) {
  const [cargando, setCargando] = useState(false);
  const mostrarToast = useAppStore((s) => s.mostrarToast);

  const iniciarCheckout = async () => {
    setCargando(true);
    onIniciar?.();
    try {
      const res = await fetch("/api/pagos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, ciclo }),
      });
      const json = await res.json();
      if (res.status === 401) {
        window.location.href = `/login?redirect=${encodeURIComponent("/precios")}`;
        return;
      }
      if (!res.ok) {
        mostrarToast(json.error ?? "No se pudo iniciar el pago", "error");
        return;
      }
      if (json.redirectUrl) {
        window.location.href = json.redirectUrl as string;
        return;
      }
      mostrarToast("Respuesta de pago incompleta", "error");
    } catch {
      mostrarToast("Error de conexión", "error");
    } finally {
      setCargando(false);
    }
  };

  const defaultStyle: React.CSSProperties = invertido
    ? { background: T.white, color: T.blue }
    : outline
    ? { background: "transparent", color: T.blue, border: `2px solid ${T.blue}` }
    : { background: T.blue, color: T.white };

  return (
    <button
      type="button"
      onClick={iniciarCheckout}
      disabled={cargando}
      className={`block w-full rounded-2xl py-3.5 text-center text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-60 ${className}`}
      style={{ ...defaultStyle, ...style }}
    >
      {cargando ? "Redirigiendo a dLocal…" : label}
    </button>
  );
}
