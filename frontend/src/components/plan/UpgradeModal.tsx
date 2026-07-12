"use client";
import { useAppStore } from "@/store/useAppStore";
import { UPGRADE_MENSAJES, type UpgradeRazon } from "@/lib/plan-limits";
import { PRECIOS_OFICIALES } from "@/lib/roles-planes-oficial";
import { CheckoutPlanButton } from "@/components/pagos/CheckoutPlanButton";
import { T } from "@/lib/theme";

const PRO_FEATURES = [
  "Cotizaciones ilimitadas",
  "Facturas ilimitadas",
  "Calculadora inteligente texto + voz 🎤",
  "Logo personalizado",
  "Compartir WhatsApp",
];

export function UpgradeModal() {
  const upgrade = useAppStore((s) => s.upgrade);
  const cerrarUpgrade = useAppStore((s) => s.cerrarUpgrade);

  if (!upgrade?.abierto) return null;

  const msg = UPGRADE_MENSAJES[upgrade.razon as UpgradeRazon] ?? {
    titulo: "Mejora tu plan",
    subtitulo: "Desbloquea más funciones con DARIVO PRO.",
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-24 pt-8"
      style={{ background: "rgba(10,22,40,0.55)" }}
      onClick={cerrarUpgrade}
    >
      <div
        className="w-full max-w-[390px] rounded-2xl p-5"
        style={{ background: T.white, boxShadow: "0 12px 40px rgba(10,22,40,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg font-black" style={{ color: T.text }}>{msg.titulo}</p>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: T.textMid }}>
          {msg.subtitulo}
        </p>

        {/* Card Pro destacada */}
        <div
          className="relative mt-4 rounded-2xl p-4"
          style={{ background: T.blue, boxShadow: "0 6px 24px rgba(37,99,235,0.40)" }}
        >
          <span
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[9px] font-extrabold"
            style={{ background: T.white, color: T.blue }}
          >
            MÁS USADO
          </span>
          <p className="text-base font-black" style={{ color: T.white }}>
            {PRECIOS_OFICIALES.pro.nombre} · S/{PRECIOS_OFICIALES.pro.mensual}/mes
          </p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.92)" }}>
                ✅ {f}
              </li>
            ))}
          </ul>
          <CheckoutPlanButton
            plan="pro"
            label="Suscribirme a Pro"
            invertido
            onIniciar={cerrarUpgrade}
          />
        </div>

        <button
          type="button"
          onClick={cerrarUpgrade}
          className="mt-3 w-full py-2 text-sm font-semibold"
          style={{ color: T.textMid }}
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
