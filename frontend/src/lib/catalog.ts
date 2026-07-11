// DARIVO PRO — Catálogo base de partidas de obra (precios referenciales PEN)
// Debe mantenerse en sincronía con backend/services/catalogo_base.py
import type { Capitulo, LineaCotizacion, Partida } from "@/types";

export const CATALOGO: Capitulo[] = [
  {
    id: "albanileria", nombre: "Albañilería", emoji: "🧱", color: "#F59E0B",
    partidas: [
      { id: "alb-muro",          nombre: "Muro de ladrillo",           calcType: "m2",    precio: 85,  unidad: "m²" },
      { id: "alb-tarrajeo",      nombre: "Tarrajeo de paredes",        calcType: "m2",    precio: 35,  unidad: "m²" },
      { id: "alb-piso-ceramico", nombre: "Piso cerámico instalado",    calcType: "m2",    precio: 55,  unidad: "m²" },
      { id: "alb-contrapiso",    nombre: "Contrapiso",                 calcType: "m2",    precio: 45,  unidad: "m²" },
      { id: "alb-demolicion",    nombre: "Demolición de muro",         calcType: "m2",    precio: 30,  unidad: "m²" },
    ],
  },
  {
    id: "fontaneria", nombre: "Gasfitería", emoji: "🚿", color: "#0D9488",
    partidas: [
      { id: "fon-punto-agua",    nombre: "Punto de agua",              calcType: "unit",  precio: 120, unidad: "pto" },
      { id: "fon-punto-desague", nombre: "Punto de desagüe",           calcType: "unit",  precio: 140, unidad: "pto" },
      { id: "fon-inodoro",       nombre: "Instalación de inodoro",     calcType: "unit",  precio: 150, unidad: "und" },
      { id: "fon-lavadero",      nombre: "Instalación de lavadero",    calcType: "unit",  precio: 130, unidad: "und" },
      { id: "fon-ducha",         nombre: "Instalación de ducha",       calcType: "unit",  precio: 180, unidad: "und" },
      { id: "fon-reparacion",    nombre: "Reparación de fuga",         calcType: "hour",  precio: 60,  unidad: "h" },
    ],
  },
  {
    id: "electricidad", nombre: "Electricidad", emoji: "⚡", color: "#D97706",
    partidas: [
      { id: "ele-punto-luz",     nombre: "Punto de luz",               calcType: "unit",  precio: 90,  unidad: "pto" },
      { id: "ele-tomacorriente", nombre: "Tomacorriente",              calcType: "unit",  precio: 75,  unidad: "pto" },
      { id: "ele-tablero",       nombre: "Tablero eléctrico",          calcType: "unit",  precio: 350, unidad: "und" },
      { id: "ele-cableado",      nombre: "Cableado",                   calcType: "m2",    precio: 25,  unidad: "m²" },
      { id: "ele-luminaria",     nombre: "Instalación de luminaria",   calcType: "unit",  precio: 45,  unidad: "und" },
    ],
  },
  {
    id: "pintura", nombre: "Pintura", emoji: "🎨", color: "#2563EB",
    partidas: [
      { id: "pin-interior",      nombre: "Pintura interior (2 manos)", calcType: "m2",    precio: 18,  unidad: "m²" },
      { id: "pin-exterior",      nombre: "Pintura exterior",           calcType: "m2",    precio: 22,  unidad: "m²" },
      { id: "pin-empaste",       nombre: "Empaste de paredes",         calcType: "m2",    precio: 15,  unidad: "m²" },
      { id: "pin-puerta",        nombre: "Pintado de puerta",          calcType: "unit",  precio: 80,  unidad: "und" },
    ],
  },
  {
    id: "carpinteria", nombre: "Carpintería", emoji: "🪚", color: "#92400E",
    partidas: [
      { id: "car-puerta",        nombre: "Puerta contraplacada instalada", calcType: "unit", precio: 380, unidad: "und" },
      { id: "car-closet",        nombre: "Closet de melamina",         calcType: "m2",    precio: 320, unidad: "m²" },
      { id: "car-zocalo",        nombre: "Zócalo / contrazócalo",      calcType: "m2",    precio: 12,  unidad: "ml" },
      { id: "car-reparacion",    nombre: "Reparación de carpintería",  calcType: "hour",  precio: 70,  unidad: "h" },
    ],
  },
  {
    id: "climatizacion", nombre: "Climatización", emoji: "❄️", color: "#7C3AED",
    partidas: [
      { id: "cli-split",         nombre: "Instalación A/C split",      calcType: "unit",  precio: 450, unidad: "und" },
      { id: "cli-mantenimiento", nombre: "Mantenimiento A/C",          calcType: "unit",  precio: 120, unidad: "und" },
      { id: "cli-ducto",         nombre: "Ductería",                   calcType: "m2",    precio: 95,  unidad: "ml" },
      { id: "cli-extractor",     nombre: "Extractor de aire",          calcType: "unit",  precio: 160, unidad: "und" },
    ],
  },
];

/** Paleta fija de colores de categorías (Fable 5) — reutilizada al crear categorías nuevas */
export const PALETA_CATEGORIAS = [
  "#F59E0B", // naranja
  "#0D9488", // verde azulado
  "#D97706", // naranja oscuro
  "#2563EB", // azul
  "#92400E", // marrón
  "#7C3AED", // morado
] as const;

/** Emoji por defecto al crear una categoría nueva (no hay selector de ícono en esta fase) */
export const EMOJI_CATEGORIA_DEFAULT = "🔧";

/** Elige el primer color de la paleta que no esté ya usado; si todos están usados, cicla */
export function colorParaNuevaCategoria(coloresUsados: string[]): string {
  const libre = PALETA_CATEGORIAS.find((c) => !coloresUsados.includes(c));
  return libre ?? PALETA_CATEGORIAS[coloresUsados.length % PALETA_CATEGORIAS.length];
}

/** Convierte un nombre en un cat_id estable (slug ascii) */
export function slugCategoria(nombre: string): string {
  const base = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `cat-${base || "nueva"}-${Date.now().toString(36)}`;
}

/** Metadatos de categoría para UI — nombres y emojis desde CATALOGO (fuente única) */
export type CategoriaMeta = Pick<Capitulo, "id" | "nombre" | "emoji" | "color">;

export const CATEGORIAS: CategoriaMeta[] = CATALOGO.map(({ id, nombre, emoji, color }) => ({
  id,
  nombre,
  emoji,
  color,
}));

/** Convierte una partida del catálogo en una línea de cotizacion */
export const partidaALinea = (cap: Capitulo, partida: Partida, qty = 1): LineaCotizacion => ({
  svcId: partida.id,
  catLabel: cap.nombre,
  svcLabel: partida.nombre,
  calcType: partida.calcType,
  basePrice: partida.precio,
  unit: partida.unidad,
  qty,
  unitPrice: partida.precio,
  subtotal: Math.round(partida.precio * qty * 100) / 100,
});
