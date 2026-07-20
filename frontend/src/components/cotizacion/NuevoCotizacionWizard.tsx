"use client";
// DARIVO PRO — Wizard de cotización (diseño Fable 5 exacto — 4 pasos: 05-MODULO-COTIZACIONES.md v1.6 §2)
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCotizacion } from "@/hooks/useCotizacion";
import { useCotizacionDraft } from "@/hooks/useCotizacionDraft";
import { useCatalogo } from "@/hooks/useCatalogo";
import { useRecentItems } from "@/hooks/useRecentItems";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase/client";
import { cotizacionSchema } from "@/lib/validations";
import { fmtPEN } from "@/lib/utils";
import { calcBasket, saveCalcSnapshot, type CalcInput } from "@/lib/calc";
import { compartirPDF } from "@/lib/share";
import { WIZARD_IA_SESSION_KEY } from "@/lib/cotizacion-ia";
import { T } from "@/lib/design-system/tokens";
import { DarkHeader } from "@/components/design-system/DarkHeader";
import { BackBtn } from "@/components/design-system/BackBtn";
import { StepDots } from "@/components/design-system/StepDots";
import { FloatBar } from "@/components/design-system/FloatBar";
import { MobileShell } from "@/components/design-system/MobileShell";
import type { LineaCotizacion, Capitulo, Partida } from "@/types";

// Navegación Construcción → subcategorías (05 v1.6 · Doc 21 §15 — solo UI, cat_ids de catalog.ts)
const CONSTRUCCION_ID = "construccion";
const CONSTRUCCION_META = { id: CONSTRUCCION_ID, nombre: "Construcción", emoji: "🏗️", color: "#F59E0B" };
const SUBCATEGORIAS_CONSTRUCCION = [{ id: "albanileria", nombre: "Albañilería", emoji: "🧱" }];
const SUBCATEGORIAS_CONSTRUCCION_IDS = new Set(SUBCATEGORIAS_CONSTRUCCION.map((s) => s.id));

// ─── SVG atoms ────────────────────────────────────────────────────────────────
const chevronPath = "M9 18l6-6-6-6";
const checkPath   = "M20 6L9 17l-5-5";
const plusPath    = "M12 5v14 M5 12h14";
const savePath    = ["M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z","M17 21v-8H7v8","M7 3v5h8"];
const zapPath     = "M13 2L3 14h9l-1 8 10-12h-9l1-8z";

type SvgPath = string | string[];
function Ic({ d, size = 18, color = "currentColor", sw = 2 }: { d: SvgPath; size?: number; color?: string; sw?: number }) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

// ─── Tipos locales ─────────────────────────────────────────────────────────────
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

