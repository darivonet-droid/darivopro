"use client";
// DARIVO PRO EMPRESA — Nueva factura, capa de presentación de escritorio
// (06-MODULO-FACTURAS-EMPRESA.md §4.2/§6). Misma lógica de negocio que
// NuevaFacturaForm (Móvil): emitir(), cálculo IGV/detracción, numeración —
// solo cambia a layout de 2 columnas (~60/40) en vez de una columna apilada.
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFactura } from "@/hooks/useFactura";
import { useAppStore } from "@/store/useAppStore";
import { boletaSchema, facturaSchema } from "@/lib/validations";
import {
  buildFacturaWhatsAppUrl,
  calcularDetraccion,
  DETRACCION_UMBRAL,
  nextNumeroComprobante,
  OPCIONES_DETRACCION,
  validarRucFactura,
  type FormaPago,
  type TipoComprobante,
} from "@/lib/factura-utils";
import { calcIGV, fmtPEN, hoy } from "@/lib/utils";
import { T, WHATSAPP } from "@/lib/design-system/tokens";
import type {
  Cliente, Detraccion, EmpresaData, Factura, LineaFactura,
  Cotizacion, TipoDetraccion,
} from "@/types";

const FORMAS_PAGO: FormaPago[] = ["Efectivo", "Yape", "Transferencia", "Crédito"];
const LINEA_VACIA: LineaFactura = { desc: "", cantidad: 1, pu: 0, subtotal: 0 };

interface Props {
  empresa: EmpresaData | null;
  numerosExistentes: string[];
  aprobados: Cotizacion[];
  clientes: Cliente[];
  cotizacionId?: string;
  volverHref: string;
}

