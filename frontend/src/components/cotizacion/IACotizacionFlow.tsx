"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CotizacionIASkeleton } from "@/components/ui/Skeleton";
import { useCotizacionDraft } from "@/hooks/useCotizacionDraft";
import { useCatalogo } from "@/hooks/useCatalogo";
import type { Capitulo } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import {
  iaItemsALineas,
  WIZARD_IA_SESSION_KEY,
  type IACotizacionResult,
  type CotizacionDraft,
} from "@/lib/cotizacion-ia";
import type { LineaCotizacion } from "@/types";
import { T } from "@/lib/theme";
type Modo = "elegir" | "escribir" | "hablar";

interface IaBasketItem {
  svcId: string;
  catLabel: string;
  svcLabel: string;
  calcType: LineaCotizacion["calcType"];
  basePrice: number;
  unit: string;
  qty: string;
  catColor: string;
  catEmoji: string;
}

function lineasToBasket(lineas: LineaCotizacion[], catalogo: Capitulo[]): IaBasketItem[] {
  return lineas.map((l) => {
    const cap = catalogo.find((c) => c.partidas.some((p) => p.id === l.svcId))
      ?? catalogo.find((c) => c.nombre === l.catLabel);
    return {
      svcId:     l.svcId,
      catLabel:  l.catLabel,
      svcLabel:  l.svcLabel,
      calcType:  l.calcType,
      basePrice: l.basePrice,
      unit:      l.unit,
      qty:       l.calcType === "fixed" ? "1" : String(l.qty || ""),
      catColor:  cap?.color ?? "#2563EB",
      catEmoji:  cap?.emoji ?? "📋",
    };
  });
}

interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface IACotizacionFlowProps {
  /** Base del wizard de cotización tras generar con IA. Empresa la sustituye
   * por "/empresa/cotizaciones/nuevo" (05-MODULO-COTIZACIONES-EMPRESA.md) —
   * Móvil sigue usando la ruta por defecto. */
  nuevaCotizacionHref?: string;
  /** Empresa desktop (08-MODULO-IA-EMPRESA.md §4) agrega la 3ª card "Soporte
   * con IA" (Agente IA 2) en fila 50/50 con las otras 2 — apunta al soporte
   * real ya existente (Más → Soporte, mismo destino que documenta el propio
   * MD §10 para el acceso de escritorio); no hay chat conversacional
   * implementado, así que no se inventa uno nuevo. */
  soporteHref?: string;
  /** Nombre visible del asistente en este texto — Móvil sigue diciendo
   * "Calculadora inteligente" (nombre ya establecido); Empresa pasa "Darivo"
   * (Tarea 5a, CLAUDE.md 17/07/2026: renombrar la etiqueta en Empresa, sin
   * tocar el nombre ya usado en Móvil). Nunca "OpenAI" — regla de producto
   * ya vigente en el resto de la app (nunca se comunica como IA/proveedor
   * de cara al usuario). */
  nombreAsistente?: string;
}

