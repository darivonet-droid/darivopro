"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PresupuestoTotalesIA } from "@/components/presupuesto/PresupuestoTotalesIA";
import { PresupuestoIASkeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { usePresupuesto } from "@/hooks/usePresupuesto";
import { usePresupuestoDraft } from "@/hooks/usePresupuestoDraft";
import { useAppStore } from "@/store/useAppStore";
import {
  buildWhatsAppUrl,
  iaItemsALineas,
  recalcularTotalesIA,
  type IAPresupuestoItem,
  type IAPresupuestoResult,
  type PresupuestoDraft,
} from "@/lib/presupuesto-ia";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/theme";

type Modo = "elegir" | "escribir" | "hablar" | "resultado";

interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

export function IAPresupuestoFlow() {
  const router = useRouter();
  const { crear, generarPDF, loading } = usePresupuesto();
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const mostrarUpgrade = useAppStore((s) => s.mostrarUpgrade);
  const modoOffline = useAppStore((s) => s.modoOffline);

  const [modo, setModo]               = useState<Modo>("elegir");
  const [descripcion, setDescripcion] = useState("");
  const [escuchando, setEscuchando]   = useState(false);
  const [procesando, setProcesando]   = useState(false);
  const [resultado, setResultado]     = useState<IAPresupuestoResult | null>(null);
  const [clientName, setClientName]   = useState("");
  const [phone, setPhone]             = useState("");
  const [guardadoId, setGuardadoId]   = useState<string | null>(null);
  const [cotNum, setCotNum]           = useState<string | null>(null);
  const [pdfUrl, setPdfUrl]           = useState<string | null>(null);

  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  const draft: PresupuestoDraft = {
    clientName,
    phone,
    city: "",
    items: resultado ? iaItemsALineas(resultado.items) : [],
    margin: 0,
    notes: descripcion,
    iaResult: resultado,
  };
  const { cargar, limpiar } = usePresupuestoDraft(draft, modo !== "elegir");

  useEffect(() => {
    const saved = cargar();
    if (saved?.iaResult) {
      setResultado(saved.iaResult);
      setClientName(saved.clientName);
      setPhone(saved.phone);
      setDescripcion(saved.notes);
      setModo("resultado");
    }
  }, [cargar]);

  const generarConIA = useCallback(async (texto: string) => {
    if (modoOffline) {
      mostrarToast("Sin conexión — la IA requiere internet", "error");
      return;
    }
    setProcesando(true);
    try {
      const res = await fetch("/api/ia/presupuesto", {
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
      setResultado(json.data);
      setModo("resultado");
      if (json.data.titulo && !clientName) {
        setClientName(json.data.titulo);
      }
    } catch {
      mostrarToast("No se pudo conectar con la IA", "error");
    } finally {
      setProcesando(false);
    }
  }, [clientName, mostrarToast, mostrarUpgrade, modoOffline]);

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

  const cambiarItem = (index: number, field: keyof IAPresupuestoItem, value: string | number) => {
    if (!resultado) return;
    const items = resultado.items.map((it, i) => {
      if (i !== index) return it;
      const updated = { ...it, [field]: value };
      if (field === "cantidad" || field === "precio_unit") {
        updated.total =
          Math.round(Number(updated.cantidad) * Number(updated.precio_unit) * 100) / 100;
      }
      return updated;
    });
    setResultado({ ...resultado, ...recalcularTotalesIA(items) });
  };

  const guardar = async () => {
    if (!resultado || clientName.trim().length < 2) {
      mostrarToast("Ingresa el nombre del cliente", "error");
      return;
    }
    const lineas = iaItemsALineas(resultado.items);
    const creado = await crear({
      clientName: clientName.trim(),
      phone: phone.trim() || undefined,
      items: lineas,
      margin: 0,
      totalBase: resultado.subtotal,
      totalLabor: resultado.igv,
      totalFinal: resultado.total,
      status: "Borrador",
      notes: "Generado con IA",
    }, mostrarUpgrade);
    if (!creado) {
      mostrarToast("No se pudo guardar", "error");
      return;
    }
    setGuardadoId(creado.id);
    setCotNum(creado.cotNum ?? null);
    limpiar();
    mostrarToast("Cotización guardada ✓");
    const url = await generarPDF(creado.id);
    if (url) setPdfUrl(url);
  };

  const compartirWhatsApp = () => {
    if (!phone.trim()) {
      mostrarToast("Agrega teléfono del cliente", "error");
      return;
    }
    const msg = `Hola, te envío la cotización ${cotNum ?? ""} por S/ ${resultado?.total.toFixed(2)}.\n\nGenerado con DARIVO PRO`;
    window.open(buildWhatsAppUrl(phone, msg), "_blank");
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
            <p className="text-xs" style={{ color: T.textMid }}>Textarea → Claude</p>
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
            <p className="text-xs" style={{ color: T.textMid }}>Web Speech → Claude</p>
          </div>
        </button>
      </div>
    );
  }

  /* ── Escribir ──────────────────────────────────────────────── */
  if (modo === "escribir" && !resultado) {
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
  if (modo === "hablar" && !resultado) {
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

  /* ── Resultado ─────────────────────────────────────────────── */
  if (resultado) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl px-4 py-3" style={{ background: T.navyLight }}>
          <p className="text-xs font-bold uppercase" style={{ color: T.textLight }}>
            Nº cotización
          </p>
          <p className="text-lg font-black" style={{ color: T.white }}>
            {cotNum ?? "Se asigna al guardar"}
          </p>
        </div>

        <Input
          label="Cliente"
          placeholder="Nombre del cliente"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
        <Input
          label="Teléfono WhatsApp"
          placeholder="51 999 999 999"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <PresupuestoTotalesIA
          items={resultado.items}
          subtotal={resultado.subtotal}
          igv={resultado.igv}
          total={resultado.total}
          onChangeItem={cambiarItem}
        />

        {!guardadoId ? (
          <button
            type="button"
            disabled={loading}
            onClick={guardar}
            className="rounded-2xl py-4 text-sm font-bold text-white disabled:opacity-50"
            style={{ background: T.blue }}
          >
            {loading ? "Guardando…" : `Guardar · ${fmtPEN(resultado.total)}`}
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl py-3.5 text-center text-sm font-bold text-white"
                style={{ background: T.navy }}
              >
                📄 Descargar PDF
              </a>
            )}
            <button
              type="button"
              onClick={compartirWhatsApp}
              className="rounded-2xl py-3.5 text-sm font-bold text-white"
              style={{ background: "#25D366" }}
            >
              💬 Compartir por WhatsApp
            </button>
            <button
              type="button"
              onClick={() => router.push("/presupuestos")}
              className="rounded-2xl py-3.5 text-sm font-bold"
              style={{ background: T.slate, color: T.textMid }}
            >
              Ver mis cotizaciones
            </button>
          </div>
        )}
      </div>
    );
  }

  return <PresupuestoIASkeleton />;
}
