"use client";
// DARIVO PRO EMPRESA — Wizard de cotización, capa de presentación de escritorio
// (05-MODULO-COTIZACIONES-EMPRESA.md §4-§5). Lógica de negocio compartida con
// Móvil en useCotizacionWizard() — solo cambia cómo se presenta (multi-panel
// dentro de EmpresaShell, sin MobileShell/DarkHeader).
import Link from "next/link";
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
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import type { Capitulo } from "@/types";

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

/** StepDots claro — la variante compartida (design-system/StepDots.tsx) usa blanco
 * sobre fondo oscuro (DarkHeader); aquí el header es claro (EmpresaShell). */
function StepDotsClaro({ current, total = 3 }: { current: number; total?: number }) {
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
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const w = useCotizacionWizard();
  const backHref = "/empresa";

  /** Panel de categorías — izquierda, ~240px (MD §4/§5.1). Sin cambios de layout. */
  const renderPanelCategorias = () => (
    <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: ADMIN_COLORS.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
        Categorías
      </p>

      {w.showConstruccion && (() => {
        const cap = CONSTRUCCION_META;
        const isOpen = w.selCat === CONSTRUCCION_ID;
        const selCount = w.basket.filter((b) => w.construccionSubs.some((s) => s.partidas.some((p) => p.id === b.svcId))).length;
        return (
          <div key={CONSTRUCCION_ID} style={{ borderRadius: 12, overflow: "hidden", border: `1.5px solid ${selCount > 0 ? cap.color : isOpen ? cap.color + "60" : ADMIN_COLORS.slateD}` }}>
            <button
              type="button"
              onClick={() => w.abrirCategoria(CONSTRUCCION_ID)}
              style={{ width: "100%", padding: "10px 12px", background: isOpen ? cap.color + "0E" : selCount > 0 ? cap.color + "07" : ADMIN_COLORS.white, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>{cap.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: isOpen || selCount > 0 ? cap.color : ADMIN_COLORS.text }}>{cap.nombre}</p>
                <p style={{ fontSize: 10, color: ADMIN_COLORS.textMid }}>
                  {selCount > 0 ? `${selCount} partida${selCount !== 1 ? "s" : ""}` : `${w.construccionSubs.length} subcategorías`}
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
                {SUBCATEGORIAS_CONSTRUCCION.filter((sub) => w.construccionSubs.some((c) => c.id === sub.id)).map((sub) => {
                  const subCap = w.construccionSubs.find((c) => c.id === sub.id)!;
                  const subSel = w.basket.filter((b) => subCap.partidas.some((p) => p.id === b.svcId)).length;
                  const active = w.selSubCat === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => w.abrirSubcategoria(sub.id)}
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

      {w.otrasCategorias.map((cap) => {
        const isOpen = w.selCat === cap.id;
        const selCount = w.basket.filter((b) => cap.partidas.some((p) => p.id === b.svcId)).length;
        return (
          <button
            key={cap.id}
            type="button"
            onClick={() => w.abrirCategoria(cap.id)}
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

  /** Panel de partidas — centro. Ahora con cantidad inline (m2/unit/hour) en
   *  vez de solo +/✓ (MD §5.1, cambio de flujo 15/07/2026). */
  const renderPanelPartidas = () => {
    if (!w.catActiva) {
      return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, border: `1.5px dashed ${ADMIN_COLORS.slateD}`, minHeight: 320, background: ADMIN_COLORS.white }}>
          <p style={{ fontSize: 13, color: ADMIN_COLORS.textMid }}>Selecciona una categoría a la izquierda para ver sus partidas.</p>
        </div>
      );
    }
    const cap: Capitulo = w.catActiva;
    return (
      <div style={{ flex: 1, background: ADMIN_COLORS.white, borderRadius: 16, border: `1px solid ${ADMIN_COLORS.slateD}`, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${ADMIN_COLORS.slateD}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{cap.emoji}</span>
          <p style={{ fontSize: 14, fontWeight: 800, color: ADMIN_COLORS.text }}>{cap.nombre}</p>
        </div>
        <div>
          {cap.partidas.map((p, i) => {
            const sel = w.isSelected(p.id);
            const it = w.basket.find((b) => b.svcId === p.id);
            const calcTypeKey = p.calcType === "m2" ? "m2" : p.calcType === "unit" ? "unit" : p.calcType === "hour" ? "hour" : "fixed";
            return (
              <div
                key={p.id}
                style={{
                  padding: "13px 16px",
                  borderBottom: i < cap.partidas.length - 1 ? `1px solid ${ADMIN_COLORS.slate}` : "none",
                  background: sel ? cap.color + "0A" : ADMIN_COLORS.white,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: sel ? 800 : 600, color: sel ? cap.color : ADMIN_COLORS.text }}>{p.nombre}</p>
                    <p style={{ fontSize: 12, color: ADMIN_COLORS.textMid, marginTop: 1 }}>
                      {p.calcType === "fixed" ? `S/ ${p.precio} precio fijo` : `S/ ${p.precio} / ${p.unidad}`}
                    </p>
                  </div>
                  {p.calcType === "fixed" && (
                    <button
                      type="button"
                      onClick={() => w.toggleSvc(cap, p)}
                      style={{ width: 30, height: 30, borderRadius: 9, background: sel ? cap.color : ADMIN_COLORS.slate, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "none", cursor: "pointer" }}
                    >
                      <Ic d={sel ? checkPath : plusPath} color={sel ? ADMIN_COLORS.white : ADMIN_COLORS.textMid} size={14} />
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
                        style={{ flex: 1, maxWidth: 140, padding: "9px 10px", borderRadius: 10, fontSize: 16, fontWeight: 800, border: `1.5px solid ${sel ? cap.color : ADMIN_COLORS.slateD}`, outline: "none", color: ADMIN_COLORS.text, background: ADMIN_COLORS.slate, textAlign: "center", fontFamily: "inherit" }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 700, color: ADMIN_COLORS.textMid, minWidth: 28 }}>{p.unidad}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                      {(PRESETS[calcTypeKey] || []).map((n) => (
                        <button key={n} type="button" onClick={() => w.setCantidad(cap, p, String(n))}
                          style={{ padding: "5px 10px", borderRadius: 20, border: `1.5px solid ${String(it?.qty) === String(n) ? cap.color : ADMIN_COLORS.slateD}`, background: String(it?.qty) === String(n) ? cap.color + "12" : ADMIN_COLORS.white, cursor: "pointer", fontSize: 12, fontWeight: 800, color: String(it?.qty) === String(n) ? cap.color : ADMIN_COLORS.textMid }}>
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
  };

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: w.phase === "cats" ? "none" : 760, margin: w.phase === "cats" ? undefined : "0 auto" }}>
      {/* Toolbar del wizard: volver + StepDots + contador (Paso 1) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href={backHref} style={{ fontSize: 12, fontWeight: 700, color: ADMIN_COLORS.purple }}>
            ← Volver
          </Link>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: ADMIN_COLORS.text }}>
              {w.editandoId ? "Editar cotización" : "Nueva cotización"}
            </p>
            <p style={{ fontSize: 11, color: ADMIN_COLORS.textMid }}>{w.phaseSubtitle}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {w.basket.length > 0 && w.phase === "cats" && (
            <div style={{ width: 26, height: 26, borderRadius: 13, background: ADMIN_COLORS.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: ADMIN_COLORS.white, fontSize: 12, fontWeight: 900 }}>{w.basket.length}</span>
            </div>
          )}
          <StepDotsClaro current={w.phaseStep} total={w.totalPasos} />
        </div>
      </div>

      {/* ══ PASO 1: SELECCIÓN + CANTIDAD — panel categorías + panel partidas (MD §4/§5.1) ══ */}
      {w.phase === "cats" && (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          {renderPanelCategorias()}
          {renderPanelPartidas()}
        </div>
      )}

      {/* ══ PASO 2: RESUMEN — solo presentación (MD §5.3) ══ */}
      {w.phase === "resumen" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <button
              type="button"
              onClick={w.volverACategorias}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: ADMIN_COLORS.purple }}
            >
              ← Partidas
            </button>
          </div>

          <div style={{ background: `linear-gradient(148deg,${ADMIN_COLORS.purple} 0%,#9333EA 100%)`, borderRadius: 22, padding: "28px 26px 24px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: 90, background: "rgba(255,255,255,0.06)" }} />
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, position: "relative" }}>Total cotización</p>
            <p style={{ color: ADMIN_COLORS.white, fontSize: 45, fontWeight: 900, letterSpacing: -3, lineHeight: 1, position: "relative" }}>{fmtPEN(w.totalFinal)}</p>
            <div style={{ display: "flex", gap: 24, marginTop: 16, position: "relative" }}>
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

          <div style={{ background: ADMIN_COLORS.white, borderRadius: 16, border: `1px solid ${ADMIN_COLORS.slateD}`, overflow: "hidden", marginBottom: 16 }}>
            {Object.entries(w.groupedItems).map(([catLabel, its], gi) => {
              const cap = w.sortedCatalogo.find((c) => c.nombre === catLabel);
              const chapTotal = its.reduce((a, it) => a + w.calcItem(it).subtotal, 0);
              return (
                <div key={catLabel}>
                  <div style={{ background: (cap?.color || ADMIN_COLORS.purple) + "10", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: gi > 0 ? `1px solid ${ADMIN_COLORS.slateD}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15 }}>{cap?.emoji || "📋"}</span>
                      <p style={{ fontSize: 12, fontWeight: 800, color: cap?.color || ADMIN_COLORS.purple, textTransform: "uppercase", letterSpacing: 0.4 }}>{catLabel}</p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: cap?.color || ADMIN_COLORS.purple }}>{fmtPEN(chapTotal)}</p>
                  </div>
                  {its.map((it: BasketItem) => {
                    const { subtotal } = w.calcItem(it);
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
              <span style={{ fontSize: 15, fontWeight: 900, color: ADMIN_COLORS.purple }}>{w.margin}% · {fmtPEN(w.totalLabor)}</span>
            </div>
            <input type="range" min={0} max={120} step={5} value={w.margin} onChange={(e) => w.setMargin(parseInt(e.target.value))} style={{ accentColor: ADMIN_COLORS.purple, width: "100%", marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {[0, 25, 40, 60, 80, 100].map((v) => (
                <button key={v} type="button" onClick={() => w.setMargin(v)} style={{ flex: 1, padding: "7px 2px", borderRadius: 10, border: `1.5px solid ${w.margin === v ? ADMIN_COLORS.purple : ADMIN_COLORS.slateD}`, background: w.margin === v ? ADMIN_COLORS.purplePale : "none", cursor: "pointer", fontSize: 11, fontWeight: 800, color: w.margin === v ? ADMIN_COLORS.purple : ADMIN_COLORS.textMid }}>
                  {v}%
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, maxWidth: 220 }}>
              <input
                type="text"
                inputMode="decimal"
                value={String(w.margin)}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  w.setMargin(Number.isFinite(n) ? n : 0);
                }}
                placeholder="Escribe el % directo"
                style={{ flex: 1, padding: "9px 12px", borderRadius: 10, fontSize: 14, fontWeight: 700, border: `1.5px solid ${ADMIN_COLORS.slateD}`, outline: "none", color: ADMIN_COLORS.text, background: ADMIN_COLORS.slate, textAlign: "center", fontFamily: "inherit" }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: ADMIN_COLORS.textMid }}>%</span>
            </div>
          </div>

          <textarea
            value={w.notes}
            onChange={(e) => w.setNotes(e.target.value)}
            placeholder="📝 Condiciones, plazos, exclusiones… (aparece en el PDF)"
            style={{ width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 14, border: `1.5px solid ${ADMIN_COLORS.slateD}`, outline: "none", color: ADMIN_COLORS.text, background: ADMIN_COLORS.white, resize: "none", minHeight: 72, marginBottom: 16, fontFamily: "inherit" }}
          />

          <button
            type="button"
            onClick={w.goToCliente}
            style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${ADMIN_COLORS.purple},#9333EA)`, color: ADMIN_COLORS.white, fontSize: 15, fontWeight: 800, boxShadow: `0 4px 16px ${ADMIN_COLORS.purple}40` }}
          >
            Continuar → Cliente
          </button>
        </div>
      )}

      {/* ══ PASO 3: CLIENTE + CONFIRMACIÓN (MD §5.4) ══ */}
      {w.phase === "cliente" && (
        <div>
          <button
            type="button"
            onClick={() => w.setPhase("resumen")}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: ADMIN_COLORS.purple, marginBottom: 14 }}
          >
            ← Resumen
          </button>

          <div style={{ background: ADMIN_COLORS.white, borderRadius: 14, border: `1px solid ${ADMIN_COLORS.slateD}`, padding: "16px 18px", marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: ADMIN_COLORS.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Cliente</p>
            {[
              { k: "name", ph: "Nombre del cliente", val: w.clientName, set: w.setClientName },
              { k: "phone", ph: "Teléfono / WhatsApp", val: w.phone, set: w.setPhone },
              { k: "city", ph: "Ciudad / Dirección obra", val: w.city, set: w.setCity },
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
            <span style={{ fontSize: 22, fontWeight: 900, color: ADMIN_COLORS.purple }}>{fmtPEN(w.totalFinal)}</span>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <button
              type="button"
              onClick={w.doSave}
              disabled={w.loading || w.clientName.trim().length < 2 || w.phone.trim().replace(/\D/g, "").length < 7}
              style={{ flex: 1, padding: 15, borderRadius: 14, border: w.saved ? `1.5px solid ${ADMIN_COLORS.green}30` : "none", cursor: "pointer", background: w.saved ? ADMIN_COLORS.greenPale : `linear-gradient(135deg,${ADMIN_COLORS.green},${ADMIN_COLORS.greenD})`, color: w.saved ? ADMIN_COLORS.green : ADMIN_COLORS.white, fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: w.saved ? "none" : `0 4px 16px ${ADMIN_COLORS.green}35`, opacity: w.clientName.trim().length < 2 || w.phone.trim().replace(/\D/g, "").length < 7 ? 0.5 : 1 }}
            >
              {w.loading ? "Guardando…" : w.saved ? (
                <><Ic d={checkPath} color={ADMIN_COLORS.green} size={16} /> {w.editandoId ? "Actualizada" : "Guardada"}</>
              ) : (
                <><Ic d={savePath} color={ADMIN_COLORS.white} size={15} /> {w.editandoId ? `Actualizar · ${fmtPEN(w.totalFinal)}` : `Guardar cotización · ${fmtPEN(w.totalFinal)}`}</>
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
                style={{ flex: 1, padding: 15, borderRadius: 14, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${ADMIN_COLORS.purpleDark},${ADMIN_COLORS.purple})`, color: ADMIN_COLORS.white, fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 14px ${ADMIN_COLORS.purpleDark}30` }}
              >
                📤 Compartir PDF
              </button>
            )}
          </div>

          {w.saved && (
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
            onClick={w.reset}
            style={{ width: "100%", padding: 13, borderRadius: 14, border: `1.5px dashed ${ADMIN_COLORS.slateD}`, background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: ADMIN_COLORS.textMid }}
          >
            + Nueva cotización
          </button>
        </div>
      )}

      {/* Barra de acción del Paso 1 — docked, no flotante (MD §5.1 "FloatBar / acción") */}
      {w.phase === "cats" && w.basket.length > 0 && (
        <div style={{ position: "sticky", bottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", background: ADMIN_COLORS.purpleDark, borderRadius: 16, padding: "14px 20px", boxShadow: "0 8px 24px rgba(10,22,40,0.25)" }}>
          <span style={{ color: ADMIN_COLORS.white, fontSize: 13, fontWeight: 700 }}>
            {w.basket.length} partida{w.basket.length !== 1 ? "s" : ""} seleccionada{w.basket.length !== 1 ? "s" : ""} · {fmtPEN(w.totalFinal)}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={w.vaciarCarrito} style={{ padding: "10px 16px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.2)", background: "none", color: ADMIN_COLORS.white, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Limpiar
            </button>
            <button
              type="button"
              onClick={w.goToResumen}
              disabled={!w.cantidadesCompleto}
              style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: ADMIN_COLORS.purple, color: ADMIN_COLORS.white, fontSize: 13, fontWeight: 800, cursor: w.cantidadesCompleto ? "pointer" : "not-allowed", opacity: w.cantidadesCompleto ? 1 : 0.5 }}
            >
              Continuar → Resumen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
