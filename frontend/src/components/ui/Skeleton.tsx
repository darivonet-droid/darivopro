import { T } from "@/lib/theme";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{ background: T.bluePale, opacity: 0.85 }}
    />
  );
}

export function CotizacionIASkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <Skeleton className="h-5 w-2/3 animate-pulse" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <Skeleton className="h-10 flex-1 animate-pulse" />
          <Skeleton className="h-10 w-16 animate-pulse" />
        </div>
      ))}
      <Skeleton className="mt-2 h-12 w-full animate-pulse" />
    </div>
  );
}

export function ListaSkeleton({ filas = 5 }: { filas?: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: filas }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-4 shadow-sm">
          <Skeleton className="h-4 w-1/3 animate-pulse" />
          <Skeleton className="mt-2 h-5 w-2/3 animate-pulse" />
          <Skeleton className="mt-2 h-3 w-1/2 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
