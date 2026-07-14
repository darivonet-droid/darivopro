"use client";
// DARIVO PRO EMPRESA — Wizard de cotización, capa de presentación de escritorio
// (05-MODULO-COTIZACIONES-EMPRESA.md §4-§5). Misma lógica de negocio que el wizard
// Móvil (NuevoCotizacionWizard.tsx): cálculo, guardado, historial, IA — solo cambia
// cómo se presenta (multi-panel dentro de EmpresaShell, sin MobileShell/DarkHeader).
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCotizacion } from "@/hooks/useCotizacion";
import { useCotizacionDraft } from "@/hooks/useCotizacionDraft";
import { useCatalogo } from "@/hooks/useCatalogo";
import { useRecentItems } from "@/hooks/useRecentItems";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase/client";
import { cotizacionSchema } from "@/lib/validations";
import { fmtPEN, buildWAMsgCotizacion } from "@/lib/utils";
import { calcBasket, saveCalcSnapshot, type CalcInput } from "@/lib/calc";
import { compartirPDF } from "@/lib/share";
import { WIZARD_IA_SESSION_KEY } from "@/lib/cotizacion-ia";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import type { LineaCotizacion, Capitulo, Partida } from "@/types";

// Navegación Construcción → subcategorías (05 v1.6 · Doc 21 §15 — solo UI, cat_ids de catalog.ts)
const CONSTRUCCION_ID = "construccion";
const CONSTRUCCION_META = { id: CONSTRUCCION_ID, nombre: "Construcción", emoji: "🏗️", color: "#F59E0B" };
const SUBCATEGORIAS_CONSTRUCCION = [{ id: "albanileria", nombre: "Albañilería", emoji: "🧱" }];
const SUBCATEGORIAS_CONSTRUCCION_IDS = new Set(SUBCATEGORIAS_CONSTRUCCION.map((s) => s.id));

const chevronPath = "M9 18l6-6-6-6";
const checkPath = "M20 6L9 17l-5-5";
const plusPath = "M12 5v14 M5 12h14";
const savePath = ["M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z", "M17 21v-8H7v8", "M7 3v5h8"];

type SvgPath = string | string[];
function Ic({ d, size = 18, color = "currentColor", sw = 2 }: { d: SvgPath; size?: number; color?: string; sw?: number }) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

const PRESETS: Record<string, number[]> = { m2: [5, 10, 15, 20, 30, 50, 80], unit: [1, 2, 3, 4, 5, 8, 10], hour: [1, 2, 4, 6, 8], fixed: [] };

interface BasketItem {
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

/** StepDots claro — la variante compartida (design-system/StepDots.tsx) usa blanco
 * sobre fondo oscuro (DarkHeader); aquí el header es claro (EmpresaShell). */
function StepDotsClaro({ current, total = 4 }: { current: number; total?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            borderRadius: 3,
            background: i === current ? ADMIN_COLORS.purple : i < current ? ADMIN_COLORS.green : ADMIN_COLORS.slateD,
            transition: "all 0.15s",
          }}
        />
      ))}
    </div>
  );
}

