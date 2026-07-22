// DARIVO PRO — IA cotizaciones (OpenAI · catálogo oficial)
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  buildSystemPrompt,
  recalcularTotalesIA,
  type IACotizacionItem,
  type IACotizacionResult,
} from "@/lib/cotizacion-ia";
import { CATALOGO } from "@/lib/catalog";
import {
  obtenerPlanTipo,
  verificarLimiteIA,
  registrarUsoIA,
} from "@/lib/plan-limits";
import { planTieneLimitesIlimitados } from "@/lib/roles-planes-oficial";
import { openaiChatJSON, OpenAIConfigError, parseJSONFromModel } from "@/lib/openai";
import { capture } from "@/lib/latitude";
import type { Capitulo, Partida } from "@/types";

interface CategoriaRow {
  cat_id: string;
  nombre: string;
  emoji: string | null;
  color: string | null;
  es_base: boolean;
  activa: boolean;
}
interface PartidaRow {
  id: string;
  cap_id: string;
  nombre: string;
  calc_type: Partida["calcType"];
  precio: number | string;
  unidad: string | null;
  activa: boolean;
}
interface PrecioRow {
  svc_id: string;
  precio: number | string;
}

const _serverCatalogCache = new Map<string, { data: Capitulo[]; ts: number }>();
const SERVER_CATALOG_TTL = 5 * 60 * 1000;

