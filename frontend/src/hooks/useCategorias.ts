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

  /** Edita el precio de una partida: base → precios_usuario; propia → partidas_propias. */
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
