# Reorganización del módulo Cierre — Informes integrado como pestaña

**Fecha:** 23/07/2026
**Pedido por:** propietario (Mohamed), prompt "Reorganización del módulo Cierre (No inventar nada)".
**Rama:** `develop` (commit pendiente de PR).

## Qué se pidió

1. Eliminar "Informes" del sidebar de Darivo Pro Empresa (menú directo, posición 10).
2. Integrar su funcionalidad como 3ª pestaña dentro de "Cierre" (Gastos · Expediente Mensual · Informe).
3. En la pestaña Informe: cambiar los períodos de Semanal/Mensual/**Trimestral** a Semanal/Mensual/**Anual**.
4. Descarga en PDF de los 3 períodos (antes solo Trimestral tenía PDF).
5. Expediente mensual: debía incluir facturas emitidas SUNAT + gastos registrados, con generación/guardado/descarga de ZIP y envío posterior a gestoría.

## Hallazgos antes de implementar (por qué se paró a preguntar)

Investigación previa (agente Explore) encontró 3 puntos que el prompt del propietario asumía como ya construidos y no lo estaban, más una reversión de diseño:

- **Reversión de diseño reciente:** "Informes" se había retirado de Cierre justo el día anterior (22/07/2026, eliminación del módulo "Más", commit `eb8985f`) con una justificación explícita en código ("no debe quedar oculto dentro de otra pantalla"). Se confirmó con el propietario antes de revertirlo.
- **ZIP + envío a gestoría:** no existía nada — el botón "Generar expediente" solo cambiaba un `useState` local. Comentario explícito en código: "Exportación PDF/ZIP — pendiente integración (Tarea 07/09)".
- **PDF Semanal/Mensual:** no existía — solo Trimestral tenía `descargarPDF`.

Se preguntó al propietario con 4 decisiones puntuales (`AskUserQuestion`) y se confirmó: sí revertir la navegación, sí construir el ZIP + descarga ahora, **no** construir envío a gestoría todavía (solo descarga), sí construir PDF para los 3 períodos.

## Qué se implementó

- **Sidebar:** `frontend/src/lib/empresa-modules.ts` — entrada "Informes" eliminada de `EMPRESA_NAV` (13 entradas directas, antes 14).
- **Redirección:** `frontend/src/app/empresa/informes/page.tsx` — ya no renderiza nada, redirige a `/empresa/cierre?tab=informe` (no rompe enlaces guardados).
- **Cierre:** `frontend/src/components/cierre/CierreViewEscritorio.tsx` — 3ª pestaña "Informe" (layout de una columna, reutiliza `InformesTab` tal cual). `frontend/src/app/empresa/cierre/page.tsx` lee `?tab=` para abrir la pestaña correcta.
- **Período Anual:** `frontend/src/hooks/useInformes.ts` (`cargarTrimestre`→`cargarAnual`, `DatosTrimestre`→`DatosAnual`, `startOfQuarter`→`startOfYear`), `InformesTab.tsx`, nuevo `InformeAnual.tsx` (reemplaza `InformeTrimestral.tsx`, eliminado), nuevo `lib/pdf/InformeAnualPdf.tsx` (reemplaza `InformeTrimestralPdf.tsx`, eliminado).

  **Nota de alcance:** `InformesTab` es un componente **compartido** con Móvil (`app/(auth)/mas/informes/page.tsx`). Este cambio de período también afecta a Móvil — se decidió proceder porque la documentación oficial (`07-MODULO-MAS-EMPRESA.md` §5.3 y el propio `InformesMasPageClient.tsx` de Móvil) ya especificaba "Anual", no "Trimestral": el código estaba desalineado de la documentación desde antes de esta tarea, no es una decisión nueva de negocio.
- **PDF Semanal/Mensual:** nuevos `lib/pdf/InformeSemanalPdf.tsx` y `InformeMensualPdf.tsx`, botón "Descargar PDF" añadido a `InformeSemanal.tsx` e `InformeMensual.tsx` siguiendo el mismo patrón que ya tenía Trimestral.
- **ZIP real del Expediente mensual:** nueva ruta `frontend/src/app/api/expediente/zip/route.ts` (`POST`, autenticada, scoped a `user_id`) — genera un ZIP con `facturas-sunat/*.pdf` (un PDF por factura del período, reutiliza `facturas.pdf_url` si ya existe o lo genera con `generarPdfFactura`, igual que `/api/pdf/factura/[id]`), `gastos-registrados.csv` (gastos del período tal como vienen de `useGastos`, que sigue siendo 100% local/localStorage — no se tocó esa capa) y `resumen.txt`. Cliente (`CierreViewEscritorio.tsx`): botón "Generar expediente" llama a la ruta, descarga el ZIP automáticamente y lo deja disponible para volver a descargar sin regenerar (botón "Descargar ZIP"). Botón "Enviar a gestoría" queda **deshabilitado** ("próximamente") — no implementado, por decisión explícita del propietario.
- **Dependencia nueva:** `jszip` (`frontend/package.json`) — no existía ninguna librería de ZIP en el proyecto.

## Decisiones tomadas sin volver a preguntar (dentro de lo ya confirmado)

- **"Guardar el expediente"** se interpretó como: el ZIP se descarga automáticamente al generarlo (se guarda en el dispositivo del usuario) y queda disponible en memoria del navegador para re-descargar sin volver a generar. **No** se creó ninguna tabla nueva en Supabase para persistir un historial de expedientes generados — no se pidió explícitamente y CLAUDE.md pide evitar cambios de base de datos si no son estrictamente necesarios. Si se quiere un historial real (ej. "expedientes generados este año"), es una decisión de producto aparte, pendiente de que el propietario la pida.
- El ZIP de gastos usa **CSV**, no PDF — es una lista tabular, más útil para una gestoría (Excel) que un PDF.
- No se tocó `useGastos.ts` (sigue en localStorage, no en la tabla Supabase `gastos`) — gap preexistente, fuera de alcance de esta tarea, no se persigue sin permiso explícito.
- `frontend/src/lib/planes.ts` menciona "Informes trimestrales" en las tarjetas de precios (Básico/Pro) — texto de marketing, no la UI real. **No se tocó** — es contenido de negocio/precios, fuera de alcance, requiere decisión aparte del propietario.

## MDs actualizados

- `.cursor/rules/03-darivo-pro-empresa/09-MODULO-CIERRE-EMPRESA.md` → v1.1: nueva §7 "Pestaña — Informe", §6 (Expediente Mensual) reescrita para reflejar el ZIP real (antes describía "3 formatos" — PDF/ZIP/Carpeta — que nunca se construyeron), renumeración de §7–§14 a §8–§15.
- `.cursor/rules/03-darivo-pro-empresa/07-MODULO-MAS-EMPRESA.md` → v2.1: Informes retirado de la tabla de navegación directa (7 pantallas → 6), §5.3 marcado como histórico.
- `.cursor/rules/03-darivo-pro-empresa/INDICE-OFICIAL-DARIVO-PRO-EMPRESA.md`: filas de Cierre y Navegación directa actualizadas, imagen de Cierre marcada como desactualizada.

## Verificación

- `npm run typecheck` — ✅ verde.
- `npm run lint` — ✅ verde (solo 2 warnings preexistentes en `useCotizacion.ts`/`useFactura.ts`, no relacionados).
- `npm run build` — ✅ verde (exit code 0).
- **Pendiente:** verificación visual en vivo (Vercel, cuenta `yatriye@gmail.com`) — no se ha desplegado a `main` (autonomía de Deploy sigue requiriendo aviso explícito del propietario, `CLAUDE.md`).

## Pendiente / fuera de alcance de esta tarea

- Envío a gestoría (excluido explícitamente por el propietario).
- Historial persistente de expedientes generados (no pedido).
- Migrar `useGastos` de localStorage a la tabla Supabase `gastos` (gap preexistente).
- Actualizar `frontend/src/lib/planes.ts` ("Informes trimestrales" en precios) — marketing/negocio, no tocado.
- Imagen oficial nueva de Cierre (con 3 pestañas) e imágenes de las 6 pantallas restantes de Navegación directa.