export function NuevoCotizacionWizardEscritorio() {
  const router = useRouter();
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

  // 4 pasos oficiales — 05-MODULO-COTIZACIONES-EMPRESA.md §4/§5
  type Phase = "cats" | "cantidades" | "resumen" | "cliente";
  const [phase, setPhase] = useState<Phase>("cats");
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

  const draftState = { clientName, phone, city, items: [], margin, notes, iaResult: null };
  const { limpiar } = useCotizacionDraft(draftState);

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

  useEffect(() => {
    if (!catalogo.length || populated) return;
    setPopulated(true);

    const catParam = searchParams.get("cat");
    const fromParam = searchParams.get("from");
    const editarParam = searchParams.get("editar");
    const clienteParam = searchParams.get("cliente");
    const fromIA = searchParams.get("fromIA");

    if (fromIA && typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem(WIZARD_IA_SESSION_KEY);
        if (raw) {
          const handoff = JSON.parse(raw) as { basket: BasketItem[]; notes?: string; margin?: number };
          if (handoff.basket?.length) {
            setBasket(handoff.basket);
            if (handoff.notes) setNotes(handoff.notes);
            if (handoff.margin != null) setMargin(handoff.margin);
            setPhase("cantidades");
          }
          sessionStorage.removeItem(WIZARD_IA_SESSION_KEY);
        }
      } catch { /* ignore */ }
      return;
    }

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

    if (catParam && catalogo.some((c) => c.id === catParam)) {
      if (SUBCATEGORIAS_CONSTRUCCION_IDS.has(catParam)) {
        setSelCat(CONSTRUCCION_ID);
        setSelSubCat(catParam);
      } else {
        setSelCat(catParam);
      }
      return;
    }

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
          catColor: cap?.color ?? ADMIN_COLORS.purple,
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
      setPhase("cantidades");
    };

    if (editarParam) {
      void cargarCotizacion(editarParam, true);
      return;
    }
    if (fromParam) {
      void cargarCotizacion(fromParam, false);
      return;
    }

    const recentCat = getMostRecentCatId();
    if (recentCat && catalogo.some((c) => c.id === recentCat)) {
      setSelCat(recentCat);
    }

    const lastClient = getLastClient();
    if (lastClient) {
      setClientName(lastClient.name);
      setPhone(lastClient.phone);
      setCity(lastClient.city);
    }
  }, [catalogo]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const totalBase = calcResult.totalBase;
  const totalLabor = calcResult.totalMargen;
  const totalFinal = calcResult.totalFinal;

  const calcItem = (it: BasketItem) => {
    const qty = it.calcType === "fixed" ? 1 : parseFloat(it.qty) || 0;
    return { qty, unitPrice: it.basePrice, subtotal: calcResult.items.find((ci) => ci.svcId === it.svcId)?.subtotal ?? qty * it.basePrice };
  };

  const isSelected = (id: string) => basket.some((b) => b.svcId === id);

  const toggleSvc = (cap: Capitulo, partida: Partida) => {
    if (isSelected(partida.id)) {
      setBasket((b) => b.filter((x) => x.svcId !== partida.id));
      return;
    }
    const calcType = partida.calcType;
    setBasket((b) => [...b, {
      svcId: partida.id,
      catLabel: cap.nombre,
      svcLabel: partida.nombre,
      calcType,
      basePrice: partida.precio,
      unit: partida.unidad,
      qty: calcType === "fixed" ? "1" : "",
      catColor: cap.color,
      catEmoji: cap.emoji,
    }]);
  };

  const goToCantidades = () => {
    if (!basket.length) return;
    setPhase("cantidades");
  };

  const cantidadesCompleto = basket.every((it) => {
    if (it.calcType === "fixed") return true;
    const q = parseFloat(it.qty);
    return !!it.qty && q > 0;
  });

  const goToResumen = () => {
    if (!cantidadesCompleto) return;
    setPhase("resumen");
  };

  const goToCliente = () => {
    if (!cantidadesCompleto) return;
    setPhase("cliente");
  };

  const updateQty = (idx: number, val: string) =>
    setBasket((b) => b.map((it, i) => (i === idx ? { ...it, qty: val } : it)));

  const controlLabel = (calcType: LineaCotizacion["calcType"]) => {
    if (calcType === "m2") return "m²";
    if (calcType === "hour") return "Horas";
    if (calcType === "unit") return "Cantidad";
    return "";
  };

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

  const reset = () => {
    setPhase("cats"); setSelCat(null); setSelSubCat(null); setBasket([]); setMargin(40);
    setClientName(""); setPhone(""); setCity(""); setNotes(""); setSaved(false);
  };

  const groupedItems = basket.reduce<Record<string, BasketItem[]>>((g, it) => {
    (g[it.catLabel] = g[it.catLabel] || []).push(it);
    return g;
  }, {});

  const phaseStep = phase === "cats" ? 0 : phase === "cantidades" ? 1 : phase === "resumen" ? 2 : 3;

  const phaseSubtitle =
    phase === "cats" ? "Selecciona categorías y partidas" :
    phase === "cantidades" ? "Introduce las mediciones de cada partida" :
    phase === "resumen" ? "Revisa los totales y ajusta el margen" :
    editandoId ? "Modificando cotización existente" : "Datos del cliente y confirmación";

  // Categoría "activa" hoy en el panel central (Paso 1 — MD §5.1: subcategoría de
  // Construcción si aplica, o la categoría de nivel superior seleccionada)
  const catActiva = selSubCat
    ? construccionSubs.find((c) => c.id === selSubCat)
    : selCat && selCat !== CONSTRUCCION_ID
    ? otrasCategorias.find((c) => c.id === selCat)
    : null;

  /** Panel de categorías — izquierda, ~240px (MD §4/§5.1) */
  const renderPanelCategorias = () => (
    <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: ADMIN_COLORS.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
        Categorías
      </p>

      {showConstruccion && (() => {
        const cap = CONSTRUCCION_META;
        const isOpen = selCat === CONSTRUCCION_ID;
        const selCount = basket.filter((b) => construccionSubs.some((s) => s.partidas.some((p) => p.id === b.svcId))).length;
        return (
          <div key={CONSTRUCCION_ID} style={{ borderRadius: 12, overflow: "hidden", border: `1.5px solid ${selCount > 0 ? cap.color : isOpen ? cap.color + "60" : ADMIN_COLORS.slateD}` }}>
            <button
              type="button"
              onClick={() => { setSelCat(isOpen ? null : CONSTRUCCION_ID); setSelSubCat(null); }}
              style={{ width: "100%", padding: "10px 12px", background: isOpen ? cap.color + "0E" : selCount > 0 ? cap.color + "07" : ADMIN_COLORS.white, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>{cap.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: isOpen || selCount > 0 ? cap.color : ADMIN_COLORS.text }}>{cap.nombre}</p>
                <p style={{ fontSize: 10, color: ADMIN_COLORS.textMid }}>
                  {selCount > 0 ? `${selCount} partida${selCount !== 1 ? "s" : ""}` : `${construccionSubs.length} subcategorías`}
                </p>
              </div>
              {selCount > 0 && (
                <div style={{ width: 18, height: 18, borderRadius: 9, background: ADMIN_COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ic d={checkPath} color={ADMIN_COLORS.white} size={10} />
                </div>
              )}
            </button>
            {isOpen && (
              <div style={{ background: ADMIN_COLORS.white, borderTop: `1px solid ${cap.color}20`, padding: "6px 8px 8px" }}>
                {SUBCATEGORIAS_CONSTRUCCION.filter((sub) => construccionSubs.some((c) => c.id === sub.id)).map((sub) => {
                  const subCap = construccionSubs.find((c) => c.id === sub.id)!;
                  const subSel = basket.filter((b) => subCap.partidas.some((p) => p.id === b.svcId)).length;
                  const active = selSubCat === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelSubCat(sub.id)}
                      style={{ width: "100%", padding: "9px 10px", marginBottom: 4, borderRadius: 10, border: `1.5px solid ${active ? subCap.color : subSel > 0 ? subCap.color + "50" : ADMIN_COLORS.slateD}`, background: active ? subCap.color + "10" : subSel > 0 ? subCap.color + "08" : ADMIN_COLORS.white, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}
                    >
                      <span style={{ fontSize: 17 }}>{sub.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 800, color: ADMIN_COLORS.text }}>{sub.nombre}</p>
                        <p style={{ fontSize: 10, color: ADMIN_COLORS.textMid }}>{subCap.partidas.length} partidas</p>
                      </div>
                      {subSel > 0 && <span style={{ fontSize: 11, fontWeight: 800, color: subCap.color }}>{subSel}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {otrasCategorias.map((cap) => {
        const isOpen = selCat === cap.id;
        const selCount = basket.filter((b) => cap.partidas.some((p) => p.id === b.svcId)).length;
        return (
          <button
            key={cap.id}
            type="button"
            onClick={() => { setSelCat(isOpen ? null : cap.id); setSelSubCat(null); }}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${selCount > 0 ? cap.color : isOpen ? cap.color + "60" : ADMIN_COLORS.slateD}`, background: isOpen ? cap.color + "0E" : selCount > 0 ? cap.color + "07" : ADMIN_COLORS.white, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{cap.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: isOpen || selCount > 0 ? cap.color : ADMIN_COLORS.text }}>{cap.nombre}</p>
              <p style={{ fontSize: 10, color: ADMIN_COLORS.textMid }}>
                {selCount > 0 ? `${selCount} partida${selCount !== 1 ? "s" : ""}` : `${cap.partidas.length} partidas`}
              </p>
            </div>
            {selCount > 0 && (
              <div style={{ width: 18, height: 18, borderRadius: 9, background: ADMIN_COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Ic d={checkPath} color={ADMIN_COLORS.white} size={10} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  /** Panel de partidas — centro, sin cantidades ni calculadora (MD §5.1) */
  const renderPanelPartidas = () => {
    if (!catActiva) {
      return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, border: `1.5px dashed ${ADMIN_COLORS.slateD}`, minHeight: 320, background: ADMIN_COLORS.white }}>
          <p style={{ fontSize: 13, color: ADMIN_COLORS.textMid }}>Selecciona una categoría a la izquierda para ver sus partidas.</p>
        </div>
      );
    }
    return (
      <div style={{ flex: 1, background: ADMIN_COLORS.white, borderRadius: 16, border: `1px solid ${ADMIN_COLORS.slateD}`, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${ADMIN_COLORS.slateD}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{catActiva.emoji}</span>
          <p style={{ fontSize: 14, fontWeight: 800, color: ADMIN_COLORS.text }}>{catActiva.nombre}</p>
        </div>
        <div>
          {catActiva.partidas.map((p, i) => {
            const sel = isSelected(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleSvc(catActiva, p)}
                style={{
                  width: "100%", padding: "13px 16px",
                  borderBottom: i < catActiva.partidas.length - 1 ? `1px solid ${ADMIN_COLORS.slate}` : "none",
                  border: "none", background: sel ? catActiva.color + "0A" : ADMIN_COLORS.white,
                  cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, textAlign: "left",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: sel ? 800 : 600, color: sel ? catActiva.color : ADMIN_COLORS.text }}>{p.nombre}</p>
                  <p style={{ fontSize: 12, color: ADMIN_COLORS.textMid, marginTop: 1 }}>
                    {p.calcType === "fixed" ? `S/ ${p.precio} precio fijo` : `S/ ${p.precio} / ${p.unidad}`}
                  </p>
                </div>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: sel ? catActiva.color : ADMIN_COLORS.slate, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ic d={sel ? checkPath : plusPath} color={sel ? ADMIN_COLORS.white : ADMIN_COLORS.textMid} size={14} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const backHref = "/empresa";

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: phase === "cats" ? "none" : 760, margin: phase === "cats" ? undefined : "0 auto" }}>
      {/* Toolbar del wizard: volver + StepDots + contador (Paso 1) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href={backHref} style={{ fontSize: 12, fontWeight: 700, color: ADMIN_COLORS.purple }}>
            ← Volver
          </Link>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: ADMIN_COLORS.text }}>
              {editandoId ? "Editar cotización" : "Nueva cotización"}
            </p>
            <p style={{ fontSize: 11, color: ADMIN_COLORS.textMid }}>{phaseSubtitle}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {basket.length > 0 && phase === "cats" && (
            <div style={{ width: 26, height: 26, borderRadius: 13, background: ADMIN_COLORS.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: ADMIN_COLORS.white, fontSize: 12, fontWeight: 900 }}>{basket.length}</span>
            </div>
          )}
          <StepDotsClaro current={phaseStep} total={4} />
        </div>
      </div>

      {/* ══ PASO 1: SELECCIÓN — panel categorías + panel partidas simultáneos (MD §4/§5.1) ══ */}
      {phase === "cats" && (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          {renderPanelCategorias()}
          {renderPanelPartidas()}
        </div>
      )}

      {/* ══ PASO 2: CANTIDADES — panel central, controles por tipo (MD §5.2) ══ */}
      {phase === "cantidades" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <button
              type="button"
              onClick={() => { setSelCat(null); setSelSubCat(null); setPhase("cats"); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: ADMIN_COLORS.purple }}
            >
              ← Partidas
            </button>
          </div>
          <div style={{ background: ADMIN_COLORS.white, borderRadius: 16, border: `1px solid ${ADMIN_COLORS.slateD}`, overflow: "hidden", marginBottom: 16 }}>
            {Object.entries(groupedItems).map(([catLabel, its], gi) => {
              const cap = sortedCatalogo.find((c) => c.nombre === catLabel);
              const chapTotal = its.reduce((a, it) => a + calcItem(it).subtotal, 0);
              return (
                <div key={catLabel}>
                  <div style={{ background: (cap?.color || ADMIN_COLORS.purple) + "10", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: gi > 0 ? `1px solid ${ADMIN_COLORS.slateD}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15 }}>{cap?.emoji || "📋"}</span>
                      <p style={{ fontSize: 12, fontWeight: 800, color: cap?.color || ADMIN_COLORS.purple, textTransform: "uppercase", letterSpacing: 0.4 }}>{catLabel}</p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: cap?.color || ADMIN_COLORS.purple }}>{fmtPEN(chapTotal)}</p>
                  </div>
                  <div className="grid gap-0" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                    {its.map((it) => {
                      const idx = basket.findIndex((b) => b.svcId === it.svcId);
                      const { subtotal } = calcItem(it);
                      const calcTypeKey = it.calcType === "m2" ? "m2" : it.calcType === "unit" ? "unit" : it.calcType === "hour" ? "hour" : "fixed";
                      return (
                        <div key={it.svcId} style={{ padding: "11px 16px", borderBottom: `1px solid ${ADMIN_COLORS.slate}`, borderRight: `1px solid ${ADMIN_COLORS.slate}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: it.calcType === "fixed" ? 0 : 8 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: ADMIN_COLORS.text, lineHeight: 1.3, flex: 1 }}>{it.svcLabel}</p>
                            <p style={{ fontSize: 13, fontWeight: 800, color: ADMIN_COLORS.text, flexShrink: 0 }}>{fmtPEN(subtotal)}</p>
                          </div>
                          {it.calcType === "fixed" ? (
                            <p style={{ fontSize: 11, color: ADMIN_COLORS.textMid }}>Precio fijo · S/ {it.basePrice}</p>
                          ) : (
                            <div>
                              <p style={{ fontSize: 10, fontWeight: 700, color: ADMIN_COLORS.textMid, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>{controlLabel(it.calcType)}</p>
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={it.qty}
                                  onChange={(e) => updateQty(idx, e.target.value)}
                                  placeholder="0"
                                  style={{ flex: 1, padding: "9px 10px", borderRadius: 10, fontSize: 16, fontWeight: 800, border: `1.5px solid ${parseFloat(it.qty) > 0 ? cap?.color || ADMIN_COLORS.purple : ADMIN_COLORS.slateD}`, outline: "none", color: ADMIN_COLORS.text, background: ADMIN_COLORS.slate, textAlign: "center", fontFamily: "inherit" }}
                                />
                                <span style={{ fontSize: 12, fontWeight: 700, color: ADMIN_COLORS.textMid, minWidth: 28 }}>{it.unit}</span>
                              </div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                                {(PRESETS[calcTypeKey] || []).map((n) => (
                                  <button key={n} type="button" onClick={() => updateQty(idx, String(n))}
                                    style={{ padding: "5px 10px", borderRadius: 20, border: `1.5px solid ${String(it.qty) === String(n) ? cap?.color || ADMIN_COLORS.purple : ADMIN_COLORS.slateD}`, background: String(it.qty) === String(n) ? (cap?.color || ADMIN_COLORS.purple) + "12" : ADMIN_COLORS.white, cursor: "pointer", fontSize: 12, fontWeight: 800, color: String(it.qty) === String(n) ? cap?.color || ADMIN_COLORS.purple : ADMIN_COLORS.textMid }}>
                                    {n}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: ADMIN_COLORS.purplePale, borderRadius: 14, padding: "14px 18px" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: ADMIN_COLORS.text }}>Total parcial</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: ADMIN_COLORS.purple }}>{fmtPEN(totalFinal)}</span>
            <button
              type="button"
              onClick={goToResumen}
              disabled={!cantidadesCompleto}
              style={{ padding: "10px 22px", borderRadius: 12, border: "none", cursor: cantidadesCompleto ? "pointer" : "not-allowed", background: `linear-gradient(135deg,${ADMIN_COLORS.purple},#9333EA)`, color: ADMIN_COLORS.white, fontSize: 13, fontWeight: 800, opacity: cantidadesCompleto ? 1 : 0.5 }}
            >
              Continuar → Resumen
            </button>
          </div>
        </div>
      )}

      {/* ══ PASO 3: RESUMEN — solo presentación (MD §5.3) ══ */}
      {phase === "resumen" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <button
              type="button"
              onClick={() => setPhase("cantidades")}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: ADMIN_COLORS.purple }}
            >
              ← Cantidades
            </button>
          </div>

          <div style={{ background: `linear-gradient(148deg,${ADMIN_COLORS.purple} 0%,#9333EA 100%)`, borderRadius: 22, padding: "28px 26px 24px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: 90, background: "rgba(255,255,255,0.06)" }} />
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, position: "relative" }}>Total cotización</p>
            <p style={{ color: ADMIN_COLORS.white, fontSize: 58, fontWeight: 900, letterSpacing: -3, lineHeight: 1, position: "relative" }}>{fmtPEN(totalFinal)}</p>
            <div style={{ display: "flex", gap: 24, marginTop: 16, position: "relative" }}>
              <div>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>Ejecución material</p>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: 700, marginTop: 2 }}>{fmtPEN(totalBase)}</p>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.15)" }} />
              <div>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>Mano de obra ({margin}%)</p>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: 700, marginTop: 2 }}>{fmtPEN(totalLabor)}</p>
              </div>
            </div>
          </div>

          <div style={{ background: ADMIN_COLORS.white, borderRadius: 16, border: `1px solid ${ADMIN_COLORS.slateD}`, overflow: "hidden", marginBottom: 16 }}>
            {Object.entries(groupedItems).map(([catLabel, its], gi) => {
              const cap = sortedCatalogo.find((c) => c.nombre === catLabel);
              const chapTotal = its.reduce((a, it) => a + calcItem(it).subtotal, 0);
              return (
                <div key={catLabel}>
                  <div style={{ background: (cap?.color || ADMIN_COLORS.purple) + "10", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: gi > 0 ? `1px solid ${ADMIN_COLORS.slateD}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15 }}>{cap?.emoji || "📋"}</span>
                      <p style={{ fontSize: 12, fontWeight: 800, color: cap?.color || ADMIN_COLORS.purple, textTransform: "uppercase", letterSpacing: 0.4 }}>{catLabel}</p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: cap?.color || ADMIN_COLORS.purple }}>{fmtPEN(chapTotal)}</p>
                  </div>
                  {its.map((it) => {
                    const { subtotal } = calcItem(it);
                    return (
                      <div key={it.svcId} style={{ padding: "11px 16px", borderBottom: `1px solid ${ADMIN_COLORS.slate}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: ADMIN_COLORS.text, lineHeight: 1.3 }}>{it.svcLabel}</p>
                          <p style={{ fontSize: 11, color: ADMIN_COLORS.textMid, marginTop: 2 }}>
                            {it.calcType === "fixed" ? `Precio fijo · S/ ${it.basePrice}` : `${it.qty} ${it.unit} · S/ ${it.basePrice}/${it.unit}`}
                          </p>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 800, color: ADMIN_COLORS.text, flexShrink: 0 }}>{fmtPEN(subtotal)}</p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div style={{ background: ADMIN_COLORS.white, borderRadius: 14, border: `1px solid ${ADMIN_COLORS.slateD}`, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: ADMIN_COLORS.text }}>Ajustar mano de obra</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: ADMIN_COLORS.purple }}>{margin}% · {fmtPEN(totalLabor)}</span>
            </div>
            <input type="range" min={0} max={120} step={5} value={margin} onChange={(e) => setMargin(parseInt(e.target.value))} style={{ accentColor: ADMIN_COLORS.purple, width: "100%", marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 25, 40, 60, 80, 100].map((v) => (
                <button key={v} type="button" onClick={() => setMargin(v)} style={{ flex: 1, padding: "7px 2px", borderRadius: 10, border: `1.5px solid ${margin === v ? ADMIN_COLORS.purple : ADMIN_COLORS.slateD}`, background: margin === v ? ADMIN_COLORS.purplePale : "none", cursor: "pointer", fontSize: 11, fontWeight: 800, color: margin === v ? ADMIN_COLORS.purple : ADMIN_COLORS.textMid }}>
                  {v}%
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="📝 Condiciones, plazos, exclusiones… (aparece en el PDF)"
            style={{ width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 14, border: `1.5px solid ${ADMIN_COLORS.slateD}`, outline: "none", color: ADMIN_COLORS.text, background: ADMIN_COLORS.white, resize: "none", minHeight: 72, marginBottom: 16, fontFamily: "inherit" }}
          />

          <button
            type="button"
            onClick={goToCliente}
            style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${ADMIN_COLORS.purple},#9333EA)`, color: ADMIN_COLORS.white, fontSize: 15, fontWeight: 800, boxShadow: `0 4px 16px ${ADMIN_COLORS.purple}40` }}
          >
            Continuar → Cliente
          </button>
        </div>
      )}

      {/* ══ PASO 4: CLIENTE + CONFIRMACIÓN (MD §5.4) ══ */}
      {phase === "cliente" && (
        <div>
          <button
            type="button"
            onClick={() => setPhase("resumen")}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: ADMIN_COLORS.purple, marginBottom: 14 }}
          >
            ← Resumen
          </button>

          <div style={{ background: ADMIN_COLORS.white, borderRadius: 14, border: `1px solid ${ADMIN_COLORS.slateD}`, padding: "16px 18px", marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: ADMIN_COLORS.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Cliente</p>
            {[
              { k: "name", ph: "Nombre del cliente", val: clientName, set: setClientName },
              { k: "phone", ph: "Teléfono / WhatsApp", val: phone, set: setPhone },
              { k: "city", ph: "Ciudad / Dirección obra", val: city, set: setCity },
            ].map((f, i) => (
              <div key={f.k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 2 ? `1px solid ${ADMIN_COLORS.slateD}` : "none" }}>
                <input
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.ph}
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: ADMIN_COLORS.text, background: "transparent", fontFamily: "inherit" }}
                />
              </div>
            ))}
          </div>

          <div style={{ background: ADMIN_COLORS.purplePale, borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: ADMIN_COLORS.text }}>Total a confirmar</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: ADMIN_COLORS.purple }}>{fmtPEN(totalFinal)}</span>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <button
              type="button"
              onClick={doSave}
              disabled={loading || clientName.trim().length < 2 || phone.trim().replace(/\D/g, "").length < 7}
              style={{ flex: 1, padding: 15, borderRadius: 14, border: saved ? `1.5px solid ${ADMIN_COLORS.green}30` : "none", cursor: "pointer", background: saved ? ADMIN_COLORS.greenPale : `linear-gradient(135deg,${ADMIN_COLORS.green},${ADMIN_COLORS.greenD})`, color: saved ? ADMIN_COLORS.green : ADMIN_COLORS.white, fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: saved ? "none" : `0 4px 16px ${ADMIN_COLORS.green}35`, opacity: clientName.trim().length < 2 || phone.trim().replace(/\D/g, "").length < 7 ? 0.5 : 1 }}
            >
              {loading ? "Guardando…" : saved ? (
                <><Ic d={checkPath} color={ADMIN_COLORS.green} size={16} /> {editandoId ? "Actualizada" : "Guardada"}</>
              ) : (
                <><Ic d={savePath} color={ADMIN_COLORS.white} size={15} /> {editandoId ? `Actualizar · ${fmtPEN(totalFinal)}` : `Guardar cotización · ${fmtPEN(totalFinal)}`}</>
              )}
            </button>

            {saved && pdfUrlGuardado && (
              <button
                type="button"
                onClick={async () => {
                  const r = await compartirPDF(pdfUrlGuardado, `Cotización — ${clientName.trim() || "Sin cliente"}`);
                  if (r.method === "clipboard") mostrarToast("Enlace copiado al portapapeles ✓");
                  else if (r.method === "error") window.open(pdfUrlGuardado, "_blank");
                }}
                style={{ flex: 1, padding: 15, borderRadius: 14, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${ADMIN_COLORS.purpleDark},${ADMIN_COLORS.purple})`, color: ADMIN_COLORS.white, fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 14px ${ADMIN_COLORS.purpleDark}30` }}
              >
                📤 Compartir PDF
              </button>
            )}
          </div>

          {saved && (
            <button
              type="button"
              onClick={() => { router.push(backHref); router.refresh(); }}
              style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${ADMIN_COLORS.purple},#9333EA)`, color: ADMIN_COLORS.white, fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10, boxShadow: `0 4px 16px ${ADMIN_COLORS.purple}35` }}
            >
              Volver a Inicio →
            </button>
          )}

          <button
            type="button"
            onClick={reset}
            style={{ width: "100%", padding: 13, borderRadius: 14, border: `1.5px dashed ${ADMIN_COLORS.slateD}`, background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: ADMIN_COLORS.textMid }}
          >
            + Nueva cotización
          </button>
        </div>
      )}

      {/* Barra de acción del Paso 1 — docked, no flotante (MD §5.1 "FloatBar / acción") */}
      {phase === "cats" && basket.length > 0 && (
        <div style={{ position: "sticky", bottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", background: ADMIN_COLORS.purpleDark, borderRadius: 16, padding: "14px 20px", boxShadow: "0 8px 24px rgba(10,22,40,0.25)" }}>
          <span style={{ color: ADMIN_COLORS.white, fontSize: 13, fontWeight: 700 }}>
            {basket.length} partida{basket.length !== 1 ? "s" : ""} seleccionada{basket.length !== 1 ? "s" : ""}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => setBasket([])} style={{ padding: "10px 16px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.2)", background: "none", color: ADMIN_COLORS.white, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Limpiar
            </button>
            <button type="button" onClick={goToCantidades} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: ADMIN_COLORS.purple, color: ADMIN_COLORS.white, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
              Continuar → Cantidades
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
