/**
 * DARIVO PRO — Verificar migración 013 + prueba de cotización
 * Uso: node scripts/verify-migration-013.mjs [--apply]
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

const feEnv = loadEnv(path.join(root, "frontend", ".env.local"));
const sbEnv = loadEnv(path.join(root, "supabase", ".env"));
const env = { ...feEnv, ...sbEnv };

const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
const ref = env.SUPABASE_PROJECT_REF || "vyrtokggypcmpforglch";
const dbPassword = env.SUPABASE_DB_PASSWORD;

const results = [];

function ok(name, detail) {
  results.push({ name, status: "PASS", detail });
  console.log(`✅ ${name}: ${detail}`);
}
function fail(name, detail) {
  results.push({ name, status: "FAIL", detail });
  console.error(`❌ ${name}: ${detail}`);
}

async function fetchSchema() {
  const r = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  const j = await r.json();
  return j.definitions || {};
}

function hasColumns(defs, table, cols) {
  const props = defs[table]?.properties || {};
  return cols.every((c) => c in props);
}

async function applyMigration() {
  if (!dbPassword) throw new Error("Falta SUPABASE_DB_PASSWORD en supabase/.env");
  const { Client } = await import("pg");
  const sql = fs.readFileSync(
    path.join(root, "supabase", "migrations", "013_align_schema_to_code.sql"),
    "utf8"
  );
  const hosts = [
    `postgresql://postgres.${ref}:${encodeURIComponent(dbPassword)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${ref}.supabase.co:5432/postgres`,
  ];
  let lastErr;
  for (const conn of hosts) {
    const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      await client.query(sql);
      await client.end();
      ok("APLICAR 013", "Migración ejecutada correctamente");
      return;
    } catch (e) {
      lastErr = e;
      try { await client.end(); } catch {}
    }
  }
  throw lastErr;
}

async function testCotizacion(defs) {
  const required = [
    "id", "user_id", "cot_num", "client_name", "phone", "city", "margin",
    "total_base", "total_labor", "total_final", "status", "notes",
    "pdf_url", "wa_enviado_at", "created_at", "updated_at",
  ];
  if (!hasColumns(defs, "presupuestos", required)) {
    fail("ESQUEMA presupuestos", `Faltan columnas. Actual: ${Object.keys(defs.presupuestos?.properties || {}).join(", ")}`);
    return null;
  }
  ok("ESQUEMA presupuestos", "Todas las columnas esperadas por el código existen");

  // Obtener un user_id real de perfiles
  const perfRes = await fetch(`${url}/rest/v1/perfiles?select=id&limit=1`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  const perfiles = await perfRes.json();
  if (!perfiles?.[0]?.id) {
    fail("INSERT cotización", "No hay usuarios en perfiles para probar");
    return null;
  }
  const userId = perfiles[0].id;

  const insertRes = await fetch(`${url}/rest/v1/presupuestos`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      user_id: userId,
      client_name: "Cliente Prueba 013",
      phone: "999888777",
      city: "Lima",
      margin: 40,
      total_base: 100,
      total_labor: 50,
      total_final: 210,
      status: "Borrador",
      notes: "Prueba automática migración 013",
    }),
  });
  const inserted = await insertRes.json();
  if (!insertRes.ok) {
    fail("INSERT cotización", JSON.stringify(inserted));
    return null;
  }
  const row = inserted[0] || inserted;
  if (!row.cot_num?.match(/^COT-\d{3}$/)) {
    fail("NUMERACIÓN COT", `cot_num inesperado: ${row.cot_num}`);
  } else {
    ok("NUMERACIÓN COT", `Asignado ${row.cot_num} automáticamente`);
  }
  ok("INSERT cotización", `Guardado id=${row.id}`);

  // Insertar partida
  const itemRes = await fetch(`${url}/rest/v1/presupuesto_items`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      presupuesto_id: row.id,
      svc_id: "alb-muro",
      cat_label: "Albañilería",
      svc_label: "Muro de ladrillo",
      calc_type: "m2",
      base_price: 85,
      unit: "m²",
      qty: 10,
      unit_price: 119,
      subtotal: 1190,
    }),
  });
  const item = await itemRes.json();
  if (!itemRes.ok) fail("INSERT partida", JSON.stringify(item));
  else ok("INSERT partida", "presupuesto_items guardado");

  // Listar como hace la app
  const listRes = await fetch(
    `${url}/rest/v1/presupuestos?select=id,cot_num,client_name,total_final,status&order=created_at.desc&limit=5`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  const list = await listRes.json();
  const found = list.find((p) => p.id === row.id);
  if (found) ok("LISTA cotizaciones", `${found.cot_num} — ${found.client_name} — S/ ${found.total_final}`);
  else fail("LISTA cotizaciones", "No aparece en la consulta de lista");

  return row;
}

async function verifyUntouched(defs) {
  const checks = [
    ["cotizacion_series", ["user_id", "ultimo_num"]],
    ["comprobante_series", ["serie", "ultimo_num"]],
    ["perfiles", ["plan_tipo", "onboarding_done", "categorias", "cta_detracciones"]],
    ["categorias", ["cat_id", "nombre", "emoji", "color", "es_base", "activa"]],
    ["ia_uso_diario", ["user_id", "fecha", "llamadas"]],
    ["calculos_log", ["presupuesto_id", "total_materiales", "total_final"]],
    ["facturas", [
      "inv_id", "inv_num", "tipo_doc", "detraccion_tipo", "detraccion_pct",
      "detraccion_monto", "neto_cobrar", "from_quote_id", "client_name",
    ]],
    ["clientes", ["nombre", "ruc", "ciudad", "notas"]],
  ];
  for (const [table, cols] of checks) {
    if (hasColumns(defs, table, cols)) ok(`INTACTO ${table}`, cols.join(", "));
    else fail(`INTACTO ${table}`, `Faltan: ${cols.filter(c => !(defs[table]?.properties||{})[c]).join(", ")}`);
  }
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log("=== DARIVO PRO — Verificación migración 013 ===\n");

  if (apply) {
    try {
      await applyMigration();
    } catch (e) {
      fail("APLICAR 013", e.message);
    }
  }

  const defs = await fetchSchema();
  await verifyUntouched(defs);

  const presCols = Object.keys(defs.presupuestos?.properties || {});
  const driftBefore = presCols.includes("titulo") || presCols.includes("numero");
  if (driftBefore) {
    console.log("\n⚠️  Drift detectado: presupuestos aún tiene columnas viejas (titulo/numero).");
    console.log("   Ejecuta: node scripts/verify-migration-013.mjs --apply\n");
  } else {
    await testCotizacion(defs);
  }

  console.log("\n=== RESUMEN ===");
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  console.log(`PASS: ${passed}  FAIL: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
