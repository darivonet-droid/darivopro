"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TabPillSelector } from "@/components/design-system/TabPillSelector";
import { Toggle } from "@/components/design-system/Toggle";
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
import { RADII, T, WHATSAPP } from "@/lib/design-system/tokens";
import type {
  Cliente, Detraccion, EmpresaData, Factura, LineaFactura,
  Cotizacion, TipoDetraccion,
} from "@/types";

const FORMAS_PAGO: FormaPago[] = ["Efectivo", "Yape", "Transferencia", "Crédito"];
const LINEA_VACIA: LineaFactura = { desc: "", cantidad: 1, pu: 0, subtotal: 0 };

interface Props {
  empresa:           EmpresaData | null;
  numerosExistentes: string[];
  aprobados:         Cotizacion[];
  clientes:          Cliente[];
  cotizacionId?:    string;
  /** Tipo de comprobante elegido antes de entrar aquí (Clientes/Facturas) —
   * ya no se pregunta "¿Tu cliente tiene RUC?" dentro del formulario. */
  tipoInicial:      TipoComprobante;
  /** Cliente preseleccionado (viene de la ficha de cliente). */
  clienteIdInicial?: string;
}

/* ─── Formulario principal ────────────────────────────────── */
export function NuevaFacturaForm({
  empresa, numerosExistentes, aprobados, clientes, cotizacionId, tipoInicial, clienteIdInicial,
}: Props) {
  const router       = useRouter();
  const { crear, generarPDF, loading } = useFactura();
  const mostrarToast   = useAppStore((s) => s.mostrarToast);
  const mostrarUpgrade = useAppStore((s) => s.mostrarUpgrade);

  const [tipo, setTipo]             = useState<TipoComprobante>(tipoInicial);

  const [selectedClienteId, setSelectedClienteId] = useState<string | undefined>(undefined);
  const [clientName,   setClientName]   = useState("");
  const [clientRuc,    setClientRuc]    = useState("");
  const [clientDni,    setClientDni]    = useState("");
  const [clientDir,    setClientDir]    = useState("");
  const [clientPhone,  setClientPhone]  = useState("");
  const [clientEmail,  setClientEmail]  = useState("");
  const [items,        setItems]        = useState<LineaFactura[]>([{ ...LINEA_VACIA }]);
  const [desdeQuote,   setDesdeQuote]   = useState(cotizacionId ?? "");
  const [formaPago,    setFormaPago]    = useState<FormaPago>("Efectivo");
  const [pagado,       setPagado]       = useState(false);
  const [detTipo,      setDetTipo]      = useState<TipoDetraccion | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [guardada,     setGuardada]     = useState<Factura | null>(null);
  const [pdfUrl,       setPdfUrl]       = useState<string | null>(null);

  const invNum = useMemo(
    () => tipo ? nextNumeroComprobante(tipo, numerosExistentes) : "",
    [tipo, numerosExistentes]
  );

  const sym          = empresa?.simbolo ?? "S/";
  const subtotalBase = useMemo(() => items.reduce((s, it) => s + it.subtotal, 0), [items]);
  const { igv, total } = calcIGV(subtotalBase);

  // Detracción: solo en facturas > S/700
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
    setSelectedClienteId(p.clienteId);
    if (p.phone) setClientPhone(p.phone);
    const lineas: LineaFactura[] = p.items.map((it) => ({
      desc: it.svcLabel, cantidad: it.qty, pu: it.unitPrice, subtotal: it.subtotal,
    }));
    if (p.totalLabor > 0) {
      lineas.push({ desc: "Mano de obra", cantidad: 1, pu: p.totalLabor, subtotal: p.totalLabor });
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
    setSelectedClienteId(c.id);
    setClientName(c.nombre);
    setClientRuc(c.ruc ?? "");
    setClientDir(c.direccion ?? "");
    setClientPhone(c.telefono ?? "");
    setClientEmail(c.email ?? "");
  };

  useEffect(() => {
    if (clienteIdInicial) seleccionarCliente(clienteIdInicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteIdInicial]);

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

    // Validar RUC cliente en facturas
    if (tipo === "factura") {
      if (!clientRuc) { setError("Ingresa el RUC del cliente"); return; }
      if (!validarRucFactura(clientRuc)) {
        setError("El RUC debe tener 11 dígitos y empezar en 10 o 20");
        return;
      }
      const valido = facturaSchema.safeParse({ clientName, clientRuc, clientDir, items });
      if (!valido.success) { setError(valido.error.errors[0]?.message ?? "Revisa los datos"); return; }
    } else {
      // Boleta (Particular): DNI obligatorio
      if (!clientDni) { setError("Ingresa el DNI del cliente"); return; }
      if (!/^\d{8}$/.test(clientDni)) { setError("El DNI debe tener 8 dígitos"); return; }
      const valido = boletaSchema.safeParse({ clientName, clientDni, clientDir, items });
      if (!valido.success) { setError(valido.error.errors[0]?.message ?? "Revisa los datos"); return; }
    }

    // Detracción obligatoria en facturas > S/700
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
      clienteId: selectedClienteId,
      clientPhone: clientPhone.trim() || undefined,
      clientName: clientName.trim(),
      clientRuc:  tipo === "factura" ? clientRuc.trim() || undefined : undefined,
      clientDni:  tipo === "boleta"  ? clientDni.trim() || undefined : undefined,
      clientDir:  clientDir.trim() || undefined,
      moneda:     empresa.moneda,
      sym,
      items,
      subtotalBase,
      igvAmount:  igv,
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
      const r = await import("@/lib/share").then((m) => m.compartirPDF(pdfUrl, titulo, `${guardada.invNum}.pdf`));
      if (r.method === "clipboard") {
        mostrarToast("Enlace copiado al portapapeles ✓");
      } else if (r.method === "error") {
        window.open(pdfUrl, "_blank");
      }
    };

    return (
      <div className="flex flex-col gap-4 px-4 py-4">
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: T.greenPale, border: `1.5px solid ${T.green}` }}
        >
          <p className="text-2xl font-black" style={{ color: T.greenD }}>✓ {guardada.invNum}</p>
          <p className="mt-1 text-sm" style={{ color: T.greenD }}>
            {pagado ? "Marcada como PAGADA" : "Emitida como pendiente"}
          </p>
          {guardada.detraccion && (
            <div className="mt-3 rounded-xl px-3 py-2 text-xs" style={{ background: T.amberPale }}>
              <p className="font-bold" style={{ color: T.amberD }}>
                SPOT: {guardada.detraccion.pct}% = {fmtPEN(guardada.detraccion.monto, sym)}
              </p>
              <p style={{ color: T.amberD }}>
                Neto a cobrar: {fmtPEN(guardada.detraccion.neto, sym)}
              </p>
            </div>
          )}
        </div>
        {/* Botón Compartir único — usa Web Share API nativa, o descarga PDF como fallback */}
        {pdfUrl && (
          <button
            type="button"
            onClick={doCompartir}
            className="block w-full rounded-2xl py-3.5 text-center text-sm font-bold text-white"
            style={{ background: T.navy }}
          >
            📤 Compartir PDF
          </button>
        )}
        {/* Fallback visible solo cuando no hay PDF y hay teléfono */}
        {!pdfUrl && clientPhone && (
          <a href={waUrl}
            target="_blank" rel="noopener noreferrer"
            className="block rounded-2xl py-3.5 text-center text-sm font-bold text-white"
            style={{ background: WHATSAPP.icon }}>
            💬 Compartir por WhatsApp
          </a>
        )}
        <Button variant="ghost" full onClick={() => router.push("/facturas")}>
          Ver facturación
        </Button>
      </div>
    );
  }

  /* ── Formulario ────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-4 px-4 py-4" style={{ background: T.slate }}>
      <Link href="/facturas" className="text-sm font-semibold" style={{ color: T.textMid }}>
        ← Volver
      </Link>

      {/* Tipo seleccionado (con opción de cambiar) */}
      <div className="flex items-center justify-between rounded-2xl px-4 py-3"
        style={{ background: tipo === "factura" ? T.bluePale : T.greenPale }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide"
            style={{ color: tipo === "factura" ? T.blue : T.greenD }}>
            {tipo === "factura" ? "🏢 Factura Electrónica" : "👤 Boleta de Venta"}
          </p>
          <p className="text-sm font-black" style={{ color: tipo === "factura" ? T.navy : T.greenD }}>
            {invNum}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setTipo(tipo === "factura" ? "boleta" : "factura"); setDetTipo(null); }}
          className="text-xs font-semibold"
          style={{ color: T.textMid }}
        >
          Cambiar a {tipo === "factura" ? "Boleta" : "Factura"}
        </button>
      </div>

      {/* Cliente autocompletado */}
      {clientes.length > 0 && (
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
            Cliente guardado
          </span>
          <select onChange={(e) => seleccionarCliente(e.target.value)} defaultValue=""
            className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none"
            style={{ background: T.white, border: `1.5px solid ${T.slateD}` }}>
            <option value="">— Buscar o escribir abajo —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}{c.ruc ? ` · ${c.ruc}` : ""}</option>
            ))}
          </select>
        </label>
      )}

      {/* Importar cotización */}
      {aprobados.length > 0 && (
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
            Importar desde cotización
          </span>
          <select value={desdeQuote} onChange={(e) => importarCotizacion(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: T.white, border: `1.5px solid ${T.slateD}` }}>
            <option value="">— Desde cero —</option>
            {aprobados.map((p) => (
              <option key={p.id} value={p.id}>{p.clientName} · {fmtPEN(p.totalFinal)}</option>
            ))}
          </select>
        </label>
      )}

      {/* Campos del cliente */}
      <Input label="Cliente *" value={clientName} onChange={(e) => setClientName(e.target.value)} />

      {tipo === "factura" && (
        <>
          <Input
            label="RUC del cliente * (11 dígitos, empieza en 10 o 20)"
            inputMode="numeric"
            value={clientRuc}
            onChange={(e) => setClientRuc(e.target.value)}
          />
          {clientRuc && !validarRucFactura(clientRuc) && (
            <p className="text-xs font-semibold" style={{ color: T.red }}>
              RUC inválido — debe tener 11 dígitos y empezar en 10 o 20
            </p>
          )}
        </>
      )}

      {tipo === "boleta" && (
        <>
          <Input
            label="DNI del cliente * (8 dígitos)"
            inputMode="numeric"
            value={clientDni}
            onChange={(e) => setClientDni(e.target.value)}
          />
        </>
      )}

      <Input label="Dirección" value={clientDir} onChange={(e) => setClientDir(e.target.value)} />
      <Input label="Teléfono WhatsApp" inputMode="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
      {clientEmail && (
        <p className="px-1 text-xs" style={{ color: T.textMid }}>✉️ {clientEmail}</p>
      )}

      {/* Forma de pago */}
      <div>
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
          Forma de pago
        </span>
        <TabPillSelector
          tabs={FORMAS_PAGO.map((fp) => ({ id: fp, label: fp }))}
          active={formaPago}
          onChange={setFormaPago}
        />
      </div>

      {/* Estado */}
      <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: T.white, border: `1.5px solid ${T.slateD}` }}>
        <span className="text-sm font-bold" style={{ color: pagado ? T.green : T.amberD }}>
          {pagado ? "Pagado" : "Pendiente"}
        </span>
        <Toggle checked={pagado} onChange={setPagado} label="Marcar como pagado" />
      </div>

      {/* Líneas */}
      <div className="flex flex-col gap-2">
        {items.map((it, i) => (
          <div key={i} className="p-3" style={{ background: T.white, border: `1px solid ${T.slateD}`, borderRadius: RADII.card }}>
            <input placeholder="Descripción" value={it.desc}
              onChange={(e) => cambiarLinea(i, "desc", e.target.value)}
              className="w-full rounded-lg px-2.5 py-2 text-sm outline-none"
              style={{ background: T.slate }} />
            <div className="mt-2 flex items-center gap-2">
              <input type="number" min={0} value={it.cantidad || ""}
                onChange={(e) => cambiarLinea(i, "cantidad", e.target.value)}
                className="w-16 rounded-lg py-2 text-center text-sm font-bold outline-none"
                style={{ background: T.slate }} />
              <input type="number" min={0} value={it.pu || ""}
                onChange={(e) => cambiarLinea(i, "pu", e.target.value)}
                className="w-24 rounded-lg py-2 text-center text-sm font-bold outline-none"
                style={{ background: T.slate }} />
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm font-black" style={{ color: T.blue }}>
                  {fmtPEN(it.subtotal, sym)}
                </span>
                {items.length > 1 && (
                  <button type="button" onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                    className="text-xs font-bold" style={{ color: T.red }}>✕</button>
                )}
              </div>
            </div>
          </div>
        ))}
        <button type="button"
          onClick={() => setItems((prev) => [...prev, { ...LINEA_VACIA }])}
          className="rounded-xl border-2 border-dashed py-2 text-xs font-bold"
          style={{ borderColor: T.slateDD, color: T.textMid }}>
          + Agregar línea
        </button>
      </div>

      {/* Totales */}
      <div className="p-4" style={{ background: T.white, border: `1px solid ${T.slateD}`, borderRadius: RADII.card }}>
        {tipo === "boleta" ? (
          // Boleta: IGV incluido, no desglosado
          <div className="flex justify-between text-lg font-black" style={{ color: T.blue }}>
            <span>TOTAL (IGV incl.)</span>
            <span>{fmtPEN(total, sym)}</span>
          </div>
        ) : (
          // Factura: IGV desglosado
          <>
            <div className="flex justify-between text-sm">
              <span style={{ color: T.textMid }}>Op. Gravada</span>
              <span className="font-bold">{fmtPEN(subtotalBase, sym)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span style={{ color: T.textMid }}>IGV (18%)</span>
              <span className="font-bold">{fmtPEN(igv, sym)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t pt-3 text-lg font-black"
              style={{ borderColor: T.slateD, color: T.blue }}>
              <span>TOTAL</span>
              <span>{fmtPEN(total, sym)}</span>
            </div>
          </>
        )}
      </div>

      {/* Sección detracción (solo facturas > S/700) */}
      {aplicaDetraccion && (
        <div className="rounded-2xl p-4" style={{ background: T.amberPale, border: `1.5px solid ${T.amber}` }}>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-wide" style={{ color: T.amberD }}>
            ⚠ Operación sujeta a Detracción SPOT (total &gt; S/700)
          </p>
          <div className="flex flex-col gap-2">
            {OPCIONES_DETRACCION.map((op) => {
              const sel = detTipo === op.tipo;
              return (
                <button
                  key={op.tipo}
                  type="button"
                  onClick={() => setDetTipo(sel ? null : op.tipo)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all"
                  style={{
                    background: sel ? T.amber : T.white,
                    border: `1.5px solid ${sel ? T.amberD : T.slateD}`,
                    color: sel ? T.white : T.text,
                  }}
                >
                  <span className="text-xl">{op.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{op.label}</p>
                    <p className="text-[10px]" style={{ color: sel ? "rgba(255,255,255,0.80)" : T.textMid }}>
                      Código {op.codigos} · {op.pct}%
                    </p>
                  </div>
                  {sel && <span className="font-extrabold">✓</span>}
                </button>
              );
            })}
          </div>

          {detraccion && (
            <div className="mt-3 rounded-xl px-4 py-3" style={{ background: T.white }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: T.textMid }}>Total</span>
                <span className="font-bold">{fmtPEN(total, sym)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: T.amberD }}>Detracción ({detraccion.pct}%)</span>
                <span className="font-bold" style={{ color: T.red }}>− {fmtPEN(detraccion.monto, sym)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2 text-base font-black"
                style={{ borderColor: T.slateD, color: T.green }}>
                <span>NETO A COBRAR</span>
                <span>{fmtPEN(detraccion.neto, sym)}</span>
              </div>
              <p className="mt-2 text-[10px]" style={{ color: T.textLight }}>
                Depositar detracción en Banco de la Nación
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-center text-sm font-semibold" style={{ color: T.red }}>{error}</p>
      )}

      <Button full variant="success" disabled={loading} onClick={emitir}>
        {loading
          ? "Emitiendo…"
          : `Emitir ${tipo === "boleta" ? "boleta" : "factura"} · ${fmtPEN(total, sym)}`}
      </Button>
    </div>
  );
}
