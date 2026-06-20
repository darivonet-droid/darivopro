import { StyleSheet } from "@react-pdf/renderer";

export const C = {
  navy: "#0A1628",
  blue: "#2563EB",
  green: "#059669",
  slate: "#F1F5F9",
  slateD: "#E2E8F0",
  text: "#1E293B",
  textMid: "#64748B",
  textLight: "#94A3B8",
  amberPale: "#FFFBEB",
  amberText: "#92400E",
  white: "#FFFFFF",
};

export const baseStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: C.text,
    fontFamily: "Helvetica",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.slate,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.slateD,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  footer: {
    marginTop: 32,
    fontSize: 8,
    color: C.textLight,
    textAlign: "center",
  },
});

export function fmtMoney(n: number, sym = "S/"): string {
  return `${sym} ${(n || 0).toFixed(2)}`;
}

export function fmtQty(n: number, unit?: string): string {
  return `${(n || 0).toFixed(2)}${unit ? ` ${unit}` : ""}`;
}
