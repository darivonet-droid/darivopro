"use client";
import { useMemo, useRef, useState } from "react";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/theme";
import { useGastos, type Gasto } from "@/hooks/useGastos";
import type { GastoIAExtraccion } from "@/lib/gasto-ia";
import { useAppStore } from "@/store/useAppStore";

type Tab = "gastos" | "expediente";

const CATEGORIAS_GASTO = [
  "Materiales",
  "Herramientas",
  "Transporte",
  "Subcontrata",
  "Oficina",
  "Otros",
];

interface CierreViewProps {
  resumenExpediente: {
    cotizaciones: number;
    facturas: number;
    ingresosMes: number;
  };
}

export function CierreView({ resumenExpediente }: CierreViewProps) {
  const [tab, setTab] = useState<Tab>("gastos");
  const { gastos, listo, agregarGasto, gastosDelMes } = useGastos();
  const [modalManual, setModalManual] = useState(false);
  const [prefill, setPrefill] = useState<Partial<GastoIAExtraccion> | null>(null);
  const [analizando, setAnalizando] = useState(false);
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
      if (res.status === 429) {
        mostrarUpgrade("ia_limite");
        return;
      }
      if (!res.ok) {
        mostrarToast(json.error ?? "Error al analizar", "error");
        return;
      }
      setPrefill(json.data);
      setModalManual(true);
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

  const gastosMes = useMemo(
    () => gastosDelMes(anioExp, mesExp),
    [gastosDelMes, anioExp, mesExp]
  );
  const totalGastosMes = gastosMes.reduce((s, g) => s + g.total, 0);

  const recientes = gastos.slice(0, 5);

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Pestañas */}
      <div
        className="flex rounded-2xl p-1"
        style={{ background: T.slateD }}
      >
        {(["gastos", "expediente"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="flex-1 rounded-xl py-2.5 text-sm font-bold capitalize transition-all"
            style={{
              background: tab === t ? T.white : "transparent",
              color: tab === t ? T.purple : T.textMid,
              boxShadow: tab === t ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {t === "gastos" ? "Gastos" : "Expediente Mensual"}
          </button>
        ))}
      </div>

      {tab === "gastos" ? (
        <>
          {/* Tarjeta registrar gasto */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: `linear-gradient(135deg, ${T.navy}, ${T.purple})`,
              boxShadow: `0 6px 24px ${T.purple}44`,
            }}
          >
            <p className="text-lg font-black" style={{ color: T.white }}>
              Registrar gasto
            </p>
            <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
              📷 La Calculadora inteligente analizará tu documento automáticamente
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={abrirCamara}
                disabled={analizando}
                className="rounded-xl py-2.5 text-xs font-bold disabled:opacity-60"
                style={{ background: "rgba(255,255,255,0.15)", color: T.white }}
              >
                {analizando ? "Analizando…" : "Tomar foto"}
              </button>
              <button
                type="button"
                onClick={abrirCamara}
                disabled={analizando}
                className="rounded-xl py-2.5 text-xs font-bold disabled:opacity-60"
                style={{ background: "rgba(255,255,255,0.15)", color: T.white }}
              >
                Seleccionar imagen
              </button>
              <button
                type="button"
                disabled
                className="rounded-xl py-2.5 text-xs font-bold opacity-50"
                style={{ background: "rgba(255,255,255,0.15)", color: T.white }}
                title="PDF — pendiente"
              >
                Subir PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrefill(null);
                  setModalManual(true);
                }}
                className="rounded-xl py-2.5 text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.15)", color: T.white }}
              >
                Registro manual
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) analizarArchivo(f);
                e.target.value = "";
              }}
            />
          </div>

          {/* Gastos recientes */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold" style={{ color: T.text }}>
              Gastos recientes
            </h2>
            {gastos.length > 5 && (
              <span className="text-xs font-bold" style={{ color: T.purple }}>
                Ver todos ({gastos.length})
              </span>
            )}
          </div>

          {!listo ? (
            <p className="text-sm" style={{ color: T.textMid }}>
              Cargando…
            </p>
          ) : recientes.length === 0 ? (
            <div
              className="rounded-2xl py-10 text-center"
              style={{ background: T.white, border: `1px solid ${T.slateD}` }}
            >
              <p className="text-sm font-semibold" style={{ color: T.textMid }}>
                Aún no hay gastos registrados
              </p>
              <button
                type="button"
                onClick={() => setModalManual(true)}
                className="mt-3 text-sm font-bold"
                style={{ color: T.purple }}
              >
                Registrar manualmente →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recientes.map((g) => (
                <GastoCard key={g.id} gasto={g} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-sm" style={{ color: T.textMid }}>
            Selecciona el período y genera tu expediente mensual.
          </p>

          <div className="flex gap-3">
            <select
              value={mesExp}
              onChange={(e) => setMesExp(Number(e.target.value))}
              className="flex-1 rounded-xl border px-3 py-3 text-sm font-semibold"
              style={{ borderColor: T.slateD, color: T.text }}
            >
              {MESES.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={anioExp}
              onChange={(e) => setAnioExp(Number(e.target.value))}
              className="w-24 rounded-xl border px-3 py-3 text-sm font-semibold"
              style={{ borderColor: T.slateD, color: T.text }}
            >
              {[anioExp - 1, anioExp, anioExp + 1].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ background: T.purplePale, border: `1px solid ${T.purple}33` }}
          >
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: T.purple }}>
              ¿Qué incluye tu expediente?
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-sm" style={{ color: T.text }}>
              <li>• Cotizaciones del período</li>
              <li>• Facturas emitidas</li>
              <li>• Gastos registrados</li>
              <li>• Resumen de ingresos y egresos</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setExpedienteGenerado(true)}
            className="w-full rounded-2xl py-4 text-sm font-extrabold"
            style={{
              background: `linear-gradient(135deg, ${T.purple}, #9333EA)`,
              color: T.white,
              boxShadow: `0 4px 16px ${T.purple}44`,
            }}
          >
            Generar expediente
          </button>

          {expedienteGenerado && (
            <div
              className="rounded-2xl p-4"
              style={{ background: T.white, border: `1px solid ${T.slateD}` }}
            >
              <p className="text-base font-black" style={{ color: T.greenD }}>
                ✓ Expediente generado
              </p>
              <p className="mt-1 text-sm" style={{ color: T.textMid }}>
                {MESES[mesExp]} {anioExp}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <StatExp label="Cotizaciones" valor={String(resumenExpediente.cotizaciones)} />
                <StatExp label="Facturas" valor={String(resumenExpediente.facturas)} />
                <StatExp label="Gastos" valor={String(gastosMes.length)} />
                <StatExp label="Total gastos" valor={fmtPEN(totalGastosMes)} />
              </div>
              <p className="mt-3 text-xs" style={{ color: T.textLight }}>
                Exportación PDF/ZIP — pendiente integración (Tarea 07/09)
              </p>
            </div>
          )}
        </>
      )}

      {modalManual && (
        <ModalGastoManual
          prefill={prefill}
          onClose={() => {
            setModalManual(false);
            setPrefill(null);
          }}
          onGuardar={(g) => {
            agregarGasto(g);
            setModalManual(false);
            setPrefill(null);
          }}
        />
      )}
    </div>
  );
}

