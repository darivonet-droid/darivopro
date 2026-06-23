// DARIVO PRO — Historial de uso local (partidas recientes + último cliente)
"use client";

const RECENT_KEY  = "darivo_recent_items";
const CLIENT_KEY  = "darivo_last_client";
const MAX_ITEMS   = 30;

export interface RecentItem {
  svcId: string;
  catId: string;
  usedAt: number; // ms timestamp
  count:  number; // total uses
}

export interface LastClient {
  name:  string;
  phone: string;
  city:  string;
}

function safeRead<T>(key: string): T | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}
function safeWrite(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

export function useRecentItems() {
  const getAll = (): RecentItem[] => safeRead<RecentItem[]>(RECENT_KEY) ?? [];

  /** Registra las partidas usadas al guardar una cotización. */
  const trackItems = (items: { svcId: string; catId: string }[]) => {
    const now  = Date.now();
    const list = getAll();
    items.forEach(({ svcId, catId }) => {
      const idx = list.findIndex((r) => r.svcId === svcId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], usedAt: now, count: list[idx].count + 1 };
      } else {
        list.push({ svcId, catId, usedAt: now, count: 1 });
      }
    });
    list.sort((a, b) => b.usedAt - a.usedAt);
    safeWrite(RECENT_KEY, list.slice(0, MAX_ITEMS));
  };

  /** SvcIds ordenados por recencia (el más reciente primero). */
  const getRecentSvcIds = (): string[] => getAll().map((r) => r.svcId);

  /** CatId del capítulo usado más recientemente (para pre-abrir). */
  const getMostRecentCatId = (): string | null => getAll()[0]?.catId ?? null;

  /** Mapa catId → frecuencia total (para ordenar capítulos). */
  const getCatFrequency = (): Record<string, number> => {
    const map: Record<string, number> = {};
    getAll().forEach((r) => { map[r.catId] = (map[r.catId] ?? 0) + r.count; });
    return map;
  };

  // ── Último cliente ────────────────────────────────────────────
  const getLastClient = (): LastClient | null => safeRead<LastClient>(CLIENT_KEY);

  const saveLastClient = (client: LastClient) => {
    if (client.name.trim()) safeWrite(CLIENT_KEY, client);
  };

  return {
    trackItems,
    getRecentSvcIds,
    getMostRecentCatId,
    getCatFrequency,
    getLastClient,
    saveLastClient,
  };
}
