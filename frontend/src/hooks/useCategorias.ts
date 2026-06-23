// DARIVO PRO — CRUD de categorías y precios (overlay sobre catálogo base)
"use client";
import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CATALOGO,
  colorParaNuevaCategoria,
  EMOJI_CATEGORIA_DEFAULT,
  slugCategoria,
} from "@/lib/catalog";
import type { Capitulo, Partida } from "@/types";

const IDS_BASE = new Set(CATALOGO.map((c) => c.id));

export function useCategorias() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  /** Edita el nombre de una categoría (base → guarda override; nueva → actualiza fila). */
  const editarNombreCategoria = useCallback(
    async (cap: Capitulo, nuevoNombre: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        setError("Sesión expirada");
        return false;
      }
      const { error } = await supabase.from("categorias").upsert(
        {
          user_id: user.id,
          cat_id: cap.id,
          nombre: nuevoNombre.trim(),
          emoji: cap.emoji,
          color: cap.color,
          es_base: IDS_BASE.has(cap.id),
          activa: true,
        },
        { onConflict: "user_id,cat_id" }
      );
      setLoading(false);
      if (error) setError(error.message);
      return !error;
    },
    [supabase]
  );

  /** Edita el precio de una partida: base → precios_usuario; propia → partidas_propias.
   *  Registra el cambio en precios_historial para trazabilidad completa. */
  const editarPrecioPartida = useCallback(
    async (partida: Partida, precio: number): Promise<boolean> => {
      setLoading(true);
      setError(null);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        setError("Sesión expirada");
        return false;
      }

      // 1. Read current price before overwriting (for history record)
      let precioAnterior: number | null = null;
      if (partida.esPropia) {
        const { data } = await supabase
          .from("partidas_propias")
          .select("precio")
          .eq("id", partida.id)
          .eq("user_id", user.id)
          .single();
        precioAnterior = data ? Number(data.precio) : null;
      } else {
        const { data } = await supabase
          .from("precios_usuario")
          .select("precio")
          .eq("svc_id", partida.id)
          .eq("user_id", user.id)
          .maybeSingle();
        // If no override exists yet, the previous price is the catalog base price
        precioAnterior = data ? Number(data.precio) : partida.precio;
      }

      // 2. Persist the new price
      let error;
      if (partida.esPropia) {
        ({ error } = await supabase
          .from("partidas_propias")
          .update({ precio })
          .eq("id", partida.id)
          .eq("user_id", user.id));
      } else {
        ({ error } = await supabase
          .from("precios_usuario")
          .upsert({ user_id: user.id, svc_id: partida.id, precio }, { onConflict: "user_id,svc_id" }));
      }

      // 3. Record history (fire-and-forget; never blocks the main save)
      if (!error) {
        supabase
          .from("precios_historial")
          .insert({
            user_id:         user.id,
            svc_id:          partida.id,
            es_propia:       partida.esPropia ?? false,
            precio_anterior: precioAnterior,
            precio_nuevo:    precio,
          })
          .then(({ error: histErr }) => {
            if (histErr) console.warn("[precios_historial] no disponible aún:", histErr.message);
          });
      }

      setLoading(false);
      if (error) setError(error.message);
      return !error;
    },
    [supabase]
  );

  /** Crea una categoría nueva: solo nombre; color automático y emoji por defecto. */
  const crearCategoria = useCallback(
    async (nombre: string, coloresUsados: string[]): Promise<boolean> => {
      setLoading(true);
      setError(null);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        setError("Sesión expirada");
        return false;
      }
      const { error } = await supabase.from("categorias").insert({
        user_id: user.id,
        cat_id: slugCategoria(nombre),
        nombre: nombre.trim(),
        emoji: EMOJI_CATEGORIA_DEFAULT,
        color: colorParaNuevaCategoria(coloresUsados),
        es_base: false,
        activa: true,
      });
      setLoading(false);
      if (error) setError(error.message);
      return !error;
    },
    [supabase]
  );

  return { loading, error, editarNombreCategoria, editarPrecioPartida, crearCategoria };
}

// ─── Historial de precios ─────────────────────────────────────────────────────

export interface PrecioHistorialEntry {
  id:              string;
  svcId:           string;
  esPropia:        boolean;
  precioAnterior:  number | null;
  precioNuevo:     number;
  changedAt:       string;
}

/**
 * Devuelve el historial de cambios de precio de la empresa.
 * Ordenado del más reciente al más antiguo.
 * Uso futuro: informes de auditoría, análisis de evolución de precios.
 */
export function usePreciosHistorial() {
  const supabase = createClient();

  const obtener = useCallback(
    async (svcId?: string): Promise<PrecioHistorialEntry[]> => {
      let query = supabase
        .from("precios_historial")
        .select("id, svc_id, es_propia, precio_anterior, precio_nuevo, changed_at")
        .order("changed_at", { ascending: false })
        .limit(200);

      if (svcId) query = query.eq("svc_id", svcId);

      const { data, error } = await query;
      if (error) {
        console.warn("[usePreciosHistorial]", error.message);
        return [];
      }
      return (data ?? []).map((r) => ({
        id:             r.id,
        svcId:          r.svc_id,
        esPropia:       r.es_propia,
        precioAnterior: r.precio_anterior !== null ? Number(r.precio_anterior) : null,
        precioNuevo:    Number(r.precio_nuevo),
        changedAt:      r.changed_at,
      }));
    },
    [supabase]
  );

  return { obtener };
}
