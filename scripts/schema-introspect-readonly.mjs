/**
 * DARIVO PRO — Introspección read-only: índices, RLS, políticas, triggers
 * Uso: node scripts/schema-introspect-readonly.mjs
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

const env = {
  ...loadEnv(path.join(root, "frontend", ".env.local")),
  ...loadEnv(path.join(root, "supabase", ".env")),
};
for (const [k, v] of Object.entries(process.env)) {
  if (v) env[k] = v;
}

const ref = env.SUPABASE_PROJECT_REF || "vyrtokggypcmpforglch";
const pwd = env.SUPABASE_DB_PASSWORD;

if (!pwd) {
  console.error("BLOCKED: Falta SUPABASE_DB_PASSWORD en supabase/.env o en variables de entorno.");
  process.exit(2);
}

const { Client } = await import("pg");

const hosts = [
  `postgresql://postgres.${ref}:${encodeURIComponent(pwd)}@aws-1-us-west-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres:${encodeURIComponent(pwd)}@db.${ref}.supabase.co:5432/postgres`,
];

const queries = [
  {
    name: "INDICES",
    sql: `SELECT tablename, indexname, indexdef
          FROM pg_indexes
          WHERE schemaname = 'public'
          ORDER BY tablename, indexname`,
  },
  {
    name: "RLS_ACTIVO",
    sql: `SELECT c.relname AS tabla, c.relrowsecurity AS rls_activo
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public' AND c.relkind = 'r'
          ORDER BY c.relname`,
  },
  {
    name: "POLITICAS_RLS",
    sql: `SELECT tablename, policyname, cmd, roles::text AS roles, qual, with_check
          FROM pg_policies
          WHERE schemaname = 'public'
          ORDER BY tablename, policyname`,
  },
  {
    name: "TRIGGERS",
    sql: `SELECT event_object_table AS tabla, trigger_name, action_timing,
                 event_manipulation, action_statement
          FROM information_schema.triggers
          WHERE trigger_schema = 'public'
          ORDER BY event_object_table, trigger_name`,
  },
];

let client;
let connected = false;
for (const conn of hosts) {
  client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    connected = true;
    break;
  } catch {
    try {
      await client.end();
    } catch {}
  }
}

if (!connected) {
  console.error("CONNECT_FAILED: no se pudo conectar a Postgres con SUPABASE_DB_PASSWORD.");
  process.exit(3);
}

for (const { name, sql } of queries) {
  console.log(`\n===== ${name} =====`);
  const res = await client.query(sql);
  console.log(JSON.stringify(res.rows, null, 2));
}

await client.end();
