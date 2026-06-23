"use client";
// DARIVO PRO — Wizard de cotización (diseño Fable 5 exacto)
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePresupuesto } from "@/hooks/usePresupuesto";
import { usePresupuestoDraft } from "@/hooks/usePresupuestoDraft";
import { useCatalogo } from "@/hooks/useCatalogo";
import { useRecentItems } from "@/hooks/useRecentItems";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase/client";
import { presupuestoSchema } from "@/lib/validations";
import { fmtPEN, buildWAMsgCotizacion } from "@/lib/utils";
import { T } from "@/lib/theme";
import type { LineaPresupuesto, Capitulo, Partida } from "@/types";
import Link from "next/link";

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

// ─── StepDots ─────────────────────────────────────────────────────────────────
function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === step ? 20 : 6,
            height: 6,
            borderRadius: 3,
            background: i === step ? T.white : i < step ? T.green : "rgba(255,255,255,0.2)",
            transition: "all 0.3s",
          }}
        />
      ))}
    </div>
  );
}

// ─── FloatBar ─────────────────────────────────────────────────────────────────
function FloatBar({ items, total, onContinue, onReset }: { items: { svcLabel: string }[]; total: number; onContinue: () => void; onReset: () => void }) {
  if (!items.length) return null;
  return (
    <div className="pi" style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 28px)", maxWidth: 362, zIndex: 200 }}>
      <div style={{ background: T.navyLight, borderRadius: 18, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 10px 36px rgba(0,0,0,0.55)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: T.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: T.white, fontSize: 15, fontWeight: 900 }}>{items.length}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {items.map(b => b.svcLabel).join(", ")}
          </p>
          <p style={{ color: T.white, fontSize: 17, fontWeight: 900 }}>{fmtPEN(total)}</p>
        </div>
        <button onClick={onReset} style={{ background: "rgba(255,255,255,0.07)", border: "none", cursor: "pointer", borderRadius: 9, padding: "7px 10px", color: T.textLight, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>✕</button>
        <button onClick={onContinue} style={{ background: `linear-gradient(135deg,${T.blue},${T.blueL})`, border: "none", cursor: "pointer", borderRadius: 13, padding: "11px 18px", color: T.white, fontSize: 14, fontWeight: 800, boxShadow: `0 4px 16px ${T.blue}50`, flexShrink: 0 }}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

// ─── Presets de cantidad por tipo ──────────────────────────────────────────────
const PRESETS: Record<string, number[]> = { m2: [5, 10, 15, 20, 30, 50, 80], unit: [1, 2, 3, 4, 5, 8, 10], hour: [1, 2, 4, 6, 8], fixed: [] };
function tipoToCalcType(tipo: string): string {
  if (tipo === "unidad") return "unit";
  if (tipo === "hora")   return "hour";
  if (tipo === "fijo")   return "fixed";
  return "m2";
}

// ─── Tipos locales ─────────────────────────────────────────────────────────────
interface BasketItem {
  svcId: string;
  catLabel: string;
  svcLabel: string;
  calcType: LineaPresupuesto["calcType"];
  basePrice: number;
  unit: string;
  qty: string;
  catColor: string;
  catEmoji: string;
}

// ─── Wizard principal ──────────────────────────────────────────────────────────
export function NuevoPresupuestoWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { crear, loading, generarPDF, registrarEnvioWA } = usePresupuesto();
  const { catalogo } = useCatalogo();
  const { trackItems, getRecentSvcIds, getMostRecentCatId, getCatFrequency, getLastClient, saveLastClient } = useRecentItems();
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const mostrarUpgrade = useAppStore((s) => s.mostrarUpgrade);
  const supabase = createClient();

  type Phase = "cats" | "input" | "result";
  const [phase, setPhase] = useState<Phase>("cats");
  const [selCat, setSelCat] = useState<string | null>(null);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [inputIdx, setInputIdx] = useState(0);
  const [margin, setMargin] = useState(40);
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [populated, setPopulated] = useState(false); // guard: run init logic only once
  const inputRef = useRef<HTMLInputElement>(null);

  // Draft restore
  const draftState = { clientName, phone, city, items: [], margin, notes, iaResult: null };
  const { limpiar } = usePresupuestoDraft(draftState);

  // ── Catálogo ordenado por frecuencia de uso reciente ──────────────────────
  const sortedCatalogo = useMemo(() => {
    if (!catalogo.length) return catalogo;
    const freq = getCatFrequency();
    const recentSvcs = new Set(getRecentSvcIds().slice(0, 10));
    return [...catalogo]
      .sort((a, b) => (freq[b.id] ?? 0) - (freq[a.id] ?? 0))
      .map((cap) => ({
        ...cap,
        // Within each category, move recently-used partidas to the top
        partidas: [
          ...cap.partidas.filter((p) => recentSvcs.has(p.id)),
          ...cap.partidas.filter((p) => !recentSvcs.has(p.id)),
        ],
      }));
  }, [catalogo]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Inicialización: ?cat=, ?from=<id>, o pre-abrir categoría reciente ────
  useEffect(() => {
    if (!catalogo.length || populated) return;
    setPopulated(true);

    const catParam  = searchParams.get("cat");
    const fromParam = searchParams.get("from");

    // 1. Deep-link ?cat= (desde dashboard)
    if (catParam && catalogo.some((c) => c.id === catParam)) {
      setSelCat(catParam);
      return;
    }

    // 2. Re-usar cotización anterior (?from=<id>)
    if (fromParam) {
      void (async () => {
        const { data } = await supabase
          .from("presupuestos")
          .select("*, items:presupuesto_items(*)")
          .eq("id", fromParam)
          .single();
        if (!data) return;
        // Build basket from previous items, resolving catColor/catEmoji from current catalog
        const newBasket: BasketItem[] = (data.items ?? []).map((it: Record<string, unknown>) => {
          const cap = catalogo.find((c) => c.nombre === String(it.cat_label ?? ""))
            ?? catalogo.find((c) => c.partidas.some((p) => p.id === String(it.svc_id)));
          return {
            svcId:     String(it.svc_id),
            catLabel:  String(it.cat_label ?? ""),
            svcLabel:  String(it.svc_label ?? ""),
            calcType:  (it.calc_type as LineaPresupuesto["calcType"]) ?? "fixed",
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
        // Skip straight to result — all quantities already filled
        setPhase("result");
      })();
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
  }, [catalogo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus quantity input
  useEffect(() => {
    if (phase === "input") {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [phase, inputIdx]);

  // Totals
  const calcItem = (it: BasketItem) => {
    const q = it.calcType === "fixed" ? 1 : parseFloat(it.qty) || 0;
    return { qty: q, unitPrice: it.basePrice, subtotal: q * it.basePrice };
  };
  const totalBase  = basket.reduce((a, it) => a + calcItem(it).subtotal, 0);
  const totalLabor = Math.round(totalBase * margin) / 100;
  const totalFinal = totalBase + totalLabor;

  // Basket helpers
  const isSelected = (id: string) => basket.some((b) => b.svcId === id);
  const catForSvc  = (id: string) => sortedCatalogo.find((c) => c.partidas.some((p) => p.id === id));

  const toggleSvc = (cap: Capitulo, partida: Partida) => {
    if (isSelected(partida.id)) {
      setBasket((b) => b.filter((x) => x.svcId !== partida.id));
      return;
    }
    const calcType = tipoToCalcType(partida.tipo) as LineaPresupuesto["calcType"];
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

  const goToInput = () => {
    const firstNF = basket.findIndex((b) => b.calcType !== "fixed");
    if (firstNF === -1) { setPhase("result"); return; }
    setInputIdx(firstNF);
    setPhase("input");
  };

  const advanceInput = (idx: number) => {
    let next = idx + 1;
    while (next < basket.length && basket[next].calcType === "fixed") next++;
    if (next >= basket.length) setPhase("result");
    else setInputIdx(next);
  };

  const updateQty = (idx: number, val: string) =>
    setBasket((b) => b.map((it, i) => i === idx ? { ...it, qty: val } : it));

  // Save
  const doSave = async () => {
    const items: LineaPresupuesto[] = basket.map((it) => {
      const { qty, unitPrice, subtotal } = calcItem(it);
      return { svcId: it.svcId, catLabel: it.catLabel, svcLabel: it.svcLabel, calcType: it.calcType, basePrice: it.basePrice, unit: it.unit, qty, unitPrice, subtotal };
    });
    const payload = { clientName: clientName.trim() || "Sin cliente", phone: phone.trim() || undefined, city: city.trim() || undefined, items, margin, totalBase, totalLabor, totalFinal, status: "Borrador" as const, notes: notes.trim() || undefined };
    const valido = presupuestoSchema.safeParse(payload);
    if (!valido.success) { mostrarToast(valido.error.errors[0]?.message ?? "Revisa los datos", "error"); return; }
    const creado = await crear(payload, mostrarUpgrade);
    if (!creado) { mostrarToast("No se pudo guardar la cotización", "error"); return; }

    // Track recents & client autocomplete
    trackItems(basket.map((b) => ({ svcId: b.svcId, catId: catalogo.find((c) => c.partidas.some((p) => p.id === b.svcId))?.id ?? "" })));
    saveLastClient({ name: clientName.trim(), phone: phone.trim(), city: city.trim() });
    limpiar();
    setSaved(true);
    mostrarToast(`${creado.cotNum ?? "Cotización"} creada ✓`);

    // ── Auto PDF + WhatsApp (pure logic, no UI changes) ──────────────────
    // 1. Generate PDF automatically
    const pdfUrl = await generarPDF(creado.id).catch(() => null);

    // 2. Build WhatsApp message if a phone number exists
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
        cotNum:      creado.cotNum,
        clientName:  clientName.trim() || "Sin cliente",
        groupedItems: groupedForWA,
        totalBase,
        totalLabor,
        margin,
        totalFinal,
        pdfUrl:      pdfUrl ?? undefined,
      });
      const numero = cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`;
      const waUrl  = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
      // 3. Open WhatsApp ready to send
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }

    // 4. Record WA send date and PDF URL in Supabase
    await registrarEnvioWA(creado.id, pdfUrl ?? undefined);
  };

  const reset = () => {
    setPhase("cats"); setSelCat(null); setBasket([]); setInputIdx(0); setMargin(40);
    setClientName(""); setPhone(""); setCity(""); setNotes(""); setSaved(false);
  };

  // Group basket by category for result view
  const groupedItems = basket.reduce<Record<string, BasketItem[]>>((g, it) => {
    (g[it.catLabel] = g[it.catLabel] || []).push(it);
    return g;
  }, {});

  const phaseStep = phase === "cats" ? 0 : phase === "input" ? 1 : 2;

  return (
    <div style={{ minHeight: "100vh", background: T.slate, paddingBottom: 40 }}>
      {/* DarkHeader */}
      <div style={{ background: `linear-gradient(160deg,${T.navy} 0%,${T.navyLight} 100%)`, padding: "50px 18px 22px", borderBottomLeftRadius: 26, borderBottomRightRadius: 26 }}>
        {/* Back */}
        <Link href="/presupuestos" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 14, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
          <Ic d={["M19 12H5","M12 19l-7-7 7-7"]} color={T.textLight} size={18} />
          <span style={{ color: T.textLight, fontSize: 13, fontWeight: 600 }}>Volver</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: T.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Ic d={zapPath} color={T.white} size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: T.white, fontSize: 18, fontWeight: 900, lineHeight: 1.1 }}>Nueva cotización</h2>
            <p style={{ color: T.textLight, fontSize: 12, marginTop: 2 }}>
              {phase === "cats"  && "Abre capítulos y marca partidas"}
              {phase === "input" && "Introduce las cantidades"}
              {phase === "result"&& "Cotización generada"}
            </p>
          </div>
          {basket.length > 0 && phase !== "result" && (
            <div className="pi" style={{ width: 30, height: 30, borderRadius: 15, background: T.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: T.white, fontSize: 13, fontWeight: 900 }}>{basket.length}</span>
            </div>
          )}
        </div>
        <StepDots step={phaseStep} total={3} />
      </div>

      <div style={{ padding: "18px 16px 100px" }}>

        {/* ══ FASE 1: ACORDEÓN ══ */}
        {phase === "cats" && (
          <div className="su">

            {/* Basket mini-summary */}
            {basket.length > 0 && (
              <div className="pi" style={{ background: T.navyLight, borderRadius: 16, padding: "12px 16px", marginBottom: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                  Partidas seleccionadas ({basket.length})
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {basket.map((it) => {
                    const cap = catForSvc(it.svcId);
                    return (
                      <div key={it.svcId} style={{ display: "flex", alignItems: "center", gap: 5, background: (cap?.color || T.blue) + "20", borderRadius: 20, padding: "4px 10px 4px 7px", border: `1px solid ${(cap?.color || T.blue)}30` }}>
                        <span style={{ fontSize: 12 }}>{cap?.emoji}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: cap?.color || T.blue }}>{it.svcLabel}</span>
                        <button onClick={() => setBasket((b) => b.filter((x) => x.svcId !== it.svcId))} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMid, fontSize: 14, lineHeight: 1, padding: "0 2px", marginLeft: 2 }}>×</button>
                      </div>
                    );
                  })}
                </div>
                <button onClick={goToInput} style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${T.blue},${T.blueL})`, color: T.white, fontSize: 15, fontWeight: 800, boxShadow: `0 3px 14px ${T.blue}40` }}>
                  Calcular cotización →
                </button>
              </div>
            )}

            <p style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
              Toca un capítulo para ver sus partidas
            </p>

            {/* Acordeón — ordenado por uso reciente */}
            {sortedCatalogo.map((cap) => {
              const isOpen = selCat === cap.id;
              const selCount = basket.filter((b) => cap.partidas.some((p) => p.id === b.svcId)).length;
              return (
                <div key={cap.id} style={{ marginBottom: 8, borderRadius: 16, overflow: "hidden", border: `2px solid ${selCount > 0 ? cap.color : isOpen ? cap.color + "60" : T.slateD}`, transition: "border-color 0.2s" }}>
                  <button
                    type="button"
                    onClick={() => setSelCat(isOpen ? null : cap.id)}
                    style={{ width: "100%", padding: "14px 16px", background: isOpen ? cap.color + "0E" : selCount > 0 ? cap.color + "07" : T.white, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}
                  >
                    <span style={{ fontSize: 26, lineHeight: 1 }}>{cap.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 15, fontWeight: 800, color: isOpen || selCount > 0 ? cap.color : T.text }}>{cap.nombre}</p>
                      <p style={{ fontSize: 11, color: T.textMid, marginTop: 1 }}>
                        {selCount > 0 ? `${selCount} partida${selCount !== 1 ? "s" : ""} añadida${selCount !== 1 ? "s" : ""}` : `${cap.partidas.length} partidas disponibles`}
                      </p>
                    </div>
                    {selCount > 0 && (
                      <div style={{ width: 22, height: 22, borderRadius: 11, background: T.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Ic d={checkPath} color={T.white} size={12} />
                      </div>
                    )}
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: isOpen ? cap.color + "15" : T.slate, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                      <Ic d={chevronPath} color={isOpen ? cap.color : T.textMid} size={16} sw={2.5}
                        // @ts-expect-error style prop on custom component
                        style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="su" style={{ background: T.white, borderTop: `1px solid ${cap.color}20` }}>
                      {cap.partidas.map((p, si) => {
                        const sel = isSelected(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggleSvc(cap, p)}
                            style={{
                              width: "100%", padding: "12px 16px 12px 20px",
                              borderBottom: si < cap.partidas.length - 1 ? `1px solid ${T.slate}` : "none",
                              border: "none", background: sel ? cap.color + "0A" : T.white,
                              cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, textAlign: "left",
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 14, fontWeight: sel ? 800 : 600, color: sel ? cap.color : T.text, lineHeight: 1.3 }}>{p.nombre}</p>
                              <p style={{ fontSize: 12, color: T.textMid, marginTop: 1 }}>
                                {p.tipo === "fijo" ? `S/ ${p.precio} precio fijo` : `S/ ${p.precio} / ${p.unidad}`}
                              </p>
                            </div>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: sel ? cap.color : T.slate, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s", boxShadow: sel ? `0 2px 8px ${cap.color}40` : "none" }}>
                              <Ic d={sel ? checkPath : plusPath} color={sel ? T.white : T.textMid} size={15} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {basket.length > 0 && (
              <button
                type="button"
                onClick={goToInput}
                style={{ width: "100%", marginTop: 12, padding: 16, borderRadius: 14, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${T.blue},${T.blueL})`, color: T.white, fontSize: 15, fontWeight: 800, boxShadow: `0 4px 16px ${T.blue}40` }}
              >
                Calcular cotización · {basket.length} partida{basket.length !== 1 ? "s" : ""} →
              </button>
            )}
          </div>
        )}

        {/* ══ FASE 2: MEDICIONES ══ */}
        {phase === "input" && (
          <div className="su">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.4 }}>Introduce las cantidades</p>
              <button
                type="button"
                onClick={() => { setSelCat(null); setPhase("cats"); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.blue }}
              >
                + Añadir más
              </button>
            </div>

            {basket.map((it, idx) => {
              const isCurr = idx === inputIdx;
              const cap = catForSvc(it.svcId);
              const q = parseFloat(it.qty) || 0;
              const sub = it.calcType === "fixed" ? it.basePrice : q * it.basePrice;
              const done = !!it.qty && q > 0 && idx < inputIdx;
              const calcTypeKey = it.calcType === "m2" ? "m2" : it.calcType === "unit" ? "unit" : it.calcType === "hour" ? "hour" : "fixed";

              if (it.calcType === "fixed") return (
                <div key={it.svcId} style={{ background: T.greenPale, borderRadius: 14, border: `1.5px solid ${T.green}30`, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: T.greenD }}>{it.svcLabel}</p>
                    <p style={{ fontSize: 11, color: T.greenD, opacity: 0.7 }}>Precio fijo · auto-incluido</p>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 900, color: T.greenD }}>{fmtPEN(it.basePrice)}</p>
                </div>
              );

              if (!isCurr && done) return (
                <button key={it.svcId} type="button" onClick={() => setInputIdx(idx)} style={{ width: "100%", background: T.white, borderRadius: 14, border: `1.5px solid ${T.slateD}`, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 13, background: T.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Ic d={checkPath} color={T.white} size={13} />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{it.svcLabel}</p>
                      <p style={{ fontSize: 11, color: T.textMid }}>{it.qty} {it.unit} × S/ {it.basePrice}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: T.blue }}>{fmtPEN(sub)}</p>
                </button>
              );

              if (!isCurr) return (
                <div key={it.svcId} style={{ background: T.white, borderRadius: 14, border: `1.5px solid ${T.slateD}`, padding: "12px 16px", marginBottom: 8, opacity: 0.45 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.textMid }}>{it.svcLabel}</p>
                  <p style={{ fontSize: 11, color: T.textLight }}>Pendiente…</p>
                </div>
              );

              return (
                <div key={it.svcId} className="pi" style={{ background: T.white, borderRadius: 20, border: `2.5px solid ${cap?.color || T.blue}`, padding: "18px 16px", marginBottom: 10, boxShadow: `0 6px 22px ${cap?.color || T.blue}20` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: cap?.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{it.catLabel}</p>
                      <p style={{ fontSize: 16, fontWeight: 900, color: T.text, marginTop: 2, lineHeight: 1.25 }}>{it.svcLabel}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                      <p style={{ fontSize: 13, color: T.textMid, fontWeight: 600 }}>S/ {it.basePrice}/{it.unit}</p>
                      {q > 0 && <p style={{ fontSize: 12, color: T.blue, fontWeight: 700, marginTop: 2 }}>{fmtPEN(sub)}</p>}
                    </div>
                  </div>

                  <p style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                    {it.calcType === "m2" ? "Dimensiones (m²)" : it.calcType === "hour" ? "Horas estimadas" : "Cantidad (unidades)"}
                  </p>
                  <div style={{ position: "relative", marginBottom: 12 }}>
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="decimal"
                      value={it.qty}
                      onChange={(e) => updateQty(idx, e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && it.qty) advanceInput(idx); }}
                      placeholder="0"
                      style={{ width: "100%", padding: "18px 60px 18px 22px", borderRadius: 16, fontSize: 50, fontWeight: 900, border: `2px solid ${q > 0 ? cap?.color || T.blue : T.slateD}`, outline: "none", color: T.text, background: T.slate, textAlign: "center", transition: "border-color 0.15s", fontFamily: "inherit" }}
                    />
                    <span style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", fontSize: 14, fontWeight: 700, color: T.textMid }}>{it.unit}</span>
                  </div>

                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
                    {(PRESETS[calcTypeKey] || []).map((n) => {
                      const active = String(it.qty) === String(n);
                      return (
                        <button key={n} type="button" onClick={() => { updateQty(idx, String(n)); setTimeout(() => advanceInput(idx), 160); }}
                          style={{ padding: "10px 16px", borderRadius: 24, border: `2px solid ${active ? cap?.color || T.blue : T.slateD}`, background: active ? (cap?.color || T.blue) + "12" : T.white, cursor: "pointer", fontSize: 15, fontWeight: 800, color: active ? cap?.color || T.blue : T.textMid }}>
                          {n}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => { if (it.qty) advanceInput(idx); }}
                    disabled={!it.qty}
                    style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", cursor: it.qty ? "pointer" : "default", background: it.qty ? `linear-gradient(135deg,${cap?.color || T.blue},${T.blueL})` : T.slateD, color: T.white, fontSize: 15, fontWeight: 800, boxShadow: it.qty ? `0 4px 14px ${cap?.color || T.blue}35` : "none" }}
                  >
                    {basket.slice(idx + 1).every((b) => b.calcType === "fixed") ? "Ver cotización →" : "Siguiente →"}
                  </button>
                </div>
              );
            })}

            <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.slateD}`, padding: "14px 16px", marginTop: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Mano de obra / beneficio</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: T.blue }}>{margin}%</span>
              </div>
              <input type="range" min={0} max={120} step={5} value={margin} onChange={(e) => setMargin(parseInt(e.target.value))} style={{ accentColor: T.blue, width: "100%" }} />
            </div>
          </div>
        )}

        {/* ══ FASE 3: RESULTADO ══ */}
        {phase === "result" && (
          <div className="su">
            {/* Hero card */}
            <div style={{ background: `linear-gradient(148deg,${T.blue} 0%,${T.blueL} 100%)`, borderRadius: 22, padding: "26px 22px 22px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: 90, background: "rgba(255,255,255,0.06)" }} />
              <div style={{ position: "absolute", bottom: -30, left: -20, width: 130, height: 130, borderRadius: 65, background: "rgba(255,255,255,0.04)" }} />
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, position: "relative" }}>Total cotización</p>
              <p style={{ color: T.white, fontSize: 54, fontWeight: 900, letterSpacing: -3, lineHeight: 1, position: "relative" }}>{fmtPEN(totalFinal)}</p>
              <div style={{ display: "flex", gap: 20, marginTop: 14, position: "relative" }}>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>Materiales</p>
                  <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: 700, marginTop: 2 }}>{fmtPEN(totalBase)}</p>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.15)" }} />
                <div>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>M. obra ({margin}%)</p>
                  <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: 700, marginTop: 2 }}>{fmtPEN(totalLabor)}</p>
                </div>
              </div>
            </div>

            {/* Grouped breakdown */}
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
                      const { qty, unitPrice, subtotal } = calcItem(it);
                      return (
                        <div key={it.svcId} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center", padding: "11px 16px", borderBottom: `1px solid ${T.slate}` }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.3 }}>{it.svcLabel}</p>
                          <p style={{ fontSize: 11, color: T.textMid, textAlign: "right", whiteSpace: "nowrap" }}>
                            {it.calcType === "fixed" ? "1 und" : `${qty} ${it.unit} × S/${unitPrice}`}
                          </p>
                          <p style={{ fontSize: 13, fontWeight: 800, color: T.text, textAlign: "right", minWidth: 60 }}>{fmtPEN(subtotal)}</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.slateD}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: T.textMid }}>Materiales</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{fmtPEN(totalBase)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: T.textMid }}>Mano de obra ({margin}%)</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{fmtPEN(totalLabor)}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: T.bluePale }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>TOTAL COTIZACIÓN</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: T.blue }}>{fmtPEN(totalFinal)}</span>
              </div>
            </div>

            {/* Margin adjust */}
            <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.slateD}`, padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Ajustar mano de obra</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: T.blue }}>{margin}% · {fmtPEN(totalLabor)}</span>
              </div>
              <input type="range" min={0} max={120} step={5} value={margin} onChange={(e) => setMargin(parseInt(e.target.value))} style={{ accentColor: T.blue, width: "100%", marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 6 }}>
                {[0, 25, 40, 60, 80, 100].map((v) => (
                  <button key={v} type="button" onClick={() => setMargin(v)} style={{ flex: 1, padding: "7px 2px", borderRadius: 10, border: `1.5px solid ${margin === v ? T.blue : T.slateD}`, background: margin === v ? T.bluePale : "none", cursor: "pointer", fontSize: 11, fontWeight: 800, color: margin === v ? T.blue : T.textMid }}>
                    {v}%
                  </button>
                ))}
              </div>
            </div>

            {/* Client */}
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

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="📝 Condiciones, plazos, exclusiones… (aparece en el PDF)"
              style={{ width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 14, border: `1.5px solid ${T.slateD}`, outline: "none", color: T.text, background: T.white, resize: "none", minHeight: 72, marginBottom: 12, fontFamily: "inherit" }}
            />

            {/* Actions */}
            <button
              type="button"
              onClick={doSave}
              disabled={loading}
              style={{ width: "100%", padding: 16, borderRadius: 14, border: saved ? `1.5px solid ${T.green}30` : "none", cursor: "pointer", background: saved ? T.greenPale : `linear-gradient(135deg,${T.green},${T.greenD})`, color: saved ? T.green : T.white, fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: saved ? "none" : `0 4px 16px ${T.green}35`, marginBottom: 10 }}
            >
              {loading ? "Guardando…" : saved ? (
                <><Ic d={checkPath} color={T.green} size={16} /> Guardada</>
              ) : (
                <><Ic d={savePath} color={T.white} size={15} /> Guardar cotización · {fmtPEN(totalFinal)}</>
              )}
            </button>

            {saved && (
              <button
                type="button"
                onClick={() => { router.push("/presupuestos"); router.refresh(); }}
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

      {phase === "input" && basket.length > 0 && (
        <FloatBar items={basket} total={totalFinal} onContinue={goToInput} onReset={() => setBasket([])} />
      )}
    </div>
  );
}
