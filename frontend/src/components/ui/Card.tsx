// DARIVO PRO — Tarjeta base — Fable 5 §6.3
import { RADII, T } from "@/lib/design-system/tokens";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", elevated, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`su ${onClick ? "cursor-pointer transition-transform active:scale-[0.98]" : ""} ${className}`}
      style={{
        background: T.white,
        border: `1px solid ${T.slateD}`,
        borderRadius: RADII.card,
        padding: "14px 16px",
        boxShadow: elevated ? "0 2px 16px rgba(10,22,40,0.08)" : undefined,
      }}
    >
      {children}
    </div>
  );
}
