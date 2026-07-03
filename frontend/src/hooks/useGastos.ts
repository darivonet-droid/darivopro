"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type EstadoGasto = "Aprobado" | "Pendiente";

export interface Gasto {
  id: string;
  proveedor: string;
  categoria: string;
  fecha: string;
  total: number;
  metodoPago: string;
  descripcion: string;
  estado: EstadoGasto;
  createdAt: string;
}

const STORAGE_PREFIX = "darivo_gastos_";

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (!user) {
        setListo(true);
        return;
      }
      setUserId(user.id);
      try {
        const raw = localStorage.getItem(storageKey(user.id));
        setGastos(raw ? (JSON.parse(raw) as Gasto[]) : []);
      } catch {
        setGastos([]);
      }
      setListo(true);
    });
  }, []);

  const persist = useCallback(
    (next: Gasto[]) => {
      setGastos(next);
      if (userId) localStorage.setItem(storageKey(userId), JSON.stringify(next));
    },
    [userId]
  );

  const agregarGasto = useCallback(
    (input: Omit<Gasto, "id" | "createdAt" | "estado"> & { estado?: EstadoGasto }) => {
      const nuevo: Gasto = {
        ...input,
        id: crypto.randomUUID(),
        estado: input.estado ?? "Aprobado",
        createdAt: new Date().toISOString(),
      };
      persist([nuevo, ...gastos]);
      return nuevo;
    },
    [gastos, persist]
  );

  const gastosDelMes = useCallback(
    (anio: number, mes: number) =>
      gastos.filter((g) => {
        const d = new Date(g.fecha);
        return d.getFullYear() === anio && d.getMonth() === mes;
      }),
    [gastos]
  );

  return { gastos, listo, agregarGasto, gastosDelMes };
}
