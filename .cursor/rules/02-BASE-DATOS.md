# 02 – BASE DE DATOS – DARIVO PRO (SUPABASE)

**Versión:** 3.0

**Fecha:** 11/07/2026

**Estado:** Documento técnico oficial — esquema V2 (34 tablas) · inicio producto

**Cambio principal (v3.0 — 11/07/2026, autorizado por el propietario):** regeneración completa desde el esquema real (auditoría 09/07/2026, Prioridad 4). Versión de cabecera y §11 desincronizadas (2.2 vs 2.0) — unificadas. Terminología actualizada de `presupuestos`/`presupuesto_items` a `cotizaciones`/`cotizacion_items` (renombradas en `20260708120000_rename_presupuestos_to_cotizaciones.sql`, dato ya reflejado en código pero no en este MD). Eliminadas columnas documentadas que no existen en el esquema real: `perfiles.categorias` (nunca existió en el baseline) y `productos_master.orden`/`productos_master.updated_at` (el baseline solo tiene `id, slug, nombre, descripcion, activo, created_at`). Añadidas al inventario (§4) las ~11 tablas del ecosistema multi-producto que solo aparecían mencionadas de pasada (`empresas`, `empresa_empleados`, `roles_personalizados`, `partners`, `partner_referidos`, `partner_comisiones`, `partner_comisiones_historial`, `soporte_tickets`, `soporte_mensajes`, `suscripciones`, `pagos_eventos`, `darivo_admin_empleados`, `gastos`). Tampoco listaba las columnas añadidas por migraciones incrementales (`perfiles.empresa_id`, `perfiles.plan_origen_partner_id`, `empresas.activo`, `empresa_empleados.rol_personalizado_id`, `suscripciones.limite_roles_personalizados`/`limite_tecnicos`). Historial de migraciones (§10) completado con las 10 migraciones reales.

**Cambio principal (v2.1):** definido esquema mínimo de columnas de `productos_master` (§4.7) para soportar el nuevo módulo Admin de Edición de Productos (05).

**Cambio v2.2 (10/07/2026, auditoría BD):** corregida §9 — `comprobante_series` no tiene política `SELECT autenticados` (contradecía la migración real); RLS es deny-all salvo la función `SECURITY DEFINER` `asignar_inv_num()`, confirmado como diseño intencional (ningún panel la consulta directamente).

