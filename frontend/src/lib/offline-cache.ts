const PREFIX = "darivo_cache_";

export function guardarListaCache<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function leerListaCache<T>(key: string): T[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T[] };
    return parsed.data ?? null;
  } catch {
    return null;
  }
}

export type NetworkQuality = "online" | "offline" | "slow";

export function detectarRed(): NetworkQuality {
  if (typeof navigator === "undefined") return "online";
  if (!navigator.onLine) return "offline";
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  const tipo = conn?.effectiveType ?? "";
  if (tipo === "2g" || tipo === "slow-2g" || tipo === "3g") return "slow";
  return "online";
}
