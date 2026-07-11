import { T } from "@/lib/design-system/tokens";

interface StepDotsProps {
  current: number;
  total?: number;
}

/** Fable 5 §6.11 — StepDots (wizard cotización, 4 pasos, variante header oscuro) */
export function StepDots({ current, total = 4 }: StepDotsProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="transition-all"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            borderRadius: 3,
            background: i === current ? T.white : i < current ? T.green : "rgba(255,255,255,0.2)",
          }}
        />
      ))}
    </div>
  );
}
