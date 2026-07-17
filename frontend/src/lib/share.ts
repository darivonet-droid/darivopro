// DARIVO PRO — Compartición nativa (Web Share API) con fallback portapapeles
// Permite elegir entre WhatsApp, Telegram, Email, etc. desde el menú nativo del SO.

export type ShareMethod = "native-file" | "native" | "clipboard" | "cancelled" | "error";
export interface ShareResult { method: ShareMethod }

/**
 * Descarga el PDF y lo comparte como archivo real (Web Share API nivel 2,
 * navigator.canShare({files})) — la app de WhatsApp lo recibe como documento
 * adjunto, no como un link de texto. Soportado en Chrome/Safari móvil, tanto
 * en pestaña normal como instalado (PWA); no depende de display-mode.
 * Si el navegador no soporta compartir archivos, devuelve null sin lanzar
 * error para que el caller siga con el fallback de link.
 */
async function intentarCompartirArchivo(url: string, filename: string, titulo: string): Promise<ShareResult | null> {
  if (typeof navigator === "undefined" || typeof navigator.canShare !== "function") return null;

  let file: File;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    file = new File([blob], filename, { type: "application/pdf" });
  } catch {
    return null; // fetch/CORS falló — sigue con fallback de link, no es un error fatal
  }

  if (!navigator.canShare({ files: [file] })) return null;

  try {
    await navigator.share({ title: titulo, text: titulo, files: [file] });
    return { method: "native-file" };
  } catch (e) {
    if ((e as DOMException).name === "AbortError") return { method: "cancelled" };
    return null; // otro error compartiendo el archivo — sigue con fallback de link
  }
}

/**
 * Comparte el PDF real por WhatsApp/etc. Orden de intentos:
 * 1. Archivo real adjunto (Web Share API nivel 2) — lo que realmente "comparte el PDF".
 * 2. Link vía Web Share API (menú nativo, sin archivo).
 * 3. Copiar el enlace al portapapeles.
 */
export async function compartirPDF(url: string, titulo: string, filename = "documento.pdf"): Promise<ShareResult> {
  if (typeof navigator === "undefined") return { method: "error" };

  const conArchivo = await intentarCompartirArchivo(url, filename, titulo);
  if (conArchivo) return conArchivo;

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

/**
 * Abre una pestaña/ventana en blanco de forma SÍNCRONA (dentro del gesto de
 * clic) y devuelve el handle para fijar su `location` después de una
 * operación async (ej. generar el PDF). Evita que el navegador bloquee el
 * popup por "no viene de un gesto de usuario" — ese bloqueo solo se dispara
 * cuando `window.open` se llama *después* de un `await`, no cuando ya existe
 * un handle abierto de antemano. Es la causa real de que el auto-envío por
 * WhatsApp funcionara en la PWA instalada pero fallara en el navegador móvil
 * normal (Chrome Android bloquea el popup tardío; el modo standalone no
 * siempre aplica esa misma política).
 */
export function abrirVentanaDiferida(): Window | null {
  if (typeof window === "undefined") return null;
  try {
    return window.open("", "_blank", "noopener,noreferrer");
  } catch {
    return null;
  }
}

/** Fija el destino de una ventana abierta con abrirVentanaDiferida(). */
export function navegarVentanaDiferida(win: Window | null, url: string): void {
  if (!win) { window.open(url, "_blank", "noopener,noreferrer"); return; }
  try {
    win.location.href = url;
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
