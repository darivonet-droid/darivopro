/**
 * DARIVO PRO — Motor de cálculo de cotizaciones
 *
 * Principios:
 *  - Aritmética entera (centavos) para evitar acumulación de errores de punto flotante.
 *  - Redondeo half-up consistente en 2 decimales.
 *  - Separación explícita de materiales vs mano de obra.
 *  - Validación de cantidades y unidades antes de calcular.
 *  - Historial local de cálculos (localStorage).
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Tipos de cálculo coincidentes con LineaCotizacion.calcType */
export type CalcType = "m2" | "unit" | "hour" | "fixed";

/** Clasificación de un ítem dentro de la cotización */
export type CalcCategory = "material" | "mano_de_obra";

export interface CalcInput {
  svcId:     string;
  svcLabel:  string;
  catLabel:  string;
  calcType:  CalcType;
  basePrice: number;
  qty:       number;    // ya parseado (fixed = 1)
  unit:      string;
}

export interface CalcItemResult {
  svcId:        string;
  svcLabel:     string;
  catLabel:     string;
  calcType:     CalcType;
  basePrice:    number;
  qty:          number;
  unitPrice:    number;
  subtotal:     number;
  unit:         string;
  categoria:    CalcCategory;  // "material" | "mano_de_obra"
  error?:       string;
}

export interface CalcBasketResult {
  items:              CalcItemResult[];
  totalMateriales:    number;   // m2/unit items (include materials in their price)
  totalManoDeObra:    number;   // hour/fixed items (pure labor)
  totalBase:          number;   // totalMateriales + totalManoDeObra
  totalMargen:        number;   // profit/overhead amount
  margin:             number;   // margin % used
  totalFinal:         number;   // totalBase + totalMargen
  errors:             string[]; // validation warnings (non-blocking)
}

export interface CalcSnapshot {
  id:              string;
  ts:              number;
  margin:          number;
  totalMateriales: number;
  totalManoDeObra: number;
  totalBase:       number;
  totalMargen:     number;
  totalFinal:      number;
  itemCount:       number;
}

// ─── Precisión numérica ───────────────────────────────────────────────────────

/**
 * Redondeo half-up a N decimales.
 * Usa `Number.EPSILON` para compensar representaciones imprecisas (ej. 1.005).
 */
export function roundPrice(n: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((n + Number.EPSILON) * factor) / factor;
}

/**
 * Suma precisa de un arreglo de precios.
 * Opera en centavos (enteros) para eliminar errores de acumulación de punto flotante.
 * Ejemplo: sumPrecise([0.1, 0.2]) === 0.30 (no 0.30000000000000004).
 */
export function sumPrecise(values: number[]): number {
  const totalCents = values.reduce((acc, v) => acc + Math.round(v * 100), 0);
  return totalCents / 100;
}

/**
 * Multiplica dos números con redondeo preciso.
 * Evita ej. 35 * 24 = 839.9999999 en lugar de 840.
 */
export function multiplyPrecise(a: number, b: number): number {
  return roundPrice(a * b);
}

// ─── Validación ───────────────────────────────────────────────────────────────

const VALID_UNITS_BY_TYPE: Record<CalcType, readonly string[]> = {
  m2:    ["m²", "m2", "m"],
  unit:  ["und", "pto", "pza", "glb", "unidad", "unidades", "kit", "jgo"],
  hour:  ["h", "hr", "hrs", "hora", "horas"],
  fixed: [],  // no unit required
};

/**
 * Valida la cantidad para el tipo de ítem dado.
 * Retorna un mensaje de error o null si es válida.
 */
export function validateQty(qty: number, calcType: CalcType): string | null {
  if (!Number.isFinite(qty) || Number.isNaN(qty))
    return `Cantidad inválida (${qty})`;
  if (calcType !== "fixed") {
    if (qty <= 0)       return "La cantidad debe ser mayor que 0";
    if (qty > 99_999)   return "Cantidad excesiva (máx 99,999)";
    if (calcType === "m2" && qty < 0.01)
      return "Área mínima: 0.01 m²";
    if (calcType === "hour" && qty < 0.25)
      return "Mínimo 0.25 h (15 min)";
  }
  return null;
}

/**
 * Valida la unidad de medida para el tipo de ítem.
 * No bloquea el cálculo (solo advertencia), ya que el catálogo puede tener
 * unidades personalizadas.
 */
export function validateUnidad(unidad: string, calcType: CalcType): string | null {
  if (calcType === "fixed") return null;
  const clean = (unidad ?? "").trim().toLowerCase();
  if (!clean) return "Unidad de medida no especificada";
  const allowed = VALID_UNITS_BY_TYPE[calcType];
  if (allowed.length > 0 && !allowed.includes(clean))
    return `Unidad "${unidad}" poco habitual para tipo ${calcType}`;
  return null;
}

/**
 * Valida el precio base de una partida.
 */