**Referencia:** `01-VISION-DEL-PRODUCTO.md` v2.6 §14 · `DARIVO-PRO-ARQUITECTURA-MAESTRA.md` §7 · `03-AUTENTICACION-DARIVO-PRO.md` v1.0 · `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.1

**Fuente de verdad del esquema:** `supabase/migrations/20260705120000_baseline_v2.sql` y migraciones incrementales posteriores. Datos iniciales: `supabase/seed.sql`. Ante contradicción con este documento, **prevalecen las migraciones aplicadas**.

---

# 1. Objetivo

Documentar oficialmente la **estructura de base de datos implementada** en Supabase (PostgreSQL) para Darivo Pro Móvil y capas compartidas del ecosistema.

**No define** lógica de negocio ni reglas funcionales de módulos — solo estructura técnica, relaciones, IDs, índices y RLS.

**Principios estratégicos:** `01-VISION-DEL-PRODUCTO.md` §14.

---

# 2. Alcance actual

## 2.1 Implementado (baseline + incrementales — 34 tablas)

Esquema completo del ecosistema Darivo Pro: Móvil, Empresa, Admin y Panel Partner. El baseline (`20260705120000_baseline_v2.sql`) creó 32 tablas; dos migraciones incrementales añadieron `roles_personalizados` y `partner_comisiones_historial` (34 en total, ninguna eliminada).

## 2.2 Evolución del esquema

Cambios posteriores al baseline mediante migraciones incrementales en `supabase/migrations/` (convención `YYYYMMDDHHMMSS_descripcion.sql`). Ver inventario completo en §10.

---

# 3. Convenciones

| Convención | Regla |
|------------|-------|
| PK | `uuid` (`uuid_generate_v4()`) salvo tablas de serie |
| Tenant | `user_id` → `auth.users(id)` ON DELETE CASCADE |
| Perfil | `perfiles.id` = `auth.users.id` (1:1) |
| Timestamps | `created_at`, `updated_at` (trigger `handle_updated_at`) donde aplique |
| RLS | Obligatorio en tablas con datos de usuario |
| Numeración COT | `cotizacion_series` + trigger `asignar_cot_num` (por usuario) |
| Numeración F001/B001 | **Aplicación** (`factura-utils.ts`) — tabla `comprobante_series` existe pero **no la usa el frontend actual** |
| Roles personalizados | Nombre no puede ser "gerente" ni "técnico"/"tecnico" (`CHECK` en `roles_personalizados`) — esos son roles implícitos, no personalizados |

---

# 4. Inventario de tablas

## 4.1 Autenticación y perfil

### `perfiles`

Extiende `auth.users`. Creada en baseline; ampliada por `20260706123000_plan_tipo_business.sql` y `20260711130000_plan_origen_partner.sql`.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | FK → `auth.users(id)` |
| `empresa_id` | uuid FK NULL | → `empresas(id)` ON DELETE SET NULL (añadida por `ALTER TABLE` tras crear `empresas` en el mismo baseline) |
| `razon_social` | text | |
| `ruc` | text | |
| `direccion` | text | |
| `telefono` | text | |
| `moneda` | text | default `PEN` |
| `simbolo` | text | default `S/` |
| `onboarding_done` | boolean | default false |
| `plan_tipo` | text | `gratis` \| `basico` \| `pro` \| `business` (antes `empresa` en baseline — renombrado por `20260706123000_plan_tipo_business.sql`) |
| `cta_detracciones` | text | cuenta BN |
| `idioma` | text | default `es` |
| `notificaciones_activas` | boolean | default true |
| `plan_origen_partner_id` | uuid FK NULL | → `partners(id)` ON DELETE SET NULL. No nulo solo cuando `plan_tipo=business` fue otorgado por ser Partner activo (`20260711130000_plan_origen_partner.sql`) |
| `created_at` / `updated_at` | timestamptz | |

**No existe** columna `categorias` en `perfiles` (corregido 11/07/2026 — nunca estuvo en el baseline real, error de una versión anterior de este documento).

**RLS:** usuario solo accede a su fila (`auth.uid() = id`).

---

## 4.2 Clientes

### `clientes`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | → `auth.users` |
| `nombre` | text NOT NULL | |
| `telefono` | text | |
| `ruc` | text | |
| `direccion` | text | |
| `ciudad` | text | |
| `notas` | text | |
| `created_at` / `updated_at` | timestamptz | |

**Índices:** `idx_clientes_user`, `idx_clientes_nombre`, `clientes_user_telefono_idx` (UNIQUE parcial por teléfono, solo si no es null).

**RLS:** políticas explícitas SELECT / INSERT / UPDATE / DELETE.

---

## 4.3 Cotizaciones

### `cotizaciones`

**Nombre real en BD** — renombrada desde `presupuestos` por `20260708120000_rename_presupuestos_to_cotizaciones.sql` (terminología oficial unificada, `ALTER TABLE ... RENAME`, sin pérdida de datos).

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `cliente_id` | uuid FK | → `clientes(id)` ON DELETE SET NULL |
| `cot_num` | text | COT-NNN vía trigger `asignar_cot_num` |
| `client_name` | text NOT NULL | snapshot cliente |
| `phone` / `city` | text | |
| `margin` | numeric(5,2) | default 40 |
| `total_base` / `total_labor` / `total_final` | numeric(12,2) | |
| `status` | text | `Borrador` \| `Pendiente de firma` \| `Aprobado` |
| `notes` | text | |
| `pdf_url` | text | |
| `wa_enviado_at` | timestamptz | |
| `created_at` / `updated_at` | timestamptz | |

**Índices:** `cotizaciones_user_cot_num_idx` (UNIQUE, renombrado), `idx_cotizaciones_wa_enviado`, `idx_cotizaciones_cliente`.

### `cotizacion_items`

Renombrada desde `presupuesto_items` (misma migración de terminología).

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `cotizacion_id` | uuid FK | → `cotizaciones` CASCADE (columna renombrada desde `presupuesto_id`) |
| `svc_id` | text | referencia catálogo |
| `cat_label` / `svc_label` | text | snapshot |
| `calc_type` / `unit` | text | |
| `base_price` / `qty` / `unit_price` / `subtotal` | numeric | |
| `created_at` | timestamptz | |

**Índices:** `idx_cotizacion_items_cotizacion` (`20260710120000_add_missing_fk_indexes.sql` — FK que no tenía índice explícito).

**RLS:** vía existencia de la cotización del usuario.

### `cotizacion_series`

| Columna | Tipo | Notas |
|---------|------|-------|
| `user_id` | uuid PK | → `auth.users` |
| `ultimo_num` | integer | correlativo COT por usuario |

---

## 4.4 Facturas

### `facturas`

Migraciones: baseline; `20260706160000_factura_6_estados.sql` (6 estados `inv_status`); `20260710120000_add_missing_fk_indexes.sql` (índices).

| Columna | Tipo | Notas |
|---------|------|-------|
| `inv_id` | uuid PK | |
| `user_id` | uuid FK | |
| `inv_num` | text NOT NULL | B001-/F001- (generado en app) |
| `inv_date` | date | |
| `inv_status` | text | `Borrador` \| `En proceso` \| `Emitida` \| `Rechazada` \| `Pendiente de envío` \| `Cobrada` — default `Borrador` (remapeo histórico `Pendiente`→`Emitida`) |
| `tipo_doc` | text | `boleta` \| `factura` |
| `client_name` / `client_ruc` / `client_dni` / `client_dir` | text | |
| `moneda` / `sym` | text | |
| `items` | jsonb | líneas snapshot |
| `subtotal_base` / `igv_amount` / `total_final` | numeric | |
| `detraccion_tipo` / `detraccion_pct` / `detraccion_monto` / `neto_cobrar` / `cta_detracciones` | text/numeric | SUNAT |
| `from_quote_id` | uuid FK | → `cotizaciones` ON DELETE SET NULL |
| `biz_data` / `pdf_url` | jsonb / text | |
| `created_at` / `updated_at` | timestamptz | |

**Índices:** `idx_facturas_user`, `idx_facturas_from_quote` (`20260710120000_add_missing_fk_indexes.sql`).

### `comprobante_series`

| Columna | Tipo | Notas |
|---------|------|-------|
| `serie` | text PK | `B001`, `F001` — **global**, no por usuario |
| `ultimo_num` | integer | |

> **Deuda técnica:** el frontend numera leyendo `facturas.inv_num` (`nextNumeroComprobante`). Esta tabla no participa en el flujo actual. Riesgo de colisión en concurrencia — ver §9.

---

## 4.5 Catálogo y precios (capa usuario)

### `categorias`

Overlay **por usuario** sobre catálogo base en código (`catalog.ts`).

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `cat_id` | text | slug; UNIQUE(user_id, cat_id) |
| `nombre` / `emoji` / `color` | text | |
| `es_base` | boolean | override categoría base |
| `activa` | boolean | |
| `created_at` | timestamptz | |

**Realtime:** publicación `supabase_realtime`.

### `partidas_propias`

Partidas custom del usuario. Columnas: `id`, `user_id`, `cap_id`, `nombre`, `tipo` (`m2`\|`unidad`\|`hora`\|`fijo`), `precio`, `unidad`, `activa`, `created_at`. Índice `idx_partidas_propias_user`.

### `precios_usuario`

Override de precio por `svc_id`. UNIQUE(user_id, svc_id).

### `precios_historial`

Auditoría de cambios de precio. Índices `idx_precios_historial_user_tiempo`, `idx_precios_historial_svc`.

---

## 4.6 IA y auditoría interna

### `ia_uso_diario`

| Columna | Tipo | Notas |
|---------|------|-------|
| `user_id` + `fecha` | PK compuesta | |
| `llamadas` | int | RPC `incrementar_ia_uso` |

### `calculos_log`

Snapshot de totales al guardar cotización. FK opcional `cotizacion_id` → `cotizaciones` (columna renombrada desde `presupuesto_id`). Índices `idx_calculos_log_user_tiempo`, `idx_calculos_log_cotizacion` (renombrado).

---

## 4.7 Catálogo maestro y lookup (baseline)

Tablas globales sin `user_id` salvo políticas RLS de lectura autenticados / admin.

### `productos_master`

Productos del ecosistema — cabecera de clasificación del Catálogo Maestro (`01-VISION-DEL-PRODUCTO.md` §3.1; Doc 21 §4.1).

Esquema real implementado en baseline:

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | `uuid_generate_v4()` |
| `slug` | text UNIQUE NOT NULL | Identificador interno — ej. `movil`, `admin`, `empresa` |
| `nombre` | text NOT NULL | Ej. "Darivo Pro Móvil" |
| `descripcion` | text NULL | Opcional |
| `activo` | boolean NOT NULL DEFAULT true | Ocultar como filtro sin borrar categorías asociadas |
| `created_at` | timestamptz | |

**No existen** columnas `orden` ni `updated_at` en esta tabla (corregido 11/07/2026 — una versión anterior de este documento las daba por existentes; el módulo Admin de Edición de Productos (05) no puede ordenar ni auditar cambios hasta que se decida añadirlas, ver `CLAUDE.md`).

El **Programa Partner** no tiene fila en esta tabla (`01-VISION-DEL-PRODUCTO.md` §3.2).

### `configuracion_regional`

País, moneda, IGV, zona horaria (`PE` inicial). Columnas: `id`, `pais_codigo` (UNIQUE), `pais_nombre`, `moneda_codigo`, `moneda_simbolo`, `zona_horaria`, `idioma`, `igv_porcentaje` (default 18.00), `activo`, `created_at`.

### `catalogo_sectores` · `catalogo_plantillas` · `catalogo_categorias_maestro` · `catalogo_partidas_maestro`

Catálogo Maestro oficial (Doc 21). Sustituye el lookup prototipo `categorias_servicios`.

* `catalogo_sectores`: `id`, `slug` (UNIQUE), `nombre`, `emoji`, `orden`, `activo`, `created_at`.
* `catalogo_plantillas`: `id`, `sector_id` FK → `catalogo_sectores` CASCADE, `nombre`, `descripcion`, `activo`, `created_at`. Índice `idx_catalogo_plantillas_sector`.
* `catalogo_categorias_maestro`: `id`, `plantilla_id` FK → `catalogo_plantillas` SET NULL, `sector_id` FK → `catalogo_sectores` CASCADE, `producto_id` FK → `productos_master` CASCADE, `cat_id`, `nombre`, `emoji`, `color`, `activo`, `created_at`, UNIQUE(`producto_id`, `cat_id`). Índices `idx_catalogo_categorias_sector`, `idx_catalogo_categorias_plantilla`, `idx_catalogo_categorias_producto`.
* `catalogo_partidas_maestro`: `id`, `categoria_maestro_id` FK → `catalogo_categorias_maestro` CASCADE, `svc_id` (UNIQUE), `nombre`, `calc_type` (`m2`\|`unit`\|`hour`\|`fixed`), `tipo_precio` (default `tarifa_pro`), `precio_tarifa_pro`, `unidad`, `activo`, `created_at`. Índice `idx_catalogo_partidas_categoria`.

### `planes_catalogo`

Metadata comercial: `id`, `slug` (UNIQUE), `nombre`, `precio_mensual`, `precio_anual`, `activo`, `limites` (jsonb), `created_at`. *(Nota: la fuente de verdad comercial vigente de precios/planes es el código — `roles-planes-oficial.ts` — y `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6, no esta tabla; no hay evidencia en el código actual de que el frontend lea de `planes_catalogo`.)*

