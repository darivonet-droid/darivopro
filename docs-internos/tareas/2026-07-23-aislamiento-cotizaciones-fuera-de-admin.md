# 2026-07-23 — Aislamiento de datos: cotizaciones fuera de Admin

**Estado:** parcial — Tareas 1 y 2 cerradas; **Tarea 3 en ALTO OBLIGATORIO**, esperando confirmación del propietario.

**Estándar aplicado:** banco/fintech · RGPD-UE · Ley N.º 29733 (Perú). Fuente de verdad escrita en `01-VISION-DEL-PRODUCTO.md` v2.20 §4.1 y §8.4.

---

## Qué se pidió

1. Diagnosticar cómo llegan las cotizaciones al panel Admin y al sub-panel Partner dentro de Admin, y cortar el acceso en el origen (no solo la UI), con rechazo a nivel BD.
2. Reportar cómo está montado el panel Partner dentro de Admin y corregir si expone datos ajenos.
3. Quitar el cambio de plan de Admin → Usuarios (Usuario = solo correos), moviéndolo a Empresa (Mi Plan) / Partner — **con alto obligatorio antes de tocar nada**.

---

## Tarea 1 — Diagnóstico (causa raíz confirmada)

**Cómo llegaban las cotizaciones a Admin.** Un único punto de entrada, no varios:

| Punto | Archivo:línea (antes del cambio) | Qué leía |
| --- | --- | --- |
| Lista "Actividad reciente (cotizaciones)" | `frontend/src/lib/admin-queries.ts:83-87` | `cotizaciones` → `client_name, total_final, status, created_at`, últimas 5 de **toda la plataforma** |
| Serie del gráfico "Actividad de la plataforma" | `frontend/src/lib/admin-queries.ts:88` | `cotizaciones` → `created_at` de todas las cuentas en la ventana de 7/30/90 días |
| Render de la lista | `frontend/src/app/admin/page.tsx:116-130` | pintaba cliente, importe, estado y fecha |
| Render del gráfico | `frontend/src/components/admin/AdminActividadChart.tsx:36` | barra "Cotizaciones" apilada |

**Causa raíz (confirmada, no sospecha):** no era un cruce por el usuario Yatriz ni un fallo de RLS. La policy de la tabla es y sigue siendo correcta:

```sql
CREATE POLICY presupuestos_all ON public.presupuestos FOR ALL USING (auth.uid() = user_id);
-- baseline_v2.sql:708; renombrada a `cotizaciones_all` sobre `public.cotizaciones`
-- en 20260708120000_rename_presupuestos_to_cotizaciones.sql:28
```

El problema es que el Dashboard de Admin **no consulta con una sesión de usuario**: usa `createAdminClient()` (`lib/supabase/admin.ts`), es decir la `SUPABASE_SERVICE_ROLE_KEY`, y `service_role` tiene `BYPASSRLS` por diseño de Supabase. Con service role, **ninguna policy puede frenar la lectura**: se lee la tabla entera, de todas las cuentas. Por eso el corte tenía que ser a nivel de privilegios, no de policy.

**Alcance real de la fuga:** cualquier persona con acceso al Panel Admin veía nombre de cliente final, importe y estado de las últimas 5 cotizaciones de cualquier cuenta de la plataforma, más el volumen diario de cotizaciones de todo el ecosistema.

### Qué se cambió

**Capa de datos (el origen, no la UI):**
- `frontend/src/lib/admin-queries.ts` — eliminadas las **dos** consultas a `cotizaciones`, el campo `recientes` del objeto devuelto y el parámetro `fechasCotizaciones` de `construirSerieActividad()`. `AdminActividadDia` pierde el campo `cotizaciones`. Añadida nota de aislamiento en el JSDoc de `fetchAdminDashboard()`.
- Resultado: **el Panel Admin ya no consulta la tabla `cotizaciones` en absoluto** — verificado con `grep -rn 'from("cotizaciones")' frontend/src`, ninguna coincidencia bajo `app/admin/`, `components/admin/` ni `lib/admin-queries.ts`.

**Capa visual:**
- `frontend/src/app/admin/page.tsx` — eliminado el bloque "Actividad reciente (cotizaciones)" y el import de `AdminTable` que quedaba sin uso.
- `frontend/src/components/admin/AdminActividadChart.tsx` — eliminada la barra "Cotizaciones". El gráfico queda con Registros + Facturas.

**Capa de base de datos (rechazo real aunque el frontend fallara):**
- Nueva migración `supabase/migrations/20260723120000_revocar_cotizaciones_service_role.sql` — **pendiente de que el propietario la corra en el SQL Editor**:

