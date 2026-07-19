// DARIVO PRO — Conversión de monto a letras en español (línea "SON: ... SOLES")
// Confirmado con búsqueda exhaustiva (19/07/2026): no existía ninguna función
// de este tipo en el proyecto — se construyó desde cero, sin dependencias externas.

const UNIDADES = [
  "", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE",
  "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE",
];

const DECENAS = [
  "", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA",
];

const CENTENAS = [
  "", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
  "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS",
];

const VEINTIS = [
  "VEINTE", "VEINTIUNO", "VEINTIDÓS", "VEINTITRÉS", "VEINTICUATRO",
  "VEINTICINCO", "VEINTISÉIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE",
];

function dosDigitos(n: number): string {
  if (n === 0) return "";
  if (n < 20) return UNIDADES[n];
  if (n < 30) return VEINTIS[n - 20];
  const d = Math.floor(n / 10);
  const u = n % 10;
  return DECENAS[d] + (u > 0 ? ` Y ${UNIDADES[u]}` : "");
}

function tresDigitos(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "CIEN";

  const c = Math.floor(n / 100);
  const resto = n % 100;
  const partes = [c > 0 ? CENTENAS[c] : "", dosDigitos(resto)].filter(Boolean);
  return partes.join(" ");
}

/** Convierte un entero >= 0 a texto en español, mayúsculas, sin decimales. */
export function enteroALetras(n: number): string {
  if (n === 0) return "CERO";

  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;

  const partes: string[] = [];

  if (millones > 0) {
    partes.push(millones === 1 ? "UN MILLÓN" : `${tresDigitos(millones)} MILLONES`);
  }
  if (miles > 0) {
    partes.push(miles === 1 ? "MIL" : `${tresDigitos(miles)} MIL`);
  }
  if (resto > 0) {
    partes.push(tresDigitos(resto));
  }

  return partes.join(" ").trim();
}

/**
 * Formatea un monto como línea "SON: ... SOLES" (o la moneda dada), con
 * céntimos en formato "CON XX/100" — mismo estilo que el modelo Bizlinks
 * ("SON : CUATROCIENTOS TREINTA Y SEIS CON 60/100 SOLES").
 */
export function montoALetras(monto: number, moneda: "PEN" | "USD" = "PEN"): string {
  const entero    = Math.floor(Math.abs(monto));
  const centavos  = Math.round((Math.abs(monto) - entero) * 100);
  const nombreMoneda = moneda === "USD" ? "DÓLARES" : "SOLES";
  const centavosStr  = String(centavos).padStart(2, "0");

  return `${enteroALetras(entero)} CON ${centavosStr}/100 ${nombreMoneda}`;
}
