"use client";
// DARIVO PRO EMPRESA — Cierre, capa de presentación de escritorio
// (09-MODULO-CIERRE-EMPRESA.md §4-§6). Misma lógica que CierreView (Móvil):
// useGastos (100% local/localStorage), analizarArchivo() vía /api/ia/gasto —
// solo cambia de pestañas apiladas de una columna a layout 58/42 con panel
// lateral, y de cards a tabla en "Gastos recientes".
//
// Nota honesta: el MD (§5.4) describe un step indicator navegable de 4 pasos
// (Documento → Información → Revisar → Guardar) para "Revisar gasto". El
// código real (useGastos.ts) no tiene función de editar un gasto existente —
// solo agregarGasto() para uno nuevo — así que ese step indicator se muestra
// aquí como marcador visual de la etapa actual, no como un wizard funcional
// con validación por paso (eso sería inventar lógica que no existe). Al
// hacer clic en una fila de la tabla se abre un panel de solo lectura, no
// de edición, por la misma razón.
import { useMemo, useRef, useState } from "react";
import { fmtPEN } from "@/lib/utils";
import { CIERRE_ACCENT } from "@/lib/design-system/tokens";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { CodeNotice } from "@/components/common/CodeNotice";
import { useGastos, type Gasto } from "@/hooks/useGastos";
import { CATEGORIAS_GASTO } from "@/components/cierre/CierreView";
import type { GastoIAExtraccion } from "@/lib/gasto-ia";
import { useAppStore } from "@/store/useAppStore";
import { InformesTab } from "@/components/informes/InformesTab";

// Tarea 5c (CLAUDE.md 17/07/2026): "Informes" no es una sección nueva
// independiente del menú de Empresa (que no tiene "Más" fuera de
// Categorías) — se integra como 3ª pestaña aquí, dentro de Cierre, mismos
// datos que Móvil (useInformes(), vía InformesTab.tsx sin tocar). No se
// modificó nada de la lógica/JSX de Gastos ni Expediente Mensual que ya
// funcionaba bien — es una pestaña hermana, no un reemplazo.
// Nota honesta (parcial, ver CLAUDE.md): InformesTab.tsx y sus 3
// sub-componentes (Semanal/Mensual/Trimestral) siguen usando los tokens
// Fable 5 (`T`) internamente, no ADMIN_COLORS — los datos y la integración
// son reales, la reskin visual completa a la paleta de Admin queda
// pendiente.
type Tab = "gastos" | "expediente" | "informes";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

interface CierreViewEscritorioProps {
  resumenExpediente: {
    cotizaciones: number;
    facturas: number;
    ingresosMes: number;
  };
}

