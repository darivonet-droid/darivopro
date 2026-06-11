"use client";
// DARIVO PRO — Botón del design system
import { T } from "@/lib/theme";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  full?: boolean;
}

const ESTILOS: Record<Variant, React.CSSProperties> = {
  primary:   { background: T.blue,      color: T.white },
  secondary: { background: T.navy,      color: T.white },
  ghost:     { background: T.white,     color: T.text, border: `1.5px solid ${T.slateD}` },
  danger:    { background: T.redPale,   color: T.red },
  success:   { background: T.green,     color: T.white },
};

export function Button({ variant = "primary", full, style, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`pi rounded-2xl px-5 py-3.5 text-sm font-bold transition-transform active:scale-95 disabled:opacity-50 ${full ? "w-full" : ""} ${props.className ?? ""}`}
      style={{ ...ESTILOS[variant], ...style }}
    >
      {children}
    </button>
  );
}
