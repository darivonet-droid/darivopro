"use client";
// DARIVO PRO — Lógica de negocio compartida del wizard de cotización
// (Móvil NuevoCotizacionWizard.tsx / Empresa NuevoCotizacionWizardEscritorio.tsx).
// 3 pasos: Selección+Cantidad (categoría → partidas con cantidad inline) →
// Resumen → Cliente. Antes eran 4 pasos con una pantalla "Cantidades" aparte;
// unificada dentro de "cats" (05-MODULO-COTIZACIONES.md, cambio de flujo 15/07/2026).
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCotizacion } from "@/hooks/useCotizacion";
import { useCotizacionDraft } from "@/hooks/useCotizacionDraft";
import { useCatalogo } from "@/hooks/useCatalogo";
import { useRecentItems } from "@/hooks/useRecentItems";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase/client";
import { cotizacionSchema } from "@/lib/validations";
import { buildWAMsgCotizacion } from "@/lib/utils";
import { calcBasket, saveCalcSnapshot, type CalcInput } from "@/lib/calc";
import { WIZARD_IA_SESSION_KEY } from "@/lib/cotizacion-ia";
import type { LineaCotizacion, Capitulo, Partida } from "@/types";

// Navegación Construcción → subcategorías (05 v1.6 · Doc 21 §15 — solo UI, cat_ids de catalog.ts)
export const CONSTRUCCION_ID = "construccion";
export const CONSTRUCCION_META = { id: CONSTRUCCION_ID, nombre: "Construcción", emoji: "🏗️", color: "#F59E0B" };
export const SUBCATEGORIAS_CONSTRUCCION = [{ id: "albanileria", nombre: "Albañilería", emoji: "🧱" }];
export const SUBCATEGORIAS_CONSTRUCCION_IDS = new Set(SUBCATEGORIAS_CONSTRUCCION.map((s) => s.id));

// Presets de cantidad por tipo (chips rápidos junto al input)
export const PRESETS: Record<string, number[]> = { m2: [5, 10, 15, 20, 30, 50, 80], unit: [1, 2, 3, 4, 5, 8, 10], hour: [1, 2, 4, 6, 8], fixed: [] };

export interface BasketItem {
  svcId: string;
  catLabel: string;
  svcLabel: string;
  calcType: LineaCotizacion["calcType"];
  basePrice: number;
  unit: string;
  qty: string;
  catColor: string;
  catEmoji: string;
}

// 3 pasos oficiales — antes 4 ("cantidades" se fusionó dentro de "cats")
export type CotizacionWizardPhase = "cats" | "resumen" | "cliente";