### `partner_comisiones`

Tabla de **tarifas** oficiales del programa Partners (no confundir con `partner_comisiones_historial`, §4.9): `id`, `rango_desde`, `rango_hasta`, `descripcion`, `comision_texto`, `orden`, `activo`, `created_at`.

---

## 4.8 Empresas y empleados (Darivo Pro Empresa)

### `empresas`

Migraciones: baseline; `20260709180000_empresas_activo.sql` (columna `activo`).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `gerente_user_id` | uuid FK UNIQUE | → `auth.users` CASCADE |
| `razon_social` | text NOT NULL | |
| `ruc` / `direccion` / `telefono` | text | |
| `activo` | boolean NOT NULL DEFAULT true | Sustituye el proxy provisional `perfiles.onboarding_done` (`20260709180000_empresas_activo.sql`) |
| `created_at` / `updated_at` | timestamptz | |

**RLS:** el Gerente dueño (`gerente_user_id = auth.uid()`) o Admin (`is_darivo_admin()`).

### `empresa_empleados`

Migraciones: baseline; `20260706140000_roles_personalizados.sql` (columna `rol_personalizado_id`).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `empresa_id` | uuid FK | → `empresas` CASCADE |
| `nombre` / `email` / `telefono` | text | |
| `rol` | text | `CHECK` solo permite `'Técnico'` |
| `rol_personalizado_id` | uuid FK NULL | → `roles_personalizados(id)` ON DELETE SET NULL |
| `estado` | text | `Activo` \| `Inactivo` \| `Pendiente` |
| `ultima_actividad` | timestamptz | |
| `created_at` / `updated_at` | timestamptz | |

