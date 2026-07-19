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

/** 1 año en segundos — vigencia del enlace firmado del PDF. */
const VIGENCIA_URL_FIRMADA = 60 * 60 * 24 * 365;

async function subirPdf(buffer: Buffer, filename: string): Promise<string> {
  const supabase = createAdminClient();
  const path = `pdfs/${filename}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (error) throw new Error(error.message);

  // El bucket `documentos` es PRIVADO (baseline_v2.sql: public = false), así que
  // getPublicUrl() devolvía una URL que responde 400 "Bucket not found" para
  // todo el mundo — el PDF se subía bien pero nunca se podía abrir ni adjuntar
  // por WhatsApp. Se firma la URL con el cliente service_role, que sí puede.
  const { data, error: errFirma } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, VIGENCIA_URL_FIRMADA);

  if (errFirma || !data?.signedUrl) {
    throw new Error(errFirma?.message ?? "No se pudo firmar la URL del PDF");
  }

  return data.signedUrl;
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