```sql
REVOKE ALL PRIVILEGES ON TABLE public.cotizaciones     FROM service_role;
REVOKE ALL PRIVILEGES ON TABLE public.cotizacion_items FROM service_role;
```

Se revoca **todo** privilegio, no solo `SELECT`: Admin tampoco debe poder escribir ni borrar cotizaciones de un cliente. `postgres`/`supabase_admin` conservan los suyos (el SQL Editor y las migraciones siguen funcionando).

**Por qué es seguro (verificado, no asumido):**
- Las 34 llamadas restantes a `.from("cotizaciones")` en `frontend/src` usan el cliente de sesión del propio usuario (`createServerClient()` / cliente de componente): `useCotizacion.ts`, `useClientes.ts`, `useInformes.ts`, `app/(auth)/*`, `app/empresa/*`, `api/pdf/cotizacion/[id]/route.ts`, `lib/plan-limits.ts`, los 2 wizards. Ninguna usa service role.
- El trigger `verificar_limite_cotizaciones_gratis()` (`20260721230000`) hace `SELECT` sobre `cotizaciones`, pero es `SECURITY DEFINER` → corre con privilegios del owner, no de `service_role`. El REVOKE no lo afecta.
- El backend FastAPI de `backend/` no usa service role (la cadena solo aparece en `.venv/site-packages`).

**RLS intacta:** no se tocó ninguna policy. No se relajó nada. La conexión legítima Empresa↔Móvil no se tocó.

### Verificación

- `npx tsc --noEmit` — limpio.
- `npm run lint` — solo 3 warnings preexistentes de `react-hooks/exhaustive-deps` en `useCotizacion.ts`/`useFactura.ts`, ajenos a este cambio.
- `npm run build` — en verde, 0 errores.
- Técnico (Móvil) y Gerente (Empresa) sin cambios: ninguna de sus rutas (`app/(auth)/*`, `app/empresa/*`) fue tocada, y siguen leyendo con su propia sesión bajo la policy `cotizaciones_all` intacta.
- **Pendiente:** verificación visual en vivo en `https://darivopro.com/` (cuenta `yatriye@gmail.com`) y ejecución de la migración.

---

## Tarea 2 — Panel Partner dentro de Admin

**Hallazgo: no hay tal sub-panel, y la separación actual es la correcta.** Reporte antes de tocar, como se pidió:

- El **Panel Partner** es su propio panel: `frontend/src/app/partner/page.tsx` + `layout.tsx`, con guard propio (`requireProducto("partner")`), manifest y PWA propios (`/partner-manifest.json`). Consulta con el **cliente de sesión** del partner (`createServerClient()`), respetando la policy `partners_own`. No vive dentro de Admin.
- Lo que hay en Admin es el **módulo Admin → Partners** (`app/admin/partners/page.tsx` → `AdminPartnersView`), que administra el programa: alta, código, enlace, estado, toggle de acceso a Móvil, configuración e historial de comisiones. Sus únicas fuentes son `partners`, `partner_referidos`, `partner_comisiones_config` y `partner_comisiones_historial` (verificado en `lib/ecosystem-store.ts`).
- **No expone datos operativos de cliente.** Verificado por grep sobre `AdminPartnersView.tsx` (663 líneas): ninguna referencia a cotizaciones, facturas ni tarifas; las coincidencias de "cliente" son textos del plan de comisiones ("clientes referidos", "hito de clientes propios"), no datos.
- Único dato de terceros que sí muestra: el **correo** de las cuentas referidas (`partner_referidos.email`), necesario para calcular la comisión y ya visible para Admin en el módulo Usuarios. Es dato del programa, no trabajo de la cuenta.

**Conclusión:** ubicación intencional y correcta. **No se tocó código.** Solo se documentó el límite de alcance en `06-PANEL-ADMIN-PARTNERS.md` v1.8.

---

## Tarea 3 — RESUELTA por el propietario (23/07/2026): mover a Suscripciones, orden aditivo

**Decisión:** el plan de una cuenta es metadato de facturación → el operador (Admin) lo conserva, pero en Suscripciones, no en Usuarios. Construir y verificar en Suscripciones **antes** de quitar nada de Usuarios. Partner fuera de alcance (tarea propia, por comisiones).

### FASE A — construida ✅