// ─── Wizard principal ──────────────────────────────────────────────────────────
export function NuevoCotizacionWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { crear, actualizar, loading, generarPDF, registrarCalculo } = useCotizacion();
  const { catalogo } = useCatalogo();
  const {
    trackItems, getRecentSvcIds, getMostRecentCatId, getCatFrequency,
    getLastClient, saveLastClient,
    saveClientHistory, getClientHistory, getClientCatFrequency,
  } = useRecentItems();
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const mostrarUpgrade = useAppStore((s) => s.mostrarUpgrade);
  const supabase = createClient();

  // 3 pasos oficiales — 05-MODULO-COTIZACIONES.md §2: Selección+Cantidad → Resumen → Cliente
  type Phase = "cats" | "resumen" | "cliente";
  const [phase, setPhase] = useState<Phase>("cats");
  const [selCat, setSelCat] = useState<string | null>(null);
  const [selSubCat, setSelSubCat] = useState<string | null>(null);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [margin, setMargin] = useState(40);
  const [montoManoObra, setMontoManoObra] = useState("");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [pdfUrlGuardado, setPdfUrlGuardado] = useState<string | null>(null);
  const [populated, setPopulated] = useState(false);

  // Draft restore — `basket` es el carrito real (antes se guardaba items:[]
  // hardcodeado, el borrador nunca sobrevivía a salir a medio wizard).
  const draftState = { clientName, phone, city, items: [], margin, notes, iaResult: null, basket };
  const { cargar, limpiar } = useCotizacionDraft(draftState);

  // ── Catálogo ordenado por frecuencia global + boost por cliente ──────────
  const sortedCatalogo = useMemo(() => {
    if (!catalogo.length) return catalogo;

    const globalFreq = getCatFrequency();
    const recentSvcs = new Set(getRecentSvcIds().slice(0, 10));

    // Client-specific boost: categories this client usually requests rank higher
    const clientFreq = clientName.trim() ? getClientCatFrequency(clientName.trim()) : {};
    const clientHistory = clientName.trim() ? getClientHistory(clientName.trim()) : null;
    const clientSvcs   = new Set(clientHistory?.svcIds ?? []);

    // Merge global + client-specific frequencies (client boost weighted ×3)
    const mergedFreq: Record<string, number> = { ...globalFreq };
    Object.entries(clientFreq).forEach(([catId, n]) => {
      mergedFreq[catId] = (mergedFreq[catId] ?? 0) + n * 3;
    });

    // Priority set: client's last items first, then global recents
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
    otrasCategorias:  sortedCatalogo.filter((c) => !SUBCATEGORIAS_CONSTRUCCION_IDS.has(c.id)),
  }), [sortedCatalogo]);
  const showConstruccion = construccionSubs.length > 0;

  // ── Inicialización: ?cat=, ?from=<id>, o pre-abrir categoría reciente ────
  useEffect(() => {
    if (!catalogo.length || populated) return;
    setPopulated(true);

    const catParam    = searchParams.get("cat");
    const fromParam   = searchParams.get("from");
    const editarParam = searchParams.get("editar");
    const clienteParam = searchParams.get("cliente");
    const fromIA      = searchParams.get("fromIA");

    // Handoff IA → Paso 2 Cantidades (05-MODULO-COTIZACIONES.md §Regla 1 · 08-MODULO-IA.md §9)
    // Los items de la IA llegan con qty pre-rellenado pero editable — Resumen es solo lectura.
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
    //    Prefijamos nombre/teléfono/ciudad; el usuario elige partidas con normalidad.
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
      // No hacemos return: continúa el flujo normal (elegir capítulos)
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
    // Mediciones en Cantidades (05-MODULO-COTIZACIONES.md §3 — "Editar"/"Re-cotizar")
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
          svcId:     String(it.svc_id),
          catLabel:  String(it.cat_label ?? ""),
          svcLabel:  String(it.svc_label ?? ""),
          calcType:  (it.calc_type as LineaCotizacion["calcType"]) ?? "fixed",
          basePrice: Number(it.base_price ?? 0),
          unit:      String(it.unit ?? ""),
          qty:       String(it.qty ?? (it.calc_type === "fixed" ? 1 : "")),
          catColor:  cap?.color ?? T.blue,
          catEmoji:  cap?.emoji ?? "📋",
        };
      });
      setBasket(newBasket);
      setMargin(Number(data.margin ?? 40));
      setClientName(String(data.client_name ?? ""));
      setPhone(String(data.phone ?? ""));
      setCity(String(data.city ?? ""));
      setNotes(String(data.notes ?? ""));
      if (esEdicion) setEditandoId(id);
    };

    // 2. Editar cotización existente (?editar=<id>) — actualiza el registro original
    if (editarParam) {
      void cargarCotizacion(editarParam, true);
      return;
    }

    // 3. Re-usar cotización anterior (?from=<id>) — crea una nueva
    if (fromParam) {
      void cargarCotizacion(fromParam, false);
      return;
    }

    // 3. Pre-abrir la categoría usada más recientemente
    const recentCat = getMostRecentCatId();
    if (recentCat && catalogo.some((c) => c.id === recentCat)) {
      setSelCat(recentCat);
    }

    // 4. Pre-rellenar datos del último cliente
    const lastClient = getLastClient();
    if (lastClient) {
      setClientName(lastClient.name);
      setPhone(lastClient.phone);
      setCity(lastClient.city);
    }

    // 5. Restaurar borrador local si el usuario salió a medio wizard sin
    // guardar (ninguno de los casos de arriba aplicó — ?editar=/?from=/
    // ?fromIA= siempre tienen prioridad sobre el borrador). Antes el
    // borrador guardaba items:[] hardcodeado, así que nunca había nada real
    // que restaurar (CLAUDE.md, hallazgo 16/07/2026).
    const draft = cargar();
    if (draft?.basket && Array.isArray(draft.basket) && draft.basket.length) {
      setBasket(draft.basket as BasketItem[]);
      setMargin(draft.margin);
      setNotes(draft.notes ?? "");
      if (draft.clientName) setClientName(draft.clientName);
      if (draft.phone) setPhone(draft.phone);
      if (draft.city) setCity(draft.city);
      mostrarToast("Recuperamos tu cotización sin guardar");
    }
  }, [catalogo]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-apply client history when clientName matches a known client ───────
  // Silently restores: margin, notes, phone, city from the client's last quote.
  // Debounced 600ms so it doesn't trigger while the user is still typing.
  useEffect(() => {
    if (phase !== "cliente" || saved) return;
    const name = clientName.trim();
    if (name.length < 2) return;
    const timer = setTimeout(() => {
      const history = getClientHistory(name);
      if (!history) return;
      // Reutilizar porcentaje de beneficio (solo si aún está en el valor por defecto)
      setMargin((prev) => prev === 40 ? history.margin : prev);
      // Reutilizar condiciones comerciales (phone/city si estaban vacíos)
      setPhone((prev) => prev.trim() ? prev : history.phone);
      setCity((prev) => prev.trim() ? prev : history.city);
      // Reutilizar observaciones (si no se han introducido)
      setNotes((prev) => prev.trim() ? prev : history.notes);
    }, 600);
    return () => clearTimeout(timer);
  }, [clientName, phase, saved]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Motor de cálculo robusto ───────────────────────────────────────────────
  // Convierte el basket al formato CalcInput y delega al motor centralizado.
  const buildCalcInputs = (items: BasketItem[]): CalcInput[] =>
    items.map((it) => ({
      svcId:     it.svcId,
      svcLabel:  it.svcLabel,
      catLabel:  it.catLabel,
      calcType:  it.calcType,
      basePrice: it.basePrice,
      qty:       it.calcType === "fixed" ? 1 : parseFloat(it.qty) || 0,
      unit:      it.unit,
    }));

  const calcResult     = calcBasket(buildCalcInputs(basket), margin);
  const totalMateriales = calcResult.totalMateriales;   // m2/unit items
  const totalManoDeObra = calcResult.totalManoDeObra;   // hour/fixed items
  const totalBase       = calcResult.totalBase;
  const totalLabor      = calcResult.totalMargen;       // alias for DB compat
  const totalFinal      = calcResult.totalFinal;

  // Compatibility shim: calcItem still used in a few JSX renders below
  const calcItem = (it: BasketItem) => {
    const qty = it.calcType === "fixed" ? 1 : parseFloat(it.qty) || 0;
    return { qty, unitPrice: it.basePrice, subtotal: calcResult.items.find(ci => ci.svcId === it.svcId)?.subtotal ?? (qty * it.basePrice) };
  };

  // Basket helpers
  const isSelected = (id: string) => basket.some((b) => b.svcId === id);
  const catForSvc  = (id: string) => sortedCatalogo.find((c) => c.partidas.some((p) => p.id === id));

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

  // Cantidad escrita directamente en la fila de la partida (m2/unit/hour) —
  // agrega/actualiza si hay un valor > 0, quita si se deja vacío o en 0.
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

  // Monto fijo de mano de obra (S/) — recalcula el % interno (margin) según el
  // totalBase actual, para que calcBasket siga trabajando con % sin cambios.
  const handleMontoManoObra = (val: string) => {
    setMontoManoObra(val);
    if (!val) return;
    const monto = parseFloat(val);
    if (totalBase > 0 && Number.isFinite(monto) && monto >= 0) {
      setMargin(Math.round((monto / totalBase) * 1e8) / 1e6);
    }
  };

  // Regla 8 — completitud de cantidades antes de continuar a Resumen
  const cantidadesCompleto = basket.every((it) => {
    if (it.calcType === "fixed") return true;
    const q = parseFloat(it.qty);
    return !!it.qty && q > 0;
  });

  // Paso 1 → Paso 2 (cantidad ya escrita en la propia fila de la partida)
  const goToResumen = () => {
    if (!basket.length) return;
    if (!cantidadesCompleto) {
      const faltantes = basket
        .filter((it) => it.calcType !== "fixed" && !(parseFloat(it.qty) > 0))
        .map((it) => it.svcLabel);
      mostrarToast(`Falta indicar cantidad en: ${faltantes.join(", ")}`, "error");
      return;
    }
    setPhase("resumen");
  };

  // Paso 2 → Paso 3
  const goToCliente = () => {
    if (!cantidadesCompleto) return;
    setPhase("cliente");
  };

  // Save (crea nueva o actualiza existente según editandoId) — solo guarda,
  // sin disparar ningún envío automático; compartir es siempre una acción
  // manual del usuario (botón "Compartir PDF" en la pantalla de éxito).
  const doSave = async () => {
    const calcInputs = buildCalcInputs(basket);
    const engineResult = calcBasket(calcInputs, margin);
    const items: LineaCotizacion[] = basket.map((it, idx) => {
      const ci = engineResult.items[idx];
      return {
        svcId:     it.svcId,
        catLabel:  it.catLabel,
        svcLabel:  it.svcLabel,
        calcType:  it.calcType,
        basePrice: it.basePrice,
        unit:      it.unit,
        qty:       ci.qty,
        unitPrice: ci.unitPrice,
        subtotal:  ci.subtotal,
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
        totalBase:       engineResult.totalBase,
        totalMargen:     engineResult.totalMargen,
        margin:          engineResult.margin,
        totalFinal:      engineResult.totalFinal,
        itemCount:       engineResult.items.length,
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
      totalBase:       engineResult.totalBase,
      totalMargen:     engineResult.totalMargen,
      margin:          engineResult.margin,
      totalFinal:      engineResult.totalFinal,
      itemCount:       engineResult.items.length,
    });

    const itemsWithCat = basket.map((b) => ({
      svcId: b.svcId,
      catId: catalogo.find((c) => c.partidas.some((p) => p.id === b.svcId))?.id ?? "",
    }));
    trackItems(itemsWithCat);
    saveLastClient({ name: clientName.trim(), phone: phone.trim(), city: city.trim() });
    saveClientHistory(clientName.trim(), {
      phone:   phone.trim(),
      city:    city.trim(),
      margin,
      notes:   notes.trim(),
      svcIds:  itemsWithCat.map((i) => i.svcId),
      catIds:  itemsWithCat.map((i) => i.catId),
    });
    limpiar();
    setSaved(true);
    mostrarToast(`${creado.cotNum ?? "Cotización"} creada ✓`);

    const pdfUrl = await generarPDF(creado.id).catch(() => null);
    setPdfUrlGuardado(pdfUrl);
  };

  const reset = () => {
    setPhase("cats"); setSelCat(null); setSelSubCat(null); setBasket([]); setMargin(40);
    setMontoManoObra("");
    setClientName(""); setPhone(""); setCity(""); setNotes(""); setSaved(false);
  };

  // Group basket by category for result view
  const groupedItems = basket.reduce<Record<string, BasketItem[]>>((g, it) => {
    (g[it.catLabel] = g[it.catLabel] || []).push(it);
    return g;
  }, {});

  const phaseStep =
    phase === "cats"    ? 0 :
    phase === "resumen" ? 1 : 2;

  const phaseSubtitle =
    phase === "cats"    ? "Selecciona categorías, partidas y cantidades" :
    phase === "resumen" ? "Revisa los totales y ajusta el margen" :
    (editandoId ? "Modificando cotización existente" : "Datos del cliente y confirmación");

  /** Render lista de partidas — reutilizado en categorías y subcategorías.
   *  Cada fila: nombre/precio, cuadro de cantidad (m2/unit/hour) junto al
   *  botón +/✓ existente (precio fijo no tiene cuadro, solo el botón). */
  const renderPartidas = (cap: Capitulo) => (
    <div className="su" style={{ background: T.white, borderTop: `1px solid ${cap.color}20` }}>
      {cap.partidas.map((p, si) => {
        const sel = isSelected(p.id);
        const it = basket.find((b) => b.svcId === p.id);
        const faltaCantidad = sel && p.calcType !== "fixed" && !(parseFloat(it?.qty ?? "") > 0);
        return (
          <div
            key={p.id}
            style={{
              width: "100%", padding: "12px 16px 12px 20px",
              borderBottom: si < cap.partidas.length - 1 ? `1px solid ${T.slate}` : "none",
              background: faltaCantidad ? T.redPale : sel ? cap.color + "0A" : T.white,
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: sel ? 800 : 600, color: sel ? cap.color : T.text, lineHeight: 1.3 }}>{p.nombre}</p>
              <p style={{ fontSize: 12, color: faltaCantidad ? T.red : T.textMid, marginTop: 1, fontWeight: faltaCantidad ? 700 : 400 }}>
                {faltaCantidad ? "Falta indicar cantidad" : p.calcType === "fixed" ? `S/ ${p.precio} precio fijo` : `S/ ${p.precio} / ${p.unidad}`}
              </p>
            </div>
            {p.calcType !== "fixed" && (
              <input
                type="text"
                inputMode="decimal"
                value={it?.qty ?? ""}
                onChange={(e) => setCantidad(cap, p, e.target.value)}
                placeholder="0"
                style={{ width: 52, padding: "8px 6px", borderRadius: 10, fontSize: 15, fontWeight: 800, border: `1.5px solid ${faltaCantidad ? T.red : sel ? cap.color : T.slateD}`, outline: "none", color: T.text, background: T.slate, textAlign: "center", fontFamily: "inherit", flexShrink: 0 }}
              />
            )}
            <button
              type="button"
              onClick={() => toggleSvc(cap, p)}
              style={{ width: 32, height: 32, borderRadius: 10, background: sel ? cap.color : T.slate, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s", boxShadow: sel ? `0 2px 8px ${cap.color}40` : "none", border: "none", cursor: "pointer" }}
            >
              <Ic d={sel ? checkPath : plusPath} color={sel ? T.white : T.textMid} size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <MobileShell>
      <div style={{ minHeight: "100vh", background: T.slate, paddingBottom: 40 }}>
        <DarkHeader
          titulo={editandoId ? "Editar cotización" : "Nueva cotización"}
          subtitulo={phaseSubtitle}
          pt={50}
          icono={<Ic d={zapPath} color={T.white} size={22} />}
          preTitulo={<BackBtn href="/cotizaciones" label="Volver" />}
          accion={basket.length > 0 && phase === "cats" ? (
            <div className="pi" style={{ width: 30, height: 30, borderRadius: 15, background: T.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: T.white, fontSize: 13, fontWeight: 900 }}>{basket.length}</span>
            </div>
          ) : undefined}
        >
          <StepDots current={phaseStep} total={3} />
        </DarkHeader>

      <div style={{ padding: "18px 16px 100px" }}>

        {/* ══ PASO 1: SELECCIÓN (Regla 3 — sin cálculo). Drill-down Fable 5: una
             pantalla por paso — la lista de categorías se reemplaza por completo
             al abrir una, igual que ya hacía Construcción → subcategorías
             (05-MODULO-COTIZACIONES.md líneas 59, 67-99, 123-125). ══ */}
        {phase === "cats" && (
          <div className="su">

            {/* ── Lista de categorías (solo visible sin categoría abierta) ── */}
            {selCat === null && (
              <>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
                  Toca una categoría para ver sus partidas
                </p>

                {showConstruccion && (() => {
                  const cap = CONSTRUCCION_META;
                  const selCount = basket.filter((b) => construccionSubs.some((s) => s.partidas.some((p) => p.id === b.svcId))).length;
                  return (
                    <button
                      key={CONSTRUCCION_ID}
                      type="button"
                      onClick={() => setSelCat(CONSTRUCCION_ID)}
                      style={{ width: "100%", marginBottom: 8, borderRadius: 16, border: `2px solid ${selCount > 0 ? cap.color : T.slateD}`, padding: "14px 16px", background: selCount > 0 ? cap.color + "07" : T.white, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}
                    >
                      <span style={{ fontSize: 26, lineHeight: 1 }}>{cap.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: selCount > 0 ? cap.color : T.text }}>{cap.nombre}</p>
                        <p style={{ fontSize: 11, color: T.textMid, marginTop: 1 }}>
                          {selCount > 0 ? `${selCount} partida${selCount !== 1 ? "s" : ""} añadida${selCount !== 1 ? "s" : ""}` : `${construccionSubs.length} subcategorías`}
                        </p>
                      </div>
                      {selCount > 0 && (
                        <div style={{ width: 22, height: 22, borderRadius: 11, background: T.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Ic d={checkPath} color={T.white} size={12} />
                        </div>
                      )}
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: T.slate, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Ic d={chevronPath} color={T.textMid} size={16} sw={2.5} />
                      </div>
                    </button>
                  );
                })()}

                {otrasCategorias.map((cap) => {
                  const selCount = basket.filter((b) => cap.partidas.some((p) => p.id === b.svcId)).length;
                  return (
                    <button
                      key={cap.id}
                      type="button"
                      onClick={() => setSelCat(cap.id)}
                      style={{ width: "100%", marginBottom: 8, borderRadius: 16, border: `2px solid ${selCount > 0 ? cap.color : T.slateD}`, padding: "14px 16px", background: selCount > 0 ? cap.color + "07" : T.white, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}
                    >
                      <span style={{ fontSize: 26, lineHeight: 1 }}>{cap.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: selCount > 0 ? cap.color : T.text }}>{cap.nombre}</p>
                        <p style={{ fontSize: 11, color: T.textMid, marginTop: 1 }}>
                          {selCount > 0 ? `${selCount} partida${selCount !== 1 ? "s" : ""} añadida${selCount !== 1 ? "s" : ""}` : `${cap.partidas.length} partidas disponibles`}
                        </p>
                      </div>
                      {selCount > 0 && (
                        <div style={{ width: 22, height: 22, borderRadius: 11, background: T.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Ic d={checkPath} color={T.white} size={12} />
                        </div>
                      )}
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: T.slate, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Ic d={chevronPath} color={T.textMid} size={16} sw={2.5} />
                      </div>
                    </button>
                  );
                })}
              </>
            )}

            {/* ── Detalle Construcción → subcategorías → partidas (Regla 2) ── */}
            {selCat === CONSTRUCCION_ID && (() => {
              const cap = CONSTRUCCION_META;
              const activeSub = selSubCat ? construccionSubs.find((s) => s.id === selSubCat) : null;
              return (
                <div>
                  <button
                    type="button"
                    onClick={() => { setSelCat(null); setSelSubCat(null); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.blue, marginBottom: 12 }}
                  >
                    ← Categorías
                  </button>

                  {!activeSub && (
                    <div className="su">
                      {SUBCATEGORIAS_CONSTRUCCION.filter((sub) => construccionSubs.some((c) => c.id === sub.id)).map((sub) => {
                        const subCap = construccionSubs.find((c) => c.id === sub.id)!;
                        const subSel = basket.filter((b) => subCap.partidas.some((p) => p.id === b.svcId)).length;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setSelSubCat(sub.id)}
                            style={{ width: "100%", padding: "12px 14px", marginBottom: 6, borderRadius: 12, border: `1.5px solid ${subSel > 0 ? subCap.color + "50" : T.slateD}`, background: subSel > 0 ? subCap.color + "08" : T.white, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}
                          >
                            <span style={{ fontSize: 22 }}>{sub.emoji}</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{sub.nombre}</p>
                              <p style={{ fontSize: 11, color: T.textMid }}>{subCap.partidas.length} partidas</p>
                            </div>
                            {subSel > 0 && <span style={{ fontSize: 12, fontWeight: 800, color: subCap.color }}>{subSel}</span>}
                            <Ic d={chevronPath} color={T.textMid} size={16} />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {activeSub && (
                    <div style={{ borderRadius: 16, overflow: "hidden", border: `2px solid ${cap.color}60` }}>
                      <button
                        type="button"
                        onClick={() => setSelSubCat(null)}
                        style={{ width: "100%", padding: "10px 16px", background: T.slate, border: "none", cursor: "pointer", textAlign: "left", fontSize: 12, fontWeight: 700, color: T.blue }}
                      >
                        ← Subcategorías
                      </button>
                      {renderPartidas(activeSub)}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── Detalle resto de categorías — solo partidas (Regla: "Pantalla de
                 Partidas muestra únicamente las partidas") ── */}
            {selCat !== null && selCat !== CONSTRUCCION_ID && (() => {
              const cap = otrasCategorias.find((c) => c.id === selCat);
              if (!cap) return null;
              return (
                <div>
                  <button
                    type="button"
                    onClick={() => setSelCat(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.blue, marginBottom: 12 }}
                  >
                    ← Categorías
                  </button>
                  <div style={{ borderRadius: 16, overflow: "hidden", border: `2px solid ${cap.color}60` }}>
                    {renderPartidas(cap)}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ══ PASO 2: RESUMEN — presentación, sin controles de medición ══ */}
        {phase === "resumen" && (
          <div className="su">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.4 }}>Resumen de cotización</p>
              <button
                type="button"
                onClick={() => { setSelCat(null); setSelSubCat(null); setPhase("cats"); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.blue }}
              >
                ← Partidas
              </button>
            </div>

            <div style={{ background: `linear-gradient(148deg,${T.blue} 0%,${T.blueL} 100%)`, borderRadius: 18, padding: "18px 18px 16px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: 90, background: "rgba(255,255,255,0.06)" }} />
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, position: "relative" }}>Total cotización</p>
              <p style={{ color: T.white, fontSize: 32, fontWeight: 900, letterSpacing: -1, lineHeight: 1.1, position: "relative" }}>{fmtPEN(totalFinal)}</p>
              <div style={{ display: "flex", gap: 16, marginTop: 12, position: "relative" }}>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>Ejecución material</p>
                  <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 700, marginTop: 2 }}>{fmtPEN(totalBase)}</p>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.15)" }} />
                <div>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>Mano de obra ({margin % 1 === 0 ? margin : margin.toFixed(1)}%)</p>
                  <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 700, marginTop: 2 }}>{fmtPEN(totalLabor)}</p>
                </div>
              </div>
            </div>

            <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.slateD}`, overflow: "hidden", marginBottom: 12 }}>
              {Object.entries(groupedItems).map(([catLabel, its], gi) => {
                const cap = sortedCatalogo.find((c) => c.nombre === catLabel);
                const chapTotal = its.reduce((a, it) => a + calcItem(it).subtotal, 0);
                return (
                  <div key={catLabel}>
                    <div style={{ background: (cap?.color || T.blue) + "10", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: gi > 0 ? `1px solid ${T.slateD}` : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 15 }}>{cap?.emoji || "📋"}</span>
                        <p style={{ fontSize: 12, fontWeight: 800, color: cap?.color || T.blue, textTransform: "uppercase", letterSpacing: 0.4 }}>{catLabel}</p>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 800, color: cap?.color || T.blue }}>{fmtPEN(chapTotal)}</p>
                    </div>
                    {its.map((it) => {
                      const { subtotal } = calcItem(it);
                      return (
                        <div key={it.svcId} style={{ padding: "11px 16px", borderBottom: `1px solid ${T.slate}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.3, flex: 1 }}>{it.svcLabel}</p>
                            <p style={{ fontSize: 13, fontWeight: 800, color: T.text, flexShrink: 0 }}>{fmtPEN(subtotal)}</p>
                          </div>
                          <p style={{ fontSize: 11, color: T.textMid, marginTop: 2 }}>
                            {it.calcType === "fixed" ? `Precio fijo · S/ ${it.basePrice}` : `${it.qty} ${it.unit} · S/ ${it.basePrice}/${it.unit}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.slateD}`, padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Ajustar mano de obra</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: T.blue }}>{margin % 1 === 0 ? margin : margin.toFixed(1)}% · {fmtPEN(totalLabor)}</span>
              </div>
              <input type="range" min={0} max={120} step={5} value={margin} onChange={(e) => { setMargin(parseInt(e.target.value)); setMontoManoObra(""); }} style={{ accentColor: T.blue, width: "100%", marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {[0, 25, 40, 60, 80, 100].map((v) => (
                  <button key={v} type="button" onClick={() => { setMargin(v); setMontoManoObra(""); }} style={{ flex: 1, padding: "7px 2px", borderRadius: 10, border: `1.5px solid ${margin === v ? T.blue : T.slateD}`, background: margin === v ? T.bluePale : "none", cursor: "pointer", fontSize: 11, fontWeight: 800, color: margin === v ? T.blue : T.textMid }}>
                    {v}%
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.textMid }}>S/</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={montoManoObra}
                  onChange={(e) => handleMontoManoObra(e.target.value)}
                  placeholder="Monto fijo de mano de obra"
                  style={{ flex: 1, padding: "9px 12px", borderRadius: 10, fontSize: 14, fontWeight: 700, border: `1.5px solid ${T.slateD}`, outline: "none", color: T.text, background: T.slate, textAlign: "center", fontFamily: "inherit" }}
                />
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="📝 Condiciones, plazos, exclusiones… (aparece en el PDF)"
              style={{ width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 14, border: `1.5px solid ${T.slateD}`, outline: "none", color: T.text, background: T.white, resize: "none", minHeight: 72, marginBottom: 12, fontFamily: "inherit" }}
            />

            <button
              type="button"
              onClick={goToCliente}
              style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${T.blue},${T.blueL})`, color: T.white, fontSize: 15, fontWeight: 800, boxShadow: `0 4px 16px ${T.blue}40` }}
            >
              Continuar → Cliente
            </button>
          </div>
        )}

        {/* ══ PASO 4: CLIENTE + CONFIRMACIÓN (Regla 10) ══ */}
        {phase === "cliente" && (
          <div className="su">
            <button
              type="button"
              onClick={() => setPhase("resumen")}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.blue, marginBottom: 14 }}
            >
              ← Resumen
            </button>

            <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.slateD}`, padding: "14px 16px", marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Cliente</p>
              {[
                { k: "name",  ph: "Nombre del cliente",      val: clientName, set: setClientName },
                { k: "phone", ph: "Teléfono / WhatsApp",     val: phone,      set: setPhone },
                { k: "city",  ph: "Ciudad / Dirección obra",  val: city,       set: setCity },
              ].map((f, i) => (
                <div key={f.k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 2 ? `1px solid ${T.slateD}` : "none" }}>
                  <input
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.ph}
                    style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: T.text, background: "transparent", fontFamily: "inherit" }}
                  />
                </div>
              ))}
            </div>

            <div style={{ background: T.bluePale, borderRadius: 14, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Total a confirmar</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: T.blue }}>{fmtPEN(totalFinal)}</span>
            </div>

            {/* Actions */}
            <button
              type="button"
              onClick={doSave}
              disabled={loading || clientName.trim().length < 2 || phone.trim().replace(/\D/g, "").length < 7}
              style={{ width: "100%", padding: 16, borderRadius: 14, border: saved ? `1.5px solid ${T.green}30` : "none", cursor: "pointer", background: saved ? T.greenPale : `linear-gradient(135deg,${T.green},${T.greenD})`, color: saved ? T.green : T.white, fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: saved ? "none" : `0 4px 16px ${T.green}35`, marginBottom: 10, opacity: clientName.trim().length < 2 || phone.trim().replace(/\D/g, "").length < 7 ? 0.5 : 1 }}
            >
              {loading ? "Guardando…" : saved ? (
                <><Ic d={checkPath} color={T.green} size={16} /> {editandoId ? "Actualizada" : "Guardada"}</>
              ) : (
                <><Ic d={savePath} color={T.white} size={15} /> {editandoId ? `Actualizar · ${fmtPEN(totalFinal)}` : `Guardar cotización · ${fmtPEN(totalFinal)}`}</>
              )}
            </button>

            {saved && pdfUrlGuardado && (
              <button
                type="button"
                onClick={async () => {
                  const r = await compartirPDF(pdfUrlGuardado, `Cotización — ${clientName.trim() || "Sin cliente"}`, "cotizacion.pdf");
                  if (r.method === "clipboard") mostrarToast("Enlace copiado al portapapeles ✓");
                  else if (r.method === "error") window.open(pdfUrlGuardado, "_blank");
                }}
                style={{ width: "100%", padding: 13, borderRadius: 14, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${T.navy},${T.navyLight})`, color: T.white, fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10, boxShadow: `0 4px 14px ${T.navy}30` }}
              >
                📤 Compartir PDF
              </button>
            )}

            {saved && (
              <button
                type="button"
                onClick={() => { router.push("/cotizaciones"); router.refresh(); }}
                style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${T.blue},${T.blueL})`, color: T.white, fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10, boxShadow: `0 4px 16px ${T.blue}35` }}
              >
                Ver mis cotizaciones →
              </button>
            )}

            <button
              type="button"
              onClick={reset}
              style={{ width: "100%", padding: 13, borderRadius: 14, border: `1.5px dashed ${T.slateD}`, background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: T.textMid }}
            >
              + Nueva cotización
            </button>
          </div>
        )}
      </div>

        {phase === "cats" && basket.length > 0 && (
          <FloatBar
            label={`${basket.length} partida${basket.length !== 1 ? "s" : ""} seleccionada${basket.length !== 1 ? "s" : ""}`}
            badge={basket.length}
            value={fmtPEN(totalFinal)}
            primaryLabel="Continuar → Resumen"
            onPrimary={goToResumen}
            onSecondary={() => setBasket([])}
            primaryDisabled={!cantidadesCompleto}
          />
        )}
      </div>
    </MobileShell>
  );
}
