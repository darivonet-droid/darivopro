// DARIVO PRO — Documento PDF del informe semanal
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { C, fmtMoney } from "./styles";
import type { DatosSemana } from "@/hooks/useInformes";

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
  cardPrev:    { fontSize: 8, color: C.textLight, marginTop: 2 },
  footer:      { marginTop: 32, fontSize: 8, color: C.textLight, textAlign: "center" },
});

function semanaLabel(): string {
  const hoy = new Date();
  return hoy.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
}

export function InformeSemanalPdf({ data }: { data: DatosSemana }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>

        <View style={s.header}>
          <Text style={s.headerTitle}>INFORME SEMANAL</Text>
          <Text style={s.headerSub}>Semana del {semanaLabel()}</Text>
        </View>

        <View style={s.body}>
          <View style={s.section}>
            <Text style={s.sectionTitle}>Comparativa con la semana anterior</Text>
            <View style={s.grid}>
              {[
                { label: "Total cotizado",  value: fmtMoney(data.cotizado),  prev: fmtMoney(data.cotizadoPrev) },
                { label: "Total facturado", value: fmtMoney(data.facturado), prev: fmtMoney(data.facturadoPrev) },
                { label: "Total cobrado",   value: fmtMoney(data.cobrado),   prev: fmtMoney(data.cobradoPrev) },
                { label: "Pendiente cobro", value: fmtMoney(data.pendiente), prev: null },
              ].map(({ label, value, prev }) => (
                <View key={label} style={s.card}>
                  <Text style={s.cardLabel}>{label}</Text>
                  <Text style={s.cardValue}>{value}</Text>
                  {prev && <Text style={s.cardPrev}>Semana ant.: {prev}</Text>}
                </View>
              ))}
            </View>
          </View>

          <Text style={s.footer}>
            Generado con Darivo Pro · darivopro.com
          </Text>
        </View>

      </Page>
    </Document>
  );
}
