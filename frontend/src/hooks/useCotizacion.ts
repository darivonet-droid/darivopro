// DARIVO PRO — Hook de cotizaciones
"use client";
import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { verificarLimiteCotizacion } from "@/lib/plan-limits";
import { soloDigitos } from "@/lib/utils";
import type { Cotizacion, LineaCotizacion } from "@/types";

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

interface CotizacionRow {
  id: string;
  user_id: string;
  cot_num: string | null;
  cliente_id: string | null;
  client_name: string;
  phone: string | null;
  city: string | null;
  margin: number | null;
  total_base: number | null;
  total_labor: number | null;
  total_final: number | null;
  status: Cotizacion["status"];
  notes: string | null;
  created_at: string;
  pdf_url: string | null;
  items?: ItemRow[];
}

const mapItem = (it: ItemRow): LineaCotizacion => ({
  svcId: it.svc_id,
  catLabel: it.cat_label ?? "",
  svcLabel: it.svc_label ?? "",
  calcType: (it.calc_type as LineaCotizacion["calcType"]) ?? "fixed",
  basePrice: Number(it.base_price ?? 0),
  unit: it.unit ?? "",
  qty: Number(it.qty ?? 0),
  unitPrice: Number(it.unit_price ?? 0),
  subtotal: Number(it.subtotal ?? 0),
});

