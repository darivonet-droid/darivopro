// DARIVO PRO — Compartición nativa (Web Share API) con fallback portapapeles
// Permite elegir entre WhatsApp, Telegram, Email, etc. desde el menú nativo del SO.

export type ShareMethod = "native" | "clipboard" | "cancelled" | "error";
export interface ShareResult { method: ShareMethod }

/**
 * Intenta compartir via Web Share API (menú nativo del SO).
 * Fallback: copia el enlace al portapapeles.
 */
export async function compartirPDF(url: string, titulo: string): Promise<ShareResult> {
  if (typeof navigator === "undefined") return { method: "error" };

  if (navigator.share) {
    try {
      await navigator.share({ title: titulo, text: titulo, url });
      return { method: "native" };
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return { method: "cancelled" };
      // Otros errores → continuar con fallback
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return { method: "clipboard" };
  } catch {
    return { method: "error" };
  }
}

/** Indica si el navegador actual soporta Web Share API */
export function soportaCompartir(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}