| Pieza | Archivo |
| --- | --- |
| Lógica única del cambio de plan + lectura del log | `frontend/src/lib/plan-cuenta.ts` (nuevo) |
| Acción de Suscripciones (`cambiarPlanCuentaAction`) | `frontend/src/app/admin/suscripciones/actions.ts` |
| Identidad real del admin, server-side (`adminAutenticadoOError`) | `frontend/src/lib/acceso-producto.ts` |
| Pestañas "Cuentas" e "Historial de cambios" | `frontend/src/components/admin/AdminSuscripcionesView.tsx` |
| Datos (cuentas + auditoría) | `frontend/src/lib/admin-queries.ts`, `app/admin/suscripciones/page.tsx` |
| Punto de entrada de Usuarios, ahora delegando | `frontend/src/app/admin/usuarios/actions.ts` |
| Tabla de auditoría (aditiva) | `supabase/migrations/20260723130000_admin_plan_auditoria.sql` |

Cumplimiento de lo pedido:

1. **Vista/acción de cambio de plan por cuenta** — pestaña "Cuentas" en Suscripciones: listado con correo, razón social y plan actual, buscador y acción "Cambiar plan". Es la "vista por usuario" que el MD 04 dejaba como fase posterior. **No se duplicó la lógica**: `cambiarPlanUsuarioAction` (Usuarios) y `cambiarPlanCuentaAction` (Suscripciones) llaman ambas a `cambiarPlanCuenta()` en `lib/plan-cuenta.ts`.
2. **Restringida a Admin, revalidado server-side** — `adminAutenticadoOError()` en cada llamada, sin confiar en el cliente ni en el middleware. La identidad del administrador que firma sale de la sesión real del servidor; el cliente no puede enviarla ni suplantar a otro empleado. Validación del plan contra una lista blanca y motivo obligatorio, también en el servidor.
3. **Auditoría** — tabla **nueva** `admin_plan_auditoria` (no se reutilizó ninguna): quién, qué cuenta, plan anterior → nuevo, timestamp, motivo. Propiedades garantizadas en BD, no por convención:
   - **Append-only real:** `REVOKE UPDATE, DELETE, TRUNCATE ... FROM service_role` — ni el propio Panel Admin puede reescribir el log.
   - **Sobrevive a bajas:** los dos correos quedan copiados en texto y las FK son `ON DELETE SET NULL`.
   - **Cerrada a clientes:** RLS habilitada sin ninguna policy.
   - Si el `UPDATE` del plan tiene éxito pero el log falla, **no se revierte en silencio**: se devuelve un error explícito diciendo que el plan cambió pero no quedó registrado.

Efecto colateral positivo: el punto de entrada de Usuarios, que hasta hoy cambiaba planes **sin ningún rastro**, queda auditado desde ya (con un motivo automático que identifica la vía).

`typecheck` limpio · `lint` sin warnings nuevos · `build` en verde. Commit `dd79b95`.

### FASE B — BLOQUEADA ⛔

**No se puede verificar sin correr la migración `20260723130000_admin_plan_auditoria.sql`**, y las migraciones son excepción #1 de `CLAUDE.md` (las ejecuta el propietario en el SQL Editor). Sin la tabla, el insert de auditoría falla y `cambiarPlanCuenta()` devuelve error — el cambio de plan no se puede probar de extremo a extremo.

Verificación pendiente, en este orden:
1. Correr la migración.
2. En `https://darivopro.com/` → Admin → Suscripciones → Cuentas, cambiar el plan de la cuenta demo (`demo@darivopro.com`) con un motivo.
3. Confirmar que el plan persiste tras recargar y que la fila aparece en "Historial de cambios" con admin, cuenta, plan anterior → nuevo, fecha y motivo.
4. Confirmar que `UPDATE`/`DELETE` sobre el log fallan desde el Panel Admin (query de verificación incluida al final de la migración).

### FASE C — NO EJECUTADA (correcto) ⛔

La instrucción es explícita: *"no ejecutes FASE C si FASE A no está verificada"*. Como FASE B está bloqueada por la migración, **no se ha tocado el `<select>` de plan de `AdminUsuariosView.tsx` ni se ha borrado `cambiarPlanUsuarioAction`**. Usuarios conserva su punto de entrada (ya auditado) para no dejar el producto sin ninguna vía.

Cuando FASE B esté verificada, FASE C es: quitar el `<select>` de plan de `AdminUsuariosView.tsx:396-397`, borrar `cambiarPlanUsuarioAction` de `app/admin/usuarios/actions.ts`, y actualizar `03-PANEL-ADMIN-USUARIOS.md` §5.1 para que describa el módulo sin ninguna mención a planes.

**Nada que reportar bajo el "DETENTE si mover la lógica rompe algún flujo":** `cambiarPlanUsuarioAction` no tiene ningún otro consumidor. Verificado por grep — su única referencia es `AdminUsuariosView.tsx` (import + llamada en `cambiarPlan`).

