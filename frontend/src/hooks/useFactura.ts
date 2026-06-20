// DARIVO PRO — Hook de facturas
"use client";
import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { verificarLimiteFactura } from "@/lib/plan-limits";
import { buildWAMessage } from "@/lib/utils";
import type { EmpresaData, Factura, LineaFactura } from "@/types";

interface FacturaRow {
  inv_id: string;
  user_id: string;
  inv_num: string;
  inv_date: string;
  inv_status: Factura["invStatus"];
  client_name: string;
  client_ruc: string | null;
  client_dir: string | null;
  moneda: Factura["moneda"];
  sym: string;
  items: LineaFactura[];
  subtotal_base: number | null;
  igv_amount: number | null;
  total_final: number | null;
  from_quote_id: string | null;
  biz_data: EmpresaData | null;
}

const mapRow = (row: FacturaRow): Factura => ({
  invId: row.inv_id,
  tenant_id: row.user_id,
  invNum: row.inv_num,
  invDate: row.inv_date,
  invStatus: row.inv_status,
  clientName: row.client_name,
  clientRuc: row.client_ruc ?? undefined,
  clientDir: row.client_dir ?? undefined,
  moneda: row.moneda ?? "PEN",
  sym: row.sym ?? "S/",
  items: row.items ?? [],
  subtotalBase: Number(row.subtotal_base ?? 0),
  igvAmount: Number(row.igv_amount ?? 0),
  totalFinal: Number(row.total_final ?? 0),
  fromQuoteId: row.from_quote_id ?? undefined,
  bizData: row.biz_data ?? { razonSocial: "", ruc: "", direccion: "", moneda: "PEN", simbolo: "S/" },
});

function buildWhatsAppDeepLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const num = digits.startsWith("51") ? digits : `51${digits}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function useFactura() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const supabase = createClient();

  const listar = useCallback(async (): Promise<Factura[]> => {
    setLoading(true);
    const { data, error } = await supabase
      .from("facturas")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) { setError(error.message); return []; }
    return ((data ?? []) as FacturaRow[]).map(mapRow);
  }, [supabase]);

  const crear = useCallback(async (
    factura: Omit<Factura, "invId" | "tenant_id">,
    onUpgrade?: (razon: import("@/lib/plan-limits").UpgradeRazon) => void
  ): Promise<Factura | null> => {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); setError("Sesión expirada"); return null; }

    const limite = await verificarLimiteFactura(supabase);
    if (!limite.ok) {
      setLoading(false);
      setError("Límite de facturas alcanzado");
      onUpgrade?.(limite.razon);
      return null;
    }

    const { data, error } = await supabase
      .from("facturas")
      .insert({
        user_id: user.id,
        inv_num: factura.invNum,
        inv_date: factura.invDate,
        inv_status: factura.invStatus,
        client_name: factura.clientName,
        client_ruc: factura.clientRuc ?? null,
        client_dir: factura.clientDir ?? null,
        moneda: factura.moneda,
        sym: factura.sym,
        items: factura.items,
        subtotal_base: factura.subtotalBase,
        igv_amount: factura.igvAmount,
        total_final: factura.totalFinal,
        from_quote_id: factura.fromQuoteId ?? null,
        biz_data: factura.bizData,
      })
      .select()
      .single();

    setLoading(false);
    if (error || !data) { setError(error?.message ?? "Error"); return null; }
    return mapRow(data as FacturaRow);
  }, [supabase]);

  const actualizarEstado = useCallback(async (invId: string, invStatus: Factura["invStatus"]) => {
    const { error } = await supabase
      .from("facturas")
      .update({ inv_status: invStatus })
      .eq("inv_id", invId);
    if (error) setError(error.message);
    return !error;
  }, [supabase]);

  const enviarWhatsApp = useCallback(async (factura: Factura, telefono: string, pdfUrl: string): Promise<string> => {
    const mensaje = buildWAMessage(
      factura.clientName,
      factura.items,
      { base: factura.subtotalBase, igv: factura.igvAmount, total: factura.totalFinal, sym: factura.sym },
      factura.bizData,
      factura.invNum
    );
    const fullMessage = `${mensaje}\n\nPDF: ${pdfUrl}`;
    return buildWhatsAppDeepLink(telefono, fullMessage);
  }, []);

  const generarPDF = useCallback(async (invId: string): Promise<string | null> => {
    const res = await fetch(`/api/pdf/factura/${invId}`, { method: "POST" });
    if (!res.ok) { setError("No se pudo generar el PDF"); return null; }
    const json = await res.json();
    return json.data?.data?.url ?? json.data?.url ?? null;
  }, []);

  return { loading, error, listar, crear, actualizarEstado, enviarWhatsApp, generarPDF };
}
