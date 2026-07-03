"use client";
import { T } from "@/lib/design-system/tokens";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

/** Fable 5 §6.9 — Toggle */
export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative shrink-0 border-none p-0"
      style={{
        width: 46,
        height: 26,
        borderRadius: 13,
        background: checked ? T.blue : T.slateD,
        boxShadow: checked ? `0 0 0 3px ${T.blue}38` : "none",
        transition: "background 0.2s, box-shadow 0.2s",
        cursor: "pointer",
      }}
    >
      <span
        className="absolute top-[3px] block rounded-full bg-white transition-transform"
        style={{
          width: 20,
          height: 20,
          left: 3,
          transform: checked ? "translateX(20px)" : "translateX(0)",
          transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
    </button>
  );
}