export function CierreViewEscritorio({ resumenExpediente }: CierreViewEscritorioProps) {
  const [tab, setTab] = useState<Tab>("gastos");
  const { gastos, listo, agregarGasto, gastosDelMes } = useGastos();
  const [registrando, setRegistrando] = useState(false);
  const [prefill, setPrefill] = useState<Partial<GastoIAExtraccion> | null>(null);
  const [analizando, setAnalizando] = useState(false);
  const [gastoSeleccionado, setGastoSeleccionado] = useState<Gasto | null>(null);
  const [verTodos, setVerTodos] = useState(false);
  const [expedienteGenerado, setExpedienteGenerado] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const mostrarUpgrade = useAppStore((s) => s.mostrarUpgrade);

  const analizarArchivo = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      mostrarToast("Por ahora solo imágenes (JPG/PNG). PDF — pendiente.", "error");
      return;
    }
    setAnalizando(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1] ?? "");
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/ia/gasto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });
      const json = await res.json();
      if (res.status === 429) { mostrarUpgrade("ia_limite"); return; }
      if (!res.ok) { mostrarToast(json.error ?? "Error al analizar", "error"); return; }
      setPrefill(json.data);
      setGastoSeleccionado(null);
      setRegistrando(true);
      mostrarToast("Documento analizado ✓");
    } catch {
      mostrarToast("No se pudo analizar el documento", "error");
    } finally {
      setAnalizando(false);
    }
  };

  const abrirCamara = () => fileInputRef.current?.click();

  const hoy = new Date();
  const [mesExp, setMesExp] = useState(hoy.getMonth());
  const [anioExp, setAnioExp] = useState(hoy.getFullYear());

  const gastosMes = useMemo(() => gastosDelMes(anioExp, mesExp), [gastosDelMes, anioExp, mesExp]);
  const totalGastosMes = gastosMes.reduce((s, g) => s + g.total, 0);
  const listaGastos = verTodos ? gastos : gastos.slice(0, 5);

  return (
    <div className="flex flex-col gap-5">
      {/* Pestañas (§3/§4) */}
      <div style={{ display: "inline-flex", borderRadius: 14, padding: 4, background: ADMIN_COLORS.slate, width: "fit-content" }}>
        {(["gastos", "expediente", "informes"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{ padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 800, border: "none", cursor: "pointer", background: tab === t ? ADMIN_COLORS.white : "transparent", color: tab === t ? CIERRE_ACCENT : ADMIN_COLORS.textMid, boxShadow: tab === t ? "0 1px 6px rgba(0,0,0,0.08)" : "none" }}
          >
            {t === "gastos" ? "Gastos" : t === "expediente" ? "Expediente Mensual" : "Informes"}
          </button>
        ))}
      </div>

      {tab === "informes" && (
        <div style={{ borderRadius: 16, border: `1px solid ${ADMIN_COLORS.slateD}`, background: ADMIN_COLORS.white, padding: 20 }}>
          <InformesTab esEmpresa />
        </div>
      )}

      {tab !== "informes" && (
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Columna principal ~58% */}
        <div style={{ flex: "1 1 58%", display: "flex", flexDirection: "column", gap: 16 }}>
          {tab === "gastos" ? (
            <>
              <div>
                <p style={{ fontSize: 16, fontWeight: 900, color: ADMIN_COLORS.text }}>Gastos</p>
                <p style={{ fontSize: 12, color: ADMIN_COLORS.textMid }}>Registra y gestiona todos tus gastos</p>
              </div>

              {/* Tarjeta Registrar gasto (§5.2) */}
              <div style={{ borderRadius: 18, padding: 20, background: `linear-gradient(135deg, ${ADMIN_COLORS.purpleDark}, ${ADMIN_COLORS.purple})`, boxShadow: `0 6px 24px ${ADMIN_COLORS.purple}44` }}>
                <p style={{ fontSize: 16, fontWeight: 900, color: ADMIN_COLORS.white }}>Registrar gasto</p>
                <p style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>📷 La Calculadora inteligente analizará tu documento automáticamente</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 14 }}>
                  <button type="button" onClick={abrirCamara} disabled={analizando} style={{ padding: "10px 6px", borderRadius: 12, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.15)", color: ADMIN_COLORS.white, opacity: analizando ? 0.6 : 1 }}>
                    {analizando ? "Analizando…" : "📷 Tomar foto"}
                  </button>
                  <button type="button" onClick={abrirCamara} disabled={analizando} style={{ padding: "10px 6px", borderRadius: 12, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.15)", color: ADMIN_COLORS.white, opacity: analizando ? 0.6 : 1 }}>
                    Seleccionar imagen
                  </button>
                  <button type="button" disabled title="PDF — pendiente" style={{ padding: "10px 6px", borderRadius: 12, fontSize: 12, fontWeight: 700, border: "none", background: "rgba(255,255,255,0.15)", color: ADMIN_COLORS.white, opacity: 0.5 }}>
                    Subir PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPrefill(null); setGastoSeleccionado(null); setRegistrando(true); }}
                    style={{ padding: "10px 6px", borderRadius: 12, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.15)", color: ADMIN_COLORS.white }}
                  >
                    Registro manual
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) analizarArchivo(f); e.target.value = ""; }} />
              </div>

              {/* Gastos recientes — tabla (§5.3) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: ADMIN_COLORS.text }}>Gastos recientes</p>
                  {gastos.length > 5 && (
                    <button type="button" onClick={() => setVerTodos((v) => !v)} style={{ fontSize: 12, fontWeight: 700, color: CIERRE_ACCENT, background: "none", border: "none", cursor: "pointer" }}>
                      {verTodos ? "Ver recientes" : `Ver todos (${gastos.length})`}
                    </button>
                  )}
                </div>

                {!listo ? (
                  <p style={{ fontSize: 13, color: ADMIN_COLORS.textMid }}>Cargando…</p>
                ) : listaGastos.length === 0 ? (
                  <div style={{ borderRadius: 16, padding: 40, textAlign: "center", background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: ADMIN_COLORS.textMid }}>Aún no hay gastos registrados</p>
                    <button type="button" onClick={() => { setPrefill(null); setGastoSeleccionado(null); setRegistrando(true); }} style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: CIERRE_ACCENT, background: "none", border: "none", cursor: "pointer" }}>
                      Registrar manualmente →
                    </button>
                  </div>
                ) : (
                  <div style={{ borderRadius: 16, border: `1px solid ${ADMIN_COLORS.slateD}`, overflow: "hidden", background: ADMIN_COLORS.white }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: ADMIN_COLORS.slate }}>
                          {["Categoría", "Proveedor", "Fecha", "Importe", "Estado"].map((h) => (
                            <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 800, color: ADMIN_COLORS.textMid, textTransform: "uppercase" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {listaGastos.map((g) => {
                          const activo = gastoSeleccionado?.id === g.id;
                          return (
                            <tr
                              key={g.id}
                              onClick={() => { setRegistrando(false); setGastoSeleccionado(activo ? null : g); }}
                              style={{ borderTop: `1px solid ${ADMIN_COLORS.slate}`, cursor: "pointer", background: activo ? CIERRE_ACCENT + "0C" : "transparent" }}
                            >
                              <td style={{ padding: "10px 14px", fontSize: 12, color: ADMIN_COLORS.text, fontWeight: 700 }}>{g.categoria}</td>
                              <td style={{ padding: "10px 14px", fontSize: 12, color: ADMIN_COLORS.text }}>{g.proveedor}</td>
                              <td style={{ padding: "10px 14px", fontSize: 12, color: ADMIN_COLORS.textMid }}>{new Date(g.fecha).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}</td>
                              <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 800, color: CIERRE_ACCENT }}>{fmtPEN(g.total)}</td>
                              <td style={{ padding: "10px 14px" }}>
                                <span style={{ fontSize: 10, fontWeight: 800, color: g.estado === "Aprobado" ? ADMIN_COLORS.greenD : ADMIN_COLORS.amberD }}>{g.estado}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: 13, color: ADMIN_COLORS.textMid }}>Selecciona el período y genera tu expediente mensual.</p>

              <div style={{ borderRadius: 18, padding: 20, background: `linear-gradient(135deg, ${ADMIN_COLORS.purple}, #9333EA)`, boxShadow: `0 6px 24px ${ADMIN_COLORS.purple}44` }}>
                <p style={{ fontSize: 16, fontWeight: 900, color: ADMIN_COLORS.white }}>📁 Expediente mensual</p>
                <p style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.8)" }}>Genera automáticamente toda la documentación de tu actividad</p>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <select value={mesExp} onChange={(e) => setMesExp(Number(e.target.value))} style={{ flex: 1, borderRadius: 12, padding: "11px 14px", fontSize: 13, fontWeight: 700, border: `1.5px solid ${ADMIN_COLORS.slateD}`, color: ADMIN_COLORS.text, background: ADMIN_COLORS.white }}>
                  {MESES.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select value={anioExp} onChange={(e) => setAnioExp(Number(e.target.value))} style={{ width: 110, borderRadius: 12, padding: "11px 14px", fontSize: 13, fontWeight: 700, border: `1.5px solid ${ADMIN_COLORS.slateD}`, color: ADMIN_COLORS.text, background: ADMIN_COLORS.white }}>
                  {[anioExp - 1, anioExp, anioExp + 1].map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div style={{ borderRadius: 16, padding: 16, background: ADMIN_COLORS.purplePale, border: `1px solid ${ADMIN_COLORS.purple}33` }}>
                <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: ADMIN_COLORS.purple }}>¿Qué incluye tu expediente?</p>
                <ul style={{ marginTop: 8, fontSize: 13, color: ADMIN_COLORS.text, display: "flex", flexDirection: "column", gap: 4 }}>
                  <li>• Cotizaciones del período</li>
                  <li>• Facturas emitidas</li>
                  <li>• Gastos registrados</li>
                  <li>• Resumen de ingresos y egresos</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setExpedienteGenerado(true)}
                style={{ width: "100%", padding: 16, borderRadius: 16, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 800, color: ADMIN_COLORS.white, background: `linear-gradient(135deg, ${ADMIN_COLORS.purple}, #9333EA)`, boxShadow: `0 4px 16px ${ADMIN_COLORS.purple}44` }}
              >
                Generar expediente
              </button>
            </>
          )}
        </div>

        {/* Panel lateral ~42% (§5.4 / §6.2) */}
        <div style={{ flex: "1 1 42%", position: "sticky", top: 20 }}>
          {tab === "gastos" ? (
            registrando ? (
              <PanelRegistrarGasto
                prefill={prefill}
                onCancelar={() => { setRegistrando(false); setPrefill(null); }}
                onGuardar={(g) => {
                  agregarGasto(g);
                  setRegistrando(false);
                  setPrefill(null);
                  mostrarToast("Gasto guardado ✓");
                }}
              />
            ) : gastoSeleccionado ? (
              <PanelDetalleGasto gasto={gastoSeleccionado} onCerrar={() => setGastoSeleccionado(null)} />
            ) : (
              <PanelVacio texto="Selecciona un gasto de la tabla para revisarlo, o registra uno nuevo." />
            )
          ) : expedienteGenerado ? (
            <div style={{ borderRadius: 16, padding: 20, background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}>
              <p style={{ fontSize: 16, fontWeight: 900, color: ADMIN_COLORS.greenD }}>✓ ¡Expediente listo!</p>
              <p style={{ marginTop: 2, fontSize: 12, color: ADMIN_COLORS.textMid }}>{MESES[mesExp]} {anioExp}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginTop: 14 }}>
                <StatExp label="Cotizaciones" valor={String(resumenExpediente.cotizaciones)} />
                <StatExp label="Facturas" valor={String(resumenExpediente.facturas)} />
                <StatExp label="Gastos" valor={String(gastosMes.length)} />
                <StatExp label="Total gastos" valor={fmtPEN(totalGastosMes)} />
              </div>
              <p style={{ marginTop: 12, fontSize: 11, color: ADMIN_COLORS.textLight }}>Exportación PDF/ZIP — pendiente integración (Tarea 07/09)</p>
              <button type="button" onClick={() => setExpedienteGenerado(false)} style={{ marginTop: 12, width: "100%", padding: "11px 0", borderRadius: 12, border: `1.5px solid ${ADMIN_COLORS.slateD}`, background: "none", color: ADMIN_COLORS.textMid, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Generar otro expediente
              </button>
            </div>
          ) : (
            <PanelVacio texto="Genera tu expediente para ver aquí el resumen del período." />
          )}
        </div>
      </div>
      )}
    </div>
  );
}

