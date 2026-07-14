"use client";
// DARIVO PRO EMPRESA — Facturación, capa de presentación de escritorio
// (06-MODULO-FACTURAS-EMPRESA.md §4.1/§5). Misma lógica de negocio que
// FacturasView/FacturaCard (Móvil) — solo cambia de cards apiladas a tabla,
// con los 7 chips de filtro oficiales (§5.2, Corrección v1.1).
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { PaginacionLista } from "@/components/ui/PaginacionLista";
import { useFactura } from "@/hooks/useFactura";
import { useAppStore } from "@/store/useAppStore";
import { INV_STATUSES } from "@/lib/factura-utils";
import { INV_STATUS_COLORS, T } from "@/lib/design-system/tokens";
import { fmtPEN } from "@/lib/utils";
import type { Factura, InvStatus, Cotizacion } from "@/types";

interface FacturasTableEmpresaProps {
  facturas: Factura[];
  rucEmpresa: string;
  aprobados: Cotizacion[];
  /** Ruta base del editor de facturas. Empresa: "/empresa/facturas/nueva". */
  nuevaFacturaHref: string;
}

// 7 chips oficiales (§5.2, Corrección v1.1) — "Todas" + los 6 estados reales.
const CHIPS: { label: string; status: InvStatus | null }[] = [
  { label: "Todas", status: null },
  { label: "Borrador", status: "Borrador" },
  { label: "En proceso", status: "En proceso" },
  { label: "Emitidas", status: "Emitida" },
  { label: "Rechazadas", status: "Rechazada" },
  { label: "Pendiente de envío", status: "Pendiente de envío" },
  { label: "Cobradas", status: "Cobrada" },
];

function FilaFactura({ factura: f }: { factura: Factura }) {
  const router = useRouter();
  const { generarPDF, actualizarEstado } = useFactura();
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const [viendo, setViendo] = useState(false);
  const [cambiando, setCambiando] = useState(false);

  const verFactura = async () => {
    setViendo(true);
    const url = await generarPDF(f.invId);
    setViendo(false);
    if (!url) { mostrarToast("No se pudo generar el PDF", "error"); return; }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const marcarCobrada = async () => {
    setCambiando(true);
    const ok = await actualizarEstado(f.invId, "Cobrada");
    setCambiando(false);
    if (ok) {
      mostrarToast("Factura marcada como cobrada ✓");
      router.refresh();
    } else {
      mostrarToast("No se pudo cambiar el estado", "error");
    }
  };

  const colorEstado = INV_STATUS_COLORS[f.invStatus] ?? T.textMid;
  const doc = f.clientRuc || f.clientDni || "—";

  return (
    <tr style={{ borderBottom: `1px solid ${T.slateD}` }}>
      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: T.textMid, fontWeight: 700 }}>{f.invNum}</td>
      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: T.text }}>{f.clientName}</td>
      <td style={{ padding: "12px 16px", fontSize: 12, color: T.textMid }}>{doc}</td>
      <td style={{ padding: "12px 16px", fontSize: 12, color: T.textMid }}>{f.invDate}</td>
      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 800, color: T.blue }}>{fmtPEN(f.totalFinal, f.sym)}</td>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: colorEstado + "18", color: colorEstado }}>
            {f.invStatus}
          </span>
          {f.invStatus === "Emitida" && (
            <button
              type="button"
              onClick={marcarCobrada}
              disabled={cambiando}
              style={{ fontSize: 11, fontWeight: 700, color: T.green, background: "none", border: "none", cursor: "pointer" }}
            >
              {cambiando ? "…" : "→ Cobrada"}
            </button>
          )}
        </div>
      </td>
      <td style={{ padding: "12px 16px", textAlign: "right" }}>
        <button
          type="button"
          onClick={verFactura}
          disabled={viendo}
          style={{ padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${T.slateD}`, background: T.white, color: T.text, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >
          {viendo ? "Generando…" : "📄 Ver factura"}
        </button>
      </td>
    </tr>
  );
}

export function FacturasTableEmpresa({ facturas, rucEmpresa, aprobados, nuevaFacturaHref }: FacturasTableEmpresaProps) {
  const [filtro, setFiltro] = useState<InvStatus | null>(null);

  const filtradas = useMemo(
    () => (filtro === null ? facturas : facturas.filter((f) => f.invStatus === filtro)),
    [facturas, filtro]
  );
  const { slice, hayMas, cargarMas, total, visible } = usePaginatedList(filtradas);

  const totalMonto = facturas.reduce((s, f) => s + f.totalFinal, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Header (§5.1) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Facturación</p>
          <p style={{ fontSize: 12, color: T.textMid, marginTop: 2 }}>
            {facturas.length} factura{facturas.length !== 1 ? "s" : ""} · {fmtPEN(totalMonto)}
          </p>
        </div>
        {rucEmpresa && (
          <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: T.greenPale, color: T.greenD, border: `1px solid ${T.green}44` }}>
            {rucEmpresa}
          </span>
        )}
      </div>

      {/* Chips filtro (§5.2) */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
        {CHIPS.map((c) => {
          const activo = filtro === c.status;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => setFiltro(c.status)}
              style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: activo ? T.blue : T.slate, color: activo ? T.white : T.textMid }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Banner cotizaciones aprobadas (§5.3) */}
      {aprobados.length > 0 && (
        <div style={{ borderRadius: 16, padding: 16, background: T.amberPale, border: `1.5px solid ${T.amber}` }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: T.amberD }}>
            ⚡ COTIZACIONES APROBADAS — CONVERTIR EN FACTURA
          </p>
          <div className="flex flex-col gap-2" style={{ marginTop: 10 }}>
            {aprobados.slice(0, 3).map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 12, padding: "10px 14px", background: T.white }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{p.clientName}</p>
                  <p style={{ fontSize: 11, color: T.textMid }}>
                    {new Date(p.createdAt).toLocaleDateString("es-PE", { day: "numeric", month: "short" })} · {fmtPEN(p.totalFinal)}
                  </p>
                </div>
                <Link
                  href={`${nuevaFacturaHref}?cotizacion=${p.id}`}
                  style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, color: T.white, background: T.green }}
                >
                  ↺ Facturar
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar (§5.4) */}
      <div>
        <Link
          href={nuevaFacturaHref}
          style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 14, padding: "12px 20px", background: T.blue, color: T.white, fontWeight: 800, fontSize: 13 }}
        >
          + Nueva factura
          <span style={{ fontWeight: 500, fontSize: 11, opacity: 0.8 }}>Crear desde cero en 60 seg</span>
        </Link>
      </div>

      {/* Tabla principal (§5.5) */}
      {filtradas.length === 0 ? (
        <div style={{ borderRadius: 16, padding: 48, textAlign: "center", background: T.white, border: `1px solid ${T.slateD}` }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>🧾</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.textMid }}>Sin facturas todavía</p>
        </div>
      ) : (
        <div style={{ borderRadius: 16, border: `1px solid ${T.slateD}`, overflow: "hidden", background: T.white }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: T.slate, borderBottom: `1px solid ${T.slateD}` }}>
                {["Número", "Cliente", "Doc.", "Fecha", "Total", "Estado", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: h === "" ? "right" : "left", fontSize: 10, fontWeight: 800, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.map((f) => <FilaFactura key={f.invId} factura={f} />)}
            </tbody>
          </table>
        </div>
      )}
      <PaginacionLista visible={visible} total={total} hayMas={hayMas} onCargarMas={cargarMas} />
    </div>
  );
}
