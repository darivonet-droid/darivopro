import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { baseStyles, C, fmtMoney } from "./styles";
import type { Detraccion, EmpresaData, InvStatus, LineaFactura } from "@/types";
import { OPCIONES_DETRACCION } from "@/lib/factura-utils";

export interface FacturaPdfData {
  inv_num: string;
  inv_date: string;
  inv_status?: InvStatus | null;
  tipo_doc?: "boleta" | "factura" | null;
  client_name: string;
  client_ruc?: string | null;
  client_dni?: string | null;
  client_dir?: string | null;
  sym?: string | null;
  items: LineaFactura[];
  subtotal_base?: number | null;
  igv_amount?: number | null;
  total_final?: number | null;
  detraccion?: Detraccion | null;
  biz_data?: EmpresaData | null;
}

const s = StyleSheet.create({
  top: { flexDirection: "row", justifyContent: "space-between" },
  emisor: { flexDirection: "row", alignItems: "center" },
  logo: { width: 46, height: 46, marginRight: 10, objectFit: "contain" },
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
  spotBox: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 4,
    backgroundColor: "#FFFBEB",
  },
  spotTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#B45309",
    marginBottom: 4,
  },
  spotLine: { fontSize: 9, color: "#78350F", marginTop: 2 },
  detrRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    fontSize: 11,
  },
  netoFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: "#10B981",
    marginTop: 6,
    paddingTop: 8,
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#065F46",
  },
});

interface Props {
  data: FacturaPdfData;
  fechaGeneracion: string;
}

export function FacturaPdfDocument({ data, fechaGeneracion }: Props) {
  const biz      = data.biz_data ?? ({} as EmpresaData);
  const sym      = data.sym ?? "S/";
  const pagado   = data.inv_status === "Cobrada";
  // tipo_doc tiene precedencia; si falta, caer a tipoComprobante del biz_data
  const esBoleta = (data.tipo_doc ?? biz.tipoComprobante) === "boleta";
  const det      = data.detraccion ?? null;

  const opDet = det
    ? OPCIONES_DETRACCION.find((o) => o.tipo === det.tipo)
    : null;

  return (
    <Document>
      <Page size="A4" style={baseStyles.page}>
        {pagado ? <Text style={s.pagado}>PAGADO</Text> : null}

        {/* Cabecera empresa + número */}
        <View style={s.top}>
          <View style={s.emisor}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de @react-pdf/renderer (nodo de PDF), no <img> del DOM; no acepta prop alt */}
            {biz.logoUrl ? <Image src={biz.logoUrl} style={s.logo} /> : null}
            <View>
              <Text style={s.empresaName}>{biz.razonSocial ?? "Mi empresa"}</Text>
              {biz.direccion ? <Text style={s.empresaLine}>{biz.direccion}</Text> : null}
              {biz.telefono  ? <Text style={s.empresaLine}>Tel: {biz.telefono}</Text> : null}
            </View>
          </View>
          <View style={s.box}>
            <Text style={s.boxTipo}>
              {esBoleta ? "BOLETA DE VENTA" : "FACTURA ELECTRÓNICA"}
            </Text>
            <Text style={s.boxRuc}>RUC {biz.ruc ?? ""}</Text>
            <Text style={s.boxNum}>{data.inv_num}</Text>
          </View>
        </View>

        {/* Datos del cliente */}
        <View style={s.cliente}>
          <Text style={s.label}>{esBoleta ? "Señor(a)" : "Señor(es)"}</Text>
          <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 2 }}>{data.client_name}</Text>
          {data.client_ruc ? <Text style={{ marginTop: 2 }}>RUC: {data.client_ruc}</Text> : null}
          {data.client_dni ? <Text style={{ marginTop: 2 }}>DNI: {data.client_dni}</Text> : null}
          {data.client_dir ? <Text>{data.client_dir}</Text> : null}
          <Text style={{ marginTop: 4 }}>Fecha de emisión: {data.inv_date}</Text>
        </View>

        {/* Tabla de items */}
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

        {/* Totales */}
        <View style={s.totales}>
          {esBoleta ? (
            // Boleta: IGV incluido sin desglose
            <View style={s.totalFinal}>
              <Text>TOTAL (IGV incl.)</Text>
              <Text>{fmtMoney(Number(data.total_final), sym)}</Text>
            </View>
          ) : (
            // Factura: IGV desglosado
            <>
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
            </>
          )}

          {/* Detracción SPOT */}
          {det && opDet && (
            <>
              <View style={s.detrRow}>
                <Text style={{ color: "#B45309" }}>Detracción {opDet.pct}%</Text>
                <Text style={{ color: "#B45309" }}>- {fmtMoney(det.monto, sym)}</Text>
              </View>
              <View style={s.netoFinal}>
                <Text>NETO A COBRAR</Text>
                <Text>{fmtMoney(det.neto, sym)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Leyenda SPOT */}
        {det && opDet && (
          <View style={s.spotBox}>
            <Text style={s.spotTitle}>
              Operación sujeta al Sistema de Pago de Obligaciones Tributarias (SPOT)
            </Text>
            <Text style={s.spotLine}>
              Tipo: {opDet.label}
            </Text>
            <Text style={s.spotLine}>
              Código: {opDet.codigos} · Tasa: {opDet.pct}%
            </Text>
            {det.ctaDetracciones && (
              <Text style={s.spotLine}>
                Depositar en Banco de la Nación · Cuenta: {det.ctaDetracciones}
              </Text>
            )}
          </View>
        )}

        <Text style={baseStyles.footer}>
          {biz.formaPago ? `Forma de pago: ${biz.formaPago} · ` : ""}
          Representación impresa del comprobante · Generado con darivopro.com · {fechaGeneracion}
        </Text>
      </Page>
    </Document>
  );
}
