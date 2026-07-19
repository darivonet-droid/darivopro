// DARIVO PRO — Hook de facturas
"use client";
import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { verificarLimiteFactura, UPGRADE_MENSAJES } from "@/lib/plan-limits";
import { buildWAMessage, soloDigitos } from "@/lib/utils";
import type { EmpresaData, Factura, InvStatus, LineaFactura } from "@/types";

interface FacturaRow {
  inv_id: string;
  user_id: string;
  inv_num: string;
  inv_date: string;
  inv_status: InvStatus;
  tipo_doc: Factura["tipoDoc"] | null;
  cliente_id: string | null;
  client_name: string;
  client_ruc: string | null;
  client_dni: string | null;
  client_dir: string | null;
  moneda: Factura["moneda"];
  sym: string;
  items: LineaFactura[];
  subtotal_base: number | null;
  igv_amount: number | null;
  total_final: number | null;
  detraccion_tipo: string | null;
  detraccion_pct: number | null;
  detraccion_monto: number | null;
  neto_cobrar: number | null;
  cta_detracciones: string | null;
  from_quote_id: string | null;
  biz_data: EmpresaData | null;
}

const mapRow = (row: FacturaRow): Factura => ({
  invId: row.inv_id,
  tenant_id: row.user_id,
  invNum: row.inv_num,
  invDate: row.inv_date,
  invStatus: row.inv_status,
  tipoDoc: row.tipo_doc ?? "factura",
  clienteId: row.cliente_id ?? undefined,
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
    tipo: row.detraccion_tipo as import("@/types").TipoDetraccion,
    pct: Number(row.detraccion_pct ?? 0),
    monto: Number(row.detraccion_monto ?? 0),
    neto: Number(row.neto_cobrar ?? 0),
    ctaDetracciones: row.cta_detracciones ?? undefined,
  } : undefined,
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

  /**
   * Busca un cliente por teléfono normalizado y, si no existe, lo crea —
   * mismo patrón invisible que useCotizacion.findOrCreateCliente, para que
   * facturas.cliente_id use la misma fuente de verdad que cotizaciones.cliente_id.
   */
  const findOrCreateCliente = useCallback(async (
    userId:     string,
    clientName: string,
    phone?:     string,
  ): Promise<string | null> => {
    const tel = soloDigitos(phone);
    if (tel.length < 6) return null;

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
    factura: Omit<Factura, "invId" | "tenant_id"> & { clientPhone?: string },
    onUpgrade?: (razon: import("@/lib/plan-limits").UpgradeRazon) => void
  ): Promise<Factura | null> => {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); setError("Sesión expirada"); return null; }

    const limite = await verificarLimiteFactura(supabase);
    if (!limite.ok) {
      setLoading(false);
      setError(UPGRADE_MENSAJES[limite.razon].subtitulo);
      onUpgrade?.(limite.razon);
      return null;
    }

    // Vinculación factura → cliente: usa el cliente ya elegido explícitamente
    // (ficha de cliente, selector) o lo deduplica/crea por teléfono (invisible).
    const clienteId = factura.clienteId ?? await findOrCreateCliente(user.id, factura.clientName, factura.clientPhone);

    const { data, error } = await supabase
      .from("facturas")
      .insert({
        user_id: user.id,
        cliente_id: clienteId,
        inv_num: factura.invNum,
        inv_date: factura.invDate,
        inv_status: factura.invStatus,
        tipo_doc: factura.tipoDoc,
        client_name: factura.clientName,
        client_ruc: factura.clientRuc ?? null,
        client_dni: factura.clientDni ?? null,
        client_dir: factura.clientDir ?? null,
        moneda: factura.moneda,
        sym: factura.sym,
        items: factura.items,
        subtotal_base: factura.subtotalBase,
        igv_amount: factura.igvAmount,
        total_final: factura.totalFinal,
        detraccion_tipo: factura.detraccion?.tipo ?? null,
        detraccion_pct: factura.detraccion?.pct ?? null,
        detraccion_monto: factura.detraccion?.monto ?? null,
        neto_cobrar: factura.detraccion?.neto ?? null,
        cta_detracciones: factura.detraccion?.ctaDetracciones ?? null,
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