function PanelVacio({ texto }: { texto: string }) {
  return (
    <div style={{ borderRadius: 16, padding: 32, textAlign: "center", background: ADMIN_COLORS.white, border: `1.5px dashed ${ADMIN_COLORS.slateD}` }}>
      <p style={{ fontSize: 12, color: ADMIN_COLORS.textMid }}>{texto}</p>
    </div>
  );
}

function StatExp({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={{ borderRadius: 12, padding: 12, background: ADMIN_COLORS.slate }}>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: ADMIN_COLORS.textMid }}>{label}</p>
      <p style={{ marginTop: 2, fontSize: 17, fontWeight: 900, color: ADMIN_COLORS.text }}>{valor}</p>
    </div>
  );
}

/** Detalle de solo lectura — no existe función de editar un gasto ya guardado
 * en useGastos.ts, así que el clic en fila abre lectura, no un formulario
 * de edición (evita inventar una función de guardado que no existe). */
function PanelDetalleGasto({ gasto, onCerrar }: { gasto: Gasto; onCerrar: () => void }) {
  return (
    <div style={{ borderRadius: 16, padding: 20, background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ fontSize: 14, fontWeight: 900, color: ADMIN_COLORS.text }}>Gasto</p>
        <button type="button" onClick={onCerrar} style={{ fontSize: 12, fontWeight: 700, color: ADMIN_COLORS.textMid, background: "none", border: "none", cursor: "pointer" }}>✕ Cerrar</button>
      </div>
      <CodeNotice code="PEND-001" detalle className="mb-3" />
      <div className="flex flex-col gap-3">
        {[
          ["Proveedor", gasto.proveedor],
          ["Categoría", gasto.categoria],
          ["Fecha", new Date(gasto.fecha).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })],
          ["Total", fmtPEN(gasto.total)],
          ["Método de pago", gasto.metodoPago],
          ["Estado", gasto.estado],
        ].map(([label, val]) => (
          <div key={label}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: ADMIN_COLORS.textMid }}>{label}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: ADMIN_COLORS.text, marginTop: 2 }}>{val}</p>
          </div>
        ))}
        {gasto.descripcion && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: ADMIN_COLORS.textMid }}>Descripción</p>
            <p style={{ fontSize: 13, color: ADMIN_COLORS.text, marginTop: 2 }}>{gasto.descripcion}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Registrar gasto — mismo formulario/campos que ModalGastoManual (Móvil),
 * en el panel lateral en vez de un bottom-sheet. Marcador de etapa visual
 * (Documento → Información → Guardar, §5.4) — no gatea nada, es un solo paso
 * real en el código (agregarGasto), ver nota al inicio del archivo. */
