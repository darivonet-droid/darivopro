"use client";
import { GRADIENTS, RADII, SHADOWS, T } from "@/lib/design-system/tokens";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  full?: boolean;
}

const ESTILOS: Record<Variant, React.CSSProperties> = {
  primary: {
    background: GRADIENTS.primary,
    color: T.white,
    boxShadow: SHADOWS.primaryBtn,
    fontWeight: 800,
  },
  secondary: { background: T.navy, color: T.white, fontWeight: 700 },
  ghost: {
    background: T.white,
    color: T.text,
    border: `1.5px solid ${T.slateD}`,
    fontWeight: 700,
  },
  danger: { background: T.redPale, color: T.red, fontWeight: 700 },
  success: {
    background: GRADIENTS.success,
    color: T.white,
    fontWeight: 800,
  },
};

/** Fable 5 §6.4 */
export function Button({ variant = "primary", full, style, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`pi text-sm transition-transform active:scale-95 disabled:opacity-50 ${full ? "w-full" : ""} ${props.className ?? ""}`}
      style={{
        borderRadius: RADII.buttonLg,
        padding: "14px 20px",
        ...ESTILOS[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
