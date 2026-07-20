"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { detectarRed } from "@/lib/offline-cache";
import { T } from "@/lib/theme";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** iOS/iPadOS nunca dispara `beforeinstallprompt` (solo Chromium) — sin esta
 * detección, el banner de instalación queda mudo ahí para siempre. `standalone`
 * es una propiedad no estándar de Safari, no está en el tipo `Navigator`. */
function esIOS(): boolean {
  const ua = navigator.userAgent;
  const iOSClasico = /iPad|iPhone|iPod/.test(ua);
  const iPadOSComoMac = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOSClasico || iPadOSComoMac;
}

function yaInstaladoIOS(): boolean {
  return (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function PwaShell() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [mostrarInstall, setMostrarInstall] = useState(false);
  const [instalado, setInstalado] = useState(false);
  const [esDispositivoIOS, setEsDispositivoIOS] = useState(false);
  const setModoOffline = useAppStore((s) => s.setModoOffline);
  const setRedLenta = useAppStore((s) => s.setRedLenta);
  const modoOffline = useAppStore((s) => s.modoOffline);
  const redLenta = useAppStore((s) => s.redLenta);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || yaInstaladoIOS()) {
      setInstalado(true);
    }
    setEsDispositivoIOS(esIOS());

    const onInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onInstall);

    const timer = setTimeout(() => {
      if (!instalado) setMostrarInstall(true);
    }, 30_000);

    const actualizarRed = () => {
      const estado = detectarRed();
      setModoOffline(estado === "offline");
      setRedLenta(estado === "slow");
    };
    actualizarRed();
    window.addEventListener("online", actualizarRed);
    window.addEventListener("offline", actualizarRed);
    const conn = (navigator as Navigator & { connection?: EventTarget }).connection;
    conn?.addEventListener?.("change", actualizarRed);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onInstall);
      window.removeEventListener("online", actualizarRed);
      window.removeEventListener("offline", actualizarRed);
      conn?.removeEventListener?.("change", actualizarRed);
    };
  }, [instalado, setModoOffline, setRedLenta]);

  const instalar = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") setInstalado(true);
    setMostrarInstall(false);
    setInstallEvent(null);
  };

  return (
    <>
      {(modoOffline || redLenta) && (
        <div
          className="fixed left-0 right-0 top-0 z-[90] px-4 py-2 text-center text-xs font-bold"
          style={{
            background: modoOffline ? T.amber : T.navy,
            color: T.white,
            maxWidth: 390,
            margin: "0 auto",
          }}
        >
          {modoOffline
            ? "📴 Modo offline — listas en caché. Calculadora inteligente y PDF cuando vuelva la red."
            : "📶 Conexión lenta (2G/3G) — modo ahorro activo. Sincroniza al conectar WiFi."}
        </div>
      )}

      {mostrarInstall && installEvent && !instalado && (
        <div
          className="fixed bottom-20 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-[358px] -translate-x-1/2 rounded-2xl p-4"
          style={{ background: T.navy, boxShadow: "0 8px 32px rgba(10,22,40,0.35)" }}
        >
          <p className="text-sm font-bold" style={{ color: T.white }}>
            Instala Darivo Pro en tu móvil 👷‍♂️
          </p>
          <p className="mt-1 text-xs" style={{ color: T.textLight }}>
            Acceso rápido desde la pantalla de inicio
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={instalar}
              className="flex-1 rounded-xl py-2.5 text-xs font-bold"
              style={{ background: T.blue, color: T.white }}
            >
              Instalar
            </button>
            <button
              type="button"
              onClick={() => setMostrarInstall(false)}
              className="rounded-xl px-4 py-2.5 text-xs font-bold"
              style={{ color: T.textLight }}
            >
              Luego
            </button>
          </div>
        </div>
      )}

      {mostrarInstall && !installEvent && esDispositivoIOS && !instalado && (
        <div
          className="fixed bottom-20 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-[358px] -translate-x-1/2 rounded-2xl p-4"
          style={{ background: T.navy, boxShadow: "0 8px 32px rgba(10,22,40,0.35)" }}
        >
          <p className="text-sm font-bold" style={{ color: T.white }}>
            Instala Darivo Pro en tu iPhone 👷‍♂️
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: T.textLight }}>
            Toca <span aria-hidden>􀈂</span> Compartir en Safari, luego{" "}
            <b>&quot;Agregar a pantalla de inicio&quot;</b>
          </p>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setMostrarInstall(false)}
              className="rounded-xl px-4 py-2.5 text-xs font-bold"
              style={{ color: T.textLight }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
