// DARIVO PRO — Catálogo dinámico (base hardcodeado + overlay en Supabase) con Realtime
"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATALOGO } from "@/lib/catalog";
import type { Capitulo, Partida } from "@/types";

// ─── Module-level cache ───────────────────────────────────────────────────────
// Shared across ALL useCatalogo() instances in the same browser tab.
// Prevents N×3 Supabase queries and N Realtime subscriptions when multiple
// components consume the catalog simultaneously or on repeated navigation.
const _catalogCache = new Map<string, { data: Capitulo[]; ts: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

function _getCached(uid: string): Capitulo[] | null {
  const entry = _catalogCache.get(uid);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { _catalogCache.delete(uid); return null; }
  return entry.data;
}

function _setCache(uid: string, data: Capitulo[]): void {
  _catalogCache.set(uid, { data, ts: Date.now() });
}

function _invalidate(uid: string): void {
  _catalogCache.delete(uid);
}

interface CategoriaRow {
  cat_id: string;
  nombre: string;
  emoji: string | null;
  color: string | null;
  es_base: boolean;
  activa: boolean;
}

interface PartidaPropiaRow {
  id: string;
  cap_id: string;
  nombre: string;
  calc_type: Partida["calcType"];
  precio: number | string;
  unidad: string | null;
  activa: boolean;
}

interface PrecioRow {
  svc_id: string;
  precio: number | string;
}

const propiaALinea = (pp: PartidaPropiaRow): Partida => ({
  id: pp.id,
  nombre: pp.nombre,
  calcType: pp.calc_type,
  precio: Number(pp.precio),
  unidad: pp.unidad ?? "",
  esPropia: true,
});

/**
 * Devuelve el catálogo del usuario combinando:
 *  - CATALOGO base (hardcodeado)
 *  - overrides de categoría (nombre/emoji/color) y categorías nuevas → tabla `categorias`
 *  - precios personalizados → tabla `precios_usuario`
 *  - partidas propias → tabla `partidas_propias`
 * Se re-sincroniza en tiempo real ante cualquier cambio en esas 3 tablas.
 */
export function useCatalogo() {
  const [catalogo, setCatalogo] = useState<Capitulo[]>(CATALOGO);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setCatalogo(CATALOGO);
      setLoading(false);
      return;
    }

    // Return from module-level cache if still fresh (avoids N×3 Supabase queries)
    const cached = _getCached(user.id);
    if (cached) {
      setCatalogo(cached);
      setLoading(false);
      return;
    }

    const [{ data: cats }, { data: precios }, { data: propias }] = await Promise.all([
      supabase.from("categorias").select("cat_id, nombre, emoji, color, es_base, activa").eq("activa", true),
      supabase.from("precios_usuario").select("svc_id, precio"),
      supabase.from("partidas_propias").select("id, cap_id, nombre, calc_type, precio, unidad, activa").eq("activa", true),
    ]);

    const precioMap = new Map<string, number>(
      ((precios ?? []) as PrecioRow[]).map((p) => [p.svc_id, Number(p.precio)])
    );
    const overrideMap = new Map<string, CategoriaRow>(
      ((cats ?? []) as CategoriaRow[]).filter((c) => c.es_base).map((c) => [c.cat_id, c])
    );
    const propiasRows = (propias ?? []) as PartidaPropiaRow[];

    const merged: Capitulo[] = CATALOGO.map((cap) => {
      const ov = overrideMap.get(cap.id);
      const partidasBase: Partida[] = cap.partidas.map((p) => ({
        ...p,
        precio: precioMap.get(p.id) ?? p.precio,
      }));
      const propiasDeCap = propiasRows.filter((pp) => pp.cap_id === cap.id).map(propiaALinea);
      return {
        ...cap,
        nombre: ov?.nombre ?? cap.nombre,
        emoji: ov?.emoji ?? cap.emoji,
        color: ov?.color ?? cap.color,
        partidas: [...partidasBase, ...propiasDeCap],
      };
    });

    const nuevas: Capitulo[] = ((cats ?? []) as CategoriaRow[])
      .filter((c) => !c.es_base)
      .map((c) => ({
        id: c.cat_id,
        nombre: c.nombre,
        emoji: c.emoji ?? "🔧",
        color: c.color ?? "#2563EB",
        partidas: propiasRows.filter((pp) => pp.cap_id === c.cat_id).map(propiaALinea),
      }));

    const result = [...merged, ...nuevas];
    _setCache(user.id, result);   // store for sibling hook instances
    setCatalogo(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
    const supabase = createClient();

    // Invalidate module cache then re-fetch so all active hook instances get fresh data
    const onDbChange = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) _invalidate(user.id);
      cargar();
    };

    const channel = supabase
      .channel("catalogo-cambios")
      .on("postgres_changes", { event: "*", schema: "public", table: "categorias" }, onDbChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "precios_usuario" }, onDbChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "partidas_propias" }, onDbChange)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [cargar]);

  return { catalogo, loading, recargar: cargar };
}
