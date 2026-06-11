// DARIVO PRO — Estado vacío
import { T } from "@/lib/theme";

interface EmptyStateProps {
  emoji: string;
  titulo: string;
  descripcion: string;
  children?: React.ReactNode;
}

export function EmptyState({ emoji, titulo, descripcion, children }: EmptyStateProps) {
  return (
    <div className="fi flex flex-col items-center gap-2 py-16 text-center">
      <div className="text-5xl">{emoji}</div>
      <h3 className="mt-2 text-base font-extrabold" style={{ color: T.text }}>{titulo}</h3>
      <p className="max-w-[260px] text-sm" style={{ color: T.textMid }}>{descripcion}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
