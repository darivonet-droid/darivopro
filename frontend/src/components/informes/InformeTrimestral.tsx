"use client";
// DARIVO PRO — Informe Trimestral con descarga PDF
import { useEffect, useState } from "react";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/theme";
import type { DatosTrimestre } from "@/hooks/useInformes";

interface Props {
  datos:    DatosTrimestre | null;
  cargando: boolean;
  onLoad:   () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-3" style={{ borderColor: T.slateD }}>
      <span className="text-sm" style={{ color: T.textMid }}>{label}</span>
      <span className="text-sm font-bold" style={{ color: T.text }}>{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-3 mt-1 border-b-2 pb-1 text-xs font-extrabold uppercase tracking-wider"
      style={{ color: T.navy, borderColor: T.blue }}
    >
      {children}
    </p>
  );
}

function trimLabel() {
  const q = Math.floor(new Date().getMonth() / 3) + 1;
  return `Q${q} ${new Date().getFullYear()}`;
}

export function InformeTrimestral({ datos, cargando, onLoad }: Props) {
  const [descargando, setDescargando] = useState(false);

  useEffect(() => { onLoad(); }, [onLoad]);

  const descargarPDF = async () => {
    if (!datos) return;
    setDescargando(true);
    try {
      // Importación dinámica para evitar SSR del renderer
      const { pdf }                    = await import("@react-pdf/renderer");
      const { InformeTrimestralPdf }   = await import("@/lib/pdf/InformeTrimestralPdf");
      const React                      = (await import("react")).default;

      type DocumentProps = import("@react-pdf/renderer").DocumentProps;
      type PdfElem = import("react").ReactElement<DocumentProps>;
      const elem = React.createElement(InformeTrimestralPdf, { data: datos }) as PdfElem;
      const blob = await pdf(elem).toBlob();

      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href     = url;
      link.download = `informe-trimestral-${trimLabel()}.pdf`;
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
          style={{ background: T.blue, color: T.white }}
        >
          {trimLabel()}
        </span>
        <span className="text-xs" style={{ color: T.textLight }}>
          {datos.empresa.razonSocial}
        </span>
      </div>

      {/* Resumen financiero */}
      <div className="rounded-2xl bg-white px-4 py-4" style={{ boxShadow: "0 2px 12px rgba(10,22,40,0.07)" }}>
        <SectionTitle>Resumen financiero</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total facturado",   valor: fmtPEN(datos.totalFacturado),  color: T.blue },
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
        <SectionTitle>Documentos emitidos</SectionTitle>
        <Row label="Nº de cotizaciones"   value={String(datos.numCotizaciones)} />
        <Row label="Nº de facturas"        value={String(datos.numFacturas)} />
        <Row label="Tasa de aprobación"    value={`${datos.tasaAprobacion}%`} />
      </div>

      {/* Destacados */}
      <div className="rounded-2xl bg-white px-4 py-4" style={{ boxShadow: "0 2px 12px rgba(10,22,40,0.07)" }}>
        <SectionTitle>Destacados del trimestre</SectionTitle>
        <div
          className="mb-3 rounded-xl px-3 py-3"
          style={{ background: T.bluePale }}
        >
          <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: T.blue }}>Cliente principal</p>
          <p className="mt-1 text-sm font-black" style={{ color: T.navy }}>{datos.clientePrincipal}</p>
        </div>
        <div
          className="rounded-xl px-3 py-3"
          style={{ background: T.amberPale }}
        >
          <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: T.amberD }}>Categoría más frecuente</p>
          <p className="mt-1 text-sm font-black" style={{ color: T.navy }}>{datos.categoriaTop}</p>
        </div>
      </div>

      {/* Botón descargar PDF */}
      <button
        type="button"
        onClick={descargarPDF}
        disabled={descargando}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-60"
        style={{ background: T.blue, boxShadow: "0 4px 20px rgba(37,99,235,0.35)" }}
      >
        {descargando ? (
          <>⏳ Generando PDF…</>
        ) : (
          <>📄 Descargar PDF</>
        )}
      </button>

      <p className="text-center text-[10px]" style={{ color: T.textLight }}>
        Generado con Darivo Pro · darivo.net
      </p>

    </div>
  );
}
