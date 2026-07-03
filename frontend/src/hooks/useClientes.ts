// DARIVO PRO — Hook de clientes
"use client";
import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { soloDigitos } from "@/lib/utils";
import type { Cliente } from "@/types";

interface ClienteRow {
  id: string;
  nombre: string;
  telefono: string | null;
  ruc: string | null;
  direccion: string | null;
  ciudad: string | null;
  notas: string | null;
  created_at: string;
}

const mapRow = (row: ClienteRow): Cliente => ({
  id: row.id,
  nombre: row.nombre,
  telefono: row.telefono ?? undefined,
  ruc: row.ruc ?? undefined,
  direccion: row.direccion ?? undefined,
  ciudad: row.ciudad ?? undefined,
  notas: row.notas ?? undefined,
  createdAt: row.created_at,
});

export function useClientes() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const supabase = createClient();

  const listar = useCallback(async (): Promise<Cliente[]> => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nombre");
    setLoading(false);
    if (error) { setError(error.message); return []; }
    return ((data ?? []) as ClienteRow[]).map(mapRow);
  }, [supabase]);

  const crear = useCallback(async (cliente: Omit<Cliente, "id" | "createdAt">): Promise<Cliente | null> => {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); setError("Sesión expirada"); return null; }

    const tel = soloDigitos(cliente.telefono) || null;
    const { data, error } = await supabase
      .from("clientes")
      .insert({
        user_id: user.id,
        nombre: cliente.nombre,
        telefono: tel,
        ruc: cliente.ruc ?? null,
        direccion: cliente.direccion ?? null,
        ciudad: cliente.ciudad ?? null,
        notas: cliente.notas ?? null,
      })
      .select()
      .single();
    setLoading(false);
    if (error || !data) { setError(error?.message ?? "Error"); return null; }
    return mapRow(data as ClienteRow);
  }, [supabase]);

  const actualizar = useCallback(async (
    id: string,
    cliente: Partial<Omit<Cliente, "id" | "createdAt">>,
  ): Promise<Cliente | null> => {
    setLoading(true);
    setError(null);
    const patch: Record<string, unknown> = {};
    if (cliente.nombre    !== undefined) patch.nombre    = cliente.nombre;
    if (cliente.telefono  !== undefined) patch.telefono  = soloDigitos(cliente.telefono) || null;
    if (cliente.ruc       !== undefined) patch.ruc       = cliente.ruc       || null;
    if (cliente.direccion !== undefined) patch.direccion = cliente.direccion || null;
    if (cliente.ciudad    !== undefined) patch.ciudad    = cliente.ciudad    || null;
    if (cliente.notas     !== undefined) patch.notas     = cliente.notas     || null;

    const { data, error } = await supabase
      .from("clientes")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    setLoading(false);
    if (error || !data) { setError(error?.message ?? "Error"); return null; }
    return mapRow(data as ClienteRow);
  }, [supabase]);

  const eliminar = useCallback(async (id: string): Promise<boolean> => {
    const { error, count } = await supabase
      .from("clientes")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) { setError(error.message); return false; }
    // count === 0 means RLS blocked the delete silently — treat as failure
    if (count === 0) { setError("No tienes permiso para eliminar este cliente"); return false; }
    return true;
  }, [supabase]);

  return { loading, error, listar, crear, actualizar, eliminar };
}
