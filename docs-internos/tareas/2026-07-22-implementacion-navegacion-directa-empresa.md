# Implementación en código — navegación directa Empresa (sin "Más") (22/07/2026)

## Qué se pidió

Completar Darivo Pro Empresa en código hasta que coincida con la documentación oficial (que ya reflejaba, tras las tareas del mismo día, la eliminación de "Más" del sidebar y la sincronización funcional con Móvil). Trabajo autónomo, sin confirmación entre módulos.

## Alcance ejecutado

### 1. Navegación (implementa la Tarea "eliminación módulo Más")

- `frontend/src/lib/empresa-modules.ts` — `EMPRESA_NAV` reescrito: 14 posiciones, sin "Más", con "Darivo" (IA) visible por primera vez en el sidebar (antes oculta, solo accesible desde dentro de "Categorías").
- Nuevas pantallas (reutilizando componentes ya existentes, sin duplicar lógica):
  - `/empresa/catalogo` (posición 6) — Categorías + Mis Tarifas. `MisTarifasTab` se extrajo de `MasTabs.tsx` a su propio archivo (`components/mas/MisTarifasTab.tsx`) para reutilizarlo aquí sin tocar el comportamiento de Móvil.
  - `/empresa/empresa` (9) — datos de la empresa, reutiliza `AjustesForm` tal cual.
  - `/empresa/informes` (10) — reutiliza `InformesTab` (el mismo componente que ya usaba Cierre-Empresa).
  - `/empresa/documentos` (11) — misma consulta que Móvil (`(auth)/mas/documentos`), reescrita con `ADMIN_COLORS`.
- Movidas (mismo contenido, nueva ruta): `/empresa/mas/plan` → `/empresa/plan` (12), `/empresa/mas/soporte` → `/empresa/soporte` (13), `/empresa/mas/perfil` → `/empresa/configuracion` (14, ampliada con el bloque de "Preferencias de IA" que antes solo existía en la ruta Móvil).
- Borrado: `frontend/src/app/empresa/mas/` completo.
- `MasTabs.tsx` y `MasOpcionesList.tsx` — limpiados de las ramas de código que solo existían para Empresa (`esEmpresa`, `ocultarOpciones`, reescritura de hrefs) tras dejar de usarse; vuelven a ser componentes exclusivos de Móvil, sin funcionalidad muerta.
- `CierreViewEscritorio.tsx` — se quitó la pestaña "Informes" que vivía oculta ahí dentro (añadida en una tarea anterior, 17/07/2026): con entrada directa propia, ya no debía seguir oculta dentro de otra pantalla, siguiendo el mismo criterio que motivó todo este cambio.

### 2. Gaps funcionales encontrados en la propia auditoría de esta tarea (doc↔código, no solo doc↔doc)

- **Inicio** (`EmpresaInicioView.tsx`): tenía 2 tarjetas de "acceso rápido" a Clientes/Cotizaciones que Móvil eliminó el 06/07/2026 — el código nunca se había resincronizado (aunque el MD ya se había corregido en la tarea de documentación de esta misma fecha). Eliminadas; "Ver todos →" ahora apunta a la lista global de cotizaciones.
- **Cotizaciones**: `/empresa/cotizaciones/page.tsx` era un `redirect("/empresa/clientes")` con un comentario explicando que así lo exigía el MD — el MD se corrigió en la tarea de documentación (§3.1, la lista global sí existe), así que este redirect quedó obsoleto. Reemplazado por una página real que reutiliza `CotizacionesList` (el mismo componente de Móvil).
- **Facturas** (`FacturasTableEmpresa.tsx`): faltaba la acción "Reintentar" para estado Pendiente de envío. Añadida (reutiliza `actualizarEstado` del hook `useFactura`, mismo patrón que el botón "→ Cobrada" ya existente).

## No implementado — motivo y verificación

**"Motivo del rechazo" en Facturas** (exigido también por el MD, `06-MODULO-FACTURAS-EMPRESA.md` §5.5/§6.4): **no tiene columna real en la tabla `facturas` hoy**. Verificado en `supabase/migrations/`:
- `20260706160000_factura_6_estados.sql` (ya ejecutada) solo define el `CHECK` de los 6 estados — sin columna de motivo.
- El único lugar del repo con una columna relacionada (`ose_codigo_respuesta`, `ose_estado`) es `20260721180000_facturas_bizlinks_esquema.sql`, que `CLAUDE.md` marca explícitamente como **"no correr todavía, en pausa a propósito"** (preguntas #6/#7 de la auditoría de seguridad sin resolver, decisión de Mohamed).

Construir esa UI hoy habría significado inventar un campo que no existe en producción, o desbloquear una migración en pausa sin autorización — ninguna de las dos es aceptable. Se deja pendiente explícitamente, no se implementó con datos falsos.

## Verificado (evidencia de esta sesión)

- `npm run typecheck` — 0 errores (tras limpiar `.next/types`, que tenía artefactos de las rutas ya borradas).
- `npm run lint` — 0 errores; 3 warnings preexistentes en `useCotizacion.ts`/`useFactura.ts`, no tocados por este cambio.
- `npm run build` — `✓ Generating static pages (84/84)`. Todas las rutas nuevas aparecen en el árbol de salida; `/empresa/mas/*` ya no existe.
- `npm test` — "No tests found" (el repo no tiene archivos de test bajo el patrón `__tests__`/`*.test.*` pese a tener el script configurado — estado preexistente, no introducido por este cambio).
- Grep de `esEmpresa`/`ocultarOpciones` tras la limpieza de `MasTabs`/`MasOpcionesList` — sin consumidores rotos (`(auth)/mas/page.tsx`, el único llamador de `MasTabs`, nunca usó esas props).

## Sospecha (no verificada esta sesión)

- Sin verificación **visual** en navegador — por instrucción permanente del propietario (memoria de sesión) nunca se usa el dev server local para verificar Empresa; se verifica en el preview de Vercel del PR. Pendiente de que el propietario lo revise ahí.

## Git / despliegue

- 2 commits en `develop` (`f8d657b` documentación, `eb8985f` código), pusheados a `origin/develop`.
- PR abierto `develop` → `main`: https://github.com/darivonet-droid/darivopro/pull/7
- **No se mergeó a `main` ni se hizo deploy** — la instrucción pedía autonomía total, pero el merge/push a `main` está gateado en `CLAUDE.md` a la frase explícita "producción autónomo" (no dicha en esta tarea) o al aviso directo del propietario. Queda esperando ese aviso.
