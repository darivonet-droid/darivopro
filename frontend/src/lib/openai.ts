/**
 * Cliente OpenAI API — registro oficial 08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md §5.2
 */

export class OpenAIConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIConfigError";
  }
}

function apiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new OpenAIConfigError("OPENAI_API_KEY no configurada");
  return key;
}

function model(vision = false): string {
  if (vision) return process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini";
  return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
}

type ChatMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | {
      role: "user";
      content: Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
    };

export async function openaiChatJSON(options: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: options.system },
    { role: "user", content: options.user },
  ];
  return openaiRequest(messages, options.maxTokens ?? 1024, false, true);
}

/**
 * Chat de texto libre, multi-turno (sin forzar JSON) — usado por Darivo.
 * `history` no debe incluir el mensaje `system`, ese va aparte en `system`.
 */
export async function openaiChatText(options: {
  system: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
}): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: options.system },
    ...options.history,
  ];
  return openaiRequest(messages, options.maxTokens ?? 500, false, false);
}

export async function openaiVisionJSON(options: {
  system: string;
  userText: string;
  imageBase64: string;
  mimeType?: string;
  maxTokens?: number;
}): Promise<string> {
  const mime = options.mimeType ?? "image/jpeg";
  const messages: ChatMessage[] = [
    { role: "system", content: options.system },
    {
      role: "user",
      content: [
        { type: "text", text: options.userText },
        {
          type: "image_url",
          image_url: { url: `data:${mime};base64,${options.imageBase64}` },
        },
      ],
    },
  ];
  return openaiRequest(messages, options.maxTokens ?? 1024, true, true);
}

async function openaiRequest(
  messages: ChatMessage[],
  maxTokens: number,
  vision: boolean,
  jsonMode: boolean
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      model: model(vision),
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: "json_object" as const } } : {}),
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("OpenAI error:", err);
    throw new Error("Error al procesar con OpenAI");
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = body.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("Respuesta vacía de OpenAI");
  return text;
}

export function parseJSONFromModel<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("La IA no devolvió JSON válido");
  return JSON.parse(match[0]) as T;
}