**Índices:** `idx_empresa_empleados_empresa`, `idx_empresa_empleados_rol_personalizado`.

**RLS:** Gerente de la empresa dueña o Admin.

### `roles_personalizados`

Añadida por `20260706140000_roles_personalizados.sql` — RBAC, **solo plan Business** (`11-ROLES-PLANES-PERMISOS-EMPRESA.md` §6.1).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `empresa_id` | uuid FK | → `empresas` CASCADE |
| `nombre` | text NOT NULL | UNIQUE(`empresa_id`, `nombre`); `CHECK` prohíbe `gerente`/`técnico`/`tecnico` (son roles implícitos) |
| `descripcion` | text | |
| `permisos` | jsonb NOT NULL DEFAULT `{}` | **Administrable pero inerte** — `MATRIZ_PERMISOS_APROBADA=false` en código, no gatea funcionalidades todavía (DT-04-02) |
| `activo` | boolean | |
| `created_at` / `updated_at` | timestamptz | |

**Índice:** `idx_roles_personalizados_empresa`. **RLS:** Gerente de la empresa dueña o Admin.

---

## 4.9 Programa Partner

No es un producto (`01-VISION-DEL-PRODUCTO.md` §3.2) — componente del ecosistema administrado desde Darivo Pro Admin.

### `partners`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK NULL | → `auth.users` SET NULL |
| `nombre` | text NOT NULL | |
| `email` | text UNIQUE NOT NULL | |
| `telefono` | text | |
| `codigo` | text UNIQUE NOT NULL | Código de enlace `/ref/{codigo}` |
| `enlace` | text NOT NULL | |
| `estado` | text | `Activo` \| `Pendiente` \| `Suspendido` |
| `created_at` / `updated_at` | timestamptz | |

