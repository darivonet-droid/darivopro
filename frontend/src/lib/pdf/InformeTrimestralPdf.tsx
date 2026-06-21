// DARIVO PRO — Documento PDF del informe trimestral
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { C, fmtMoney } from "./styles";
import type { DatosTrimestre } from "@/hooks/useInformes";

const s = StyleSheet.create({
  page:        { padding: 0, fontSize: 10, fontFamily: "Helvetica", color: C.text },
  header:      { backgroundColor: C.navy, paddingHorizontal: 36, paddingVertical: 28 },
  headerTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: C.white, letterSpacing: 1 },
  headerSub:   { fontSize: 10, color: "#94A3B8", marginTop: 4 },
  body:        { paddingHorizontal: 36, paddingVertical: 24 },
  section:     { marginBottom: 20 },
  sectionTitle:{ fontSize: 12, fontFamily: "Helvetica-Bold", color: C.navy, marginBottom: 10, borderBottomWidth: 1.5, borderBottomColor: C.blue, paddingBottom: 4 },
  grid:        { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card:        { width: "47%", backgroundColor: C.slate, borderRadius: 8, padding: 12 },
  cardLabel:   { fontSize: 8, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5 },
  cardValue:   { fontSize: 16, fontFamily: "Helvetica-Bold", color: C.navy, marginTop: 4 },
  row:         { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  label:       { fontSize: 10, color: C.textMid },
  value:       { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.text },
  highlight:   { backgroundColor: "#EFF6FF", borderRadius: 8, padding: 12, marginTop: 8 },
  highlightL:  { fontSize: 9, color: C.textMid },
  highlightV:  { fontSize: 14, fontFamily: "Helvetica-Bold", color: C.blue, marginTop: 2 },
  footer:      { marginTop: 32, fontSize: 8, color: C.textLight, textAlign: "center" },
  badge:       { backgroundColor: C.blue, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start", marginTop: 4 },
  badgeText:   { fontSize: 9, color: C.white, fontFamily: "Helvetica-Bold" },
});

function trimLabel(): string {
  const now = new Date();
  const q   = Math.floor(now.getMonth() / 3) + 1;
  return `Q${q} ${now.getFullYear()}`;
}

export function InformeTrimestralPdf({ data }: { data: DatosTrimestre }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header navy */}
        <View style={s.header}>
          <Text style={s.headerTitle}>INFORME TRIMESTRAL</Text>
          <Text style={s.headerSub}>
            {data.empresa.razonSocial}
            {data.empresa.ruc ? `  ·  RUC ${data.empresa.ruc}` : ""}
            {"  ·  "}{trimLabel()}
          </Text>
        </View>

        <View style={s.body}>

          {/* Resumen financiero */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Resumen financiero</Text>
            <View style={s.grid}>
              {[
                { label: "Total facturado",    value: fmtMoney(data.totalFacturado) },
                { label: "Total cobrado",       value: fmtMoney(data.totalCobrado) },
                { label: "Pendiente de cobro",  value: fmtMoney(data.pendienteCobro) },
                { label: "IGV acumulado (18%)", value: fmtMoney(data.igvAcumulado) },
              ].map(({ label, value }) => (
                <View key={label} style={s.card}>
                  <Text style={s.cardLabel}>{label}</Text>
                  <Text style={s.cardValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Documentos emitidos */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Documentos emitidos</Text>
            {[
              { label: "Nº de cotizaciones",   value: String(data.numCotizaciones) },
              { label: "Nº de facturas",        value: String(data.numFacturas) },
              { label: "Tasa de aprobación",    value: `${data.tasaAprobacion}%` },
            ].map(({ label, value }) => (
              <View key={label} style={s.row}>
                <Text style={s.label}>{label}</Text>
                <Text style={s.value}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Highlights */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Destacados del trimestre</Text>
            <View style={s.highlight}>
              <Text style={s.highlightL}>Cliente principal</Text>
              <Text style={s.highlightV}>{data.clientePrincipal}</Text>
            </View>
            <View style={[s.highlight, { marginTop: 10 }]}>
              <Text style={s.highlightL}>Servicio/categoría más frecuente</Text>
              <Text style={s.highlightV}>{data.categoriaTop}</Text>
            </View>
          </View>

          <Text style={s.footer}>
            Generado con Darivo Pro · darivo.net
          </Text>
        </View>

      </Page>
    </Document>
  );
}
