/**
 * DARIVO PRO — Checklist E2E post-migración 013
 * Simula: Partidas → Cliente → Resumen → Guardar + cliente + lista + PDF
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const require = createRequire(path.join(root, "frontend", "package.json"));
const { createClient } = require("@supabase/supabase-js");

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

const env = { ...loadEnv(path.join(root, "frontend", ".env.local")) };
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const TEST_EMAIL = `e2e-013-${Date.now()}@darivo.pro`;
const TEST_PASS = "E2eTest013!Darivo";

const results = [];
function pass(step, detail) {
  results.push({ step, ok: true, detail });
  console.log(`✅ ${step}: ${detail}`);
}
function fail(step, detail) {
  results.push({ step, ok: false, detail });
  console.error(`❌ ${step}: ${detail}`);
}

async function admin(path, opts = {}) {
  const r = await fetch(`${url}${path}`, {
    ...opts,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { ok: r.ok, status: r.status, body };
}

async function main() {
  console.log("=== CHECKLIST E2E — Post migración 013 ===\n");

  // Crear usuario de prueba
  const createUser = await admin("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASS,
      email_confirm: true,
    }),
  });
  if (!createUser.ok) {
    fail("SETUP usuario", JSON.stringify(createUser.body));
    return summary();
  }
  const userId = createUser.body.id;
  pass("SETUP usuario", `${TEST_EMAIL} (${userId.slice(0, 8)}…)`);

  // Perfil (trigger puede no haber corrido)
  await admin("/rest/v1/perfiles", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      id: userId,
      razon_social: "Empresa E2E 013",
      onboarding_done: true,
      plan_tipo: "pro",
    }),
  });

  const supabase = createClient(url, anonKey);
  const { error: signErr } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASS,
  });
  if (signErr) {
    fail("LOGIN", signErr.message);
    return summary();
  }
  pass("LOGIN", "Sesión autenticada (RLS activo)");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    fail("SESION", "No se obtuvo usuario autenticado");
    return summary();
  }

  // ── PASO: Crear cliente con RUC y ciudad ──
  const { data: cliente, error: cliErr } = await supabase
    .from("clientes")
    .insert({
      user_id: user.id,
      nombre: "Constructora E2E SAC",
      telefono: "987654321",
      ruc: "20123456789",
      direccion: "Av. Prueba 123",
      ciudad: "Lima",
      notas: "Cliente prueba post-013",
    })
    .select()
    .single();

  if (cliErr) fail("CREAR cliente (RUC + ciudad)", cliErr.message);
  else pass("CREAR cliente (RUC + ciudad)", `${cliente.nombre} — RUC ${cliente.ruc} — ${cliente.ciudad}`);

  // ── PASO: Cotización (Partidas → Cliente → Resumen → Guardar) ──
  const partidas = [
    {
      svcId: "alb-muro",
      catLabel: "Albañilería",
      svcLabel: "Muro de ladrillo",
      calcType: "m2",
      basePrice: 85,
      unit: "m²",
      qty: 12,
      unitPrice: 119,
      subtotal: 1428,
    },
    {
      svcId: "pin-interior",
      catLabel: "Pintura",
      svcLabel: "Pintura interior (2 manos)",
      calcType: "m2",
      basePrice: 18,
      unit: "m²",
      qty: 30,
      unitPrice: 25.2,
      subtotal: 756,
    },
  ];
  const totalBase = 1428 + 756;
  const totalLabor = 0;
  const margin = 40;
  const totalFinal = Math.round(totalBase * (1 + margin / 100));

  const { data: pres, error: presErr } = await supabase
    .from("presupuestos")
    .insert({
      user_id: user.id,
      client_name: cliente?.nombre ?? "Constructora E2E SAC",
      phone: cliente?.telefono ?? "987654321",
      city: cliente?.ciudad ?? "Lima",
      margin,
      total_base: totalBase,
      total_labor: totalLabor,
      total_final: totalFinal,
      status: "Borrador",
      notes: "Cotización E2E — verificación migración 013",
    })
    .select()
    .single();

  if (presErr) {
    fail("GUARDAR cotización", presErr.message);
    return summary();
  }
  pass("GUARDAR cotización", `id=${pres.id} — total S/ ${pres.total_final}`);

  // Partidas
  const { error: itemsErr } = await supabase.from("presupuesto_items").insert(
    partidas.map((it) => ({
      presupuesto_id: pres.id,
      svc_id: it.svcId,
      cat_label: it.catLabel,
      svc_label: it.svcLabel,
      calc_type: it.calcType,
      base_price: it.basePrice,
      unit: it.unit,
      qty: it.qty,
      unit_price: it.unitPrice,
      subtotal: it.subtotal,
    }))
  );
  if (itemsErr) fail("INSERT partidas", itemsErr.message);
  else pass("INSERT partidas", `${partidas.length} líneas guardadas`);

  // ── PASO: Numeración COT ──
  const { data: presFull, error: cotErr } = await supabase
    .from("presupuestos")
    .select("cot_num")
    .eq("id", pres.id)
    .single();

  if (cotErr) fail("NUMERACIÓN COT", cotErr.message);
  else if (!presFull?.cot_num?.match(/^COT-\d{3}$/))
    fail("NUMERACIÓN COT", `Formato inesperado: ${presFull?.cot_num}`);
  else pass("NUMERACIÓN COT", presFull.cot_num);

  // ── PASO: Lista de cotizaciones ──
  const { data: lista, error: listErr } = await supabase
    .from("presupuestos")
    .select("id, cot_num, client_name, total_final, status, items:presupuesto_items(svc_label, subtotal)")
    .order("created_at", { ascending: false });

  if (listErr) fail("LISTA cotizaciones", listErr.message);
  else {
    const found = lista?.find((p) => p.id === pres.id);
    if (found)
      pass("LISTA cotizaciones", `${found.cot_num} — ${found.client_name} — S/ ${found.total_final} — ${found.items?.length ?? 0} partidas`);
    else fail("LISTA cotizaciones", "No aparece la cotización recién creada");
  }

  // ── PASO: PDF (misma lógica que /api/pdf/presupuesto) ──
  try {
    const { generarPdfPresupuesto } = await import(
      path.join(root, "frontend", "src", "lib", "pdf", "generate.ts")
    ).catch(() => ({ generarPdfPresupuesto: null }));

    if (!generarPdfPresupuesto) {
      // Fallback: generar vía child process tsx
      const { execSync } = await import("child_process");
      const pdfScript = `
        import { generarPdfPresupuesto } from './src/lib/pdf/generate.ts';
        const url = await generarPdfPresupuesto({
          id: '${pres.id}',
          cot_num: '${presFull?.cot_num ?? ""}',
          client_name: '${pres.client_name}',
          city: '${pres.city ?? ""}',
          phone: '${pres.phone ?? ""}',
          status: '${pres.status}',
          margin: ${pres.margin},
          total_base: ${pres.total_base},
          total_labor: ${pres.total_labor},
          total_final: ${pres.total_final},
          notes: '${(pres.notes ?? "").replace(/'/g, "")}',
          items: ${JSON.stringify(partidas.map(p => ({
            cat_label: p.catLabel, svc_label: p.svcLabel,
            qty: p.qty, unit: p.unit, unit_price: p.unitPrice, subtotal: p.subtotal
          })))},
        });
        console.log(url);
      `;
      const tmp = path.join(root, "frontend", ".e2e-pdf.mjs");
      fs.writeFileSync(tmp, pdfScript);
      const out = execSync(`npx tsx ${tmp}`, { cwd: path.join(root, "frontend"), encoding: "utf8" }).trim();
      fs.unlinkSync(tmp);
      if (out.startsWith("http")) {
        await supabase.from("presupuestos").update({ pdf_url: out }).eq("id", pres.id);
        pass("GENERAR PDF", out);
      } else fail("GENERAR PDF", out);
    }
  } catch (e) {
    // Direct tsx approach
    try {
      const { execSync } = await import("child_process");
      const itemsJson = JSON.stringify(
        partidas.map((p) => ({
          cat_label: p.catLabel,
          svc_label: p.svcLabel,
          qty: p.qty,
          unit: p.unit,
          unit_price: p.unitPrice,
          subtotal: p.subtotal,
        }))
      );
      const cmd = `npx tsx -e "import { generarPdfPresupuesto } from './src/lib/pdf/generate.ts'; generarPdfPresupuesto({ id: '${pres.id}', cot_num: '${presFull?.cot_num}', client_name: '${pres.client_name}', city: '${pres.city}', phone: '${pres.phone}', status: '${pres.status}', margin: ${pres.margin}, total_base: ${pres.total_base}, total_labor: ${pres.total_labor}, total_final: ${pres.total_final}, notes: 'E2E', items: ${itemsJson.replace(/"/g, '\\"')} }).then(u=>console.log(u)).catch(e=>{console.error(e);process.exit(1)})"`;
      const out = execSync(cmd, { cwd: path.join(root, "frontend"), encoding: "utf8", shell: true }).trim();
      const pdfUrl = out.split("\n").pop();
      if (pdfUrl?.startsWith("http")) {
        await supabase.from("presupuestos").update({ pdf_url: pdfUrl }).eq("id", pres.id);
        pass("GENERAR PDF", pdfUrl);
      } else fail("GENERAR PDF", out);
    } catch (e2) {
      fail("GENERAR PDF", e2.message);
    }
  }

  // ── PASO: Consola — buscar errores "column does not exist" en queries clave ──
  const queries = [
    ["presupuestos", () => supabase.from("presupuestos").select("id, client_name, cot_num, status, total_final, pdf_url")],
    ["facturas", () => supabase.from("facturas").select("inv_id, inv_num, client_name, tipo_doc, total_final")],
    ["clientes", () => supabase.from("clientes").select("id, nombre, ruc, ciudad, notas")],
    ["dashboard", () => supabase.from("presupuestos").select("id, status")],
    ["informes", () => supabase.from("presupuestos").select("total_final, status, client_name")],
  ];
  let colErrors = 0;
  for (const [name, fn] of queries) {
    const { error } = await fn();
    if (error?.message?.includes("column") || error?.message?.includes("does not exist")) {
      fail(`CONSOLA equivalente (${name})`, error.message);
      colErrors++;
    }
  }
  if (colErrors === 0)
    pass('0 errores "column does not exist"', `${queries.length} consultas críticas OK (vía API autenticada)`);

  // Limpieza opcional — dejar datos para inspección manual
  console.log(`\n📋 Datos de prueba: usuario ${TEST_EMAIL} / ${TEST_PASS}`);
  console.log(`   Cotización: ${presFull?.cot_num} (${pres.id})`);

  return summary();
}

function summary() {
  console.log("\n=== RESUMEN CHECKLIST ===");
  const ok = results.filter((r) => r.ok).length;
  const bad = results.filter((r) => !r.ok).length;
  console.log(`PASS: ${ok}  FAIL: ${bad}`);
  for (const r of results) {
    console.log(`  ${r.ok ? "✅" : "❌"} ${r.step}: ${r.detail}`);
  }
  process.exit(bad > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
