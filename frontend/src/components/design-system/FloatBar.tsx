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
      style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 28px)", maxWidth: 362, zIndex: 200 }}
    >
      <div style={{ background: T.navyLight, borderRadius: 18, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 10px 36px rgba(0,0,0,0.55)", display: "flex", alignItems: "center", gap: 10 }}>
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
        <button
          onClick={onPrimary}
          disabled={primaryDisabled}
          style={{ background: primaryDisabled ? T.slateD : `linear-gradient(135deg,${T.blue},${T.blueL})`, border: "none", cursor: primaryDisabled ? "default" : "pointer", borderRadius: 13, padding: "11px 18px", color: T.white, fontSize: 14, fontWeight: 800, boxShadow: primaryDisabled ? "none" : `0 4px 16px ${T.blue}50`, flexShrink: 0 }}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