**Índice:** `idx_partners_user`. **RLS:** el propio partner ve solo su fila (`user_id` o `email` del JWT); Admin control total.

### `partner_referidos`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `partner_id` | uuid FK | → `partners` CASCADE |
| `email` | text NOT NULL | |
| `fecha` | timestamptz | |
| `referred_user_id` | uuid FK NULL | → `auth.users` SET NULL |

**Índices:** `idx_partner_referidos_partner`, `idx_partner_referidos_referred_user`.

### `partner_comisiones_historial`

Añadida por `20260711120000_partner_comisiones_historial.sql` (`06-PANEL-ADMIN-PARTNERS.md` §5.2). **Registro inmutable** de cada comisión generada — no confundir con `partner_comisiones` (tabla de tarifas, §4.7).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `partner_id` | uuid FK | → `partners` CASCADE |
| `tipo` | text | `venta` (automático, vía trigger) \| `hito` (manual, sin UI todavía) |
| `referido_id` | uuid FK NULL | → `partner_referidos` SET NULL |
| `pago_evento_id` | uuid FK NULL | → `pagos_eventos` SET NULL |
| `referidos_en_momento` | integer NOT NULL | Snapshot del conteo — no recalcular a posteriori |
| `porcentaje_aplicado` | numeric(5,2) NOT NULL | 20.00 fijo para `venta` |
| `monto` | numeric(12,2) NOT NULL | |
| `moneda` | text NOT NULL DEFAULT `PEN` | |
| `estado` | text | `pendiente` \| `pagada` |
| `pagada_at` | timestamptz | |
| `created_at` | timestamptz | |

**Índices:** `idx_partner_comisiones_historial_partner`, `idx_partner_comisiones_historial_estado`, UNIQUE parcial `idx_partner_comisiones_historial_pago_evento_venta` (idempotencia: un mismo `pago_evento_id` no genera dos comisiones de venta).

**Trigger:** `on_pago_evento_generar_comision_venta` (`AFTER INSERT OR UPDATE OF estado ON pagos_eventos`) llama a `generar_comision_venta_partner()`.

> ⚠️ **Deuda técnica real, no cosmética** (documentada en la propia migración): el trigger solo dispara `WHEN (NEW.estado = 'exitoso')`, pero `pagos_eventos.estado` es texto libre **sin `CHECK` constraint**, y a la fecha de esta migración no existe integración real del webhook de dLocal que confirme que `'exitoso'` es el valor real que se escribirá. **Ver §9, DT-02-06.**

**RLS:** el partner solo lee sus propias comisiones (nunca inserta/edita directo); Admin control total.

---

## 4.10 Soporte

