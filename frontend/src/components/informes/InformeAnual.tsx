"use client";
// DARIVO PRO — Informe Anual con descarga PDF
import { useEffect, useState } from "react";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/theme";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import type { DatosAnual } from "@/hooks/useInformes";

interface Props {
  datos:    DatosAnual | null;
  cargando: boolean;
  onLoad:   () => void;
  /** Empresa desktop (Cierre → Informe) pasa true para que el navy/azul de
   * Fable 5 (badge de período, títulos de sección, stats, destacados, botón
   * PDF) use ADMIN_COLORS — Móvil sigue con su paleta por defecto
   * (22/07/2026, hallazgo adicional de la tarea de InformesTab). */
  esEmpresa?: boolean;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-3" style={{ borderColor: T.slateD }}>
      <span className="text-sm" style={{ color: T.textMid }}>{label}</span>
      <span className="text-sm font-bold" style={{ color: T.text }}>{value}</span>
    </div>
  );
}

function SectionTitle({ children, esEmpresa }: { children: React.ReactNode; esEmpresa?: boolean }) {
  return (
    <p
      className="mb-3 mt-1 border-b-2 pb-1 text-xs font-extrabold uppercase tracking-wider"
      style={{
        color: esEmpresa ? ADMIN_COLORS.text : T.navy,
        borderColor: esEmpresa ? ADMIN_COLORS.purple : T.blue,
      }}
    >
      {children}
    </p>
  );
}

function anioLabel() {
  return String(new Date().getFullYear());
}

export function InformeAnual({ datos, cargando, onLoad, esEmpresa }: Props) {
  const [descargando, setDescargando] = useState(false);
  const accent = esEmpresa ? ADMIN_COLORS.purple : T.blue;
  const accentPale = esEmpresa ? ADMIN_COLORS.purplePale : T.bluePale;
  const darkText = esEmpresa ? ADMIN_COLORS.text : T.navy;

  useEffect(() => { onLoad(); }, [onLoad]);

  const descargarPDF = async () => {
    if (!datos) return;
    setDescargando(true);
    try {
      // Importación dinámica para evitar SSR del renderer
      const { pdf }              = await import("@react-pdf/renderer");
      const { InformeAnualPdf }  = await import("@/lib/pdf/InformeAnualPdf");
      const React                = (await import("react")).default;

      type DocumentProps = import("@react-pdf/renderer").DocumentProps;
      type PdfElem = import("react").ReactElement<DocumentProps>;
      const elem = React.createElement(InformeAnualPdf, { data: datos }) as PdfElem;
      const blob = await pdf(elem).toBlob();

      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href     = url;
      link.download = `informe-anual-${anioLabel()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDescargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 rounded-2xl" style={{ background: T.slate }} />
        ))}
      </div>
    );
  }

  if (!datos) return null;

  return (
    <div className="flex flex-col gap-4">

      {/* Período */}
      <div className="flex items-center gap-2">
        <span
          className="rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wide"
          style={{ background: accent, color: T.white }}
        >
          {anioLabel()}
        </span>
        <span className="text-xs" style={{ color: T.textLight }}>
          {datos.empresa.razonSocial}
        </span>
      </div>

      {/* Resumen financiero */}
      <div className="rounded-2xl bg-white px-4 py-4" style={{ boxShadow: "0 2px 12px rgba(10,22,40,0.07)" }}>
        <SectionTitle esEmpresa={esEmpresa}>Resumen financiero</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total facturado",   valor: fmtPEN(datos.totalFacturado),  color: accent },
            { label: "Total cobrado",      valor: fmtPEN(datos.totalCobrado),    color: T.green },
            { label: "Pendiente cobro",    valor: fmtPEN(datos.pendienteCobro),  color: T.amber },
            { label: "IGV acumulado",      valor: fmtPEN(datos.igvAcumulado),    color: T.textMid },
          ].map(({ label, valor, color }) => (
            <div
              key={label}
              className="rounded-xl px-3 py-3"
              style={{ background: T.slate }}
            >
              <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: T.textLight }}>{label}</p>
              <p className="mt-1 text-base font-black" style={{ color }}>{valor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Documentos emitidos */}
      <div className="rounded-2xl bg-white px-4 py-4" style={{ boxShadow: "0 2px 12px rgba(10,22,40,0.07)" }}>
        <SectionTitle esEmpresa={esEmpresa}>Documentos emitidos</SectionTitle>
        <Row label="Nº de cotizaciones"   value={String(datos.numCotizaciones)} />
        <Row label="Nº de facturas"        value={String(datos.numFacturas)} />
        <Row label="Tasa de aprobación"    value={`${datos.tasaAprobacion}%`} />
      </div>

      {/* Destacados */}
      <div className="rounded-2xl bg-white px-4 py-4" style={{ boxShadow: "0 2px 12px rgba(10,22,40,0.07)" }}>
        <SectionTitle esEmpresa={esEmpresa}>Destacados del año</SectionTitle>
        <div
          className="mb-3 rounded-xl px-3 py-3"
          style={{ background: accentPale }}
        >
          <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: accent }}>Cliente principal</p>
          <p className="mt-1 text-sm font-black" style={{ color: darkText }}>{datos.clientePrincipal}</p>
        </div>
        <div
          className="rounded-xl px-3 py-3"
          style={{ background: T.amberPale }}
        >
          <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: T.amberD }}>Categoría más frecuente</p>
          <p className="mt-1 text-sm font-black" style={{ color: darkText }}>{datos.categoriaTop}</p>
        </div>
      </div>

      {/* Botón descargar PDF */}
      <button
        type="button"
        onClick={descargarPDF}
        disabled={descargando}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-60"
        style={{
          background: accent,
          boxShadow: esEmpresa ? "0 4px 20px rgba(124,58,237,0.35)" : "0 4px 20px rgba(37,99,235,0.35)",
        }}
      >
        {descargando ? (
          <>⏳ Generando PDF…</>
        ) : (
          <>📄 Descargar PDF</>
        )}
      </button>

      <p className="text-center text-[10px]" style={{ color: T.textLight }}>
        Generado con Darivo Pro · darivopro.com
      </p>

    </div>
  );
}
