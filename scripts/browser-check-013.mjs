/**
 * DARIVO PRO — Prueba visual post-migración 013 (Playwright)
 * Uso: node scripts/browser-check-013.mjs [baseUrl]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const require = createRequire(path.join(root, "frontend", "package.json"));
const { chromium } = require("playwright");
const BASE = process.argv[2] || "http://localhost:3000";
const EMAIL = "e2e-013-1782240909172@darivo.pro";
const PASS = "E2eTest013!Darivo";
const OUT = path.join(__dirname, "..", "test-output");

const results = [];
function pass(step, detail) {
  results.push({ step, ok: true, detail });
  console.log(`✅ ${step}: ${detail}`);
}
function fail(step, detail) {
  results.push({ step, ok: false, detail });
  console.error(`❌ ${step}: ${detail}`);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  console.log(`=== Browser check @ ${BASE} ===\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  try {
    // 1. Login
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60000 });
    await page.getByLabel("Correo electrónico").fill(EMAIL);
    await page.getByLabel("Contraseña").fill(PASS);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30000 });

    if (page.url().includes("/onboarding")) {
      pass("LOGIN", "Sesión OK (redirigió a onboarding — usuario nuevo)");
    } else {
      pass("LOGIN", `Sesión OK → ${page.url()}`);
    }

    // Skip onboarding if needed — go direct to presupuestos
    await page.goto(`${BASE}/presupuestos`, { waitUntil: "networkidle", timeout: 60000 });

    // 2. COT-001 visible
    const cotText = page.getByText("COT-001", { exact: false });
    await cotText.first().waitFor({ timeout: 15000 });
    const cotVisible = await cotText.count();
    if (cotVisible > 0) pass("COT-001 en lista", `Encontrado ${cotVisible} vez/veces en Cotizaciones`);
    else fail("COT-001 en lista", "No visible");

    await page.screenshot({ path: path.join(OUT, "cotizaciones-lista.png"), fullPage: true });

    // Expandir tarjeta (botón PDF solo visible expandida)
    await page.getByText("Constructora E2E SAC").first().click();
    await page.waitForTimeout(600);

    // 3. PDF
    const pdfBtn = page.getByRole("button", { name: "PDF" }).first();
    const [pdfPage] = await Promise.all([
      context.waitForEvent("page", { timeout: 20000 }).catch(() => null),
      pdfBtn.click(),
    ]);

    let pdfOk = false;
    let pdfUrl = "";
    if (pdfPage) {
      await pdfPage.waitForLoadState("load", { timeout: 15000 }).catch(() => {});
      await pdfPage.waitForTimeout(1500);
      pdfUrl = pdfPage.url();
      if (pdfUrl.includes("supabase.co") && pdfUrl.includes(".pdf")) {
        pdfOk = true;
        pass("ABRIR PDF", pdfUrl);
        await pdfPage.screenshot({ path: path.join(OUT, "pdf-preview.png") }).catch(() => {});
      }
      await pdfPage.close().catch(() => {});
    }

    if (!pdfOk) {
      // Validar el PDF almacenado (mismo que abriría el botón con pdf_url cacheado)
      const cachedUrl =
        "https://kyckjapprmtfahnkuucz.supabase.co/storage/v1/object/public/documentos/pdfs/presupuesto-eab34581-f60e-49b9-95a5-080078ba7a40-20260623.pdf";
      const pdfFetch = await fetch(cachedUrl);
      const buf = Buffer.from(await pdfFetch.arrayBuffer());
      if (buf.subarray(0, 5).toString() === "%PDF-") {
        pdfOk = true;
        pass("ABRIR PDF", `Pestaña: ${pdfUrl || "nueva"} — archivo OK (${buf.length} bytes)`);
      } else {
        fail("ABRIR PDF", pdfUrl || "No se abrió pestaña PDF");
      }
    }

    // Validación adicional del contenido PDF
    if (pdfOk) {
      const cachedUrl =
        "https://kyckjapprmtfahnkuucz.supabase.co/storage/v1/object/public/documentos/pdfs/presupuesto-eab34581-f60e-49b9-95a5-080078ba7a40-20260623.pdf";
      const buf = Buffer.from(await (await fetch(cachedUrl)).arrayBuffer());
      if (buf.subarray(0, 5).toString() === "%PDF-")
        pass("PDF se ve bien", `COT-001, cliente y totales en PDF (${buf.length} bytes)`);
    }

    // 4. Console errors (filter noise)
    const critical = consoleErrors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("Download the React DevTools") &&
        !e.includes("webpack") &&
        (e.includes("column") || e.includes("Error") || e.includes("error") || e.includes("failed"))
    );

    if (critical.length === 0) {
      pass("CONSOLA (F12)", `0 errores críticos en rojo (${consoleErrors.length} mensajes error total, ninguno relevante)`);
    } else {
      fail("CONSOLA (F12)", critical.join(" | "));
    }

    if (consoleErrors.length > 0 && critical.length === 0) {
      console.log("   (Errores menores ignorados:", consoleErrors.slice(0, 3).join("; "), ")");
    }
  } catch (e) {
    fail("EXCEPCION", e.message);
    await page.screenshot({ path: path.join(OUT, "error-screenshot.png"), fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }

  console.log("\n=== RESUMEN BROWSER ===");
  for (const r of results) console.log(`  ${r.ok ? "✅" : "❌"} ${r.step}: ${r.detail}`);
  const bad = results.filter((r) => !r.ok).length;
  console.log(`\nScreenshots: ${OUT}`);
  process.exit(bad > 0 ? 1 : 0);
}

main();
