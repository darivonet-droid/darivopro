import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { baseStyles, C, fmtMoney } from "./styles";
import type { EmpresaData, LineaFactura } from "@/types";

export interface FacturaPdfData {
  inv_num: string;
  inv_date: string;
  inv_status?: string | null;
  client_name: string;
  client_ruc?: string | null;
  client_dir?: string | null;
  sym?: string | null;
  items: LineaFactura[];
  subtotal_base?: number | null;
  igv_amount?: number | null;
  total_final?: number | null;
  biz_data?: EmpresaData | null;
}

const s = StyleSheet.create({
  top: { flexDirection: "row", justifyContent: "space-between" },
  empresaName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: C.navy },
  empresaLine: { fontSize: 9, color: C.textMid, marginTop: 2 },
  box: {
    borderWidth: 2,
    borderColor: C.navy,
    borderRadius: 6,
    padding: 10,
    minWidth: 140,
    alignItems: "center",
  },
  boxTipo: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.navy },
  boxRuc: { fontSize: 9, color: C.textMid, marginTop: 4 },
  boxNum: { fontSize: 12, fontFamily: "Helvetica-Bold", color: C.blue, marginTop: 4 },
  cliente: {
    marginTop: 16,
    padding: 10,
    backgroundColor: C.slate,
    borderRadius: 4,
    fontSize: 10,
  },
  label: { fontSize: 8, color: C.textMid, textTransform: "uppercase" },
  thRow: {
    flexDirection: "row",
    backgroundColor: C.navy,
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginTop: 14,
  },
  th: { fontSize: 8, color: C.white, fontFamily: "Helvetica-Bold" },
  colDesc: { width: "46%" },
  colQty: { width: "14%", textAlign: "right" },
  colPu: { width: "20%", textAlign: "right" },
  colSub: { width: "20%", textAlign: "right" },
  tdRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.slateD,
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 10,
  },
  totales: { marginTop: 16, marginLeft: "auto", width: "50%" },
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
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
  },
  pagado: {
    position: "absolute",
    top: 280,
    left: 120,
    borderWidth: 3,
    borderColor: C.green,
    color: C.green,
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 20,
    paddingVertical: 8,
    opacity: 0.35,
    transform: "rotate(-18deg)",
  },
});

interface Props {
  data: FacturaPdfData;
  fechaGeneracion: string;
}

export function FacturaPdfDocument({ data, fechaGeneracion }: Props) {
  const biz = data.biz_data ?? ({} as EmpresaData);
  const sym = data.sym ?? "S/";
  const pagado = data.inv_status === "Cobrada";
  const esBoleta = biz.tipoComprobante === "boleta";

  return (
    <Document>
      <Page size="A4" style={baseStyles.page}>
        {pagado ? <Text style={s.pagado}>PAGADO</Text> : null}

        <View style={s.top}>
          <View>
            <Text style={s.empresaName}>{biz.razonSocial ?? "Mi empresa"}</Text>
            {biz.direccion ? <Text style={s.empresaLine}>{biz.direccion}</Text> : null}
            {biz.telefono ? <Text style={s.empresaLine}>Tel: {biz.telefono}</Text> : null}
          </View>
          <View style={s.box}>
            <Text style={s.boxTipo}>
              {esBoleta ? "BOLETA DE VENTA" : "FACTURA ELECTRÓNICA"}
            </Text>
            <Text style={s.boxRuc}>RUC {biz.ruc ?? ""}</Text>
            <Text style={s.boxNum}>{data.inv_num}</Text>
          </View>
        </View>

        <View style={s.cliente}>
          <Text style={s.label}>Señor(es)</Text>
          <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 2 }}>{data.client_name}</Text>
          {data.client_ruc ? <Text style={{ marginTop: 2 }}>RUC/DNI: {data.client_ruc}</Text> : null}
          {data.client_dir ? <Text>{data.client_dir}</Text> : null}
          <Text style={{ marginTop: 4 }}>Fecha de emisión: {data.inv_date}</Text>
        </View>

        <View style={s.thRow}>
          <Text style={[s.th, s.colDesc]}>Descripción</Text>
          <Text style={[s.th, s.colQty]}>Cant.</Text>
          <Text style={[s.th, s.colPu]}>P. Unit.</Text>
          <Text style={[s.th, s.colSub]}>Importe</Text>
        </View>

        {(data.items ?? []).map((item, i) => (
          <View key={i} style={s.tdRow}>
            <Text style={s.colDesc}>{item.desc}</Text>
            <Text style={s.colQty}>{(item.cantidad || 0).toFixed(2)}</Text>
            <Text style={s.colPu}>{fmtMoney(item.pu, sym)}</Text>
            <Text style={s.colSub}>{fmtMoney(item.subtotal, sym)}</Text>
          </View>
        ))}

        <View style={s.totales}>
          <View style={s.totalRow}>
            <Text>Op. Gravada</Text>
            <Text>{fmtMoney(Number(data.subtotal_base), sym)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text>IGV (18%)</Text>
            <Text>{fmtMoney(Number(data.igv_amount), sym)}</Text>
          </View>
          <View style={s.totalFinal}>
            <Text>IMPORTE TOTAL</Text>
            <Text>{fmtMoney(Number(data.total_final), sym)}</Text>
          </View>
        </View>

        <Text style={baseStyles.footer}>
          {biz.formaPago ? `Forma de pago: ${biz.formaPago} · ` : ""}
          Representación impresa del comprobante · Generado con DARIVO PRO · {fechaGeneracion}
        </Text>
      </Page>
    </Document>
  );
}
