// DARIVO PRO — IA análisis gastos (Cierre · OpenAI Vision/texto)
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  buildGastoSystemPrompt,
  normalizarGastoIA,
  type GastoIAExtraccion,
} from "@/lib/gasto-ia";
import {
  obtenerPlanTipo,
  verificarLimiteIA,
  registrarUsoIA,
} from "@/lib/plan-limits";
import { planTieneLimitesIlimitados } from "@/lib/roles-planes-oficial";
import {
  openaiChatJSON,
  openaiVisionJSON,
  OpenAIConfigError,
  parseJSONFromModel,
} from "@/lib/openai";

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const descripcion: string = (body.descripcion ?? "").trim();
  const imageBase64: string = (body.imageBase64 ?? "").trim();
  const mimeType: string = body.mimeType ?? "image/jpeg";

  if (!descripcion && !imageBase64) {
    return NextResponse.json(
      { error: "Proporciona descripción o imagen del documento" },
      { status: 400 }
    );
  }

  const limite = await verificarLimiteIA(supabase);
  if (!limite.ok) {
    return NextResponse.json(
      { error: "Límite diario de IA alcanzado", razon: limite.razon },
      { status: 429 }
    );
  }

  const system = buildGastoSystemPrompt();

  try {
    let text: string;
    if (imageBase64) {
      text = await openaiVisionJSON({
        system,
        userText:
          descripcion ||
          "Analiza este documento de gasto y extrae los campos en JSON.",
        imageBase64,
        mimeType,
      });
    } else {
      text = await openaiChatJSON({
        system,
        user: `Extrae los datos del gasto descrito:\n\n${descripcion}`,
      });
    }

    const raw = parseJSONFromModel<GastoIAExtraccion>(text);
    const data = normalizarGastoIA(raw);

    const plan = await obtenerPlanTipo(supabase);
    if (!planTieneLimitesIlimitados(plan)) {
      await registrarUsoIA(supabase);
    }

    return NextResponse.json({ data });
  } catch (e) {
    if (e instanceof OpenAIConfigError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    console.error("IA gasto error:", e);
    return NextResponse.json({ error: "No se pudo analizar el documento" }, { status: 500 });
  }
}
