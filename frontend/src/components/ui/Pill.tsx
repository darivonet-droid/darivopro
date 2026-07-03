import { chipBg } from "@/lib/design-system/tokens";

interface PillProps {
  label: string;
  color: string;
  sm?: boolean;
}

/** Fable 5 §6.5 — Pill / Badge */
export function Pill({ label, color, sm }: PillProps) {
  return (
    <span
      className="inline-block font-bold uppercase tracking-wide"
      style={{
        color,
        background: chipBg(color),
        borderRadius: 20,
        padding: sm ? "2px 8px" : "3px 11px",
        fontSize: sm ? 10 : 11,
      }}
    >
      {label}
    </span>
  );
}
