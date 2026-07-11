// DARIVO PRO — Cuentas de envío de email transaccional (Gmail API, domain-wide delegation)
// Ver README de este módulo (send.ts) para el setup manual pendiente (Google Workspace).

export type CuentaEmail = "info" | "facturacion" | "noreply" | "partners" | "soporte";

const DOMINIO = process.env.EMAIL_DOMINIO?.trim() || "darivopro.com";

export const CUENTAS_EMAIL: Record<CuentaEmail, string> = {
  info: `info@${DOMINIO}`,
  facturacion: `facturacion@${DOMINIO}`,
  noreply: `noreply@${DOMINIO}`,
  partners: `partners@${DOMINIO}`,
  soporte: `soporte@${DOMINIO}`,
};
