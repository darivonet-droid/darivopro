import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { baseStyles, C, fmtMoney, fmtQty } from "./styles";

export interface PresupuestoItemRow {
  cat_label?: string | null;
  svc_label?: string | null;
  qty?: number | null;
  unit?: string | null;
  unit_price?: number | null;
  subtotal?: number | null;
}

export interface PresupuestoPdfData {
  id: string;
  client_name: string;
  city?: string | null;
  phone?: string | null;
  status?: string | null;
  margin?: number | null;
  total_base?: number | null;
  total_labor?: number | null;
  total_final?: number | null;
  notes?: string | null;
  items: PresupuestoItemRow[];
}

const s = StyleSheet.create({
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
  data: PresupuestoPdfData;
  fechaGeneracion: string;
}

export function PresupuestoPdfDocument({ data, fechaGeneracion }: Props) {
  let lastCap = "";

  return (
    <Document>
      <Page size="A4" style={baseStyles.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>PRESUPUESTO</Text>
          <Text style={s.headerSub}>
            Generado con DARIVO PRO · {fechaGeneracion}
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
            <Text>Mano de obra ({Number(data.margin ?? 0)}%)</Text>
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
          Este presupuesto tiene validez de 30 días desde su emisión · DARIVO PRO
        </Text>
      </Page>
    </Document>
  );
}