const mapRow = (row: CotizacionRow): Cotizacion => ({
  id: row.id,
  tenant_id: row.user_id,
  cotNum: row.cot_num ?? undefined,
  clienteId: row.cliente_id ?? undefined,
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

export function useCotizacion() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const supabase = createClient();

  /**
   * Busca un cliente por teléfono normalizado (solo dígitos) y, si no existe,
   * lo crea con nombre + teléfono. Devuelve el id del cliente o null si no hay
   * teléfono con el que deduplicar. Invisible para el usuario.
   */
  const findOrCreateCliente = useCallback(async (
    userId:     string,
    clientName: string,
    phone?:     string,
  ): Promise<string | null> => {
    const tel = soloDigitos(phone);
    if (tel.length < 6) return null; // sin teléfono fiable no deduplicamos

    const { data: existente } = await supabase
      .from("clientes")
      .select("id")
      .eq("user_id", userId)
      .eq("telefono", tel)
      .limit(1)
      .maybeSingle();
    if (existente?.id) return existente.id as string;

    const { data: creado, error: insErr } = await supabase
      .from("clientes")
      .insert({ user_id: userId, nombre: clientName.trim() || "Cliente", telefono: tel })
      .select("id")
      .single();

    // Si otro proceso lo creó a la vez (índice único), re-consultamos
    if (insErr) {
      const { data: reintento } = await supabase
        .from("clientes")
        .select("id")
        .eq("user_id", userId)
        .eq("telefono", tel)
        .limit(1)
        .maybeSingle();
      return (reintento?.id as string) ?? null;
    }
    return (creado?.id as string) ?? null;
  }, [supabase]);

  const listar = useCallback(async (): Promise<Cotizacion[]> => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cotizaciones")
      .select("id, user_id, cot_num, cliente_id, client_name, phone, city, margin, total_base, total_labor, total_final, status, notes, created_at, pdf_url, items:cotizacion_items(svc_id, cat_label, svc_label, calc_type, base_price, unit, qty, unit_price, subtotal)")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) { setError(error.message); return []; }
    return ((data ?? []) as CotizacionRow[]).map(mapRow);
  }, [supabase]);

  const crear = useCallback(async (
    cotizacion: Omit<Cotizacion, "id" | "tenant_id" | "createdAt">,
    onUpgrade?: (razon: import("@/lib/plan-limits").UpgradeRazon) => void
  ): Promise<Cotizacion | null> => {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); setError("Sesión expirada"); return null; }

    const limite = await verificarLimiteCotizacion(supabase);
    if (!limite.ok) {
      setLoading(false);
      setError("Límite de plan alcanzado");
      onUpgrade?.(limite.razon);
      return null;
    }

    // Auto-vinculación cotización → cliente (invisible)
    const clienteId = await findOrCreateCliente(user.id, cotizacion.clientName, cotizacion.phone);

    const { data, error } = await supabase
      .from("cotizaciones")
      .insert({
        user_id: user.id,
        cliente_id: clienteId,
        client_name: cotizacion.clientName,
        phone: cotizacion.phone ?? null,
        city: cotizacion.city ?? null,
        margin: cotizacion.margin,
        total_base: cotizacion.totalBase,
        total_labor: cotizacion.totalLabor,
        total_final: cotizacion.totalFinal,
        status: cotizacion.status,
        notes: cotizacion.notes ?? null,
      })
      .select()
      .single();

    if (error || !data) { setLoading(false); setError(error?.message ?? "Error"); return null; }

    if (cotizacion.items.length > 0) {
      const { error: itemsError } = await supabase.from("cotizacion_items").insert(
        cotizacion.items.map((it) => ({
          cotizacion_id: data.id,
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
    return mapRow({ ...(data as CotizacionRow), items: [] });
  }, [supabase]);

  /**
   * Actualiza una cotización existente: reemplaza campos y partidas.
   * El cot_num se preserva (el trigger solo asigna en INSERT).
   * Invalida el PDF cacheado (pdf_url → null) porque el contenido cambió.
   */
  const actualizar = useCallback(async (
    id: string,
    cotizacion: Omit<Cotizacion, "id" | "tenant_id" | "createdAt" | "cotNum">
  ): Promise<Cotizacion | null> => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    const clienteId = user
      ? await findOrCreateCliente(user.id, cotizacion.clientName, cotizacion.phone)
      : null;

    const { error: updErr } = await supabase
      .from("cotizaciones")
      .update({
        ...(clienteId ? { cliente_id: clienteId } : {}),
        client_name: cotizacion.clientName,
        phone:       cotizacion.phone       ?? null,
        city:        cotizacion.city        ?? null,
        margin:      cotizacion.margin,
        total_base:  cotizacion.totalBase,
        total_labor: cotizacion.totalLabor,
        total_final: cotizacion.totalFinal,
        status:      cotizacion.status,
        notes:       cotizacion.notes       ?? null,
        pdf_url:     null,
      })
      .eq("id", id);

    if (updErr) { setLoading(false); setError(updErr.message); return null; }

    await supabase.from("cotizacion_items").delete().eq("cotizacion_id", id);

    if (cotizacion.items.length > 0) {
      const { error: itemsErr } = await supabase.from("cotizacion_items").insert(
        cotizacion.items.map((it) => ({
          cotizacion_id: id,
          svc_id:     it.svcId,
          cat_label:  it.catLabel,
          svc_label:  it.svcLabel,
          calc_type:  it.calcType,
          base_price: it.basePrice,
          unit:       it.unit,
          qty:        it.qty,
          unit_price: it.unitPrice,
          subtotal:   it.subtotal,
        }))
      );
      if (itemsErr) { setLoading(false); setError(itemsErr.message); return null; }
    }

    const { data } = await supabase
      .from("cotizaciones")
      .select("id, user_id, cot_num, client_name, phone, city, margin, total_base, total_labor, total_final, status, notes, created_at, pdf_url")
      .eq("id", id)
      .single();

    setLoading(false);
    return data ? mapRow({ ...(data as CotizacionRow), items: [] }) : null;
  }, [supabase]);

  const actualizarEstado = useCallback(async (id: string, status: Cotizacion["status"]) => {
    const { error } = await supabase
      .from("cotizaciones")
      .update({ status })
      .eq("id", id);
    if (error) setError(error.message);
    return !error;
  }, [supabase]);

  const eliminar = useCallback(async (id: string) => {
    const { error, count } = await supabase
      .from("cotizaciones")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) { setError(error.message); return false; }
    if (count === 0) { setError("No tienes permiso para eliminar esta cotización"); return false; }
    return true;
  }, [supabase]);

  const generarPDF = useCallback(async (id: string): Promise<string | null> => {
    const res = await fetch(`/api/pdf/cotizacion/${id}`, { method: "POST" });
    if (!res.ok) { setError("No se pudo generar el PDF"); return null; }
    const json = await res.json();
    return json.data?.data?.url ?? json.data?.url ?? null;
  }, []);

  /**
   * Registra el snapshot de cálculo en la tabla calculos_log (Supabase).
   * Silencioso — nunca bloquea el guardado principal.
   */
  const registrarCalculo = useCallback(async (
    cotizacionId: string,
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
        cotizacion_id:   cotizacionId,
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

  return { loading, error, listar, crear, actualizar, actualizarEstado, eliminar, generarPDF, registrarCalculo };
}