export function NuevaFacturaFormEscritorio({
  empresa, numerosExistentes, aprobados, clientes, cotizacionId, volverHref,
}: Props) {
  const router = useRouter();
  const { crear, generarPDF, loading } = useFactura();
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const mostrarUpgrade = useAppStore((s) => s.mostrarUpgrade);

  const [tipo, setTipo] = useState<TipoComprobante | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientRuc, setClientRuc] = useState("");
  const [clientDni, setClientDni] = useState("");
  const [clientDir, setClientDir] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [items, setItems] = useState<LineaFactura[]>([{ ...LINEA_VACIA }]);
  const [desdeQuote, setDesdeQuote] = useState(cotizacionId ?? "");
  const [formaPago, setFormaPago] = useState<FormaPago>("Efectivo");
  const [pagado, setPagado] = useState(false);
  const [detTipo, setDetTipo] = useState<TipoDetraccion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardada, setGuardada] = useState<Factura | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const invNum = useMemo(
    () => (tipo ? nextNumeroComprobante(tipo, numerosExistentes) : ""),
    [tipo, numerosExistentes]
  );

  const sym = empresa?.simbolo ?? "S/";
  const subtotalBase = useMemo(() => items.reduce((s, it) => s + it.subtotal, 0), [items]);
  const { igv, total } = calcIGV(subtotalBase);

  const aplicaDetraccion = tipo === "factura" && total > DETRACCION_UMBRAL;
  const detraccion: Detraccion | undefined = useMemo(() => {
    if (!aplicaDetraccion || !detTipo) return undefined;
    return calcularDetraccion(total, detTipo, empresa?.cta_detracciones ?? undefined);
  }, [aplicaDetraccion, detTipo, total, empresa]);

  const importarCotizacion = (id: string) => {
    setDesdeQuote(id);
    const p = aprobados.find((x) => x.id === id);
    if (!p) return;
    setClientName(p.clientName);
    if (p.phone) setClientPhone(p.phone);
    const lineas: LineaFactura[] = p.items.map((it) => ({
      desc: it.svcLabel, cantidad: it.qty, pu: it.unitPrice, subtotal: it.subtotal,
    }));
    if (p.totalLabor > 0) {
      lineas.push({ desc: `Mano de obra (${p.margin}%)`, cantidad: 1, pu: p.totalLabor, subtotal: p.totalLabor });
    }
    setItems(lineas.length ? lineas : [{ ...LINEA_VACIA }]);
  };

  useEffect(() => {
    if (cotizacionId) importarCotizacion(cotizacionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cotizacionId]);

  const seleccionarCliente = (id: string) => {
    const c = clientes.find((x) => x.id === id);
    if (!c) return;
    setClientName(c.nombre);
    setClientRuc(c.ruc ?? "");
    setClientDir(c.direccion ?? "");
    setClientPhone(c.telefono ?? "");
  };

  const cambiarLinea = (i: number, campo: keyof LineaFactura, valor: string) => {
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== i) return it;
        const nueva = { ...it, [campo]: campo === "desc" ? valor : Number(valor) };
        nueva.subtotal = Math.round(nueva.cantidad * nueva.pu * 100) / 100;
        return nueva;
      })
    );
  };

  const emitir = async () => {
    setError(null);
    if (!tipo) return;
    if (!empresa || !/^\d{11}$/.test(empresa.ruc)) {
      setError("Completa el RUC de tu empresa en Configuración");
      return;
    }

    if (tipo === "factura") {
      if (!clientRuc) { setError("Ingresa el RUC del cliente"); return; }
      if (!validarRucFactura(clientRuc)) {
        setError("El RUC debe tener 11 dígitos y empezar en 10 o 20");
        return;
      }
      const valido = facturaSchema.safeParse({ clientName, clientRuc, clientDir, items });
      if (!valido.success) { setError(valido.error.errors[0]?.message ?? "Revisa los datos"); return; }
    } else {
      if (!clientDni) { setError("Ingresa el DNI del cliente"); return; }
      if (!/^\d{8}$/.test(clientDni)) { setError("El DNI debe tener 8 dígitos"); return; }
      const valido = boletaSchema.safeParse({ clientName, clientDni, clientDir, items });
      if (!valido.success) { setError(valido.error.errors[0]?.message ?? "Revisa los datos"); return; }
    }

    if (aplicaDetraccion && !detTipo) {
      setError("Selecciona el tipo de detracción (obligatorio para facturas > S/700)");
      return;
    }

    const bizData: EmpresaData = { ...empresa, tipoComprobante: tipo, formaPago };

    const creada = await crear({
      invNum,
      invDate: hoy(),
      invStatus: pagado ? "Cobrada" : "Emitida",
      tipoDoc: tipo,
      clientName: clientName.trim(),
      clientRuc: tipo === "factura" ? clientRuc.trim() || undefined : undefined,
      clientDni: tipo === "boleta" ? clientDni.trim() || undefined : undefined,
      clientDir: clientDir.trim() || undefined,
      moneda: empresa.moneda,
      sym,
      items,
      subtotalBase,
      igvAmount: igv,
      totalFinal: total,
      detraccion,
      fromQuoteId: desdeQuote || undefined,
      bizData,
    }, mostrarUpgrade);

    if (!creada) { mostrarToast("No se pudo emitir", "error"); return; }

    setGuardada(creada);
    mostrarToast(`${invNum} emitida ✓`);
    const url = await generarPDF(creada.invId);
    if (url) setPdfUrl(url);
  };

  /* ── Pantalla de éxito ─────────────────────────────────── */
  if (guardada) {
    const waUrl = buildFacturaWhatsAppUrl(clientPhone, guardada.invNum, total, sym);

    const doCompartir = async () => {
      if (!pdfUrl) { if (clientPhone) window.open(waUrl, "_blank", "noopener,noreferrer"); return; }
      const titulo = `${guardada.invNum} — ${guardada.clientName}`;
      const r = await import("@/lib/share").then((m) => m.compartirPDF(pdfUrl, titulo));
      if (r.method === "clipboard") mostrarToast("Enlace copiado al portapapeles ✓");
      else if (r.method === "error") window.open(pdfUrl, "_blank");
    };

    return (
      <div style={{ maxWidth: 480, margin: "40px auto" }} className="flex flex-col gap-4">
        <div style={{ borderRadius: 16, padding: 28, textAlign: "center", background: T.greenPale, border: `1.5px solid ${T.green}` }}>
          <p style={{ fontSize: 26, fontWeight: 900, color: T.greenD }}>✓ {guardada.invNum}</p>
          <p style={{ marginTop: 4, fontSize: 13, color: T.greenD }}>
            {pagado ? "Marcada como PAGADA" : "Emitida como pendiente"}
          </p>
          {guardada.detraccion && (
            <div style={{ marginTop: 12, borderRadius: 12, padding: "10px 14px", background: T.amberPale, textAlign: "left" }}>
              <p style={{ fontWeight: 700, fontSize: 12, color: T.amberD }}>
                SPOT: {guardada.detraccion.pct}% = {fmtPEN(guardada.detraccion.monto, sym)}
              </p>
              <p style={{ fontSize: 12, color: T.amberD }}>Neto a cobrar: {fmtPEN(guardada.detraccion.neto, sym)}</p>
            </div>
          )}
        </div>
        {pdfUrl && (
          <button type="button" onClick={doCompartir} style={{ borderRadius: 14, padding: "13px 0", background: T.navy, color: T.white, fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
            📤 Compartir PDF
          </button>
        )}
        {!pdfUrl && clientPhone && (
          <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", borderRadius: 14, padding: "13px 0", background: WHATSAPP.icon, color: T.white, fontWeight: 700, fontSize: 13 }}>
            💬 Compartir por WhatsApp
          </a>
        )}
        <button type="button" onClick={() => router.push(volverHref)} style={{ borderRadius: 14, padding: "13px 0", background: "none", border: `1.5px solid ${T.slateD}`, color: T.textMid, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          Ver facturación
        </button>
      </div>
    );
  }

  /* ── Paso 0: elegir tipo (card selector, MD §6.1) ──────── */
  if (!tipo) {
    return (
      <div style={{ maxWidth: 640, margin: "20px auto" }} className="flex flex-col gap-5">
        <Link href={volverHref} style={{ fontSize: 12, fontWeight: 700, color: T.blue }}>← Volver</Link>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 20, fontWeight: 900, color: T.navy }}>¿Tu cliente tiene RUC?</p>
          <p style={{ marginTop: 4, fontSize: 13, color: T.textMid }}>Esto determina el tipo de comprobante SUNAT</p>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <button
            type="button"
            onClick={() => { setTipo("factura"); setDetTipo(null); }}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, borderRadius: 16, padding: 24, background: T.white, border: `2px solid ${T.blue}`, cursor: "pointer" }}
          >
            <span style={{ fontSize: 32 }}>🏢</span>
            <p style={{ fontWeight: 800, color: T.blue, fontSize: 14 }}>Sí, tiene RUC → Factura</p>
            <p style={{ fontSize: 11, color: T.textMid, textAlign: "center" }}>Serie F001 · IGV desglosado · Detracción si aplica</p>
          </button>
          <button
            type="button"
            onClick={() => { setTipo("boleta"); setDetTipo(null); }}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, borderRadius: 16, padding: 24, background: T.white, border: `2px solid ${T.green}`, cursor: "pointer" }}
          >
            <span style={{ fontSize: 32 }}>👤</span>
            <p style={{ fontWeight: 800, color: T.greenD, fontSize: 14 }}>No tiene RUC → Boleta</p>
            <p style={{ fontSize: 11, color: T.textMid, textAlign: "center" }}>Serie B001 · IGV incluido · DNI si total &gt; S/700</p>
          </button>
        </div>
      </div>
    );
  }

  /* ── Editor — layout ~60/40 (MD §4.2) ──────────────────── */
  return (
    <div className="flex flex-col gap-4">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href={volverHref} style={{ fontSize: 12, fontWeight: 700, color: T.blue }}>← Volver</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 12, background: tipo === "factura" ? T.bluePale : T.greenPale }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: tipo === "factura" ? T.blue : T.greenD }}>
              {tipo === "factura" ? "🏢 Factura Electrónica" : "👤 Boleta de Venta"}
            </p>
            <p style={{ fontSize: 13, fontWeight: 900, color: tipo === "factura" ? T.navy : T.greenD }}>{invNum}</p>
          </div>
          <button type="button" onClick={() => setTipo(null)} style={{ fontSize: 11, fontWeight: 700, color: T.textMid, background: "none", border: "none", cursor: "pointer" }}>
            Cambiar
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Columna izquierda ~60% */}
        <div style={{ flex: "1 1 60%", display: "flex", flexDirection: "column", gap: 14 }}>
          {clientes.length > 0 && (
            <label>
              <span style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: T.textMid }}>Cliente guardado</span>
              <select onChange={(e) => seleccionarCliente(e.target.value)} defaultValue="" style={{ width: "100%", borderRadius: 12, padding: "10px 14px", fontSize: 13, background: T.white, border: `1.5px solid ${T.slateD}`, outline: "none" }}>
                <option value="">— Buscar o escribir abajo —</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}{c.ruc ? ` · ${c.ruc}` : ""}</option>)}
              </select>
            </label>
          )}

          {aprobados.length > 0 && (
            <label>
              <span style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: T.textMid }}>Importar desde cotización</span>
              <select value={desdeQuote} onChange={(e) => importarCotizacion(e.target.value)} style={{ width: "100%", borderRadius: 12, padding: "10px 14px", fontSize: 13, background: T.white, border: `1.5px solid ${T.slateD}`, outline: "none" }}>
                <option value="">— Desde cero —</option>
                {aprobados.map((p) => <option key={p.id} value={p.id}>{p.clientName} · {fmtPEN(p.totalFinal)}</option>)}
              </select>
            </label>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <span style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700, color: T.textMid }}>Cliente *</span>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} style={{ width: "100%", borderRadius: 12, padding: "10px 14px", fontSize: 13, background: T.white, border: `1.5px solid ${T.slateD}`, outline: "none" }} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700, color: T.textMid }}>Dirección</span>
              <input value={clientDir} onChange={(e) => setClientDir(e.target.value)} style={{ width: "100%", borderRadius: 12, padding: "10px 14px", fontSize: 13, background: T.white, border: `1.5px solid ${T.slateD}`, outline: "none" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {tipo === "factura" ? (
              <div style={{ flex: 1 }}>
                <span style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700, color: T.textMid }}>RUC del cliente * (11 dígitos, empieza en 10 o 20)</span>
                <input inputMode="numeric" value={clientRuc} onChange={(e) => setClientRuc(e.target.value)} style={{ width: "100%", borderRadius: 12, padding: "10px 14px", fontSize: 13, background: T.white, border: `1.5px solid ${T.slateD}`, outline: "none" }} />
                {clientRuc && !validarRucFactura(clientRuc) && (
                  <p style={{ marginTop: 4, fontSize: 11, fontWeight: 700, color: T.red }}>RUC inválido — debe tener 11 dígitos y empezar en 10 o 20</p>
                )}
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <span style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700, color: T.textMid }}>DNI del cliente * (8 dígitos)</span>
                <input inputMode="numeric" value={clientDni} onChange={(e) => setClientDni(e.target.value)} style={{ width: "100%", borderRadius: 12, padding: "10px 14px", fontSize: 13, background: T.white, border: `1.5px solid ${T.slateD}`, outline: "none" }} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <span style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700, color: T.textMid }}>Teléfono WhatsApp</span>
              <input inputMode="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} style={{ width: "100%", borderRadius: 12, padding: "10px 14px", fontSize: 13, background: T.white, border: `1.5px solid ${T.slateD}`, outline: "none" }} />
            </div>
          </div>

          {/* Tabla de líneas (§6.3) */}
          <div>
            <span style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: T.textMid }}>Líneas</span>
            <div style={{ borderRadius: 14, border: `1px solid ${T.slateD}`, overflow: "hidden", background: T.white }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: T.slate }}>
                    {["Descripción", "Cant", "P.Unit", "Total", ""].map((h) => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: h === "" ? "right" : "left", fontSize: 10, fontWeight: 800, color: T.textMid, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${T.slate}` }}>
                      <td style={{ padding: "8px 12px" }}>
                        <input placeholder="Descripción" value={it.desc} onChange={(e) => cambiarLinea(i, "desc", e.target.value)} style={{ width: "100%", border: "none", outline: "none", fontSize: 13, background: "transparent" }} />
                      </td>
                      <td style={{ padding: "8px 12px", width: 70 }}>
                        <input type="number" min={0} value={it.cantidad || ""} onChange={(e) => cambiarLinea(i, "cantidad", e.target.value)} style={{ width: "100%", border: "none", outline: "none", fontSize: 13, fontWeight: 700, textAlign: "center", background: "transparent" }} />
                      </td>
                      <td style={{ padding: "8px 12px", width: 90 }}>
                        <input type="number" min={0} value={it.pu || ""} onChange={(e) => cambiarLinea(i, "pu", e.target.value)} style={{ width: "100%", border: "none", outline: "none", fontSize: 13, fontWeight: 700, textAlign: "center", background: "transparent" }} />
                      </td>
                      <td style={{ padding: "8px 12px", fontSize: 13, fontWeight: 800, color: T.blue, whiteSpace: "nowrap" }}>{fmtPEN(it.subtotal, sym)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>
                        {items.length > 1 && (
                          <button type="button" onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))} style={{ fontSize: 12, fontWeight: 800, color: T.red, background: "none", border: "none", cursor: "pointer" }}>✕</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={() => setItems((prev) => [...prev, { ...LINEA_VACIA }])}
                style={{ width: "100%", padding: "10px 0", fontSize: 12, fontWeight: 700, color: T.textMid, background: T.slate, border: "none", borderTop: `1px solid ${T.slateD}`, cursor: "pointer" }}
              >
                + Agregar línea
              </button>
            </div>
          </div>

          {error && <p style={{ fontSize: 12, fontWeight: 700, color: T.red }}>{error}</p>}

          <button
            type="button"
            onClick={emitir}
            disabled={loading}
            style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${T.green},${T.greenD})`, color: T.white, fontSize: 14, fontWeight: 800 }}
          >
            {loading ? "Emitiendo…" : `Emitir ${tipo === "boleta" ? "boleta" : "factura"} · ${fmtPEN(total, sym)}`}
          </button>
        </div>

        {/* Columna derecha ~40% */}
        <div style={{ flex: "1 1 40%", display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 20 }}>
          {/* Totales */}
          <div style={{ padding: 16, borderRadius: 14, background: T.white, border: `1px solid ${T.slateD}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 }}>Resumen totales</p>
            {tipo === "boleta" ? (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 900, color: T.blue }}>
                <span>TOTAL (IGV incl.)</span>
                <span>{fmtPEN(total, sym)}</span>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: T.textMid }}>Op. Gravada</span>
                  <span style={{ fontWeight: 700 }}>{fmtPEN(subtotalBase, sym)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8 }}>
                  <span style={{ color: T.textMid }}>IGV (18%)</span>
                  <span style={{ fontWeight: 700 }}>{fmtPEN(igv, sym)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 900, color: T.blue, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.slateD}` }}>
                  <span>TOTAL</span>
                  <span>{fmtPEN(total, sym)}</span>
                </div>
              </>
            )}
          </div>

          {/* Detracción (§6.2) */}
          {aplicaDetraccion && (
            <div style={{ borderRadius: 14, padding: 16, background: T.amberPale, border: `1.5px solid ${T.amber}` }}>
              <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: T.amberD, marginBottom: 10 }}>
                ⚠ Detracción SPOT (total &gt; S/700)
              </p>
              <div className="flex flex-col gap-2">
                {OPCIONES_DETRACCION.map((op) => {
                  const sel = detTipo === op.tipo;
                  return (
                    <button
                      key={op.tipo}
                      type="button"
                      onClick={() => setDetTipo(sel ? null : op.tipo)}
                      style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 10, padding: "10px 12px", textAlign: "left", cursor: "pointer", background: sel ? T.amber : T.white, border: `1.5px solid ${sel ? T.amberD : T.slateD}`, color: sel ? T.white : T.text }}
                    >
                      <span style={{ fontSize: 18 }}>{op.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12, fontWeight: 700 }}>{op.label}</p>
                        <p style={{ fontSize: 10, color: sel ? "rgba(255,255,255,0.8)" : T.textMid }}>Código {op.codigos} · {op.pct}%</p>
                      </div>
                      {sel && <span style={{ fontWeight: 800 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
              {detraccion && (
                <div style={{ marginTop: 10, borderRadius: 10, padding: "10px 12px", background: T.white }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: T.textMid }}>Total</span>
                    <span style={{ fontWeight: 700 }}>{fmtPEN(total, sym)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: T.amberD }}>Detracción ({detraccion.pct}%)</span>
                    <span style={{ fontWeight: 700, color: T.red }}>− {fmtPEN(detraccion.monto, sym)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 900, color: T.green, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${T.slateD}` }}>
                    <span>NETO A COBRAR</span>
                    <span>{fmtPEN(detraccion.neto, sym)}</span>
                  </div>
                  <p style={{ marginTop: 6, fontSize: 10, color: T.textLight }}>Depositar detracción en Banco de la Nación</p>
                </div>
              )}
            </div>
          )}

          {/* Forma de pago */}
          <div style={{ padding: 16, borderRadius: 14, background: T.white, border: `1px solid ${T.slateD}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 }}>Forma de pago</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FORMAS_PAGO.map((fp) => (
                <button
                  key={fp}
                  type="button"
                  onClick={() => setFormaPago(fp)}
                  style={{ padding: "7px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${formaPago === fp ? T.blue : T.slateD}`, background: formaPago === fp ? T.bluePale : T.white, color: formaPago === fp ? T.blue : T.textMid }}
                >
                  {fp}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.slateD}` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: pagado ? T.green : T.amberD }}>{pagado ? "Pagado" : "Pendiente"}</span>
              <button
                type="button"
                onClick={() => setPagado((v) => !v)}
                style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", background: pagado ? T.green : T.slateD, position: "relative" }}
              >
                <span style={{ position: "absolute", top: 2, left: pagado ? 20 : 2, width: 18, height: 18, borderRadius: 9, background: T.white, transition: "left 0.15s" }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
