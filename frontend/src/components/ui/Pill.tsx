// DARIVO PRO — Pill de estado
interface PillProps {
  label: string;
  color: string;
}

export function Pill({ label, color }: PillProps) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
      style={{ color, background: `${color}1A` }}
    >
      {label}
    </span>
  );
}
