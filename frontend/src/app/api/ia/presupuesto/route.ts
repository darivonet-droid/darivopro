import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { IA_SYSTEM_PROMPT, parseIAResponse } from "@/lib/presupuesto-ia";

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY no configurada" },
      { status: 503 }
    );
  }

  const { descripcion } = await req.json();
  if (!descripcion?.trim()) {
    return NextResponse.json({ error: "Descripción vacía" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: IA_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Genera el presupuesto en JSON puro (sin markdown):\n\n${descripcion.trim()}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Anthropic error:", err);
      return NextResponse.json({ error: "Error al procesar con IA" }, { status: 502 });
    }

    const body = await res.json();
    const text = body.content?.[0]?.text ?? "";
    const resultado = parseIAResponse(text);

    return NextResponse.json({ data: resultado });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo interpretar la respuesta" }, { status: 500 });
  }
}
