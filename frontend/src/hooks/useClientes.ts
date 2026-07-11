// DARIVO PRO — Hook de clientes
"use client";
import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { soloDigitos } from "@/lib/utils";
import type { Cliente, Cotizacion, Factura, InvStatus, LineaCotizacion } from "@/types";

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

  /**
   * Ficha completa de un cliente (cliente + cotizaciones + facturas) —
   * misma consulta que `app/(auth)/clientes/[id]/page.tsx` (Server Component,
   * Móvil), pero client-side para el panel lateral de Empresa
   * (03-MODULO-CLIENTES-EMPRESA.md §4/§6 — panel sin navegar fuera del shell).
   * Respeta RLS igual que el resto de este hook (cliente autenticado del navegador).
   */
  const obtenerFicha = useCallback(async (
    id: string
  ): Promise<{ cliente: Cliente; cotizaciones: Cotizacion[]; facturas: Factura[] } | null> => {
    const { data: cliRow } = await supabase.from("clientes").select("*").eq("id", id).single();
    if (!cliRow) return null;
    const cliente = mapRow(cliRow as ClienteRow);

    const { data: presRows } = await supabase
      .from("cotizaciones")
      .select(
        "id, user_id, cot_num, client_name, phone, city, margin, total_base, total_labor, total_final, status, notes, created_at, pdf_url, items:cotizacion_items(svc_id, cat_label, svc_label, calc_type, base_price, unit, qty, unit_price, subtotal)"
      )
      .eq("cliente_id", id)
      .order("created_at", { ascending: false });

    const cotizaciones: Cotizacion[] = (presRows ?? []).map((row) => ({
      id: row.id,
      tenant_id: row.user_id,
      cotNum: row.cot_num ?? undefined,
      clientName: row.client_name,
      phone: row.phone ?? undefined,
      city: row.city ?? undefined,
      items: (row.items ?? []).map((it: Record<string, unknown>): LineaCotizacion => ({
        svcId: String(it.svc_id),
        catLabel: String(it.cat_label ?? ""),
        svcLabel: String(it.svc_label ?? ""),
        calcType: (it.calc_type ?? "fixed") as LineaCotizacion["calcType"],
        basePrice: Number(it.base_price ?? 0),
        unit: String(it.unit ?? ""),
        qty: Number(it.qty ?? 0),
        unitPrice: Number(it.unit_price ?? 0),
        subtotal: Number(it.subtotal ?? 0),
      })),
      margin: Number(row.margin ?? 0),
      totalBase: Number(row.total_base ?? 0),
      totalLabor: Number(row.total_labor ?? 0),
      totalFinal: Number(row.total_final ?? 0),
      status: row.status,
      createdAt: row.created_at,
      notes: row.notes ?? undefined,
      pdfUrl: row.pdf_url ?? undefined,
    }));

    const quoteIds = cotizaciones.map((p) => p.id);
    let facturas: Factura[] = [];
    if (quoteIds.length > 0) {
      const { data: facRows } = await supabase
        .from("facturas")
        .select("*")
        .in("from_quote_id", quoteIds)
        .order("created_at", { ascending: false });

      facturas = (facRows ?? []).map((row) => ({
        invId: row.inv_id,
        tenant_id: row.user_id,
        invNum: row.inv_num,
        invDate: row.inv_date,
        invStatus: row.inv_status as InvStatus,
        tipoDoc: row.tipo_doc ?? "factura",
        clientName: row.client_name,
        clientRuc: row.client_ruc ?? undefined,
        clientDni: row.client_dni ?? undefined,
        clientDir: row.client_dir ?? undefined,
        moneda: row.moneda ?? "PEN",
        sym: row.sym ?? "S/",
        items: row.items ?? [],
        subtotalBase: Number(row.subtotal_base ?? 0),
        igvAmount: Number(row.igv_amount ?? 0),
        totalFinal: Number(row.total_final ?? 0),
        detraccion: row.detraccion_tipo ? {
          tipo: row.detraccion_tipo,
          pct: Number(row.detraccion_pct ?? 0),
          monto: Number(row.detraccion_monto ?? 0),
          neto: Number(row.neto_cobrar ?? 0),
          ctaDetracciones: row.cta_detracciones ?? undefined,
        } : undefined,
        fromQuoteId: row.from_quote_id ?? undefined,
        bizData: row.biz_data ?? { razonSocial: "", ruc: "", direccion: "", moneda: "PEN", simbolo: "S/" },
      }));
    }

    return { cliente, cotizaciones, facturas };
  }, [supabase]);

  return { loading, error, listar, crear, actualizar, eliminar, obtenerFicha };
}
