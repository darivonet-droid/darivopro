/**
 * Limpia usuarios y datos E2E post-migración 013
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}

const env = loadEnv(path.join(root, "frontend", ".env.local"));
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

const hdr = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

async function admin(path, opts = {}) {
  const r = await fetch(`${url}${path}`, { ...opts, headers: { ...hdr, ...(opts.headers || {}) } });
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { ok: r.ok, status: r.status, body };
}

async function main() {
  const list = await admin("/auth/v1/admin/users?per_page=200");
  const users = (list.body?.users ?? []).filter((u) =>
    u.email?.startsWith("e2e-013-")
  );

  console.log(`Usuarios E2E encontrados: ${users.length}`);
  for (const u of users) console.log(`  - ${u.email} (${u.id})`);

  const pdfPaths = new Set([
    "pdfs/presupuesto-eab34581-f60e-49b9-95a5-080078ba7a40-20260623.pdf",
  ]);

  for (const u of users) {
    const uid = u.id;

    const { body: pres } = await admin(
      `/rest/v1/presupuestos?user_id=eq.${uid}&select=id,pdf_url`
    );
    for (const p of pres ?? []) {
      if (p.pdf_url?.includes("/documentos/")) {
        const m = p.pdf_url.match(/documentos\/(.+)$/);
        if (m) pdfPaths.add(m[1]);
      }
      await admin(`/rest/v1/presupuesto_items?presupuesto_id=eq.${p.id}`, { method: "DELETE" });
      await admin(`/rest/v1/calculos_log?presupuesto_id=eq.${p.id}`, { method: "DELETE" });
    }
    await admin(`/rest/v1/presupuestos?user_id=eq.${uid}`, { method: "DELETE" });
    await admin(`/rest/v1/clientes?user_id=eq.${uid}`, { method: "DELETE" });
    await admin(`/rest/v1/cotizacion_series?user_id=eq.${uid}`, { method: "DELETE" });
    await admin(`/rest/v1/perfiles?id=eq.${uid}`, { method: "DELETE" });
    await admin(`/rest/v1/ia_uso_diario?user_id=eq.${uid}`, { method: "DELETE" });

    const del = await admin(`/auth/v1/admin/users/${uid}`, { method: "DELETE" });
    console.log(del.ok ? `✅ Usuario eliminado: ${u.email}` : `❌ Usuario ${u.email}: ${JSON.stringify(del.body)}`);
  }

  // Presupuesto huérfano del script verify (service role, sin user e2e)
  const { body: orphan } = await admin(
    `/rest/v1/presupuestos?client_name=eq.Cliente Prueba 013&select=id,pdf_url`
  );
  for (const p of orphan ?? []) {
    await admin(`/rest/v1/presupuesto_items?presupuesto_id=eq.${p.id}`, { method: "DELETE" });
    await admin(`/rest/v1/calculos_log?presupuesto_id=eq.${p.id}`, { method: "DELETE" });
    await admin(`/rest/v1/presupuestos?id=eq.${p.id}`, { method: "DELETE" });
    console.log(`✅ Cotización huérfana eliminada: ${p.id}`);
  }

  for (const p of pdfPaths) {
    const del = await admin(`/storage/v1/object/documentos/${p}`, { method: "DELETE" });
    console.log(del.ok || del.status === 404 ? `✅ PDF eliminado: ${p}` : `⚠️ PDF ${p}: ${del.status}`);
  }

  // Verificación final
  const check = await admin("/rest/v1/presupuestos?select=id,client_name,cot_num");
  const remaining = (check.body ?? []).filter(
    (r) => r.client_name?.includes("E2E") || r.client_name?.includes("Prueba 013")
  );
  console.log("\n=== Verificación ===");
  console.log(`Cotizaciones de prueba restantes: ${remaining.length}`);
  if (remaining.length) console.log(remaining);

  const cli = await admin("/rest/v1/clientes?nombre=eq.Constructora E2E SAC&select=id");
  console.log(`Clientes 'Constructora E2E SAC': ${(cli.body ?? []).length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
