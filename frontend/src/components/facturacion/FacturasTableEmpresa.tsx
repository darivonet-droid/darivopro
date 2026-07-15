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
import { INV_STATUS_COLORS } from "@/lib/design-system/tokens";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
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

  const colorEstado = INV_STATUS_COLORS[f.invStatus] ?? ADMIN_COLORS.textMid;
  const doc = f.clientRuc || f.clientDni || "—";

  return (
    <tr style={{ borderBottom: `1px solid ${ADMIN_COLORS.slateD}` }}>
      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: ADMIN_COLORS.textMid, fontWeight: 700 }}>{f.invNum}</td>
      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: ADMIN_COLORS.text }}>{f.clientName}</td>
      <td style={{ padding: "12px 16px", fontSize: 12, color: ADMIN_COLORS.textMid }}>{doc}</td>
      <td style={{ padding: "12px 16px", fontSize: 12, color: ADMIN_COLORS.textMid }}>{f.invDate}</td>
      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 800, color: ADMIN_COLORS.purple }}>{fmtPEN(f.totalFinal, f.sym)}</td>
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
              style={{ fontSize: 11, fontWeight: 700, color: ADMIN_COLORS.green, background: "none", border: "none", cursor: "pointer" }}
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
          style={{ padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${ADMIN_COLORS.slateD}`, background: ADMIN_COLORS.white, color: ADMIN_COLORS.text, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
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
          <p style={{ fontSize: 18, fontWeight: 900, color: ADMIN_COLORS.text }}>Facturación</p>
          <p style={{ fontSize: 12, color: ADMIN_COLORS.textMid, marginTop: 2 }}>
            {facturas.length} factura{facturas.length !== 1 ? "s" : ""} · {fmtPEN(totalMonto)}
          </p>
        </div>
        {rucEmpresa && (
          <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: ADMIN_COLORS.greenPale, color: ADMIN_COLORS.greenD, border: `1px solid ${ADMIN_COLORS.green}44` }}>
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
              style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: activo ? ADMIN_COLORS.purple : ADMIN_COLORS.slate, color: activo ? ADMIN_COLORS.white : ADMIN_COLORS.textMid }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Banner cotizaciones aprobadas (§5.3) */}
      {aprobados.length > 0 && (
        <div style={{ borderRadius: 16, padding: 16, background: ADMIN_COLORS.amberPale, border: `1.5px solid ${ADMIN_COLORS.amber}` }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: ADMIN_COLORS.amberD }}>
            ⚡ COTIZACIONES APROBADAS — CONVERTIR EN FACTURA
          </p>
          <div className="flex flex-col gap-2" style={{ marginTop: 10 }}>
            {aprobados.slice(0, 3).map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 12, padding: "10px 14px", background: ADMIN_COLORS.white }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: ADMIN_COLORS.text }}>{p.clientName}</p>
                  <p style={{ fontSize: 11, color: ADMIN_COLORS.textMid }}>
                    {new Date(p.createdAt).toLocaleDateString("es-PE", { day: "numeric", month: "short" })} · {fmtPEN(p.totalFinal)}
                  </p>
                </div>
                <Link
                  href={`${nuevaFacturaHref}?cotizacion=${p.id}`}
                  style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, color: ADMIN_COLORS.white, background: ADMIN_COLORS.green }}
                >
                  ↺ Facturar
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar (§5.4) — 2 accesos directos al formulario, sin pantalla intermedia de "¿tiene RUC?" */}
      <div style={{ display: "flex", gap: 12 }}>
        <Link
          href={`${nuevaFacturaHref}?tipo=factura`}
          style={{ display: "inline-flex", flexDirection: "column", gap: 2, borderRadius: 14, padding: "12px 20px", background: ADMIN_COLORS.purple, color: ADMIN_COLORS.white }}
        >
          <span style={{ fontWeight: 800, fontSize: 13 }}>🏢 Factura</span>
          <span style={{ fontWeight: 500, fontSize: 11, opacity: 0.85 }}>Serie F001 · IGV desglosado · Detracción si aplica</span>
        </Link>
        <Link
          href={`${nuevaFacturaHref}?tipo=boleta`}
          style={{ display: "inline-flex", flexDirection: "column", gap: 2, borderRadius: 14, padding: "12px 20px", background: ADMIN_COLORS.green, color: ADMIN_COLORS.white }}
        >
          <span style={{ fontWeight: 800, fontSize: 13 }}>👤 Boleta</span>
          <span style={{ fontWeight: 500, fontSize: 11, opacity: 0.85 }}>Serie B001 · IGV incluido · DNI si total &gt; S/700</span>
        </Link>
      </div>

      {/* Tabla principal (§5.5) */}
      {filtradas.length === 0 ? (
        <div style={{ borderRadius: 16, padding: 48, textAlign: "center", background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>🧾</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: ADMIN_COLORS.textMid }}>Sin facturas todavía</p>
        </div>
      ) : (
        <div style={{ borderRadius: 16, border: `1px solid ${ADMIN_COLORS.slateD}`, overflow: "hidden", background: ADMIN_COLORS.white }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: ADMIN_COLORS.slate, borderBottom: `1px solid ${ADMIN_COLORS.slateD}` }}>
                {["Número", "Cliente", "Doc.", "Fecha", "Total", "Estado", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: h === "" ? "right" : "left", fontSize: 10, fontWeight: 800, color: ADMIN_COLORS.textMid, textTransform: "uppercase", letterSpacing: 0.5 }}>
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
