"use client";
// DARIVO PRO — Wizard de cotización (diseño Fable 5 exacto — 3 pasos: 05-MODULO-COTIZACIONES.md v1.6 §2)
// Lógica de negocio compartida con Empresa en useCotizacionWizard() — este archivo
// es solo la capa de presentación Móvil (Fable 5).
import { useRouter } from "next/navigation";
import {
  useCotizacionWizard,
  CONSTRUCCION_ID, CONSTRUCCION_META,
  SUBCATEGORIAS_CONSTRUCCION,
  PRESETS,
  type BasketItem,
} from "@/hooks/useCotizacionWizard";
import { useAppStore } from "@/store/useAppStore";
import { fmtPEN } from "@/lib/utils";
import { compartirPDF } from "@/lib/share";
import { T } from "@/lib/design-system/tokens";
import { DarkHeader } from "@/components/design-system/DarkHeader";
import { BackBtn } from "@/components/design-system/BackBtn";
import { StepDots } from "@/components/design-system/StepDots";
import { FloatBar } from "@/components/design-system/FloatBar";
import { MobileShell } from "@/components/design-system/MobileShell";
import type { Capitulo } from "@/types";

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

// ─── Wizard principal ──────────────────────────────────────────────────────────
export function NuevoCotizacionWizard() {
  const router = useRouter();
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const w = useCotizacionWizard();

  /** Fila de partida — checkbox (fixed) o cantidad inline (m2/unit/hour).
   *  Reutilizado en categorías y subcategorías. */
  const renderPartidas = (cap: Capitulo) => (
    <div className="su" style={{ background: T.white, borderTop: `1px solid ${cap.color}20` }}>
      {cap.partidas.map((p, si) => {
        const sel = w.isSelected(p.id);
        const it = w.basket.find((b) => b.svcId === p.id);
        const calcTypeKey = p.calcType === "m2" ? "m2" : p.calcType === "unit" ? "unit" : p.calcType === "hour" ? "hour" : "fixed";
        return (
          <div
            key={p.id}
            style={{
              padding: "12px 16px 12px 20px",
              borderBottom: si < cap.partidas.length - 1 ? `1px solid ${T.slate}` : "none",
              background: sel ? cap.color + "0A" : T.white,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: sel ? 800 : 600, color: sel ? cap.color : T.text, lineHeight: 1.3 }}>{p.nombre}</p>
                <p style={{ fontSize: 12, color: T.textMid, marginTop: 1 }}>
                  {p.calcType === "fixed" ? `S/ ${p.precio} precio fijo` : `S/ ${p.precio} / ${p.unidad}`}
                </p>
              </div>
              {p.calcType === "fixed" && (
                <button
                  type="button"
                  onClick={() => w.toggleSvc(cap, p)}
                  style={{ width: 32, height: 32, borderRadius: 10, background: sel ? cap.color : T.slate, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "none", cursor: "pointer", transition: "background 0.15s", boxShadow: sel ? `0 2px 8px ${cap.color}40` : "none" }}
                >
                  <Ic d={sel ? checkPath : plusPath} color={sel ? T.white : T.textMid} size={15} />
                </button>
              )}
            </div>

            {p.calcType !== "fixed" && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={it?.qty ?? ""}
                    onChange={(e) => w.setCantidad(cap, p, e.target.value)}
                    placeholder="0"
                    style={{ flex: 1, padding: "10px 12px", borderRadius: 10, fontSize: 18, fontWeight: 800, border: `1.5px solid ${sel ? cap.color : T.slateD}`, outline: "none", color: T.text, background: T.slate, textAlign: "center", fontFamily: "inherit" }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.textMid, minWidth: 28 }}>{p.unidad}</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  {(PRESETS[calcTypeKey] || []).map((n) => (
                    <button key={n} type="button" onClick={() => w.setCantidad(cap, p, String(n))}
                      style={{ padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${String(it?.qty) === String(n) ? cap.color : T.slateD}`, background: String(it?.qty) === String(n) ? cap.color + "12" : T.white, cursor: "pointer", fontSize: 13, fontWeight: 800, color: String(it?.qty) === String(n) ? cap.color : T.textMid }}>
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
  );

  return (
    <MobileShell>
      <div style={{ minHeight: "100vh", background: T.slate, paddingBottom: 40 }}>
        <DarkHeader
          titulo={w.editandoId ? "Editar cotización" : "Nueva cotización"}
          subtitulo={w.phaseSubtitle}
          pt={50}
          icono={<Ic d={zapPath} color={T.white} size={22} />}
          preTitulo={<BackBtn href="/cotizaciones" label="Volver" />}
          accion={w.basket.length > 0 && w.phase === "cats" ? (
            <div className="pi" style={{ width: 30, height: 30, borderRadius: 15, background: T.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: T.white, fontSize: 13, fontWeight: 900 }}>{w.basket.length}</span>
            </div>
          ) : undefined}
        >
          <StepDots current={w.phaseStep} total={w.totalPasos} />
        </DarkHeader>

      <div style={{ padding: "18px 16px 100px" }}>

        {/* ══ PASO 1: SELECCIÓN + CANTIDAD (categoría → solo sus partidas) ══ */}
        {w.phase === "cats" && (
          <div className="su">

            {w.selCat === null ? (
              <>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
                  Toca una categoría para ver sus partidas
                </p>

                {/* Construcción → subcategorías → partidas (Regla 2) */}
                {w.showConstruccion && (() => {
                  const cap = CONSTRUCCION_META;
                  const selCount = w.basket.filter((b) => w.construccionSubs.some((s) => s.partidas.some((p) => p.id === b.svcId))).length;
                  return (
                    <button
                      key={CONSTRUCCION_ID}
                      type="button"
                      onClick={() => w.abrirCategoria(CONSTRUCCION_ID)}
                      style={{ width: "100%", marginBottom: 8, borderRadius: 16, border: `2px solid ${selCount > 0 ? cap.color : T.slateD}`, padding: "14px 16px", background: selCount > 0 ? cap.color + "07" : T.white, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}
                    >
                      <span style={{ fontSize: 26, lineHeight: 1 }}>{cap.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: selCount > 0 ? cap.color : T.text }}>{cap.nombre}</p>
                        <p style={{ fontSize: 11, color: T.textMid, marginTop: 1 }}>
                          {selCount > 0 ? `${selCount} partida${selCount !== 1 ? "s" : ""} añadida${selCount !== 1 ? "s" : ""}` : `${w.construccionSubs.length} subcategorías`}
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

                {/* Resto de categorías — acceso directo a partidas */}
                {w.otrasCategorias.map((cap) => {
                  const selCount = w.basket.filter((b) => cap.partidas.some((p) => p.id === b.svcId)).length;
                  return (
                    <button
                      key={cap.id}
                      type="button"
                      onClick={() => w.abrirCategoria(cap.id)}
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
            ) : w.selCat === CONSTRUCCION_ID && !w.selSubCat ? (
              /* Construcción abierta, sin subcategoría elegida — solo sus subcategorías */
              <div>
                <button
                  type="button"
                  onClick={w.volverACategorias}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.blue, marginBottom: 12 }}
                >
                  ← Categorías
                </button>
                <p style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 10 }}>{CONSTRUCCION_META.emoji} {CONSTRUCCION_META.nombre}</p>
                {SUBCATEGORIAS_CONSTRUCCION.filter((sub) => w.construccionSubs.some((c) => c.id === sub.id)).map((sub) => {
                  const subCap = w.construccionSubs.find((c) => c.id === sub.id)!;
                  const subSel = w.basket.filter((b) => subCap.partidas.some((p) => p.id === b.svcId)).length;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => w.abrirSubcategoria(sub.id)}
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
            ) : (
              /* Categoría (o subcategoría de Construcción) abierta — solo sus partidas */
              <div>
                <button
                  type="button"
                  onClick={w.selCat === CONSTRUCCION_ID ? w.volverASubcategorias : w.volverACategorias}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.blue, marginBottom: 12 }}
                >
                  {w.selCat === CONSTRUCCION_ID ? "← Subcategorías" : "← Categorías"}
                </button>
                {w.catActiva && (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 4 }}>{w.catActiva.emoji} {w.catActiva.nombre}</p>
                    {renderPartidas(w.catActiva)}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ PASO 2: RESUMEN — presentación, sin controles de medición ══ */}
        {w.phase === "resumen" && (
          <div className="su">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.4 }}>Resumen de cotización</p>
              <button
                type="button"
                onClick={w.volverACategorias}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.blue }}
              >
                ← Partidas
              </button>
            </div>

            <div style={{ background: `linear-gradient(148deg,${T.blue} 0%,${T.blueL} 100%)`, borderRadius: 22, padding: "26px 22px 22px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: 90, background: "rgba(255,255,255,0.06)" }} />
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, position: "relative" }}>Total cotización</p>
              <p style={{ color: T.white, fontSize: 42, fontWeight: 900, letterSpacing: -3, lineHeight: 1, position: "relative" }}>{fmtPEN(w.totalFinal)}</p>
              <div style={{ display: "flex", gap: 20, marginTop: 14, position: "relative" }}>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>Ejecución material</p>
                  <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: 700, marginTop: 2 }}>{fmtPEN(w.totalBase)}</p>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.15)" }} />
                <div>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>Mano de obra ({w.margin}%)</p>
                  <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: 700, marginTop: 2 }}>{fmtPEN(w.totalLabor)}</p>
                </div>
              </div>
            </div>

            <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.slateD}`, overflow: "hidden", marginBottom: 12 }}>
              {Object.entries(w.groupedItems).map(([catLabel, its], gi) => {
                const cap = w.sortedCatalogo.find((c) => c.nombre === catLabel);
                const chapTotal = its.reduce((a, it) => a + w.calcItem(it).subtotal, 0);
                return (
                  <div key={catLabel}>
                    <div style={{ background: (cap?.color || T.blue) + "10", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: gi > 0 ? `1px solid ${T.slateD}` : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 15 }}>{cap?.emoji || "📋"}</span>
                        <p style={{ fontSize: 12, fontWeight: 800, color: cap?.color || T.blue, textTransform: "uppercase", letterSpacing: 0.4 }}>{catLabel}</p>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 800, color: cap?.color || T.blue }}>{fmtPEN(chapTotal)}</p>
                    </div>
                    {its.map((it: BasketItem) => {
                      const { subtotal } = w.calcItem(it);
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
                <span style={{ fontSize: 15, fontWeight: 900, color: T.blue }}>{w.margin}% · {fmtPEN(w.totalLabor)}</span>
              </div>
              <input type="range" min={0} max={120} step={5} value={w.margin} onChange={(e) => w.setMargin(parseInt(e.target.value))} style={{ accentColor: T.blue, width: "100%", marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {[0, 25, 40, 60, 80, 100].map((v) => (
                  <button key={v} type="button" onClick={() => w.setMargin(v)} style={{ flex: 1, padding: "7px 2px", borderRadius: 10, border: `1.5px solid ${w.margin === v ? T.blue : T.slateD}`, background: w.margin === v ? T.bluePale : "none", cursor: "pointer", fontSize: 11, fontWeight: 800, color: w.margin === v ? T.blue : T.textMid }}>
                    {v}%
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="text"
                  inputMode="decimal"
                  value={String(w.margin)}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    w.setMargin(Number.isFinite(n) ? n : 0);
                  }}
                  placeholder="Escribe el % directo"
                  style={{ flex: 1, padding: "9px 12px", borderRadius: 10, fontSize: 14, fontWeight: 700, border: `1.5px solid ${T.slateD}`, outline: "none", color: T.text, background: T.slate, textAlign: "center", fontFamily: "inherit" }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: T.textMid }}>%</span>
              </div>
            </div>

            <textarea
              value={w.notes}
              onChange={(e) => w.setNotes(e.target.value)}
              placeholder="📝 Condiciones, plazos, exclusiones… (aparece en el PDF)"
              style={{ width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 14, border: `1.5px solid ${T.slateD}`, outline: "none", color: T.text, background: T.white, resize: "none", minHeight: 72, marginBottom: 12, fontFamily: "inherit" }}
            />

            <button
              type="button"
              onClick={w.goToCliente}
              style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${T.blue},${T.blueL})`, color: T.white, fontSize: 15, fontWeight: 800, boxShadow: `0 4px 16px ${T.blue}40` }}
            >
              Continuar → Cliente
            </button>
          </div>
        )}

        {/* ══ PASO 3: CLIENTE + CONFIRMACIÓN (Regla 10) ══ */}
        {w.phase === "cliente" && (
          <div className="su">
            <button
              type="button"
              onClick={() => w.setPhase("resumen")}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.blue, marginBottom: 14 }}
            >
              ← Resumen
            </button>

            <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.slateD}`, padding: "14px 16px", marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Cliente</p>
              {[
                { k: "name",  ph: "Nombre del cliente",      val: w.clientName, set: w.setClientName },
                { k: "phone", ph: "Teléfono / WhatsApp",     val: w.phone,      set: w.setPhone },
                { k: "city",  ph: "Ciudad / Dirección obra",  val: w.city,       set: w.setCity },
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
              <span style={{ fontSize: 22, fontWeight: 900, color: T.blue }}>{fmtPEN(w.totalFinal)}</span>
            </div>

            {/* Actions */}
            <button
              type="button"
              onClick={w.doSave}
              disabled={w.loading || w.clientName.trim().length < 2 || w.phone.trim().replace(/\D/g, "").length < 7}
              style={{ width: "100%", padding: 16, borderRadius: 14, border: w.saved ? `1.5px solid ${T.green}30` : "none", cursor: "pointer", background: w.saved ? T.greenPale : `linear-gradient(135deg,${T.green},${T.greenD})`, color: w.saved ? T.green : T.white, fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: w.saved ? "none" : `0 4px 16px ${T.green}35`, marginBottom: 10, opacity: w.clientName.trim().length < 2 || w.phone.trim().replace(/\D/g, "").length < 7 ? 0.5 : 1 }}
            >
              {w.loading ? "Guardando…" : w.saved ? (
                <><Ic d={checkPath} color={T.green} size={16} /> {w.editandoId ? "Actualizada" : "Guardada"}</>
              ) : (
                <><Ic d={savePath} color={T.white} size={15} /> {w.editandoId ? `Actualizar · ${fmtPEN(w.totalFinal)}` : `Guardar cotización · ${fmtPEN(w.totalFinal)}`}</>
              )}
            </button>

            {w.saved && w.pdfUrlGuardado && (
              <button
                type="button"
                onClick={async () => {
                  const r = await compartirPDF(w.pdfUrlGuardado!, `Cotización — ${w.clientName.trim() || "Sin cliente"}`);
                  if (r.method === "clipboard") mostrarToast("Enlace copiado al portapapeles ✓");
                  else if (r.method === "error") window.open(w.pdfUrlGuardado!, "_blank");
                }}
                style={{ width: "100%", padding: 13, borderRadius: 14, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${T.navy},${T.navyLight})`, color: T.white, fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10, boxShadow: `0 4px 14px ${T.navy}30` }}
              >
                📤 Compartir PDF
              </button>
            )}

            {w.saved && (
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
              onClick={w.reset}
              style={{ width: "100%", padding: 13, borderRadius: 14, border: `1.5px dashed ${T.slateD}`, background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: T.textMid }}
            >
              + Nueva cotización
            </button>
          </div>
        )}
      </div>

        {w.phase === "cats" && w.basket.length > 0 && (
          <FloatBar
            label={`${w.basket.length} partida${w.basket.length !== 1 ? "s" : ""} seleccionada${w.basket.length !== 1 ? "s" : ""}`}
            badge={w.basket.length}
            value={fmtPEN(w.totalFinal)}
            primaryLabel="Continuar → Resumen"
            onPrimary={w.goToResumen}
            onSecondary={w.vaciarCarrito}
            primaryDisabled={!w.cantidadesCompleto}
          />
        )}
      </div>
    </MobileShell>
  );
}
