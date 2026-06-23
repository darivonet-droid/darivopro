// DARIVO PRO — Hook de presupuestos
"use client";
import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { verificarLimitePresupuesto } from "@/lib/plan-limits";
import type { Presupuesto, LineaPresupuesto } from "@/types";

interface ItemRow {
  svc_id: string;
  cat_label: string | null;
  svc_label: string | null;
  calc_type: string | null;
  base_price: number | null;
  unit: string | null;
  qty: number | null;
  unit_price: number | null;
  subtotal: number | null;
}

interface PresupuestoRow {
  id: string;
  user_id: string;
  cot_num: string | null;
  client_name: string;
  phone: string | null;
  city: string | null;
  margin: number | null;
  total_base: number | null;
  total_labor: number | null;
  total_final: number | null;
  status: Presupuesto["status"];
  notes: string | null;
  created_at: string;
  pdf_url: string | null;
  items?: ItemRow[];
}

const mapItem = (it: ItemRow): LineaPresupuesto => ({
  svcId: it.svc_id,
  catLabel: it.cat_label ?? "",
  svcLabel: it.svc_label ?? "",
  calcType: (it.calc_type as LineaPresupuesto["calcType"]) ?? "fixed",
  basePrice: Number(it.base_price ?? 0),
  unit: it.unit ?? "",
  qty: Number(it.qty ?? 0),
  unitPrice: Number(it.unit_price ?? 0),
  subtotal: Number(it.subtotal ?? 0),
});

const mapRow = (row: PresupuestoRow): Presupuesto => ({
  id: row.id,
  tenant_id: row.user_id,
  cotNum: row.cot_num ?? undefined,
  clientName: row.client_name,
  phone: row.phone ?? undefined,
  city: row.city ?? undefined,
  items: (row.items ?? []).map(mapItem),
  margin: Number(row.margin ?? 0),
  totalBase: Number(row.total_base ?? 0),
  totalLabor: Number(row.total_labor ?? 0),
  totalFinal: Number(row.total_final ?? 0),
  status: row.status,
  createdAt: row.created_at,
  notes: row.notes ?? undefined,
  pdfUrl: row.pdf_url ?? undefined,
});

export function usePresupuesto() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const supabase = createClient();

  const listar = useCallback(async (): Promise<Presupuesto[]> => {
    setLoading(true);
    const { data, error } = await supabase
      .from("presupuestos")
      .select("id, user_id, cot_num, client_name, phone, city, margin, total_base, total_labor, total_final, status, notes, created_at, pdf_url, items:presupuesto_items(svc_id, cat_label, svc_label, calc_type, base_price, unit, qty, unit_price, subtotal)")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) { setError(error.message); return []; }
    return ((data ?? []) as PresupuestoRow[]).map(mapRow);
  }, [supabase]);

  const crear = useCallback(async (
    presupuesto: Omit<Presupuesto, "id" | "tenant_id" | "createdAt">,
    onUpgrade?: (razon: import("@/lib/plan-limits").UpgradeRazon) => void
  ): Promise<Presupuesto | null> => {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); setError("Sesión expirada"); return null; }

    const limite = await verificarLimitePresupuesto(supabase);
    if (!limite.ok) {
      setLoading(false);
      setError("Límite de plan alcanzado");
      onUpgrade?.(limite.razon);
      return null;
    }

    const { data, error } = await supabase
      .from("presupuestos")
      .insert({
        user_id: user.id,
        client_name: presupuesto.clientName,
        phone: presupuesto.phone ?? null,
        city: presupuesto.city ?? null,
        margin: presupuesto.margin,
        total_base: presupuesto.totalBase,
        total_labor: presupuesto.totalLabor,
        total_final: presupuesto.totalFinal,
        status: presupuesto.status,
        notes: presupuesto.notes ?? null,
      })
      .select()
      .single();

    if (error || !data) { setLoading(false); setError(error?.message ?? "Error"); return null; }

    if (presupuesto.items.length > 0) {
      const { error: itemsError } = await supabase.from("presupuesto_items").insert(
        presupuesto.items.map((it) => ({
          presupuesto_id: data.id,
          svc_id: it.svcId,
          cat_label: it.catLabel,
          svc_label: it.svcLabel,
          calc_type: it.calcType,
          base_price: it.basePrice,
          unit: it.unit,
          qty: it.qty,
          unit_price: it.unitPrice,
          subtotal: it.subtotal,
        }))
      );
      if (itemsError) { setLoading(false); setError(itemsError.message); return null; }
    }

    setLoading(false);
    return mapRow({ ...(data as PresupuestoRow), items: [] });
  }, [supabase]);

  const actualizarEstado = useCallback(async (id: string, status: Presupuesto["status"]) => {
    const { error } = await supabase
      .from("presupuestos")
      .update({ status })
      .eq("id", id);
    if (error) setError(error.message);
    return !error;
  }, [supabase]);

  const eliminar = useCallback(async (id: string) => {
    const { error } = await supabase.from("presupuestos").delete().eq("id", id);
    if (error) setError(error.message);
    return !error;
  }, [supabase]);

  const generarPDF = useCallback(async (id: string): Promise<string | null> => {
    const res = await fetch(`/api/pdf/presupuesto/${id}`, { method: "POST" });
    if (!res.ok) { setError("No se pudo generar el PDF"); return null; }
    const json = await res.json();
    return json.data?.data?.url ?? json.data?.url ?? null;
  }, []);

  /**
   * Registra el snapshot de cálculo en la tabla calculos_log (Supabase).
   * Silencioso — nunca bloquea el guardado principal.
   */
  const registrarCalculo = useCallback(async (
    presupuestoId: string,
    calc: {
      totalMateriales: number;
      totalManoDeObra: number;
      totalBase:       number;
      totalMargen:     number;
      margin:          number;
      totalFinal:      number;
      itemCount:       number;
    }
  ): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("calculos_log").insert({
        user_id:          user.id,
        presupuesto_id:   presupuestoId,
        total_materiales: calc.totalMateriales,
        total_mano_obra:  calc.totalManoDeObra,
        total_base:       calc.totalBase,
        total_margen:     calc.totalMargen,
        margin_pct:       calc.margin,
        total_final:      calc.totalFinal,
        items_count:      calc.itemCount,
      });
    } catch (e) {
      console.warn("[registrarCalculo] no disponible aún:", e);
    }
  }, [supabase]);

  /**
   * Registra la fecha de apertura del enlace WhatsApp y guarda la URL del PDF.
   * Silencioso — no propaga errores (puede fallar si la migración aún no está aplicada).
   */
  const registrarEnvioWA = useCallback(async (
    id:      string,
    pdfUrl?: string
  ): Promise<void> => {
    try {
      await supabase
        .from("presupuestos")
        .update({
          wa_enviado_at: new Date().toISOString(),
          ...(pdfUrl ? { pdf_url: pdfUrl } : {}),
        })
        .eq("id", id);
    } catch (e) {
      console.warn("[registrarEnvioWA] no disponible aún:", e);
    }
  }, [supabase]);

  return { loading, error, listar, crear, actualizarEstado, eliminar, generarPDF, registrarCalculo, registrarEnvioWA };
}
