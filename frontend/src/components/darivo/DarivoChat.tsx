"use client";

import { useEffect, useRef, useState } from "react";
import { T } from "@/lib/theme";

interface Mensaje {
  role: "user" | "assistant";
  content: string;
}

const SALUDO_INICIAL =
  "¡Hola! Soy Darivo. Puedo ayudarte con dudas sobre Darivo Pro, tu plan, cómo armar una cotización, o dejarle tu caso al equipo si hace falta. ¿En qué te ayudo?";

interface DarivoChatProps {
  /** Alto máximo del área de mensajes (scrollable). Por defecto se adapta al contenedor. */
  maxHeight?: number | string;
}

export function DarivoChat({ maxHeight = 420 }: DarivoChatProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([{ role: "assistant", content: SALUDO_INICIAL }]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [mensajes, enviando]);

  const enviar = async () => {
    const contenido = texto.trim();
    if (!contenido || enviando) return;

    const historial = [...mensajes, { role: "user" as const, content: contenido }];
    setMensajes(historial);
    setTexto("");
    setEnviando(true);
    setError(null);

    try {
      const res = await fetch("/api/darivo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historial }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "No se pudo enviar tu mensaje, intenta de nuevo");
        return;
      }
      setMensajes((prev) => [...prev, { role: "assistant", content: json.reply as string }]);
    } catch {
      setError("No se pudo enviar tu mensaje — revisa tu conexión");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl"
      style={{ background: T.white, border: `1.5px solid ${T.slateD}` }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ background: T.tealPale, borderBottom: `1px solid ${T.slateD}` }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white"
          style={{ background: T.teal }}
        >
          D
        </div>
        <div>
          <p className="text-sm font-extrabold" style={{ color: T.text }}>
            Darivo
          </p>
          <p className="text-[11px]" style={{ color: T.textMid }}>
            Soporte de Darivo Pro
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-col gap-2 overflow-y-auto px-4 py-4"
        style={{ maxHeight, minHeight: 220 }}
      >
        {mensajes.map((m, i) => (
          <div
            key={i}
            className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
            style={
              m.role === "user"
                ? { alignSelf: "flex-end", background: T.blue, color: T.white, borderBottomRightRadius: 4 }
                : { alignSelf: "flex-start", background: T.slate, color: T.text, borderBottomLeftRadius: 4 }
            }
          >
            {m.content}
          </div>
        ))}
        {enviando && (
          <div
            className="max-w-[60%] rounded-2xl px-3.5 py-2.5 text-sm"
            style={{ alignSelf: "flex-start", background: T.slate, color: T.textMid, borderBottomLeftRadius: 4 }}
          >
            escribiendo…
          </div>
        )}
      </div>

      {error && (
        <p className="px-4 pb-1 text-xs font-semibold" style={{ color: T.red }}>
          {error}
        </p>
      )}

      <div className="flex items-center gap-2 px-3 py-3" style={{ borderTop: `1px solid ${T.slateD}` }}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void enviar();
            }
          }}
          placeholder="Escribe tu mensaje…"
          className="flex-1 rounded-xl border px-3.5 py-2.5 text-sm outline-none"
          style={{ borderColor: T.slateD, color: T.text }}
        />
        <button
          type="button"
          onClick={() => void enviar()}
          disabled={enviando || !texto.trim()}
          className="rounded-xl px-4 py-2.5 text-sm font-extrabold text-white disabled:opacity-50"
          style={{ background: T.teal }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
