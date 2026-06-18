"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useFactura } from "@/hooks/useFactura";
import { useAppStore } from "@/store/useAppStore";
import { facturaSchema } from "@/lib/validations";
import {
  buildFacturaWhatsAppUrl,
  nextNumeroComprobante,
  type FormaPago,
  type TipoComprobante,
} from "@/lib/factura-utils";
import { calcIGV, fmtPEN, hoy } from "@/lib/utils";
import { T } from "@/lib/theme";
import type { Cliente, EmpresaData, Factura, LineaFactura, Presupuesto } from "@/types";

const FORMAS_PAGO: FormaPago[] = ["Efectivo", "Yape", "Transferencia", "Crédito"];
const LINEA_VACIA: LineaFactura = { desc: "", cantidad: 1, pu: 0, subtotal: 0 };

interface Props {
  empresa: EmpresaData | null;
  numerosExistentes: string[];
  aprobados: Presupuesto[];
  clientes: Cliente[];
  presupuestoId?: string;
}

export function NuevaFacturaForm({
  empresa,
  numerosExistentes,
  aprobados,
  clientes,
  presupuestoId,
}: Props) {
  const router = useRouter();
  const { crear, generarPDF, loading } = useFactura();
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const mostrarUpgrade = useAppStore((s) => s.mostrarUpgrade);

  const [tipo, setTipo]               = useState<TipoComprobante>("factura");
  const [clientName, setClientName]   = useState("");
  const [clientRuc, setClientRuc]     = useState("");
  const [clientDir, setClientDir]     = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [items, setItems]             = useState<LineaFactura[]>([{ ...LINEA_VACIA }]);
  const [desdeQuote, setDesdeQuote]   = useState(presupuestoId ?? "");
  const [formaPago, setFormaPago]     = useState<FormaPago>("Efectivo");
  const [pagado, setPagado]           = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [guardada, setGuardada]       = useState<Factura | null>(null);
  const [pdfUrl, setPdfUrl]           = useState<string | null>(null);

  const invNum = useMemo(
    () => nextNumeroComprobante(tipo, numerosExistentes),
    [tipo, numerosExistentes]
  );
  const sym = empresa?.simbolo ?? "S/";
  const subtotalBase = useMemo(() => items.reduce((s, it) => s + it.subtotal, 0), [items]);
  const { igv, total } = calcIGV(subtotalBase);

  const importarPresupuesto = (id: string) => {
    setDesdeQuote(id);
    const p = aprobados.find((x) => x.id === id);
    if (!p) return;
    setClientName(p.clientName);
    if (p.phone) setClientPhone(p.phone);
    const lineas: LineaFactura[] = p.items.map((it) => ({
      desc: it.svcLabel,
      cantidad: it.qty,
      pu: it.unitPrice,
      subtotal: it.subtotal,
    }));
    if (p.totalLabor > 0) {
      lineas.push({
        desc: `Mano de obra (${p.margin}%)`,
        cantidad: 1,
        pu: p.totalLabor,
        subtotal: p.totalLabor,
      });
    }
    setItems(lineas.length ? lineas : [{ ...LINEA_VACIA }]);
  };

  useEffect(() => {
    if (presupuestoId) importarPresupuesto(presupuestoId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presupuestoId]);

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
    if (!empresa || !/^\d{11}$/.test(empresa.ruc)) {
      setError("Completa el RUC de tu empresa en Configuración");
      return;
    }
    const valido = facturaSchema.safeParse({ clientName, clientRuc, clientDir, items });
    if (!valido.success) {
      setError(valido.error.errors[0]?.message ?? "Revisa los datos");
      return;
    }

    const invStatus = pagado ? "Cobrada" : "Emitida";
    const bizData: EmpresaData = {
      ...empresa,
      tipoComprobante: tipo,
      formaPago,
    };

    const creada = await crear({
      invNum,
      invDate: hoy(),
      invStatus,
      clientName: clientName.trim(),
      clientRuc: clientRuc.trim() || undefined,
      clientDir: clientDir.trim() || undefined,
      moneda: empresa.moneda,
      sym,
      items,
      subtotalBase,
      igvAmount: igv,
      totalFinal: total,
      fromQuoteId: desdeQuote || undefined,
      bizData,
    }, mostrarUpgrade);

    if (!creada) {
      mostrarToast("No se pudo emitir", "error");
      return;
    }

    setGuardada(creada);
    mostrarToast(`${invNum} emitida ✓`);
    const url = await generarPDF(creada.invId);
    if (url) setPdfUrl(url);
  };

  if (guardada) {
    return (
      <div className="flex flex-col gap-4 px-4 py-4">
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: T.greenPale, border: `1.5px solid ${T.green}` }}
        >
          <p className="text-2xl font-black" style={{ color: T.greenD }}>✓ {guardada.invNum}</p>
          <p className="mt-1 text-sm" style={{ color: T.greenD }}>
            {pagado ? "Marcada como PAGADA — sello en PDF" : "Emitida como pendiente"}
          </p>
        </div>
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl py-3.5 text-center text-sm font-bold text-white"
            style={{ background: T.navy }}
          >
            📄 Descargar PDF
          </a>
        )}
        {clientPhone && (
          <a
            href={buildFacturaWhatsAppUrl(clientPhone, guardada.invNum, total, sym)}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl py-3.5 text-center text-sm font-bold text-white"
            style={{ background: "#25D366" }}
          >
            💬 Compartir por WhatsApp
          </a>
        )}
        <Button variant="ghost" full onClick={() => router.push("/facturas")}>
          Ver facturación
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4" style={{ background: "#F8FAFF" }}>
      <Link href="/facturas" className="text-sm font-semibold" style={{ color: T.textMid }}>
        ← Volver
      </Link>

      {/* Tipo Boleta / Factura */}
      <div className="flex gap-2 rounded-2xl p-1" style={{ background: T.navyLight }}>
        {(["boleta", "factura"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className="flex-1 rounded-xl py-2.5 text-sm font-bold capitalize"
            style={{
              background: tipo === t ? T.blue : "transparent",
              color: tipo === t ? T.white : T.textLight,
            }}
          >
            {t === "boleta" ? "Boleta" : "Factura"}
          </button>
        ))}
      </div>

      {/* Número automático */}
      <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: T.navy }}>
        <span className="text-xs font-bold" style={{ color: T.slateDD }}>Número</span>
        <span className="text-sm font-black" style={{ color: T.white }}>{invNum}</span>
      </div>

      {/* Cliente autocompletado */}
      {clientes.length > 0 && (
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
            Cliente guardado
          </span>
          <select
            onChange={(e) => seleccionarCliente(e.target.value)}
            defaultValue=""
            className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none"
            style={{ background: T.white, border: `1.5px solid ${T.slateD}` }}
          >
            <option value="">— Buscar o escribir abajo —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}{c.ruc ? ` · ${c.ruc}` : ""}</option>
            ))}
          </select>
        </label>
      )}

      {aprobados.length > 0 && (
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
            Importar desde presupuesto
          </span>
          <select
            value={desdeQuote}
            onChange={(e) => importarPresupuesto(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: T.white, border: `1.5px solid ${T.slateD}` }}
          >
            <option value="">— Desde cero —</option>
            {aprobados.map((p) => (
              <option key={p.id} value={p.id}>
                {p.clientName} · {fmtPEN(p.totalFinal)}
              </option>
            ))}
          </select>
        </label>
      )}

      <Input label="Cliente *" value={clientName} onChange={(e) => setClientName(e.target.value)} />
      <Input label="RUC / DNI" inputMode="numeric" value={clientRuc} onChange={(e) => setClientRuc(e.target.value)} />
      <Input label="Dirección" value={clientDir} onChange={(e) => setClientDir(e.target.value)} />
      <Input label="Teléfono WhatsApp" inputMode="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />

      {/* Forma de pago */}
      <div>
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
          Forma de pago
        </span>
        <div className="grid grid-cols-2 gap-2">
          {FORMAS_PAGO.map((fp) => (
            <button
              key={fp}
              type="button"
              onClick={() => setFormaPago(fp)}
              className="rounded-xl py-2.5 text-xs font-bold"
              style={{
                background: formaPago === fp ? T.bluePale : T.white,
                color: formaPago === fp ? T.blue : T.textMid,
                border: `1.5px solid ${formaPago === fp ? T.blue : T.slateD}`,
              }}
            >
              {fp}
            </button>
          ))}
        </div>
      </div>

      {/* Estado Pendiente / Pagado */}
      <div className="flex gap-2">
        {([false, true] as const).map((p) => (
          <button
            key={String(p)}
            type="button"
            onClick={() => setPagado(p)}
            className="flex-1 rounded-xl py-3 text-sm font-bold"
            style={{
              background: pagado === p ? (p ? T.green : T.amberPale) : T.white,
              color: pagado === p ? (p ? T.white : T.amberD) : T.textMid,
              border: `1.5px solid ${pagado === p ? (p ? T.green : T.amber) : T.slateD}`,
            }}
          >
            {p ? "Pagado" : "Pendiente"}
          </button>
        ))}
      </div>

      {/* Líneas */}
      <div className="flex flex-col gap-2">
        {items.map((it, i) => (
          <div key={i} className="rounded-2xl bg-white p-3 shadow-sm">
            <input
              placeholder="Descripción"
              value={it.desc}
              onChange={(e) => cambiarLinea(i, "desc", e.target.value)}
              className="w-full rounded-lg px-2.5 py-2 text-sm outline-none"
              style={{ background: T.slate }}
            />
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={it.cantidad || ""}
                onChange={(e) => cambiarLinea(i, "cantidad", e.target.value)}
                className="w-16 rounded-lg py-2 text-center text-sm font-bold outline-none"
                style={{ background: T.slate }}
              />
              <input
                type="number"
                min={0}
                value={it.pu || ""}
                onChange={(e) => cambiarLinea(i, "pu", e.target.value)}
                className="w-24 rounded-lg py-2 text-center text-sm font-bold outline-none"
                style={{ background: T.slate }}
              />
              <span className="ml-auto text-sm font-black" style={{ color: T.blue }}>
                {fmtPEN(it.subtotal, sym)}
              </span>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, { ...LINEA_VACIA }])}
          className="rounded-xl border-2 border-dashed py-2 text-xs font-bold"
          style={{ borderColor: T.slateDD, color: T.textMid }}
        >
          + Agregar línea
        </button>
      </div>

      {/* Totales */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex justify-between text-sm">
          <span style={{ color: T.textMid }}>Subtotal</span>
          <span className="font-bold">{fmtPEN(subtotalBase, sym)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span style={{ color: T.textMid }}>IGV (18%)</span>
          <span className="font-bold">{fmtPEN(igv, sym)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t pt-3 text-lg font-black" style={{ borderColor: T.slateD, color: T.blue }}>
          <span>TOTAL</span>
          <span>{fmtPEN(total, sym)}</span>
        </div>
      </div>

      {error && <p className="text-center text-sm font-semibold" style={{ color: T.red }}>{error}</p>}

      <Button full variant="success" disabled={loading} onClick={emitir}>
        {loading ? "Emitiendo…" : `Emitir ${tipo === "boleta" ? "boleta" : "factura"} · ${fmtPEN(total, sym)}`}
      </Button>
    </div>
  );
}