export function useCotizacionWizard() {
  const searchParams = useSearchParams();
  const { crear, actualizar, loading, generarPDF, registrarCalculo, registrarEnvioWA } = useCotizacion();
  const { catalogo } = useCatalogo();
  const {
    trackItems, getRecentSvcIds, getMostRecentCatId, getCatFrequency,
    getLastClient, saveLastClient,
    saveClientHistory, getClientHistory, getClientCatFrequency,
  } = useRecentItems();
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const mostrarUpgrade = useAppStore((s) => s.mostrarUpgrade);
  const supabase = createClient();

  const [phase, setPhase] = useState<CotizacionWizardPhase>("cats");
  const [selCat, setSelCat] = useState<string | null>(null);
  const [selSubCat, setSelSubCat] = useState<string | null>(null);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [margin, setMargin] = useState(40);
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [pdfUrlGuardado, setPdfUrlGuardado] = useState<string | null>(null);
  const [populated, setPopulated] = useState(false);

  // Draft restore
  const draftState = { clientName, phone, city, items: [], margin, notes, iaResult: null };
  const { limpiar } = useCotizacionDraft(draftState);

  // ── Catálogo ordenado por frecuencia global + boost por cliente ──────────
  const sortedCatalogo = useMemo(() => {
    if (!catalogo.length) return catalogo;

    const globalFreq = getCatFrequency();
    const recentSvcs = new Set(getRecentSvcIds().slice(0, 10));

    const clientFreq = clientName.trim() ? getClientCatFrequency(clientName.trim()) : {};
    const clientHistory = clientName.trim() ? getClientHistory(clientName.trim()) : null;
    const clientSvcs = new Set(clientHistory?.svcIds ?? []);

    const mergedFreq: Record<string, number> = { ...globalFreq };
    Object.entries(clientFreq).forEach(([catId, n]) => {
      mergedFreq[catId] = (mergedFreq[catId] ?? 0) + n * 3;
    });

    const prioritySvcs = new Set([...clientSvcs, ...recentSvcs]);

    return [...catalogo]
      .sort((a, b) => (mergedFreq[b.id] ?? 0) - (mergedFreq[a.id] ?? 0))
      .map((cap) => ({
        ...cap,
        partidas: [
          ...cap.partidas.filter((p) => prioritySvcs.has(p.id)),
          ...cap.partidas.filter((p) => !prioritySvcs.has(p.id)),
        ],
      }));
  }, [catalogo, clientName]); // eslint-disable-line react-hooks/exhaustive-deps

  const { construccionSubs, otrasCategorias } = useMemo(() => ({
    construccionSubs: sortedCatalogo.filter((c) => SUBCATEGORIAS_CONSTRUCCION_IDS.has(c.id)),
    otrasCategorias: sortedCatalogo.filter((c) => !SUBCATEGORIAS_CONSTRUCCION_IDS.has(c.id)),
  }), [sortedCatalogo]);
  const showConstruccion = construccionSubs.length > 0;

  // Categoría "activa" hoy en la vista de detalle (subcategoría de Construcción
  // si aplica, o la categoría de nivel superior elegida)
  const catActiva: Capitulo | null = selSubCat
    ? construccionSubs.find((c) => c.id === selSubCat) ?? null
    : selCat && selCat !== CONSTRUCCION_ID
    ? otrasCategorias.find((c) => c.id === selCat) ?? null
    : null;

  // ── Inicialización: ?cat=, ?from=<id>, o pre-abrir categoría reciente ────
  useEffect(() => {
    if (!catalogo.length || populated) return;
    setPopulated(true);

    const catParam = searchParams.get("cat");
    const fromParam = searchParams.get("from");
    const editarParam = searchParams.get("editar");
    const clienteParam = searchParams.get("cliente");
    const fromIA = searchParams.get("fromIA");

    // Handoff IA → basket precargado, se revisa dentro de "cats" (08-MODULO-IA.md §9)
    if (fromIA && typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem(WIZARD_IA_SESSION_KEY);
        if (raw) {
          const handoff = JSON.parse(raw) as { basket: BasketItem[]; notes?: string; margin?: number };
          if (handoff.basket?.length) {
            setBasket(handoff.basket);
            if (handoff.notes) setNotes(handoff.notes);
            if (handoff.margin != null) setMargin(handoff.margin);
          }
          sessionStorage.removeItem(WIZARD_IA_SESSION_KEY);
        }
      } catch { /* ignore */ }
      return;
    }

    // 0. Preseleccionar cliente (?cliente=<id> desde la ficha de cliente)
    if (clienteParam) {
      void (async () => {
        const { data } = await supabase
          .from("clientes")
          .select("nombre, telefono, ciudad")
          .eq("id", clienteParam)
          .single();
        if (!data) return;
        setClientName(String(data.nombre ?? ""));
        setPhone(String(data.telefono ?? ""));
        setCity(String(data.ciudad ?? ""));
      })();
    }

    // 1. Deep-link ?cat= (desde dashboard)
    if (catParam && catalogo.some((c) => c.id === catParam)) {
      if (SUBCATEGORIAS_CONSTRUCCION_IDS.has(catParam)) {
        setSelCat(CONSTRUCCION_ID);
        setSelSubCat(catParam);
      } else {
        setSelCat(catParam);
      }
      return;
    }

    // Helper: cargar cotizacion en el wizard (usado por ?from= y ?editar=)
    const cargarCotizacion = async (id: string, esEdicion: boolean) => {
      const { data } = await supabase
        .from("cotizaciones")
        .select("*, items:cotizacion_items(*)")
        .eq("id", id)
        .single();
      if (!data) return;
      const newBasket: BasketItem[] = (data.items ?? []).map((it: Record<string, unknown>) => {
        const cap = catalogo.find((c) => c.nombre === String(it.cat_label ?? ""))
          ?? catalogo.find((c) => c.partidas.some((p) => p.id === String(it.svc_id)));
        return {
          svcId: String(it.svc_id),
          catLabel: String(it.cat_label ?? ""),
          svcLabel: String(it.svc_label ?? ""),
          calcType: (it.calc_type as LineaCotizacion["calcType"]) ?? "fixed",
          basePrice: Number(it.base_price ?? 0),
          unit: String(it.unit ?? ""),
          qty: String(it.qty ?? (it.calc_type === "fixed" ? 1 : "")),
          catColor: cap?.color ?? "#2563EB",
          catEmoji: cap?.emoji ?? "📋",
        };
      });
      setBasket(newBasket);
      setMargin(Number(data.margin ?? 40));
      setClientName(String(data.client_name ?? ""));
      setPhone(String(data.phone ?? ""));
      setCity(String(data.city ?? ""));
      setNotes(String(data.notes ?? ""));
      if (esEdicion) setEditandoId(id);
      // Se queda en "cats" — el usuario abre cada categoría con badge para
      // revisar/ajustar cantidades ya precargadas (no se auto-abre ninguna).
    };

    // 2. Editar cotización existente (?editar=<id>)
    if (editarParam) {
      void cargarCotizacion(editarParam, true);
      return;
    }

    // 3. Re-usar cotización anterior (?from=<id>)
    if (fromParam) {
      void cargarCotizacion(fromParam, false);
      return;
    }

    // 4. Pre-abrir la categoría usada más recientemente
    const recentCat = getMostRecentCatId();
    if (recentCat && catalogo.some((c) => c.id === recentCat)) {
      setSelCat(recentCat);
    }

    // 5. Pre-rellenar datos del último cliente
    const lastClient = getLastClient();
    if (lastClient) {
      setClientName(lastClient.name);
      setPhone(lastClient.phone);
      setCity(lastClient.city);
    }
  }, [catalogo]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-apply client history when clientName matches a known client ───────
  useEffect(() => {
    if (phase !== "cliente" || saved) return;
    const name = clientName.trim();
    if (name.length < 2) return;
    const timer = setTimeout(() => {
      const history = getClientHistory(name);
      if (!history) return;
      setMargin((prev) => (prev === 40 ? history.margin : prev));
      setPhone((prev) => (prev.trim() ? prev : history.phone));
      setCity((prev) => (prev.trim() ? prev : history.city));
      setNotes((prev) => (prev.trim() ? prev : history.notes));
    }, 600);
    return () => clearTimeout(timer);
  }, [clientName, phase, saved]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Motor de cálculo robusto ───────────────────────────────────────────────
  const buildCalcInputs = (items: BasketItem[]): CalcInput[] =>
    items.map((it) => ({
      svcId: it.svcId,
      svcLabel: it.svcLabel,
      catLabel: it.catLabel,
      calcType: it.calcType,
      basePrice: it.basePrice,
      qty: it.calcType === "fixed" ? 1 : parseFloat(it.qty) || 0,
      unit: it.unit,
    }));

  const calcResult = calcBasket(buildCalcInputs(basket), margin);
  const totalMateriales = calcResult.totalMateriales;
  const totalManoDeObra = calcResult.totalManoDeObra;
  const totalBase = calcResult.totalBase;
  const totalLabor = calcResult.totalMargen;
  const totalFinal = calcResult.totalFinal;

  const calcItem = (it: BasketItem) => {
    const qty = it.calcType === "fixed" ? 1 : parseFloat(it.qty) || 0;
    return { qty, unitPrice: it.basePrice, subtotal: calcResult.items.find((ci) => ci.svcId === it.svcId)?.subtotal ?? qty * it.basePrice };
  };

  // Basket helpers
  const isSelected = (id: string) => basket.some((b) => b.svcId === id);

  // Partidas de precio fijo — toggle simple (sin cantidad, qty siempre "1")
  const toggleSvc = (cap: Capitulo, partida: Partida) => {
    if (isSelected(partida.id)) {
      setBasket((b) => b.filter((x) => x.svcId !== partida.id));
      return;
    }
    setBasket((b) => [...b, {
      svcId: partida.id,
      catLabel: cap.nombre,
      svcLabel: partida.nombre,
      calcType: partida.calcType,
      basePrice: partida.precio,
      unit: partida.unidad,
      qty: "1",
      catColor: cap.color,
      catEmoji: cap.emoji,
    }]);
  };

  // Partidas m2/unit/hour — cantidad escrita directamente en la fila, sin
  // paso de "Cantidades" aparte. Escribir 0/vacío quita la partida del carrito;
  // escribir un valor > 0 la agrega (si no estaba) o actualiza su cantidad.
  const setCantidad = (cap: Capitulo, partida: Partida, val: string) => {
    const q = parseFloat(val);
    setBasket((b) => {
      const idx = b.findIndex((x) => x.svcId === partida.id);
      if (!val || !(q > 0)) {
        return idx === -1 ? b : b.filter((x) => x.svcId !== partida.id);
      }
      if (idx === -1) {
        return [...b, {
          svcId: partida.id,
          catLabel: cap.nombre,
          svcLabel: partida.nombre,
          calcType: partida.calcType,
          basePrice: partida.precio,
          unit: partida.unidad,
          qty: val,
          catColor: cap.color,
          catEmoji: cap.emoji,
        }];
      }
      return b.map((x, i) => (i === idx ? { ...x, qty: val } : x));
    });
  };

  // Navegación categoría ↔ detalle (generaliza el patrón que ya existía solo
  // para la subcategoría de Construcción a cualquier categoría de nivel superior)
  const abrirCategoria = (id: string) => { setSelCat(id); setSelSubCat(null); };
  const abrirSubcategoria = (id: string) => { setSelSubCat(id); };
  const volverASubcategorias = () => { setSelSubCat(null); };
  const volverACategorias = () => { setSelCat(null); setSelSubCat(null); };

  // Completitud antes de pasar a Resumen — con cantidad inline esto ya es
  // prácticamente siempre true (setCantidad no deja qty inválido en el
  // carrito), salvo ítems precargados por edición/handoff IA sin revisar aún.
  const cantidadesCompleto = basket.every((it) => {
    if (it.calcType === "fixed") return true;
    const q = parseFloat(it.qty);
    return !!it.qty && q > 0;
  });

  const goToResumen = () => {
    if (!basket.length || !cantidadesCompleto) return;
    setPhase("resumen");
  };

  const goToCliente = () => {
    if (!cantidadesCompleto) return;
    setPhase("cliente");
  };

  const controlLabel = (calcType: LineaCotizacion["calcType"]) => {
    if (calcType === "m2") return "m²";
    if (calcType === "hour") return "Horas";
    if (calcType === "unit") return "Cantidad";
    return "";
  };

  // Save (crea nueva o actualiza existente según editandoId)
  const doSave = async () => {
    const calcInputs = buildCalcInputs(basket);
    const engineResult = calcBasket(calcInputs, margin);
    const items: LineaCotizacion[] = basket.map((it, idx) => {
      const ci = engineResult.items[idx];
      return {
        svcId: it.svcId,
        catLabel: it.catLabel,
        svcLabel: it.svcLabel,
        calcType: it.calcType,
        basePrice: it.basePrice,
        unit: it.unit,
        qty: ci.qty,
        unitPrice: ci.unitPrice,
        subtotal: ci.subtotal,
      };
    });
    const payload = { clientName: clientName.trim() || "Sin cliente", phone: phone.trim() || undefined, city: city.trim() || undefined, items, margin, totalBase, totalLabor, totalFinal, status: "Borrador" as const, notes: notes.trim() || undefined };
    const valido = cotizacionSchema.safeParse(payload);
    if (!valido.success) { mostrarToast(valido.error.errors[0]?.message ?? "Revisa los datos", "error"); return; }

    // ── MODO EDICIÓN: actualizar registro existente ────────────────────────
    if (editandoId) {
      const actualizado = await actualizar(editandoId, payload);
      if (!actualizado) { mostrarToast("No se pudo actualizar la cotización", "error"); return; }
      saveCalcSnapshot(engineResult);
      void registrarCalculo(editandoId, {
        totalMateriales: engineResult.totalMateriales,
        totalManoDeObra: engineResult.totalManoDeObra,
        totalBase: engineResult.totalBase,
        totalMargen: engineResult.totalMargen,
        margin: engineResult.margin,
        totalFinal: engineResult.totalFinal,
        itemCount: engineResult.items.length,
      });
      setSaved(true);
      mostrarToast(`${actualizado.cotNum ?? "Cotización"} actualizada ✓`);
      const url = await generarPDF(editandoId).catch(() => null);
      setPdfUrlGuardado(url);
      return;
    }

    // ── MODO CREACIÓN: crear nueva cotización ──────────────────────────────
    const creado = await crear(payload, mostrarUpgrade);
    if (!creado) { mostrarToast("No se pudo guardar la cotización", "error"); return; }

    saveCalcSnapshot(engineResult);
    void registrarCalculo(creado.id, {
      totalMateriales: engineResult.totalMateriales,
      totalManoDeObra: engineResult.totalManoDeObra,
      totalBase: engineResult.totalBase,
      totalMargen: engineResult.totalMargen,
      margin: engineResult.margin,
      totalFinal: engineResult.totalFinal,
      itemCount: engineResult.items.length,
    });

    const itemsWithCat = basket.map((b) => ({
      svcId: b.svcId,
      catId: catalogo.find((c) => c.partidas.some((p) => p.id === b.svcId))?.id ?? "",
    }));
    trackItems(itemsWithCat);
    saveLastClient({ name: clientName.trim(), phone: phone.trim(), city: city.trim() });
    saveClientHistory(clientName.trim(), {
      phone: phone.trim(),
      city: city.trim(),
      margin,
      notes: notes.trim(),
      svcIds: itemsWithCat.map((i) => i.svcId),
      catIds: itemsWithCat.map((i) => i.catId),
    });
    limpiar();
    setSaved(true);
    mostrarToast(`${creado.cotNum ?? "Cotización"} creada ✓`);

    const pdfUrl = await generarPDF(creado.id).catch(() => null);
    setPdfUrlGuardado(pdfUrl);

    // Auto-WhatsApp al crear (con PDF link incluido)
    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.length >= 7) {
      const groupedForWA = basket.reduce<Record<string, { svcLabel: string; calcType: string; qty: number; unitPrice: number; subtotal: number; unit: string }[]>>(
        (g, it) => {
          const calc = calcItem(it);
          (g[it.catLabel] = g[it.catLabel] || []).push({ svcLabel: it.svcLabel, calcType: it.calcType, qty: calc.qty, unitPrice: calc.unitPrice, subtotal: calc.subtotal, unit: it.unit });
          return g;
        },
        {}
      );
      const msg = buildWAMsgCotizacion({
        cotNum: creado.cotNum,
        clientName: clientName.trim() || "Sin cliente",
        groupedItems: groupedForWA,
        totalBase, totalLabor, margin, totalFinal,
        pdfUrl: pdfUrl ?? undefined,
      });
      const numero = cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`;
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    }
    await registrarEnvioWA(creado.id, pdfUrl ?? undefined);
  };

  const vaciarCarrito = () => setBasket([]);

  const reset = () => {
    setPhase("cats"); setSelCat(null); setSelSubCat(null); setBasket([]); setMargin(40);
    setClientName(""); setPhone(""); setCity(""); setNotes(""); setSaved(false);
    setEditandoId(null); setPdfUrlGuardado(null);
  };

  // Group basket by category for result/qty views
  const groupedItems = basket.reduce<Record<string, BasketItem[]>>((g, it) => {
    (g[it.catLabel] = g[it.catLabel] || []).push(it);
    return g;
  }, {});

  const phaseStep = phase === "cats" ? 0 : phase === "resumen" ? 1 : 2;

  const phaseSubtitle =
    phase === "cats" ? "Selecciona categorías, partidas y cantidades" :
    phase === "resumen" ? "Revisa los totales y ajusta el margen" :
    (editandoId ? "Modificando cotización existente" : "Datos del cliente y confirmación");

  return {
    // catálogo
    sortedCatalogo, construccionSubs, otrasCategorias, showConstruccion, catActiva,
    // navegación
    phase, setPhase, phaseStep, phaseSubtitle, totalPasos: 3,
    selCat, selSubCat, abrirCategoria, abrirSubcategoria, volverASubcategorias, volverACategorias,
    goToResumen, goToCliente,
    // carrito
    basket, groupedItems, isSelected, toggleSvc, setCantidad, calcItem, controlLabel,
    cantidadesCompleto,
    // totales
    totalMateriales, totalManoDeObra, totalBase, totalLabor, totalFinal,
    // margen
    margin, setMargin,
    // cliente
    clientName, setClientName, phone, setPhone, city, setCity, notes, setNotes,
    // guardado
    editandoId, saved, pdfUrlGuardado, loading, doSave, reset, vaciarCarrito,
  };
}

export type UseCotizacionWizardResult = ReturnType<typeof useCotizacionWizard>;
