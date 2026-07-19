"use client";
import { T } from "@/lib/design-system/tokens";

interface FloatBarProps {
  label: string;
  badge?: number;
  value?: string;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  onSecondary?: () => void;
  secondaryLabel?: string;
}

/** Fable 5 §6.12 — FloatBar (wizard cotización, fases Selección/Cantidades) */
export function FloatBar({
  label,
  badge,
  value,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  onSecondary,
  secondaryLabel = "✕",
}: FloatBarProps) {
  return (
    <div
      className="pi"
      style={{
        position: "fixed",
        // 20px de margen de siempre + el inset real de la barra de sistema
        // (gestos/navegación de Android, home indicator de iOS). Sin
        // safe-area (pantallas sin barra de gestos) env(...) resuelve a 0px,
        // así que queda igual que antes (20px).
        bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
        // Centrado con left/right/margin, NO con transform: la clase `.pi`
        // (globals.css) anima `transform` hasta `scale(1)` con fill-mode `both`,
        // y una animación CSS pisa el estilo inline — el `translateX(-50%)` que
        // había aquí quedaba anulado en cuanto terminaba la animación, dejando
        // la barra pegada al 50% de la pantalla y desbordando por la derecha.
        left: 0,
        right: 0,
        margin: "0 auto",
        width: "calc(100% - 28px)",
        maxWidth: 362,
        zIndex: 200,
      }}
    >
      <div style={{ background: T.navyLight, borderRadius: 18, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 10px 36px rgba(0,0,0,0.55)", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {badge != null && (
            <div style={{ width: 38, height: 38, borderRadius: 11, background: T.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: T.white, fontSize: 15, fontWeight: 900 }}>{badge}</span>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {value ? (
              <>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</p>
                <p style={{ color: T.white, fontSize: 16, fontWeight: 900, marginTop: 1 }}>{value}</p>
              </>
            ) : (
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</p>
            )}
          </div>
          {onSecondary && (
            <button onClick={onSecondary} style={{ background: "rgba(255,255,255,0.07)", border: "none", cursor: "pointer", borderRadius: 9, padding: "7px 10px", color: T.textLight, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
              {secondaryLabel}
            </button>
          )}
        </div>
        <button
          onClick={onPrimary}
          style={{ width: "100%", background: primaryDisabled ? T.slateD : `linear-gradient(135deg,${T.blue},${T.blueL})`, border: "none", cursor: "pointer", borderRadius: 13, padding: "12px 18px", color: T.white, fontSize: 14, fontWeight: 800, boxShadow: primaryDisabled ? "none" : `0 4px 16px ${T.blue}50` }}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
