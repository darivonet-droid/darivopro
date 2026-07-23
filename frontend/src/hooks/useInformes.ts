"use client";
// DARIVO PRO — Hook de datos para el módulo Informes
import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/* ─── Tipos ────────────────────────────────────────────────── */
export interface DatosSemana {
  cotizado:   number;
  facturado:  number;
  cobrado:    number;
  pendiente:  number;
  cotizadoPrev:  number;
  facturadoPrev: number;
  cobradoPrev:   number;
}

export interface SemanaBar {
  semana: string;
  monto:  number;
}

export interface ClienteTop {
  nombre: string;
  total:  number;
}

export interface DatosMes {
  barras:     SemanaBar[];
  totalMes:   number;
  totalPrev:  number;
  topClientes: ClienteTop[];
  igvAcum:    number;
}

export interface DatosAnual {
  totalFacturado:   number;
  totalCobrado:     number;
  pendienteCobro:   number;
  igvAcumulado:     number;
  numCotizaciones:  number;
  numFacturas:      number;
  tasaAprobacion:   number;
  clientePrincipal: string;
  categoriaTop:     string;
  empresa: {
    razonSocial: string;
    ruc:         string;
  };
}

/* ─── Utilidades de fechas ─────────────────────────────────── */
function startOfWeek(d: Date): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - r.getDay());
  r.setHours(0, 0, 0, 0);
  return r;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

