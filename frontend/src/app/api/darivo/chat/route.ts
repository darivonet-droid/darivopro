// DARIVO PRO — Darivo (Agente IA 2, ver 08-MODULO-IA.md §3-A). Endpoint público
// (no requiere sesión) y también usado por usuarios logueados. Sin cliente admin
// ni acceso a otras tablas de negocio — la única fuente de conocimiento es
// DARIVO-CONOCIMIENTO-SOPORTE.md (leído aquí, nunca la base de datos ni el código).
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { openaiChatText, OpenAIConfigError } from "@/lib/openai";
import { buildDarivoSystemPrompt, extraerEscalado, DARIVO_MAX_TURNOS_USUARIO } from "@/lib/darivo";
import { crearTicketSoporte } from "@/lib/soporte-server";
import { capture } from "@/lib/latitude";

interface ChatTurno {
  role: "user" | "assistant";
  content: string;
}

let conocimientoCache: { texto: string; ts: number } | null = null;
const CONOCIMIENTO_TTL = 5 * 60 * 1000;

function leerConocimiento(): string {
  if (conocimientoCache && Date.now() - conocimientoCache.ts < CONOCIMIENTO_TTL) {
    return conocimientoCache.texto;
  }
  const texto = readFileSync(join(process.cwd(), "src/content/darivo/conocimiento.md"), "utf8");
  conocimientoCache = { texto, ts: Date.now() };
  return texto;
}

// Protección anti-robots (08-MODULO-IA.md §5) — en memoria, por IP, best-effort.
// No es una defensa de seguridad crítica (se reinicia con el server), es la
// misma protección "20+ preguntas seguidas" descrita en el MD oficial.
const RATE_WINDOW_MS = 2 * 60 * 1000;
const RATE_MAX = 20;
const rateMap = new Map<string, { count: number; windowStart: number }>();

function limiteExcedido(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messages = Array.isArray(body.messages) ? (body.messages as ChatTurno[]) : [];

  if (!messages.length || messages[messages.length - 1]?.role !== "user") {
    return NextResponse.json({ error: "Falta el mensaje del usuario" }, { status: 400 });
  }

  const turnosUsuario = messages.filter((m) => m.role === "user").length;
  if (turnosUsuario > DARIVO_MAX_TURNOS_USUARIO) {
    return NextResponse.json({
      reply:
        "Estamos recibiendo muchos mensajes seguidos en esta conversación — dame un momento y volvemos a intentarlo, o escríbenos directamente a info@darivopro.com si es algo urgente.",
    });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limiteExcedido(ip)) {
    return NextResponse.json({
      reply: "Estamos recibiendo muchos mensajes seguidos — dame un momento y volvemos a intentarlo.",
    });
  }

  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const conocimiento = leerConocimiento();
  const systemPrompt = buildDarivoSystemPrompt(conocimiento, !!user);

  try {
    const reply = await capture(
      "darivo-chat",
      async () => {
        const raw = await openaiChatText({ system: systemPrompt, history: messages });
        const { visible, asunto } = extraerEscalado(raw);

        let replyText = visible;

        if (asunto && user) {
          const ultimoUsuario = [...messages].reverse().find((m) => m.role === "user");
          const ticket = await crearTicketSoporte(supabase, user, {
            asunto,
            descripcion: ultimoUsuario?.content ?? asunto,
          });
          if (ticket) {
            replyText += "\n\nYa registré tu caso, en breve alguien del equipo te escribe.";
          }
        }

        return replyText;
      },
      { userId: user?.id, tags: ["darivo", "soporte"] }
    );

    return NextResponse.json({ reply });
  } catch (e) {
    if (e instanceof OpenAIConfigError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    console.error("Darivo chat error:", e);
    return NextResponse.json(
      { error: "No se pudo responder en este momento, intenta de nuevo en un momento" },
      { status: 500 }
    );
  }
}
