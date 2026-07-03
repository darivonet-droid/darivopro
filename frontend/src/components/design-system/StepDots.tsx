import { T } from "@/lib/design-system/tokens";

interface StepDotsProps {
  current: number;
  total?: number;
}

/** Fable 5 §2.4 — StepDots (wizard cotización, 3 pasos) */
export function StepDots({ current, total = 3 }: StepDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="rounded-full transition-all"
          style={{
            width: i === current ? 22 : 8,
            height: 8,
            background: i <= current ? T.blue : T.slateD,
          }}
        />
      ))}
    </div>
  );
}
