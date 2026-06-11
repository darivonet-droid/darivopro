// DARIVO PRO — Design System Tokens
export const T = {
  navy:"#0A1628", navyMid:"#0D1E35", navyLight:"#112240",
  blue:"#2563EB", blueL:"#3B82F6", bluePale:"#EFF6FF", blueDark:"#1D4ED8",
  white:"#FFFFFF", slate:"#F1F5F9", slateD:"#E2E8F0", slateDD:"#CBD5E1",
  text:"#1E293B", textMid:"#64748B", textLight:"#94A3B8",
  green:"#10B981", greenD:"#059669", greenPale:"#ECFDF5",
  amber:"#F59E0B", amberD:"#D97706", amberPale:"#FFFBEB",
  red:"#EF4444", redPale:"#FEF2F2",
  purple:"#7C3AED", purplePale:"#F5F3FF",
  teal:"#0D9488", tealPale:"#F0FDFA",
  brown:"#92400E",
} as const;

export const CAP_COLORS: Record<string,string> = {
  albanileria:"#F59E0B", fontaneria:"#0D9488",
  electricidad:"#D97706", pintura:"#2563EB",
  carpinteria:"#92400E", climatizacion:"#7C3AED",
};

export const STATUS_COLORS: Record<string,string> = {
  "Borrador":"#64748B","Pendiente de firma":"#F59E0B","Aprobado":"#10B981",
};

export const INV_STATUS_COLORS: Record<string,string> = {
  "Pendiente":"#F59E0B","Emitida":"#2563EB","Cobrada":"#10B981",
};
