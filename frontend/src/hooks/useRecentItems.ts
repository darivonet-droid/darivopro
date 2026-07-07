// DARIVO PRO — Historial de uso local (partidas recientes + último cliente + historial por cliente)
"use client";

const RECENT_KEY         = "darivo_recent_items";
const CLIENT_KEY         = "darivo_last_client";
const CLIENT_HISTORY_KEY = "darivo_client_history_v1";
const MAX_ITEMS          = 30;
const MAX_CLIENTS        = 60;

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

/**
 * Historial de cotizaciones por cliente (almacenado en localStorage).
 * Permite reutilizar condiciones comerciales, observaciones, partidas y margen.
 */
export interface ClientHistoryEntry {
  key:         string;    // nombre normalizado (lowercase+trim) — clave de búsqueda
  displayName: string;    // nombre tal como lo escribió el usuario
  phone:       string;
  city:        string;
  margin:      number;    // último margen de beneficio usado con este cliente
  notes:       string;    // últimas observaciones usadas con este cliente
  svcIds:      string[];  // partidas del último cotizacion
  catIds:      string[];  // capítulos correspondientes (mismo orden que svcIds)
  lastUsedAt:  number;    // timestamp de la última cotización
  count:       number;    // número total de cotizaciones para este cliente
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

/** Normaliza un nombre de cliente para búsquedas insensibles a mayúsculas/tildes. */
function normalizeClientKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove diacritics
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

  // ── Historial por cliente ──────────────────────────────────────

  const getAllClientHistory = (): ClientHistoryEntry[] =>
    safeRead<ClientHistoryEntry[]>(CLIENT_HISTORY_KEY) ?? [];

  /**
   * Guarda o actualiza el historial de un cliente tras crear una cotización.
   * Conserva: margen, observaciones, partidas, capítulos, teléfono, ciudad.
   */
  const saveClientHistory = (
    name: string,
    data: { phone: string; city: string; margin: number; notes: string; svcIds: string[]; catIds: string[] }
  ) => {
    if (!name.trim()) return;
    const key  = normalizeClientKey(name);
    const list = getAllClientHistory();
    const idx  = list.findIndex((e) => e.key === key);
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        displayName: name,
        phone:       data.phone,
        city:        data.city,
        margin:      data.margin,
        notes:       data.notes,
        svcIds:      data.svcIds,
        catIds:      data.catIds,
        lastUsedAt:  Date.now(),
        count:       list[idx].count + 1,
      };
    } else {
      list.unshift({
        key,
        displayName: name,
        phone:       data.phone,
        city:        data.city,
        margin:      data.margin,
        notes:       data.notes,
        svcIds:      data.svcIds,
        catIds:      data.catIds,
        lastUsedAt:  Date.now(),
        count:       1,
      });
    }
    list.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
    safeWrite(CLIENT_HISTORY_KEY, list.slice(0, MAX_CLIENTS));
  };

  /**
   * Devuelve el historial de un cliente por nombre exacto (normalizado).
   * Retorna null si el cliente no tiene historial.
   */
  const getClientHistory = (name: string): ClientHistoryEntry | null => {
    if (!name.trim()) return null;
    const key = normalizeClientKey(name);
    return getAllClientHistory().find((e) => e.key === key) ?? null;
  };

  /**
   * Mapa catId → frecuencia de uso específica de un cliente.
   * Permite ordenar capítulos según lo que ese cliente suele pedir.
   */
  const getClientCatFrequency = (name: string): Record<string, number> => {
    const history = getClientHistory(name);
    if (!history) return {};
    const map: Record<string, number> = {};
    history.catIds.forEach((catId) => {
      map[catId] = (map[catId] ?? 0) + 1;
    });
    return map;
  };

  /**
   * Devuelve los N clientes más recientes (para sugerencias futuras).
   */
  const getTopClients = (n = 10): ClientHistoryEntry[] =>
    getAllClientHistory().slice(0, n);

  return {
    trackItems,
    getRecentSvcIds,
    getMostRecentCatId,
    getCatFrequency,
    getLastClient,
    saveLastClient,
    saveClientHistory,
    getClientHistory,
    getClientCatFrequency,
    getTopClients,
  };
}