function PanelRegistrarGasto({
  prefill, onCancelar, onGuardar,
}: {
  prefill: Partial<GastoIAExtraccion> | null;
  onCancelar: () => void;
  onGuardar: (g: Omit<Gasto, "id" | "createdAt" | "estado">) => void;
}) {
  const [proveedor, setProveedor] = useState(prefill?.proveedor ?? "");
  const [categoria, setCategoria] = useState(prefill?.categoria ?? CATEGORIAS_GASTO[0]);
  const [fecha, setFecha] = useState(prefill?.fecha ?? new Date().toISOString().slice(0, 10));
  const [total, setTotal] = useState(prefill?.total ? String(prefill.total) : "");
  const [metodoPago, setMetodoPago] = useState(prefill?.metodoPago ?? "Efectivo");
  const [descripcion, setDescripcion] = useState(prefill?.descripcion ?? "");

  const etapas = ["Documento", "Información", prefill ? "Revisar" : "Registrar", "Guardar"];
  const etapaActual = prefill ? 2 : 1;

  return (
    <div style={{ borderRadius: 16, padding: 20, background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        {etapas.map((e, i) => (
          <div key={e} style={{ display: "flex", alignItems: "center", gap: 6, flex: i < etapas.length - 1 ? 1 : undefined }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: i === etapaActual ? CIERRE_ACCENT : ADMIN_COLORS.textLight }}>{e}</span>
            {i < etapas.length - 1 && <span style={{ flex: 1, height: 2, borderRadius: 1, background: i < etapaActual ? CIERRE_ACCENT : ADMIN_COLORS.slateD }} />}
          </div>
        ))}
      </div>

      <p style={{ fontSize: 15, fontWeight: 900, color: ADMIN_COLORS.text }}>{prefill ? "Revisar gasto" : "Registro manual"}</p>
      {prefill && (
        <p style={{ marginTop: 2, fontSize: 11, fontWeight: 700, color: ADMIN_COLORS.greenD }}>✓ Documento analizado — La Calculadora inteligente extrajo la información</p>
      )}

      <div className="flex flex-col gap-3" style={{ marginTop: 14 }}>
        <input placeholder="Proveedor" value={proveedor} onChange={(e) => setProveedor(e.target.value)} style={{ borderRadius: 10, padding: "10px 12px", fontSize: 13, border: `1.5px solid ${ADMIN_COLORS.slateD}`, outline: "none" }} />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ borderRadius: 10, padding: "10px 12px", fontSize: 13, border: `1.5px solid ${ADMIN_COLORS.slateD}`, outline: "none" }}>
          {CATEGORIAS_GASTO.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ borderRadius: 10, padding: "10px 12px", fontSize: 13, border: `1.5px solid ${ADMIN_COLORS.slateD}`, outline: "none" }} />
        <input placeholder="Total S/" inputMode="decimal" value={total} onChange={(e) => setTotal(e.target.value)} style={{ borderRadius: 10, padding: "10px 12px", fontSize: 13, border: `1.5px solid ${ADMIN_COLORS.slateD}`, outline: "none" }} />
        <input placeholder="Método de pago" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ borderRadius: 10, padding: "10px 12px", fontSize: 13, border: `1.5px solid ${ADMIN_COLORS.slateD}`, outline: "none" }} />
        <textarea placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} style={{ borderRadius: 10, padding: "10px 12px", fontSize: 13, border: `1.5px solid ${ADMIN_COLORS.slateD}`, outline: "none", resize: "none" }} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button type="button" onClick={onCancelar} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: `1.5px solid ${ADMIN_COLORS.slateD}`, background: "none", color: ADMIN_COLORS.textMid, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Cancelar
        </button>
        <button
          type="button"
          disabled={!proveedor || !total}
          onClick={() => onGuardar({ proveedor, categoria, fecha, total: parseFloat(total) || 0, metodoPago, descripcion })}
          style={{ flex: 2, padding: "11px 0", borderRadius: 12, border: "none", background: CIERRE_ACCENT, color: ADMIN_COLORS.white, fontSize: 13, fontWeight: 800, cursor: "pointer", opacity: !proveedor || !total ? 0.5 : 1 }}
        >
          Guardar gasto
        </button>
      </div>
    </div>
  );
}
