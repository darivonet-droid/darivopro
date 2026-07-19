import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { baseStyles, C, fmtMoney, fmtQty } from "./styles";
import type { EmpresaData } from "@/types";

export interface CotizacionItemRow {
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
  th: { fontSize: 8, color: C.textMid, fontFamily: "Helvetica-Bold" },
  colDesc: { width: "46%" },
  colQty: { width: "18%", textAlign: "right" },
  colPu: { width: "18%", textAlign: "right" },
  colSub: { width: "18%", textAlign: "right" },
  totales: { marginTop: 18, marginLeft: "auto", width: "55%" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    fontSize: 11,
  },
  totalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: C.navy,
    marginTop: 6,
    paddingTop: 8,
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
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
            <Text style={[s.th, s.colDesc]}>Partida</Text>
            <Text style={[s.th, s.colQty]}>Cant.</Text>
            <Text style={[s.th, s.colPu]}>P. Unit.</Text>
            <Text style={[s.th, s.colSub]}>Subtotal</Text>
          </View>

          {(data.items ?? []).map((item, i) => {
            const cap = item.cat_label ?? "";
            const showCap = cap && cap !== lastCap;
            if (showCap) lastCap = cap;
            return (
              <React.Fragment key={i}>
                {showCap ? <Text style={s.cap}>{cap}</Text> : null}
                <View style={baseStyles.tableRow}>
                  <Text style={s.colDesc}>{item.svc_label ?? ""}</Text>
                  <Text style={s.colQty}>{fmtQty(Number(item.qty), item.unit ?? undefined)}</Text>
                  <Text style={s.colPu}>{fmtMoney(Number(item.unit_price))}</Text>
                  <Text style={s.colSub}>{fmtMoney(Number(item.subtotal))}</Text>
                </View>
              </React.Fragment>
            );
          })}
        </View>

        <View style={s.totales}>
          <View style={s.totalRow}>
            <Text>Materiales y partidas</Text>
            <Text>{fmtMoney(Number(data.total_base))}</Text>
          </View>
          <View style={s.totalRow}>
            <Text>Mano de obra</Text>
            <Text>{fmtMoney(Number(data.total_labor))}</Text>
          </View>
          <View style={s.totalFinal}>
            <Text>TOTAL</Text>
            <Text>{fmtMoney(Number(data.total_final))}</Text>
          </View>
        </View>

        {data.notes ? (
          <View style={s.notas}>
            <Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Notas: </Text>
              {data.notes}
            </Text>
          </View>
        ) : null}

        <Text style={baseStyles.footer}>
          Esta cotización tiene validez de 30 días desde su emisión · DARIVO PRO
        </Text>
      </Page>
    </Document>
  );
}