### `soporte_tickets`

Columnas: `id`, `user_id` FK, `user_email`, `user_nombre`, `plan_snapshot`, `asunto` NOT NULL, `descripcion` NOT NULL, `estado` (`Abierto`\|`En progreso`\|`Resuelto`\|`Cerrado`), `created_at`, `ultima_respuesta_at`. Índice `idx_soporte_tickets_user_estado`. **RLS:** dueño del ticket o Admin.

### `soporte_mensajes`

Columnas: `id`, `ticket_id` FK → `soporte_tickets` CASCADE, `autor_tipo` (`usuario`\|`admin`), `autor_user_id` FK NULL, `mensaje` NOT NULL, `created_at`. Índices `idx_soporte_mensajes_ticket`, `idx_soporte_mensajes_autor`. **RLS:** vía existencia del ticket del usuario, o Admin.

---

## 4.11 Pagos y suscripciones

### `suscripciones`

Migraciones: baseline; `20260706140000_roles_personalizados.sql` (columnas de límites).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK UNIQUE | |
| `plan_tipo` | text | `gratis`\|`basico`\|`pro`\|`business` (mismo renombrado que `perfiles.plan_tipo`) |
| `estado` | text | `activa`\|`cancelada`\|`pausada`\|`expirada` |
| `monto_mensual` | numeric(10,2) | |
| `moneda` | text | default `PEN` |
| `inicio` / `fin` | timestamptz | |
| `dlocal_subscription_id` | text | |
| `limite_roles_personalizados` | integer NULL | Añadida `20260706140000` |
| `limite_tecnicos` | integer NULL DEFAULT 5 | Añadida `20260706140000` |
| `created_at` / `updated_at` | timestamptz | |

**RLS:** solo SELECT del propio dueño (no hay policy de escritura directa — se actualiza vía backend/webhook).

### `pagos_eventos`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK NULL | SET NULL |
| `suscripcion_id` | uuid FK NULL | → `suscripciones` SET NULL |
| `evento_tipo` | text NOT NULL | |
| `monto` | numeric(12,2) | **Sin NOT NULL** — ver nota de deuda técnica en §4.9/§9 |
| `moneda` | text | default `PEN` |
| `estado` | text | **Texto libre, sin `CHECK` constraint** — ver DT-02-06 |
| `dlocal_order_id` | text | |
| `payload` | jsonb | |
| `created_at` | timestamptz | |

**Índice:** `idx_pagos_eventos_user_fecha`, `idx_pagos_eventos_suscripcion`. **RLS:** solo SELECT del propio dueño.

---

## 4.12 Admin interno

### `darivo_admin_empleados`

Columnas: `id`, `user_id` FK UNIQUE, `email` NOT NULL, `nombre`, `cargo`, `departamento`, `activo` DEFAULT true, `created_at`. **RLS:** solo Admin (`is_darivo_admin()`), incluyendo la propia tabla que alimenta esa función.

---

## 4.13 Cierre / gastos

### `gastos`

Columnas: `id`, `user_id` FK, `proveedor` NOT NULL, `categoria` NOT NULL, `fecha` DEFAULT `current_date`, `total` numeric(12,2) NOT NULL, `metodo_pago`, `descripcion`, `estado` (`Registrado`\|`Verificado`\|`Anulado`), `documento_storage_path`, `created_at`. Índice `idx_gastos_user_fecha`. **RLS:** `auth.uid() = user_id`.

---

# 5. Relaciones (diagrama lógico)

```
auth.users
    ├── perfiles (1:1) ── empresa_id → empresas · plan_origen_partner_id → partners
    ├── clientes (1:N)
    ├── cotizaciones (1:N) ── cliente_id → clientes
    │       └── cotizacion_items (1:N)
    ├── facturas (1:N) ── from_quote_id → cotizaciones
    ├── categorias / partidas_propias / precios_usuario (1:N)
    ├── precios_historial / calculos_log / ia_uso_diario (1:N)
    ├── cotizacion_series (1:1)
    ├── suscripciones (1:1) ── pagos_eventos (1:N)
    ├── gastos (1:N)
    └── soporte_tickets (1:N) ── soporte_mensajes (1:N)

productos_master → catalogo_categorias_maestro → catalogo_partidas_maestro
catalogo_sectores → catalogo_plantillas
configuracion_regional · planes_catalogo · comprobante_series · partner_comisiones (independientes)

empresas (1:N) ── empresa_empleados ── rol_personalizado_id → roles_personalizados
empresas (1:N) ── roles_personalizados

partners (1:N) ── partner_referidos ── referred_user_id → auth.users
partners (1:N) ── partner_comisiones_historial ── referido_id → partner_referidos
                                                 └── pago_evento_id → pagos_eventos

darivo_admin_empleados (independiente — alimenta is_darivo_admin())
```