export function validateBasePrice(price: number): string | null {
  if (!Number.isFinite(price) || price < 0)
    return `Precio inválido (${price})`;
  if (price > 999_999)
    return "Precio excesivo (máx S/ 999,999)";
  return null;
}

// ─── Motor de cálculo ─────────────────────────────────────────────────────────

/**
 * Clasifica un ítem como "material" (incluye materiales en su precio) o
 * "mano_de_obra" (costo puramente laboral).
 *
 * Criterio para el mercado peruano de maestros de obra:
 *  - m2 / unit → incluye materiales + MO → clasificado como "material"
 *  - hour / fixed → MO pura → clasificado como "mano_de_obra"
 */
export function clasificarItem(calcType: CalcType): CalcCategory {
  return calcType === "hour" || calcType === "fixed" ? "mano_de_obra" : "material";
}

/**
 * Calcula un único ítem del cotizacion con precisión entera y validación.
 */
export function calcItemPrecise(input: CalcInput): CalcItemResult {
  const qty       = input.calcType === "fixed" ? 1 : input.qty;
  const subtotal  = multiplyPrecise(qty, input.basePrice);
  const categoria = clasificarItem(input.calcType);

  // Collect non-blocking validation warnings
  const qtyErr   = input.calcType !== "fixed" ? validateQty(qty, input.calcType) : null;
  const unitErr  = validateUnidad(input.unit, input.calcType);
  const priceErr = validateBasePrice(input.basePrice);
  const error    = [qtyErr, unitErr, priceErr].filter(Boolean).join("; ") || undefined;

  return {
    svcId:     input.svcId,
    svcLabel:  input.svcLabel,
    catLabel:  input.catLabel,
    calcType:  input.calcType,
    basePrice: input.basePrice,
    qty,
    unitPrice: input.basePrice,
    subtotal,
    unit:      input.unit,
    categoria,
    error,
  };
}

/**
 * Calcula el basket completo con separación de materiales / mano de obra,
 * aplicación del margen de beneficio y recalculo en tiempo real.
 *
 * @param inputs   - Ítems del basket (qty ya parseado)
 * @param margin   - Porcentaje de beneficio (ej. 40 = 40%)
 */
export function calcBasket(inputs: CalcInput[], margin: number): CalcBasketResult {
  // Clamp margin to sane range
  const safeMárgen = Number.isFinite(margin) && margin >= 0 && margin <= 500
    ? margin
    : 40;

  const items = inputs.map(calcItemPrecise);
  const errors = items.flatMap((it) => it.error ? [it.error] : []);

  const totalMateriales = sumPrecise(
    items.filter((it) => it.categoria === "material").map((it) => it.subtotal)
  );
  const totalManoDeObra = sumPrecise(
    items.filter((it) => it.categoria === "mano_de_obra").map((it) => it.subtotal)
  );
  const totalBase    = sumPrecise([totalMateriales, totalManoDeObra]);
  const totalMargen  = roundPrice(totalBase * safeMárgen / 100);
  const totalFinal   = roundPrice(totalBase + totalMargen);

  return {
    items,
    totalMateriales,
    totalManoDeObra,
    totalBase,
    totalMargen,
    margin: safeMárgen,
    totalFinal,
    errors,
  };
}

// ─── Historial de cálculos (localStorage) ────────────────────────────────────

const CALC_HISTORY_KEY  = "darivo_calc_history_v1";
const MAX_CALC_HISTORY  = 25;

function _genId(): string {
  return `calc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function _safeRead<T>(key: string): T | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}
function _safeWrite(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

/**
 * Guarda un snapshot del cálculo en localStorage (historial local).
 * Permite auditar la evolución de una cotización antes de guardarla.
 */
export function saveCalcSnapshot(result: CalcBasketResult): CalcSnapshot {
  const snapshot: CalcSnapshot = {
    id:              _genId(),
    ts:              Date.now(),
    margin:          result.margin,
    totalMateriales: result.totalMateriales,
    totalManoDeObra: result.totalManoDeObra,
    totalBase:       result.totalBase,
    totalMargen:     result.totalMargen,
    totalFinal:      result.totalFinal,
    itemCount:       result.items.length,
  };
  const history = _safeRead<CalcSnapshot[]>(CALC_HISTORY_KEY) ?? [];
  history.unshift(snapshot);
  _safeWrite(CALC_HISTORY_KEY, history.slice(0, MAX_CALC_HISTORY));
  return snapshot;
}

/**
 * Devuelve el historial local de cálculos (más reciente primero).
 */
export function getCalcHistory(): CalcSnapshot[] {
  return _safeRead<CalcSnapshot[]>(CALC_HISTORY_KEY) ?? [];
}

/**
 * Devuelve el último snapshot guardado, o null si no hay historial.
 */
export function getLastCalcSnapshot(): CalcSnapshot | null {
  return getCalcHistory()[0] ?? null;
}