async function getMergedCatalog(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<Capitulo[]> {
  const cached = _serverCatalogCache.get(userId);
  if (cached && Date.now() - cached.ts < SERVER_CATALOG_TTL) return cached.data;

  const [{ data: cats }, { data: precios }, { data: propias }] = await Promise.all([
    supabase.from("categorias").select("cat_id, nombre, emoji, color, es_base, activa").eq("activa", true),
    supabase.from("precios_usuario").select("svc_id, precio"),
    supabase.from("partidas_propias").select("id, cap_id, nombre, calc_type, precio, unidad, activa").eq("activa", true),
  ]);

  const precioMap = new Map<string, number>(
    ((precios ?? []) as PrecioRow[]).map((p) => [p.svc_id, Number(p.precio)])
  );
  const overrideMap = new Map<string, CategoriaRow>(
    ((cats ?? []) as CategoriaRow[]).filter((c) => c.es_base).map((c) => [c.cat_id, c])
  );
  const propiasRows = (propias ?? []) as PartidaRow[];

  const merged: Capitulo[] = CATALOGO.map((cap) => {
    const ov = overrideMap.get(cap.id);
    return {
      ...cap,
      nombre: ov?.nombre ?? cap.nombre,
      emoji: ov?.emoji ?? cap.emoji,
      color: ov?.color ?? cap.color,
      partidas: [
        ...cap.partidas.map((p) => ({ ...p, precio: precioMap.get(p.id) ?? p.precio })),
        ...propiasRows
          .filter((pp) => pp.cap_id === cap.id)
          .map((pp) => ({
            id: pp.id,
            nombre: pp.nombre,
            calcType: pp.calc_type,
            precio: Number(pp.precio),
            unidad: pp.unidad ?? "",
            esPropia: true as const,
          })),
      ],
    };
  });

  const nuevas: Capitulo[] = ((cats ?? []) as CategoriaRow[])
    .filter((c) => !c.es_base)
    .map((c) => ({
      id: c.cat_id,
      nombre: c.nombre,
      emoji: c.emoji ?? "🔧",
      color: c.color ?? "#2563EB",
      partidas: propiasRows
        .filter((pp) => pp.cap_id === c.cat_id)
        .map((pp) => ({
          id: pp.id,
          nombre: pp.nombre,
          calcType: pp.calc_type,
          precio: Number(pp.precio),
          unidad: pp.unidad ?? "",
          esPropia: true as const,
        })),
    }));

  const result = [...merged, ...nuevas];
  _serverCatalogCache.set(userId, { data: result, ts: Date.now() });
  return result;
}

interface IAItemResponse {
  svcId: string;
  qty: number;
  sugerida?: boolean;
  nota?: string;
}
interface IACotizacionIAJson {
  titulo: string;
  items: IAItemResponse[];
  notasFaltantes?: string[];
}

type IACotizacionCaptura =
  | { ok: true; resultado: IACotizacionResult }
  | { ok: false; sinCatalogo: string[] };

function findPartida(catalog: Capitulo[], svcId: string): { cap: Capitulo; partida: Partida } | null {
  for (const cap of catalog) {
    const partida = cap.partidas.find((p) => p.id === svcId);
    if (partida) return { cap, partida };
  }
  return null;
}

const TIPO_UNIDAD: Record<Partida["calcType"], string> = {
  m2: "m²",
  unit: "und",
  hour: "h",
  fixed: "fijo",
};

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
  if (!descripcion) {
    return NextResponse.json({ error: "Descripción vacía" }, { status: 400 });
  }

  const [limite, catalog] = await Promise.all([
    verificarLimiteIA(supabase),
    getMergedCatalog(supabase, user.id),
  ]);

  if (!limite.ok) {
    return NextResponse.json(
      { error: "Límite diario de IA alcanzado", razon: limite.razon },
      { status: 429 }
    );
  }

  const systemPrompt = buildSystemPrompt(catalog);

  try {
    const captura = await capture(
      "ia-cotizacion",
      async (): Promise<IACotizacionCaptura> => {
        const text = await openaiChatJSON({
          system: systemPrompt,
          user: `Analiza este trabajo y genera el JSON de cotización:\n\n${descripcion}`,
        });

        const iaResult = parseJSONFromModel<IACotizacionIAJson>(text);
        if (!Array.isArray(iaResult.items)) {
          throw new Error("Sin partidas en la respuesta");
        }

        const mappedItems: IACotizacionItem[] = [];
        const sinCatalogo: string[] = iaResult.notasFaltantes ?? [];

        for (const ci of iaResult.items) {
          const found = findPartida(catalog, ci.svcId);
          if (!found) {
            sinCatalogo.push(`${ci.svcId} — ID no encontrado en catálogo`);
            continue;
          }
          const { cap, partida } = found;
          const qty = Math.max(0, Number(ci.qty) || 0);
          const price = partida.precio;
          mappedItems.push({
            descripcion: partida.nombre + (ci.sugerida ? " — sugerida" : ""),
            cantidad: qty,
            unidad: TIPO_UNIDAD[partida.calcType] ?? partida.unidad,
            precio_unit: price,
            total: Math.round(qty * price * 100) / 100,
            svcId: partida.id,
            catLabel: cap.nombre,
            sugerida: ci.sugerida ?? false,
          });
        }

        if (!mappedItems.length) {
          return { ok: false, sinCatalogo };
        }

        const resultado: IACotizacionResult = {
          ...recalcularTotalesIA(mappedItems),
          titulo: iaResult.titulo ?? "Cotización",
          items: mappedItems,
          notasFaltantes: sinCatalogo.length ? sinCatalogo : undefined,
        };
        return { ok: true, resultado };
      },
      { userId: user.id, tags: ["ia", "cotizacion"] }
    );

    if (!captura.ok) {
      return NextResponse.json(
        {
          error: "No se encontraron partidas del catálogo en la descripción. Intenta ser más específico.",
          sinCatalogo: captura.sinCatalogo,
        },
        { status: 422 }
      );
    }

    const plan = await obtenerPlanTipo(supabase);
    if (!planTieneLimitesIlimitados(plan)) {
      await registrarUsoIA(supabase);
    }

    return NextResponse.json({ data: captura.resultado });
  } catch (e) {
    if (e instanceof OpenAIConfigError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    console.error("IA cotizacion error:", e);
    return NextResponse.json({ error: "No se pudo interpretar la respuesta de la IA" }, { status: 500 });
  }
}