---

# 6. IDs y claves

| Entidad | PK | FKs principales |
|---------|-----|-----------------|
| Perfil | `perfiles.id` = user uuid | auth.users, empresa_id?, plan_origen_partner_id? |
| Cliente | uuid | user_id |
| Cotización | uuid | user_id, cliente_id? |
| Línea cotización | uuid | cotizacion_id |
| Factura | inv_id uuid | user_id, from_quote_id? |
| Serie COT | user_id | auth.users |
| Serie comprobante | serie text | — |
| Empresa | uuid | gerente_user_id (UNIQUE) |
| Empleado empresa | uuid | empresa_id, rol_personalizado_id? |
| Rol personalizado | uuid | empresa_id |
| Partner | uuid | user_id? |
| Referido Partner | uuid | partner_id, referred_user_id? |
| Comisión histórica Partner | uuid | partner_id, referido_id?, pago_evento_id? |
| Suscripción | uuid | user_id (UNIQUE) |
| Evento de pago | uuid | user_id?, suscripcion_id? |

**Regla Visión §14:** relaciones por ID, no por teléfono/nombre. Teléfono único es índice de deduplicación (`clientes_user_telefono_idx`), no FK.

---

# 7. Índices relevantes

| Índice | Tabla | Propósito |
|--------|-------|-----------|
| `idx_clientes_user` | clientes | listado por tenant |
| `idx_clientes_nombre` | clientes | búsqueda por nombre |
| `clientes_user_telefono_idx` | clientes | UNIQUE teléfono/usuario |
| `cotizaciones_user_cot_num_idx` | cotizaciones | UNIQUE COT/usuario |
| `idx_cotizaciones_cliente` | cotizaciones | ficha cliente |
| `idx_cotizaciones_wa_enviado` | cotizaciones | reportes WA |
| `idx_cotizacion_items_cotizacion` | cotizacion_items | apertura de cotización (FK, auditoría BD 10/07/2026) |
| `idx_facturas_user` | facturas | filtro RLS de cada listado (auditoría BD 10/07/2026) |
| `idx_facturas_from_quote` | facturas | trazabilidad cotización → factura |
| `idx_precios_historial_*` | precios_historial | auditoría precios |
| `idx_calculos_log_*` | calculos_log | auditoría cálculos |
| `idx_perfiles_onboarding` | perfiles | usuarios pendientes onboarding |
| `idx_empresas_gerente` | — | **Eliminado** 10/07/2026 (`20260710130000_drop_duplicate_empresas_index.sql`) — redundante con el UNIQUE implícito de `gerente_user_id` |
| `idx_partner_comisiones_historial_pago_evento_venta` | partner_comisiones_historial | UNIQUE parcial — idempotencia de comisión por evento de pago |

---

# 8. RLS — resumen

| Tabla | Modelo |
|-------|--------|
| perfiles, cotizaciones, facturas, partidas_propias, precios_usuario, categorias, precios_historial, calculos_log, ia_uso_diario, cotizacion_series, gastos | `auth.uid() = user_id` (o `id` en perfiles) |
| cotizacion_items | subquery cotización del usuario |
| clientes | 4 políticas CRUD explícitas |
| productos_master, configuracion_regional, planes_catalogo, partner_comisiones, catalogo_* | SELECT autenticados; admin vía `is_darivo_admin()` |
| comprobante_series | **Deny-all** — RLS activo, sin políticas `CREATE POLICY`. Acceso exclusivo vía función `SECURITY DEFINER` `asignar_inv_num()`. Diseño intencional (ningún panel la consulta directamente). |
| empresas, empresa_empleados, roles_personalizados | Gerente dueño (vía `empresa_id`/`gerente_user_id`) o Admin |
| partners | El propio partner ve solo su fila (`user_id` o `email` del JWT); Admin control total |
| partner_referidos, partner_comisiones_historial | El partner dueño lee (subquery vía `partners`); Admin control total. Sin policy de INSERT/UPDATE para el rol Partner — nacen solo vía función `SECURITY DEFINER` o acción manual de Admin |
| soporte_tickets, soporte_mensajes | Dueño del ticket (o subquery del ticket) o Admin |
| suscripciones, pagos_eventos | Solo SELECT del propio dueño — sin policy de escritura directa (actualización vía backend/webhook) |
| darivo_admin_empleados | Solo Admin |