/* ─── Hook ─────────────────────────────────────────────────── */
export function useInformes() {
  const supabase = createClient();

  const [semana,     setSemana]     = useState<DatosSemana     | null>(null);
  const [mes,        setMes]        = useState<DatosMes        | null>(null);
  const [anual,      setAnual]      = useState<DatosAnual      | null>(null);
  const [cargando,   setCargando]   = useState(false);

  /* ─── SEMANAL ─────────────────────────────────── */
  const cargarSemana = useCallback(async () => {
    setCargando(true);
    const hoy   = new Date();
    const sw    = startOfWeek(hoy);
    const swPrev = new Date(sw); swPrev.setDate(swPrev.getDate() - 7);
    const swEnd  = new Date(sw); swEnd.setDate(swEnd.getDate() + 7);

    const [presRes, facsRes, prevPresRes, prevFacsRes] = await Promise.all([
      supabase.from("cotizaciones").select("total_final").gte("created_at", sw.toISOString()).lt("created_at", swEnd.toISOString()),
      supabase.from("facturas").select("total_final, inv_status, created_at"),
      supabase.from("cotizaciones").select("total_final").gte("created_at", swPrev.toISOString()).lt("created_at", sw.toISOString()),
      supabase.from("facturas").select("total_final, inv_status, created_at").gte("created_at", swPrev.toISOString()).lt("created_at", sw.toISOString()),
    ]);

    const sum = (rows: { total_final?: number | null }[]) =>
      (rows ?? []).reduce((s, r) => s + Number(r.total_final ?? 0), 0);

    const facsEsta   = (facsRes.data ?? []).filter(f => new Date(f.created_at) >= sw && new Date(f.created_at) < swEnd);
    const facsPrev   = (prevFacsRes.data ?? []);

    const cotizado   = sum(presRes.data ?? []);
    const facturado  = sum(facsEsta);
    const cobrado    = sum(facsEsta.filter(f => f.inv_status === "Cobrada"));
    const pendiente  = sum(facsEsta.filter(f => f.inv_status === "Emitida"));

    setSemana({
      cotizado, facturado, cobrado, pendiente,
      cotizadoPrev:  sum(prevPresRes.data ?? []),
      facturadoPrev: sum(facsPrev),
      cobradoPrev:   sum(facsPrev.filter(f => f.inv_status === "Cobrada")),
    });
    setCargando(false);
  }, [supabase]);

  /* ─── MENSUAL ─────────────────────────────────── */
  const cargarMes = useCallback(async () => {
    setCargando(true);
    const hoy       = new Date();
    const smInicio  = startOfMonth(hoy);
    const smPrev    = startOfMonth(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1));
    const smPrevEnd = startOfMonth(hoy);

    const [facsRes, facsPrevRes, presAprobRes] = await Promise.all([
      supabase.from("facturas").select("total_final, inv_status, created_at").gte("created_at", smInicio.toISOString()),
      supabase.from("facturas").select("total_final, inv_status, created_at").gte("created_at", smPrev.toISOString()).lt("created_at", smPrevEnd.toISOString()),
      supabase.from("cotizaciones").select("client_name, total_final").eq("status", "Aprobado").gte("created_at", smInicio.toISOString()),
    ]);

    const facs     = facsRes.data     ?? [];
    const facsPrev = facsPrevRes.data ?? [];

    // Barras por semana del mes (hasta 5 semanas)
    const barras: SemanaBar[] = [];
    for (let w = 0; w < 5; w++) {
      const ws = new Date(smInicio); ws.setDate(ws.getDate() + w * 7);
      const we = new Date(ws);       we.setDate(we.getDate() + 7);
      const total = facs
        .filter(f => new Date(f.created_at) >= ws && new Date(f.created_at) < we)
        .reduce((s, f) => s + Number(f.total_final ?? 0), 0);
      if (ws < new Date(smInicio.getFullYear(), smInicio.getMonth() + 1, 1)) {
        barras.push({ semana: `S${w + 1}`, monto: total });
      }
    }

    // Top 3 clientes por monto aprobado
    const clienteMap: Record<string, number> = {};
    for (const p of (presAprobRes.data ?? [])) {
      clienteMap[p.client_name] = (clienteMap[p.client_name] ?? 0) + Number(p.total_final ?? 0);
    }
    const topClientes: ClienteTop[] = Object.entries(clienteMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([nombre, total]) => ({ nombre, total }));

    const totalMes  = facs.reduce((s, f) => s + Number(f.total_final ?? 0), 0);
    const totalPrev = facsPrev.reduce((s, f) => s + Number(f.total_final ?? 0), 0);
    const igvAcum   = Math.round(totalMes * 0.18 * 100) / 100;

    setMes({ barras, totalMes, totalPrev, topClientes, igvAcum });
    setCargando(false);
  }, [supabase]);

  /* ─── ANUAL ──────────────────────────────────── */
  const cargarAnual = useCallback(async () => {
    setCargando(true);
    const hoy   = new Date();
    const sy    = startOfYear(hoy);

    const [facsRes, presRes, perfilRes] = await Promise.all([
      supabase.from("facturas").select("total_final, inv_status, created_at").gte("created_at", sy.toISOString()),
      supabase.from("cotizaciones").select("status, client_name, total_final, cotizacion_items(cat_label)").gte("created_at", sy.toISOString()),
      supabase.from("perfiles").select("razon_social, ruc").single(),
    ]);

    const facs = facsRes.data ?? [];
    const pres = presRes.data ?? [];

    const totalFacturado  = facs.reduce((s, f) => s + Number(f.total_final ?? 0), 0);
    const totalCobrado    = facs.filter(f => f.inv_status === "Cobrada").reduce((s, f) => s + Number(f.total_final ?? 0), 0);
    const pendienteCobro  = facs.filter(f => f.inv_status === "Emitida").reduce((s, f) => s + Number(f.total_final ?? 0), 0);
    const igvAcumulado    = Math.round(totalFacturado * 0.18 * 100) / 100;

    const numCotizaciones = pres.length;
    const numFacturas     = facs.length;
    const numAprobados    = pres.filter(p => p.status === "Aprobado").length;
    const tasaAprobacion  = numCotizaciones > 0 ? Math.round((numAprobados / numCotizaciones) * 100) : 0;

    // Cliente principal (mayor monto en cotizaciones aprobadas)
    const clienteMap: Record<string, number> = {};
    for (const p of pres.filter(p => p.status === "Aprobado")) {
      clienteMap[p.client_name] = (clienteMap[p.client_name] ?? 0) + Number(p.total_final ?? 0);
    }
    const clientePrincipal = Object.entries(clienteMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    // Categoría más frecuente
    const catMap: Record<string, number> = {};
    for (const p of pres) {
      const items = (p as { cotizacion_items?: { cat_label?: string }[] }).cotizacion_items ?? [];
      for (const it of items) {
        const cat = it.cat_label ?? "Sin categoría";
        catMap[cat] = (catMap[cat] ?? 0) + 1;
      }
    }
    const categoriaTop = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    setAnual({
      totalFacturado, totalCobrado, pendienteCobro, igvAcumulado,
      numCotizaciones, numFacturas, tasaAprobacion,
      clientePrincipal, categoriaTop,
      empresa: {
        razonSocial: perfilRes.data?.razon_social ?? "Mi Empresa",
        ruc:         perfilRes.data?.ruc         ?? "",
      },
    });
    setCargando(false);
  }, [supabase]);

  return { semana, mes, anual, cargando, cargarSemana, cargarMes, cargarAnual };
}
