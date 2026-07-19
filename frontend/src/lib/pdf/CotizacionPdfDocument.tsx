import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { baseStyles, C, fmtMoney } from "./styles";
import { montoALetras } from "@/lib/numero-a-letras";
import type { EmpresaData } from "@/types";

export interface CotizacionItemRow {
  svc_id?: string | null;
  cat_label?: string | null;
  svc_label?: string | null;
  qty?: number | null;
  unit?: string | null;
  unit_price?: number | null;
  subtotal?: number | null;
}

export interface CotizacionPdfData {
  id: string;
  cot_num?: string | null;
  client_name: string;
  city?: string | null;
  phone?: string | null;
  status?: string | null;
  margin?: number | null;
  total_base?: number | null;
  total_labor?: number | null;
  total_final?: number | null;
  notes?: string | null;
  items: CotizacionItemRow[];
  biz_data?: EmpresaData | null;
}

const s = StyleSheet.create({
  emisor: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  logo: { width: 42, height: 42, marginRight: 10, objectFit: "contain" },
  emisorName: { fontSize: 12, fontFamily: "Helvetica-Bold", color: C.navy },
  emisorLine: { fontSize: 9, color: C.textMid, marginTop: 1 },
  header: {
    backgroundColor: C.navy,
    color: C.white,
    padding: 18,
    borderRadius: 6,
  },
  headerTitle: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  headerSub: { fontSize: 9, color: C.textLight, marginTop: 4 },
  label: {
    fontSize: 8,
    color: C.textMid,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  meta: { marginTop: 16, flexDirection: "row", justifyContent: "space-between" },
  estado: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: "#EFF6FF",
    color: C.blue,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  cap: {
    marginTop: 10,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.blue,
    textTransform: "uppercase",
  },
  // Tabla de ítems estilo Bizlinks (modelo de referencia de Factura real,
  // 19/07/2026): Ítem | Código | Descripción | Und. | Cantidad | V. Unitario
  // | P. Unitario | Descuento | Valor Venta.
  th: { fontSize: 7, color: C.textMid, fontFamily: "Helvetica-Bold" },
  thSub: { fontSize: 5.5, color: C.textLight, fontFamily: "Helvetica" },
  td: { fontSize: 8 },
  colItem: { width: "5%" },
  colCodigo: { width: "11%" },
  colDescripcion: { width: "25%" },
  colUnd: { width: "6%" },
  colCantidad: { width: "9%", textAlign: "right" },
  colVUnit: { width: "11%", textAlign: "right" },
  colPUnit: { width: "11%", textAlign: "right" },
  colDescuento: { width: "10%", textAlign: "right" },
  colValorVenta: { width: "12%", textAlign: "right" },
  totales: { marginTop: 18, marginLeft: "auto", width: "60%" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    fontSize: 10,
  },
  totalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: C.navy,
    marginTop: 6,
    paddingTop: 8,
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
  },
  sonLetras: {
    marginTop: 10,
    marginLeft: "auto",
    width: "60%",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.textMid,
    textTransform: "uppercase",
  },
  notas: {
    marginTop: 16,
    padding: 10,
    backgroundColor: C.amberPale,
    borderRadius: 4,
    fontSize: 10,
    color: C.amberText,
  },
});

interface Props {
  data: CotizacionPdfData;
  fechaGeneracion: string;
}

