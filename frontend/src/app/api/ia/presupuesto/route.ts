// DARIVO PRO — IA cotizaciones (catalog-aware, sin precios inventados)
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  buildSystemPrompt,
  recalcularTotalesIA,
  type IAPresupuestoItem,
  type IAPresupuestoResult,
} from "@/lib/presupuesto-ia";
import { CATALOGO } from "@/lib/catalog";
import {
  obtenerPlanTipo,
  verificarLimiteIA,
  registrarUsoIA,
} from "@/lib/plan-limits";
import type { Capitulo, Partida } from "@/types";

// ─── Server-side catalog merge (same logic as useCatalogo hook) ───────────────
interface CategoriaRow  { cat_id: string; nombre: string; emoji: string | null; color: string | null; es_base: boolean; activa: boolean; }
interface PartidaRow    { id: string; cap_id: string; nombre: string; tipo: Partida["tipo"]; precio: number | string; unidad: string | null; activa: boolean; }
interface PrecioRow     { svc_id: string; precio: number | string; }

// Module-level cache: avoids 3 Supabase queries per AI request.
// Lives in the Node.js worker process; TTL ensures price changes propagate within 5 min.
const _serverCatalogCache = new Map<string, { data: Capitulo[]; ts: number }>();
const SERVER_CATALOG_TTL  = 5 * 60 * 1000; // 5 minutes

async function getMergedCatalog(
  supabase: ReturnType<typeof createServerClient>,
  userId:  string
): Promise<Capitulo[]> {
  const cached = _serverCatalogCache.get(userId);
  if (cached && Date.now() - cached.ts < SERVER_CATALOG_TTL) return cached.data;

  const [{ data: cats }, { data: precios }, { data: propias }] = await Promise.all([
    supabase.from("categorias").select("cat_id, nombre, emoji, color, es_base, activa").eq("activa", true),
    supabase.from("precios_usuario").select("svc_id, precio"),
    supabase.from("partidas_propias").select("id, cap_id, nombre, tipo, precio, unidad, activa").eq("activa", true),
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
      emoji:  ov?.emoji  ?? cap.emoji,
      color:  ov?.color  ?? cap.color,
      partidas: [
        ...cap.partidas.map((p) => ({ ...p, precio: precioMap.get(p.id) ?? p.precio })),
        ...propiasRows
          .filter((pp) => pp.cap_id === cap.id)
          .map((pp) => ({ id: pp.id, nombre: pp.nombre, tipo: pp.tipo, precio: Number(pp.precio), unidad: pp.unidad ?? "", esPropia: true as const })),
      ],
    };
  });

  const nuevas: Capitulo[] = ((cats ?? []) as CategoriaRow[])
    .filter((c) => !c.es_base)
    .map((c) => ({
      id:       c.cat_id,
      nombre:   c.nombre,
      emoji:    c.emoji ?? "🔧",
      color:    c.color ?? "#2563EB",
      partidas: propiasRows
        .filter((pp) => pp.cap_id === c.cat_id)
        .map((pp) => ({ id: pp.id, nombre: pp.nombre, tipo: pp.tipo, precio: Number(pp.precio), unidad: pp.unidad ?? "", esPropia: true as const })),
    }));

  const result = [...merged, ...nuevas];
  _serverCatalogCache.set(userId, { data: result, ts: Date.now() });
  return result;
}

// ─── Claude response shape ────────────────────────────────────────────────────
interface ClaudeItem {
  svcId:    string;
  qty:      number;
  sugerida?: boolean;
  nota?:    string;
}
interface ClaudeResponse {
  titulo:         string;
  items:          ClaudeItem[];
  notasFaltantes?: string[];
}

function parseClaudeJSON(text: string): ClaudeResponse {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("La IA no devolvió JSON válido");
  const parsed = JSON.parse(match[0]) as ClaudeResponse;
  if (!Array.isArray(parsed.items)) throw new Error("Sin partidas en la respuesta");
  return parsed;
}