export function IACotizacionFlow({
  nuevaCotizacionHref = "/cotizaciones/nuevo",
  soporteHref,
  nombreAsistente = "Calculadora inteligente",
}: IACotizacionFlowProps = {}) {
  const router = useRouter();
  const { catalogo } = useCatalogo();
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const mostrarUpgrade = useAppStore((s) => s.mostrarUpgrade);
  const modoOffline = useAppStore((s) => s.modoOffline);

  const [modo, setModo]               = useState<Modo>("elegir");
  const [descripcion, setDescripcion] = useState("");
  const [escuchando, setEscuchando]   = useState(false);
  const [procesando, setProcesando]   = useState(false);

  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  const draft: CotizacionDraft = {
    clientName: "",
    phone: "",
    city: "",
    items: [],
    margin: 40,
    notes: descripcion,
    iaResult: null,
  };
  const { cargar, limpiar } = useCotizacionDraft(draft, modo !== "elegir");

  useEffect(() => {
    const saved = cargar();
    if (saved?.iaResult && catalogo.length) {
      sessionStorage.setItem(WIZARD_IA_SESSION_KEY, JSON.stringify({
        basket: lineasToBasket(iaItemsALineas(saved.iaResult.items), catalogo),
        notes:  saved.notes,
        margin: saved.margin,
      }));
      limpiar();
      router.push(`${nuevaCotizacionHref}?fromIA=1`);
    }
  }, [cargar, catalogo, limpiar, router, nuevaCotizacionHref]);

  const redirigirAResumen = useCallback((data: IACotizacionResult, texto: string) => {
    const lineas = iaItemsALineas(data.items);
    const notas = data.notasFaltantes?.length
      ? `${texto}\n\nNotas IA: ${data.notasFaltantes.join("; ")}`
      : texto;
    sessionStorage.setItem(WIZARD_IA_SESSION_KEY, JSON.stringify({
      basket: lineasToBasket(lineas, catalogo),
      notes:  notas,
      margin: 40,
    }));
    limpiar();
    router.push(`${nuevaCotizacionHref}?fromIA=1`);
  }, [catalogo, limpiar, router, nuevaCotizacionHref]);

  const generarConIA = useCallback(async (texto: string) => {
    if (modoOffline) {
      mostrarToast(`Sin conexión — ${nombreAsistente} requiere internet`, "error");
      return;
    }
    setProcesando(true);
    try {
      const res = await fetch("/api/ia/cotizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion: texto }),
      });
      const json = await res.json();
      if (res.status === 429) {
        mostrarUpgrade("ia_limite");
        return;
      }
      if (!res.ok) {
        mostrarToast(json.error ?? `Error con ${nombreAsistente}`, "error");
        return;
      }
      redirigirAResumen(json.data, texto);
    } catch {
      mostrarToast(`No se pudo conectar con ${nombreAsistente}`, "error");
    } finally {
      setProcesando(false);
    }
  }, [mostrarToast, mostrarUpgrade, modoOffline, redirigirAResumen, nombreAsistente]);

  const iniciarVoz = () => {
    setModo("hablar");
    const W = window as Window & {
      SpeechRecognition?: new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onresult: (e: SpeechRecognitionEvent) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onresult: (e: SpeechRecognitionEvent) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      };
    };
    const SR = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!SR) {
      mostrarToast("Tu navegador no soporta voz. Usa escribir.", "error");
      setModo("escribir");
      return;
    }
    const rec = new SR();
    rec.lang = "es-PE";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setDescripcion(text);
      setEscuchando(false);
      generarConIA(text);
    };
    rec.onerror = () => {
      setEscuchando(false);
      mostrarToast("No se pudo capturar la voz", "error");
    };
    rec.onend = () => setEscuchando(false);
    recognitionRef.current = rec;
    setEscuchando(true);
    rec.start();
  };

  /* ── Pantalla: elegir modo ─────────────────────────────────── */
  if (modo === "elegir" && !procesando) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm" style={{ color: T.textMid }}>
          Describe el trabajo y {nombreAsistente} genera la cotización en segundos.
        </p>
        <div className={soporteHref ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"}>
          <button
            type="button"
            onClick={() => setModo("escribir")}
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-transform active:scale-95"
          >
            <span className="text-3xl">✏️</span>
            <div className="text-left">
              <p className="font-extrabold" style={{ color: T.text }}>Escribir descripción</p>
              <p className="text-xs" style={{ color: T.textMid }}>Texto → {nombreAsistente}</p>
            </div>
          </button>
          <button
            type="button"
            onClick={iniciarVoz}
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-transform active:scale-95"
          >
            <span className="text-3xl">🎤</span>
            <div className="text-left">
              <p className="font-extrabold" style={{ color: T.text }}>Hablar</p>
              <p className="text-xs" style={{ color: T.textMid }}>Voz → {nombreAsistente}</p>
            </div>
          </button>
        </div>
        {/* Card 3 — Soporte con IA (Agente IA 2), solo Empresa desktop
            (08-MODULO-IA-EMPRESA.md §4/§10). Apunta al soporte real
            existente — no hay chat conversacional implementado todavía. */}
        {soporteHref && (
          <Link
            href={soporteHref}
            className="flex items-center gap-4 rounded-2xl p-5 shadow-sm transition-transform active:scale-95"
            style={{ background: T.tealPale }}
          >
            <span className="text-3xl">📞</span>
            <div className="text-left">
              <p className="font-extrabold" style={{ color: T.teal }}>Soporte con IA</p>
              <p className="text-xs" style={{ color: T.textMid }}>Agente IA 2 · crear y consultar tickets</p>
            </div>
          </Link>
        )}
      </div>
    );
  }

  /* ── Escribir ──────────────────────────────────────────────── */
  if (modo === "escribir") {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setModo("elegir")}
          className="self-start text-sm font-semibold"
          style={{ color: T.textMid }}
        >
          ← Volver
        </button>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Ej: Reforma de baño 4m², demolición alicatado, nueva cerámica, pintura plástica…"
          rows={6}
          className="w-full rounded-2xl p-4 text-sm outline-none focus:ring-2"
          style={{
            background: T.white,
            color: T.text,
            border: `2px solid ${T.amber}`,
            // @ts-expect-error custom property
            "--tw-ring-color": T.blue,
          }}
        />
        {procesando ? (
          <CotizacionIASkeleton />
        ) : (
          <button
            type="button"
            disabled={!descripcion.trim()}
            onClick={() => generarConIA(descripcion)}
            className="rounded-2xl py-4 text-sm font-bold text-white disabled:opacity-50"
            style={{ background: T.blue }}
          >
            Generar cotización ⚡
          </button>
        )}
      </div>
    );
  }

  /* ── Hablar (loading) ──────────────────────────────────────── */
  if (modo === "hablar") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <div
          className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full text-4xl"
          style={{ background: T.bluePale }}
        >
          🎤
        </div>
        <p className="font-bold" style={{ color: T.text }}>
          {escuchando ? "Escuchando… habla ahora" : "Procesando voz…"}
        </p>
        {procesando && <CotizacionIASkeleton />}
      </div>
    );
  }

  return <CotizacionIASkeleton />;
}