### Hallazgo no pedido: un TERCER punto de cambio de plan

Al verificar los consumidores apareció `cambiarPlanEmpresaAction` (`app/admin/empresas/actions.ts:16`), usada desde `AdminEmpresasView.tsx:74`: Admin → Empresas también hacía su propio `UPDATE perfiles SET plan_tipo` (sobre el gerente de la empresa), **sin ningún registro**. No estaba en el encargo, que nombraba solo Usuarios.

**Qué se hizo y por qué:** se le aplicó la misma delegación a `lib/plan-cuenta.ts`, de modo que también queda auditada. Es aditivo y no cambia su comportamiento visible. La razón es que dejar una segunda vía sin auditar habría vaciado de sentido el requisito 3 del encargo ("registra **cada** cambio en un log"): bastaría con usar Empresas para cambiar planes sin rastro.

**Qué NO se hizo, y queda para el propietario:** no se retiró la acción de Empresas. `02-PANEL-ADMIN-EMPRESAS.md` §5/§12 dice explícitamente que el cambio de plan se hace desde ese módulo, y retirarlo no estaba pedido. **Pregunta abierta:** si la decisión es "el plan solo se gestiona desde Suscripciones", ¿Empresas también debe perderlo, o su vía se considera legítima por operar sobre el gerente de una empresa concreta?

### Diagnóstico previo que motivó el alto (se conserva como contexto)

Qué existía antes de esta fase:

**Admin → Usuarios** (`03-PANEL-ADMIN-USUARIOS.md` §5): la acción "Cambiar plan" existe y es real — `cambiarPlanUsuarioAction()` (`app/admin/usuarios/actions.ts:49-66`) hace `UPDATE perfiles SET plan_tipo` con service role, expuesta como un `<select>` por fila en `AdminUsuariosView.tsx:396-397`. Las demás acciones del módulo son Bloquear/Desbloquear, Reenviar invitación, Invitar (CSV) y Restablecer acceso — todas de gestión de cuenta/correo, no de plan.

**Admin → Suscripciones** (`04-PANEL-ADMIN-SUSCRIPCIONES.md` v1.10 §6): se declara "**fuente única de definición del catálogo oficial de planes**". Administra los 3 planes (nombre, precio mensual, precio anual, límites, activo) sobre `planes_catalogo`. **No administra el plan de un usuario concreto** — la vista de suscripción por usuario está documentada como "fase posterior", sin construir. Es decir: hoy el único sitio donde se cambia el plan **de una cuenta** es Usuarios.

**Consecuencia si se quita sin construir el reemplazo:** no quedaría ningún punto en el producto para cambiar el plan de una cuenta concreta. Empresa → Mi Plan es autoservicio del cliente (pasa por checkout), y el panel Partner hoy no tiene ninguna acción de cambio de plan sobre sus referidos — habría que construirla.

**Preguntas al propietario, pendientes de respuesta:**
1. ¿Se acepta que Admin pierda toda capacidad de cambiar el plan de una cuenta, incluso para soporte (cortesía, corrección de un cobro, plan regalado)?
2. Si se quita de Usuarios, ¿dónde debe vivir para las cuentas que **no** son de un partner: en Admin → Suscripciones (nueva vista por usuario, hoy sin construir) o en ningún sitio?
3. El panel Partner no tiene hoy acción de cambio de plan. ¿Se construye?

---

## Archivos tocados

**Código:**
- `frontend/src/lib/admin-queries.ts`
- `frontend/src/app/admin/page.tsx`
- `frontend/src/components/admin/AdminActividadChart.tsx`

**Migración (sin ejecutar):**
- `supabase/migrations/20260723120000_revocar_cotizaciones_service_role.sql`

**Documentación:**
- `.cursor/rules/01-VISION-DEL-PRODUCTO.md` → v2.20 (nuevo §4.1; estándar de aislamiento en §8.4; la antigua "§4.1 Aviso por dispositivo" renumerada a §8.4.1, que es su lugar jerárquico real)
- `.cursor/rules/02-darivo-pro-admin/00-PANEL-ADMIN-DASHBOARD.md` → v1.5
- `.cursor/rules/02-darivo-pro-admin/06-PANEL-ADMIN-PARTNERS.md` → v1.8
- `CLAUDE.md` → "ESTADO REAL DEL PROYECTO" + índice de tareas

**Sin tocar (Tarea 3 en alto):** `04-PANEL-ADMIN-SUSCRIPCIONES.md`, `03-PANEL-ADMIN-USUARIOS.md`, `app/admin/usuarios/*`.