---

# 9. Deuda técnica y dominios pendientes

| ID | Descripción | Estado |
|----|-------------|--------|
| DT-02-01 | `comprobante_series` no usada; numeración factura en app | Escalabilidad / futuro |
| DT-02-02 | Catálogo Maestro objetivo (Doc 21) vs `categorias` overlay | Transición en curso |
| DT-02-03 | Tablas de empresas, suscripciones, partners | ✅ Resuelta — todas documentadas en §4.8–§4.11 |
| DT-02-04 | Proveedor IA — OpenAI implementado (Tarea 07) | ✅ Resuelta |
| DT-02-05 | `04-SIMBOLOS-Y-BOTONES.md` ausente | Documentación Móvil, sin fecha |
| DT-02-06 | `pagos_eventos.estado` es texto libre sin `CHECK` constraint; el trigger `on_pago_evento_generar_comision_venta` asume el literal `'exitoso'` como placeholder — no existe todavía integración real del webhook dLocal que confirme ese valor (ver comentario literal en `20260711120000_partner_comisiones_historial.sql`) | **Pendiente — confirmar antes de activar pagos Partner en producción** |
| DT-02-07 | `productos_master` no tiene `orden` ni `updated_at` — el módulo Admin 05 no puede reordenar productos ni auditar cambios hasta decidir si se añaden (requiere migración, pendiente de confirmación de Mohamed) | Pendiente de decisión del propietario |
| DT-02-08 | `roles_personalizados.permisos` es administrable desde la UI pero no gatea ninguna funcionalidad todavía (`MATRIZ_PERMISOS_APROBADA=false` en código) | Pendiente de decisión del propietario (activar RBAC de verdad) |

---

# 10. Historial de migraciones

| Fecha | Archivo | Contenido |
|-------|---------|-----------|
| 05/07/2026 | `20260705120000_baseline_v2.sql` | 32 tablas · 6 funciones · 11 triggers · RLS · storage · realtime |
| 06/07/2026 | `20260706123000_plan_tipo_business.sql` | `plan_tipo`: `empresa` → `business` en `perfiles` y `suscripciones` |
| 06/07/2026 | `20260706140000_roles_personalizados.sql` | Tabla `roles_personalizados` (tabla 33) · `empresa_empleados.rol_personalizado_id` · `suscripciones.limite_*` · RLS tenant |
| 06/07/2026 | `20260706160000_factura_6_estados.sql` | 6 estados oficiales `facturas.inv_status` · default `Borrador` · remapeo `Pendiente`→`Emitida` |
| 08/07/2026 | `20260708120000_rename_presupuestos_to_cotizaciones.sql` | `presupuestos`→`cotizaciones`, `presupuesto_items`→`cotizacion_items` (rename, sin pérdida de datos) |
| 09/07/2026 | `20260709180000_empresas_activo.sql` | `empresas.activo` (sustituye proxy `perfiles.onboarding_done`) |
| 10/07/2026 | `20260710120000_add_missing_fk_indexes.sql` | 9 índices en columnas FK sin índice explícito |
| 10/07/2026 | `20260710130000_drop_duplicate_empresas_index.sql` | Elimina `idx_empresas_gerente` (redundante) |
| 11/07/2026 | `20260711120000_partner_comisiones_historial.sql` | Tabla `partner_comisiones_historial` (tabla 34) · función + trigger `generar_comision_venta_partner` |
| 11/07/2026 | `20260711130000_plan_origen_partner.sql` | `perfiles.plan_origen_partner_id` |
| — | `supabase/seed.sql` | Productos, planes, catálogo maestro, series |

Migraciones incrementales futuras: `YYYYMMDDHHMMSS_descripcion.sql` en `supabase/migrations/`.

---

# 11. Estado del documento

**Versión:** 3.0

**Estado:** Documento Oficial — esquema V2 completo, 34 tablas, sincronizado con migraciones reales (11/07/2026).

---

## Protección del documento

Este documento MD forma parte de la documentación oficial de Darivo Pro.

**Solo el propietario del proyecto está autorizado a crear, modificar, reorganizar o eliminar este documento.**

**Fin del documento.**
