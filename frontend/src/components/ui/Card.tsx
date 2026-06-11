// DARIVO PRO — Tarjeta base
import { T } from "@/lib/theme";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`su rounded-2xl p-4 shadow-sm ${onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""} ${className}`}
      style={{ background: T.white }}
    >
      {children}
    </div>
  );
}
