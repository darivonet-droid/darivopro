"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PresupuestoIASkeleton } from "@/components/ui/Skeleton";
import { usePresupuestoDraft } from "@/hooks/usePresupuestoDraft";
import { useCatalogo } from "@/hooks/useCatalogo";
import type { Capitulo } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import {
  iaItemsALineas,
  WIZARD_IA_SESSION_KEY,
  type IAPresupuestoResult,
  type PresupuestoDraft,
} from "@/lib/presupuesto-ia";
import type { LineaPresupuesto } from "@/types";
import { T } from "@/lib/theme";
type Modo = "elegir" | "escribir" | "hablar";

interface IaBasketItem {
  svcId: string;
  catLabel: string;
  svcLabel: string;
  calcType: LineaPresupuesto["calcType"];
  basePrice: number;
  unit: string;
  qty: string;
  catColor: string;
  catEmoji: string;
}

function lineasToBasket(lineas: LineaPresupuesto[], catalogo: Capitulo[]): IaBasketItem[] {
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

export function IAPresupuestoFlow() {
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

  const draft: PresupuestoDraft = {
    clientName: "",
    phone: "",
    city: "",
    items: [],
    margin: 40,
    notes: descripcion,
    iaResult: null,
  };
  const { cargar, limpiar } = usePresupuestoDraft(draft, modo !== "elegir");

  useEffect(() => {
    const saved = cargar();
    if (saved?.iaResult && catalogo.length) {
      sessionStorage.setItem(WIZARD_IA_SESSION_KEY, JSON.stringify({
        basket: lineasToBasket(iaItemsALineas(saved.iaResult.items), catalogo),
        notes:  saved.notes,
        margin: saved.margin,
      }));
      limpiar();
      router.push("/cotizaciones/nuevo?fromIA=1");
    }
  }, [cargar, catalogo, limpiar, router]);

  const redirigirAResumen = useCallback((data: IAPresupuestoResult, texto: string) => {
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
    router.push("/cotizaciones/nuevo?fromIA=1");
  }, [catalogo, limpiar, router]);

  const generarConIA = useCallback(async (texto: string) => {
    if (modoOffline) {
      mostrarToast("Sin conexión — la IA requiere internet", "error");
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
        mostrarToast(json.error ?? "Error con la IA", "error");
        return;
      }
      redirigirAResumen(json.data, texto);
    } catch {
      mostrarToast("No se pudo conectar con la IA", "error");
    } finally {
      setProcesando(false);
    }
  }, [mostrarToast, mostrarUpgrade, modoOffline, redirigirAResumen]);

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
          Describe el trabajo y la IA genera la cotización en segundos.
        </p>
        <button
          type="button"
          onClick={() => setModo("escribir")}
          className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-transform active:scale-95"
        >
          <span className="text-3xl">✏️</span>
          <div className="text-left">
            <p className="font-extrabold" style={{ color: T.text }}>Escribir descripción</p>
            <p className="text-xs" style={{ color: T.textMid }}>Texto → OpenAI</p>
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
            <p className="text-xs" style={{ color: T.textMid }}>Web Speech → OpenAI</p>
          </div>
        </button>
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
          <PresupuestoIASkeleton />
        ) : (
          <button
            type="button"
            disabled={!descripcion.trim()}
            onClick={() => generarConIA(descripcion)}
            className="rounded-2xl py-4 text-sm font-bold text-white disabled:opacity-50"
            style={{ background: T.blue }}
          >
            Generar con IA ⚡
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
        {procesando && <PresupuestoIASkeleton />}
      </div>
    );
  }

  return <PresupuestoIASkeleton />;
}
