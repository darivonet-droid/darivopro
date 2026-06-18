import { T } from "@/lib/theme";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ background: T.slateD }}
    />
  );
}

export function PresupuestoIASkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <Skeleton className="h-5 w-2/3" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-16" />
        </div>
      ))}
      <Skeleton className="mt-2 h-12 w-full" />
    </div>
  );
}
