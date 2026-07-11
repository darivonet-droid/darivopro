// DARIVO PRO — Cliente Gmail API (envío server-to-server vía domain-wide delegation)
//
// Requiere una cuenta de servicio de Google Cloud con "domain-wide delegation"
// habilitada en el Workspace de darivopro.com (scope gmail.send), autorizada
// para impersonar cualquier cuenta del dominio (info@, facturacion@, noreply@,
// partners@, soporte@). Con esto UN solo credential JSON sirve para las 5
// cuentas — no hace falta un OAuth consent flow por cuenta.
//
// Setup manual pendiente del propietario (no se puede hacer desde código):
// 1. Google Cloud Console → crear proyecto (o usar uno existente) → habilitar
//    "Gmail API".
// 2. IAM & Admin → Service Accounts → crear cuenta de servicio → generar clave
//    JSON (Keys → Add key → JSON). Guardar el contenido completo del JSON.
// 3. Copiar el "Client ID" (numérico) de esa cuenta de servicio.
// 4. Google Workspace Admin Console (admin.google.com) → Seguridad → Control
//    de acceso a la API → Delegación en todo el dominio → Añadir nuevo:
//    Client ID = el del paso 3, Scopes = https://www.googleapis.com/auth/gmail.send
// 5. En Vercel (o .env.local para desarrollo): variable GMAIL_SERVICE_ACCOUNT_JSON
//    con el contenido completo del JSON del paso 2 (como string de una sola línea).
//
// Sin esa delegación, cualquier llamada a enviarGmail() falla con un error de
// autorización claro (no falla en silencio).

import { google } from "googleapis";

function credencialesCuentaServicio(): { client_email: string; private_key: string } {
  const raw = process.env.GMAIL_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "GMAIL_SERVICE_ACCOUNT_JSON no configurada — ver setup manual en gmail-client.ts"
    );
  }
  try {
    const parsed = JSON.parse(raw) as { client_email?: string; private_key?: string };
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error("faltan client_email/private_key en el JSON");
    }
    return { client_email: parsed.client_email, private_key: parsed.private_key };
  } catch (e) {
    throw new Error(
      `GMAIL_SERVICE_ACCOUNT_JSON inválida: ${e instanceof Error ? e.message : String(e)}`
    );
  }
}

/** Cliente Gmail autenticado "como" la cuenta remitente (impersonación vía subject). */
function clienteGmailPara(cuentaRemitente: string) {
  const { client_email, private_key } = credencialesCuentaServicio();
  const auth = new google.auth.JWT({
    email: client_email,
    key: private_key,
    scopes: ["https://www.googleapis.com/auth/gmail.send"],
    subject: cuentaRemitente,
  });
  return google.gmail({ version: "v1", auth });
}

function construirMensajeRaw(opts: {
  from: string;
  to: string;
  subject: string;
  html: string;
}): string {
  const asuntoCodificado = `=?UTF-8?B?${Buffer.from(opts.subject, "utf-8").toString("base64")}?=`;
  const mensaje = [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${asuntoCodificado}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    opts.html,
  ].join("\r\n");

  return Buffer.from(mensaje)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Envía un correo real vía Gmail API. Lanza si falla — el llamador decide si es best-effort. */
export async function enviarGmail(opts: {
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const gmail = clienteGmailPara(opts.from);
  const raw = construirMensajeRaw(opts);
  await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
}