// ─── Resolver svcId → catalog item ───────────────────────────────────────────
function findPartida(catalog: Capitulo[], svcId: string): { cap: Capitulo; partida: Partida } | null {
  for (const cap of catalog) {
    const partida = cap.partidas.find((p) => p.id === svcId);
    if (partida) return { cap, partida };
  }
  return null;
}

// ─── Map tipo → calcType label ────────────────────────────────────────────────
const TIPO_UNIDAD: Record<Partida["tipo"], string> = {
  m2: "m²", unidad: "und", hora: "h", fijo: "fijo",
};

// ─── API handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada" }, { status: 503 });
  }

  const body = await req.json();
  const descripcion: string = (body.descripcion ?? "").trim();
  if (!descripcion) {
    return NextResponse.json({ error: "Descripción vacía" }, { status: 400 });
  }

  // 1. Run limit check + catalog merge in parallel (saves ~100-200ms)
  const [limite, catalog] = await Promise.all([
    verificarLimiteIA(supabase),
    getMergedCatalog(supabase, user.id),
  ]);

  if (!limite.ok) {
    return NextResponse.json(
      { error: "Límite diario de IA alcanzado (3/día)", razon: limite.razon },
      { status: 429 }
    );
  }

  // 2. Build system prompt with embedded catalog
  const systemPrompt = buildSystemPrompt(catalog);

  try {
    // 3. Call Claude (catalog is already loaded from cache or fresh fetch)
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Analiza este trabajo y genera el JSON de cotización (sin markdown):\n\n${descripcion}`,
        }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Anthropic error:", err);
      return NextResponse.json({ error: "Error al procesar con IA" }, { status: 502 });
    }

    const body2 = await res.json();
    const text: string = body2.content?.[0]?.text ?? "";

    // 4. Parse Claude's response
    const claudeResult = parseClaudeJSON(text);

    // 5. Map svcIds → real catalog prices (NEVER use Claude's prices)
    const mappedItems: IAPresupuestoItem[] = [];
    const sinCatalogo: string[] = claudeResult.notasFaltantes ?? [];

    for (const ci of claudeResult.items) {
      const found = findPartida(catalog, ci.svcId);
      if (!found) {
        // svcId not in catalog — add to missing list and skip
        sinCatalogo.push(`${ci.svcId} — ID no encontrado en catálogo`);
        continue;
      }
      const { cap, partida } = found;
      const qty = Math.max(0, Number(ci.qty) || 0);
      const price = partida.precio; // catalog price, never invented
      const unidad = TIPO_UNIDAD[partida.tipo] ?? partida.unidad;
      mappedItems.push({
        descripcion: partida.nombre + (ci.sugerida ? " — sugerida" : ""),
        cantidad:    qty,
        unidad,
        precio_unit: price,
        total:       Math.round(qty * price * 100) / 100,
        svcId:       partida.id,
        catLabel:    cap.nombre,
        sugerida:    ci.sugerida ?? false,
      });
    }

    if (!mappedItems.length) {
      return NextResponse.json(
        { error: "No se encontraron partidas del catálogo en la descripción. Intenta ser más específico.", sinCatalogo },
        { status: 422 }
      );
    }

    // 6. Calculate totals using catalog prices
    const resultado: IAPresupuestoResult = {
      ...recalcularTotalesIA(mappedItems),
      titulo:         claudeResult.titulo ?? "Cotización",
      items:          mappedItems,
      notasFaltantes: sinCatalogo.length ? sinCatalogo : undefined,
    };

    // 7. Register IA usage
    const plan = await obtenerPlanTipo(supabase);
    if (plan !== "pro" && plan !== "empresa") {
      await registrarUsoIA(supabase);
    }

    return NextResponse.json({ data: resultado });
  } catch (e) {
    console.error("IA error:", e);
    return NextResponse.json({ error: "No se pudo interpretar la respuesta de la IA" }, { status: 500 });
  }
}