export function CotizacionPdfDocument({ data, fechaGeneracion }: Props) {
  let lastCap = "";
  const biz = data.biz_data ?? null;

  return (
    <Document>
      <Page size="A4" style={baseStyles.page}>
        {biz && (biz.logoUrl || biz.razonSocial) ? (
          <View style={s.emisor}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de @react-pdf/renderer (nodo de PDF), no <img> del DOM; no acepta prop alt */}
            {biz.logoUrl ? <Image src={biz.logoUrl} style={s.logo} /> : null}
            <View>
              {biz.razonSocial ? <Text style={s.emisorName}>{biz.razonSocial}</Text> : null}
              {biz.direccion ? <Text style={s.emisorLine}>{biz.direccion}</Text> : null}
              {biz.telefono ? <Text style={s.emisorLine}>Tel: {biz.telefono}</Text> : null}
            </View>
          </View>
        ) : null}

        <View style={s.header}>
          <Text style={s.headerTitle}>COTIZACIÓN</Text>
          {data.cot_num ? (
            <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", color: C.white, marginTop: 4 }}>
              {data.cot_num}
            </Text>
          ) : null}
          <Text style={s.headerSub}>
            Generado con darivopro.com · {fechaGeneracion}
          </Text>
        </View>

        <View style={s.meta}>
          <View>
            <Text style={s.label}>Cliente</Text>
            <Text style={s.value}>{data.client_name}</Text>
            {data.city ? <Text style={{ fontSize: 10, marginTop: 2 }}>{data.city}</Text> : null}
            {data.phone ? <Text style={{ fontSize: 10 }}>{data.phone}</Text> : null}
          </View>
          <View>
            <Text style={s.label}>Estado</Text>
            <Text style={s.estado}>{data.status ?? "Borrador"}</Text>
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          <View style={baseStyles.tableHeader}>
            <Text style={[s.th, s.colItem]}>Ítem</Text>
            <Text style={[s.th, s.colCodigo]}>Código</Text>
            <Text style={[s.th, s.colDescripcion]}>Descripción</Text>
            <Text style={[s.th, s.colUnd]}>Und.</Text>
            <Text style={[s.th, s.colCantidad]}>Cantidad</Text>
            <Text style={[s.th, s.colVUnit]}>V. Unitario</Text>
            <Text style={[s.th, s.colPUnit]}>P. Unitario</Text>
            <Text style={[s.th, s.colDescuento]}>Descuento</Text>
            <View style={s.colValorVenta}>
              <Text style={s.th}>Valor Venta</Text>
              <Text style={s.thSub}>(afecto al IGV)</Text>
            </View>
          </View>

          {(() => {
            let itemNum = 0;
            return (data.items ?? []).map((item, i) => {
              const cap = item.cat_label ?? "";
              const showCap = cap && cap !== lastCap;
              if (showCap) lastCap = cap;
              itemNum += 1;
              const vUnitario = Number(item.unit_price ?? 0);
              const pUnitario = Math.round(vUnitario * 1.18 * 100) / 100;
              return (
                <React.Fragment key={i}>
                  {showCap ? <Text style={s.cap}>{cap}</Text> : null}
                  <View style={baseStyles.tableRow}>
                    <Text style={[s.td, s.colItem]}>{itemNum}</Text>
                    <Text style={[s.td, s.colCodigo]}>{item.svc_id ?? ""}</Text>
                    <Text style={[s.td, s.colDescripcion]}>{item.svc_label ?? ""}</Text>
                    <Text style={[s.td, s.colUnd]}>{item.unit ?? ""}</Text>
                    <Text style={[s.td, s.colCantidad]}>{Number(item.qty ?? 0).toFixed(2)}</Text>
                    <Text style={[s.td, s.colVUnit]}>{vUnitario.toFixed(2)}</Text>
                    <Text style={[s.td, s.colPUnit]}>{pUnitario.toFixed(2)}</Text>
                    <Text style={[s.td, s.colDescuento]}>0.00</Text>
                    <Text style={[s.td, s.colValorVenta]}>{Number(item.subtotal ?? 0).toFixed(2)}</Text>
                  </View>
                </React.Fragment>
              );
            });
          })()}
        </View>

        {(() => {
          // Op. Gravada = base imponible (materiales + partidas + mano de obra,
          // sin IGV) — mismo total_final que ya usa hoy la conversión real
          // Cotización → Factura (hooks/useFactura.ts, "cotizacion.totalFinal
          // is the pre-IGV base"), para que el desglose acá sea consistente
          // con la factura que eventualmente se emita desde esta cotización.
          const opGravada = Number(data.total_final ?? 0);
          const igv = Math.round(opGravada * 0.18 * 100) / 100;
          const importeTotal = Math.round((opGravada + igv) * 100) / 100;
          const moneda = biz?.moneda ?? "PEN";
          return (
            <>
              <View style={s.totales}>
                <View style={s.totalRow}>
                  <Text>Op. Gravada</Text>
                  <Text>{fmtMoney(opGravada, biz?.simbolo)}</Text>
                </View>
                <View style={s.totalRow}>
                  <Text>I.G.V (18%)</Text>
                  <Text>{fmtMoney(igv, biz?.simbolo)}</Text>
                </View>
                <View style={s.totalRow}>
                  <Text>Op. Inafecta</Text>
                  <Text>{fmtMoney(0, biz?.simbolo)}</Text>
                </View>
                <View style={s.totalRow}>
                  <Text>Op. Exonerada</Text>
                  <Text>{fmtMoney(0, biz?.simbolo)}</Text>
                </View>
                <View style={s.totalRow}>
                  <Text>Op. Exportación</Text>
                  <Text>{fmtMoney(0, biz?.simbolo)}</Text>
                </View>
                <View style={s.totalFinal}>
                  <Text>Importe Total</Text>
                  <Text>{fmtMoney(importeTotal, biz?.simbolo)}</Text>
                </View>
              </View>
              <Text style={s.sonLetras}>SON: {montoALetras(importeTotal, moneda)}</Text>
            </>
          );
        })()}

        {data.notes ? (
          <View style={s.notas}>
            <Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Notas: </Text>
              {data.notes}
            </Text>
          </View>
        ) : null}

        <Text style={baseStyles.footer}>
          Esta cotización tiene validez de 90 días desde su emisión · darivopro.com
        </Text>
      </Page>
    </Document>
  );
}
