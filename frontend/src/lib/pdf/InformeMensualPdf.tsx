// DARIVO PRO — Documento PDF del informe mensual
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { C, fmtMoney } from "./styles";
import type { DatosMes } from "@/hooks/useInformes";

const s = StyleSheet.create({
  page:        { padding: 0, fontSize: 10, fontFamily: "Helvetica", color: C.text },
  header:      { backgroundColor: C.navy, paddingHorizontal: 36, paddingVertical: 28 },
  headerTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: C.white, letterSpacing: 1 },
  headerSub:   { fontSize: 10, color: "#94A3B8", marginTop: 4 },
  body:        { paddingHorizontal: 36, paddingVertical: 24 },
  section:     { marginBottom: 20 },
  sectionTitle:{ fontSize: 12, fontFamily: "Helvetica-Bold", color: C.navy, marginBottom: 10, borderBottomWidth: 1.5, borderBottomColor: C.blue, paddingBottom: 4 },
  highlight:   { backgroundColor: "#EFF6FF", borderRadius: 8, padding: 12 },
  highlightL:  { fontSize: 9, color: C.textMid },
  highlightV:  { fontSize: 16, fontFamily: "Helvetica-Bold", color: C.blue, marginTop: 2 },
  row:         { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  label:       { fontSize: 10, color: C.textMid },
  value:       { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.text },
  barRow:      { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  footer:      { marginTop: 32, fontSize: 8, color: C.textLight, textAlign: "center" },
});

function mesLabel(): string {
  return new Date().toLocaleDateString("es-PE", { month: "long", year: "numeric" });
}

export function InformeMensualPdf({ data }: { data: DatosMes }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>

        <View style={s.header}>
          <Text style={s.headerTitle}>INFORME MENSUAL</Text>
          <Text style={s.headerSub}>{mesLabel()}</Text>
        </View>

        <View style={s.body}>
          <View style={s.section}>
            <Text style={s.sectionTitle}>Resumen del mes</Text>
            <View style={s.highlight}>
              <Text style={s.highlightL}>Total facturado</Text>
              <Text style={s.highlightV}>{fmtMoney(data.totalMes)}</Text>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>Facturado por semana</Text>
            {data.barras.map((b) => (
              <View key={b.semana} style={s.row}>
                <Text style={s.label}>{b.semana}</Text>
                <Text style={s.value}>{fmtMoney(b.monto)}</Text>
              </View>
            ))}
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>IGV acumulado (18%)</Text>
            <View style={s.row}>
              <Text style={s.label}>IGV del mes</Text>
              <Text style={s.value}>{fmtMoney(data.igvAcum)}</Text>
            </View>
          </View>

          {data.topClientes.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Top clientes del mes</Text>
              {data.topClientes.map((c) => (
                <View key={c.nombre} style={s.row}>
                  <Text style={s.label}>{c.nombre}</Text>
                  <Text style={s.value}>{fmtMoney(c.total)}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={s.footer}>
            Generado con Darivo Pro · darivopro.com
          </Text>
        </View>

      </Page>
    </Document>
  );
}
