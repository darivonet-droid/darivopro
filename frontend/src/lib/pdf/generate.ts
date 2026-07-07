import React, { type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createAdminClient } from "@/lib/supabase/admin";
import { CotizacionPdfDocument, type CotizacionPdfData } from "./CotizacionPdfDocument";
import { FacturaPdfDocument, type FacturaPdfData } from "./FacturaPdfDocument";

const BUCKET = "documentos";

function fechaHoy(): string {
  return new Date().toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

async function subirPdf(buffer: Buffer, filename: string): Promise<string> {
  const supabase = createAdminClient();
  const path = `pdfs/${filename}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function generarPdfCotizacion(data: CotizacionPdfData): Promise<string> {
  const element = React.createElement(CotizacionPdfDocument, {
    data,
    fechaGeneracion: fechaHoy(),
  }) as ReactElement<DocumentProps>;

  const buffer = await renderToBuffer(element);

  const filename = `cotizacion-${data.id}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.pdf`;
  return subirPdf(Buffer.from(buffer), filename);
}

export async function generarPdfFactura(data: FacturaPdfData): Promise<string> {
  const element = React.createElement(FacturaPdfDocument, {
    data,
    fechaGeneracion: fechaHoy(),
  }) as ReactElement<DocumentProps>;

  const buffer = await renderToBuffer(element);

  const invNum = (data.inv_num ?? "SN").replace(/\//g, "-");
  const filename = `factura-${invNum}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.pdf`;
  return subirPdf(Buffer.from(buffer), filename);
}

/** Datos de ejemplo para pruebas locales */
export const COTIZACION_EJEMPLO: CotizacionPdfData = {
  id: "ejemplo-test",
  client_name: "Juan Pérez García",
  city: "Lima",
  phone: "999 888 777",
  status: "Borrador",
  margin: 40,
  total_base: 1500,
  total_labor: 600,
  total_final: 2100,
  notes: "Incluye materiales de primera.",
  items: [
    {
      cat_label: "Pintura",
      svc_label: "Pintura latex muro",
      qty: 25,
      unit: "m2",
      unit_price: 18,
      subtotal: 450,
    },
    {
      cat_label: "Albañilería",
      svc_label: "Tarrajeo",
      qty: 20,
      unit: "m2",
      unit_price: 52.5,
      subtotal: 1050,
    },
  ],
};
