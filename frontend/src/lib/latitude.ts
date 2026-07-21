/**
 * Latitude Telemetry — traza las llamadas reales a OpenAI (Darivo, IA Cotización, IA Gasto).
 * Ver frontend/.env.example para LATITUDE_API_KEY / LATITUDE_PROJECT_SLUG.
 * Sin esas variables, capture() ejecuta la función igual, sin generar ninguna traza (no-op).
 */
import OpenAI from "openai";
import { Latitude, capture as latitudeCapture, type ContextOptions } from "@latitude-data/telemetry";

const apiKey = process.env.LATITUDE_API_KEY;
const project = process.env.LATITUDE_PROJECT_SLUG;

const latitude =
  apiKey && project
    ? new Latitude({ apiKey, project, instrumentations: { openai: OpenAI } })
    : null;

/**
 * Envuelve una llamada real a la IA (una "vuelta" de uso: Darivo, IA Cotización, IA Gasto)
 * como una traza de Latitude. `flush()` corre en cada llamada porque las rutas de Next.js
 * en Vercel son funciones serverless de vida corta — sin esto, spans en batch podrían
 * perderse si la función se suspende antes de exportarlos.
 */
export async function capture<T>(
  name: string,
  fn: () => Promise<T>,
  options?: ContextOptions
): Promise<T> {
  if (!latitude) return fn();
  try {
    return await latitudeCapture(name, fn, options);
  } finally {
    await latitude.flush();
  }
}