function GastoCard({ gasto }: { gasto: Gasto }) {
  return (
    <div
      className="flex items-center justify-between rounded-2xl px-4 py-3.5"
      style={{ background: T.white, border: `1px solid ${T.slateD}` }}
    >
      <div>
        <p className="text-sm font-bold" style={{ color: T.text }}>
          {gasto.proveedor}
        </p>
        <p className="text-xs" style={{ color: T.textMid }}>
          {gasto.categoria} ·{" "}
          {new Date(gasto.fecha).toLocaleDateString("es-PE", {
            day: "numeric",
            month: "short",
          })}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-extrabold" style={{ color: T.purple }}>
          {fmtPEN(gasto.total)}
        </p>
        <span
          className="text-[10px] font-bold"
          style={{ color: gasto.estado === "Aprobado" ? T.greenD : T.amberD }}
        >
          {gasto.estado}
        </span>
      </div>
    </div>
  );
}

function StatExp({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: T.slate }}>
      <p className="text-[10px] font-bold uppercase" style={{ color: T.textMid }}>
        {label}
      </p>
      <p className="mt-0.5 text-lg font-black" style={{ color: T.text }}>
        {valor}
      </p>
    </div>
  );
}

function ModalGastoManual({
  prefill,
  onClose,
  onGuardar,
}: {
  prefill: Partial<GastoIAExtraccion> | null;
  onClose: () => void;
  onGuardar: (g: Omit<Gasto, "id" | "createdAt" | "estado">) => void;
}) {
  const [proveedor, setProveedor] = useState(prefill?.proveedor ?? "");
  const [categoria, setCategoria] = useState(prefill?.categoria ?? CATEGORIAS_GASTO[0]);
  const [fecha, setFecha] = useState(
    prefill?.fecha ?? new Date().toISOString().slice(0, 10)
  );
  const [total, setTotal] = useState(prefill?.total ? String(prefill.total) : "");
  const [metodoPago, setMetodoPago] = useState(prefill?.metodoPago ?? "Efectivo");
  const [descripcion, setDescripcion] = useState(prefill?.descripcion ?? "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(10,22,40,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] rounded-t-3xl p-5 pb-10"
        style={{ background: T.white }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg font-black" style={{ color: T.text }}>
          {prefill ? "Revisar gasto" : "Registro manual"}
        </p>
        {prefill && (
          <p className="mt-1 text-xs font-semibold" style={{ color: T.greenD }}>
            ✓ Documento analizado — La Calculadora inteligente extrajo la información
          </p>
        )}
        <div className="mt-4 flex flex-col gap-3">
          <input
            placeholder="Proveedor"
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            className="rounded-xl border px-3 py-3 text-sm"
            style={{ borderColor: T.slateD }}
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-xl border px-3 py-3 text-sm"
            style={{ borderColor: T.slateD }}
          >
            {CATEGORIAS_GASTO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="rounded-xl border px-3 py-3 text-sm"
            style={{ borderColor: T.slateD }}
          />
          <input
            placeholder="Total S/"
            inputMode="decimal"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="rounded-xl border px-3 py-3 text-sm"
            style={{ borderColor: T.slateD }}
          />
          <input
            placeholder="Método de pago"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="rounded-xl border px-3 py-3 text-sm"
            style={{ borderColor: T.slateD }}
          />
          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            className="rounded-xl border px-3 py-3 text-sm"
            style={{ borderColor: T.slateD }}
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl py-3 text-sm font-bold"
            style={{ border: `1.5px solid ${T.slateD}`, color: T.textMid }}
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!proveedor || !total}
            onClick={() =>
              onGuardar({
                proveedor,
                categoria,
                fecha,
                total: parseFloat(total) || 0,
                metodoPago,
                descripcion,
              })
            }
            className="flex-[2] rounded-xl py-3 text-sm font-extrabold disabled:opacity-50"
            style={{ background: T.purple, color: T.white }}
          >
            Guardar gasto
          </button>
        </div>
      </div>
    </div>
  );
}

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
