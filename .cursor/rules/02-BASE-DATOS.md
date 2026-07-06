# 02 – BASE DE DATOS – DARIVO PRO (SUPABASE)

**Versión:** 2.1

**Fecha:** 05/07/2026

**Estado:** Documento técnico oficial — esquema V2 (32 tablas) · inicio producto

**Cambio principal (v2.1):** definido esquema mínimo de columnas de `productos_master` (§4.7) para soportar el nuevo módulo Admin de Edición de Productos (05).

**Referencia:** `01-VISION-DEL-PRODUCTO.md` v2.6 §14 · `DARIVO-PRO-ARQUITECTURA-MAESTRA.md` §7 · `03-AUTENTICACION-DARIVO-PRO.md` v1.0 · `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.1

**Fuente de verdad del esquema:** `supabase/migrations/20260705120000_baseline_v2.sql` y migraciones incrementales posteriores. Datos iniciales: `supabase/seed.sql`. Ante contradicción con este documento, **prevalecen las migraciones aplicadas**.

---

# 1. Objetivo

Documentar oficialmente la **estructura de base de datos implementada** en Supabase (PostgreSQL) para Darivo Pro Móvil y capas compartidas del ecosistema.

**No define** lógica de negocio ni reglas funcionales de módulos — solo estructura técnica, relaciones, IDs, índices y RLS.

**Principios estratégicos:** `01-VISION-DEL-PRODUCTO.md` §14.

---

# 2. Alcance actual

## 2.1 Implementado (baseline oficial — 32 tablas)

Esquema completo del ecosistema Darivo Pro: Móvil, Empresa, Admin y Panel Partner.

## 2.2 Evolución del esquema

Cambios posteriores al baseline mediante migraciones incrementales en `supabase/migrations/` (convención `YYYYMMDDHHMMSS_descripcion.sql`).

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

---

# 4. Inventario de tablas

## 4.1 Autenticación y perfil

### `perfiles`

Extiende `auth.users`. Creada en 001; ampliada en 004, 005, 006, 007.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | FK → `auth.users(id)` |
| `razon_social` | text | |
| `ruc` | text | |
| `direccion` | text | |
| `telefono` | text | |
| `moneda` | text | default `PEN` |
| `simbolo` | text | default `S/` |
| `categorias` | text[] | onboarding (004) |
| `onboarding_done` | boolean | default false (004) |
| `plan_tipo` | text | `gratis` (sin suscripción) \| `basico` \| `pro` (04 §6) \| `empresa` (valor técnico legacy — no plan comercial; ver `04-ROLES-PLANES-PERMISOS-DARIVO-PRO.md` §4) (005) |
| `cta_detracciones` | text | cuenta BN (007) |
| `created_at` / `updated_at` | timestamptz | |

**RLS:** usuario solo accede a su fila (`auth.uid() = id`).

---

## 4.2 Clientes

### `clientes`

Migraciones: 002, 003, 013, 016.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | → `auth.users` |
| `nombre` | text NOT NULL | |
| `telefono` | text | solo dígitos (014) |
| `ruc` | text | |
| `direccion` | text | |
| `ciudad` | text | |
| `notas` | text | |
| `created_at` / `updated_at` | timestamptz | |

**Índices:** `idx_clientes_user`, `idx_clientes_nombre`, `clientes_user_telefono_idx` (UNIQUE parcial por teléfono).

**RLS:** políticas explícitas SELECT / INSERT / UPDATE / DELETE (003, restauradas 016).

---

## 4.3 Cotizaciones

### `presupuestos`

Migraciones: 001, 008, 010, 013, 014.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `cliente_id` | uuid FK | → `clientes(id)` ON DELETE SET NULL (014) |
| `cot_num` | text | COT-NNN vía trigger |
| `client_name` | text NOT NULL | snapshot cliente |
| `phone` / `city` | text | |
| `margin` | numeric(5,2) | default 40 |
| `total_base` / `total_labor` / `total_final` | numeric(12,2) | |
| `status` | text | Borrador \| Pendiente de firma \| Aprobado |
| `notes` | text | |
| `pdf_url` | text | (010) |
| `wa_enviado_at` | timestamptz | (010) |
| `created_at` / `updated_at` | timestamptz | |

**Índices:** `presupuestos_user_cot_num_idx` (UNIQUE), `idx_presupuestos_wa_enviado`, `idx_presupuestos_cliente`.

### `presupuesto_items`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `presupuesto_id` | uuid FK | → `presupuestos` CASCADE |
| `svc_id` | text | referencia catálogo |
| `cat_label` / `svc_label` | text | snapshot |
| `calc_type` / `unit` | text | |
| `base_price` / `qty` / `unit_price` / `subtotal` | numeric | |
| `created_at` | timestamptz | |

**RLS:** vía existencia de la cotización del usuario.

### `cotizacion_series`

| Columna | Tipo | Notas |
|---------|------|-------|
| `user_id` | uuid PK | → `auth.users` |
| `ultimo_num` | integer | correlativo COT por usuario |

---

## 4.4 Facturas

### `facturas`

Migraciones: 001, 007, 013.

| Columna | Tipo | Notas |
|---------|------|-------|
| `inv_id` | uuid PK | |
| `user_id` | uuid FK | |
| `inv_num` | text NOT NULL | B001-/F001- (generado en app) |
| `inv_date` | date | |
| `inv_status` | text | Pendiente \| Emitida \| Cobrada |
| `tipo_doc` | text | boleta \| factura (007) |
| `client_name` / `client_ruc` / `client_dni` / `client_dir` | text | |
| `moneda` / `sym` | text | |
| `items` | jsonb | líneas snapshot |
| `subtotal_base` / `igv_amount` / `total_final` | numeric | |
| `detraccion_*` / `neto_cobrar` / `cta_detracciones` | numeric/text | SUNAT (007) |
| `from_quote_id` | uuid FK | → `presupuestos` SET NULL |
| `biz_data` / `pdf_url` | jsonb / text | |
| `created_at` / `updated_at` | timestamptz | |

### `comprobante_series`

| Columna | Tipo | Notas |
|---------|------|-------|
| `serie` | text PK | `B001`, `F001` — **global**, no por usuario |
| `ultimo_num` | integer | |

> **Deuda técnica:** el frontend numera leyendo `facturas.inv_num` (`nextNumeroComprobante`). Esta tabla no participa en el flujo actual. Riesgo de colisión en concurrencia — ver §9.

---

## 4.5 Catálogo y precios (capa usuario)

### `categorias`

Overlay **por usuario** sobre catálogo base en código (`catalog.ts`). Migración 009.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `cat_id` | text | slug; UNIQUE(user_id, cat_id) |
| `nombre` / `emoji` / `color` | text | |
| `es_base` | boolean | override categoría base |
| `activa` | boolean | |
| `created_at` | timestamptz | |

**Realtime:** publicación `supabase_realtime` (009).

### `partidas_propias`

Partidas custom del usuario (001).

### `precios_usuario`

Override de precio por `svc_id` (001). UNIQUE(user_id, svc_id).

### `precios_historial`

Auditoría de cambios de precio (011).

---

## 4.6 IA y auditoría interna

### `ia_uso_diario`

| Columna | Tipo | Notas |
|---------|------|-------|
| `user_id` + `fecha` | PK compuesta | |
| `llamadas` | int | RPC `incrementar_ia_uso` (005) |

### `calculos_log`

Snapshot de totales al guardar cotización (012). FK opcional → `presupuestos`.

---

## 4.7 Catálogo maestro y lookup (baseline)

Tablas globales sin `user_id` salvo políticas RLS de lectura autenticados / admin.

### `productos_master`

Productos del ecosistema (`darivo-pro`) — cabecera de clasificación del Catálogo Maestro (`01-VISION-DEL-PRODUCTO.md` §3.1; Doc 21 §4.1).

Esquema mínimo (v1 — pendiente de validar contra Supabase real antes de migrar):

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | `uuid_generate_v4()` |
| `nombre` | text NOT NULL | Ej. "Darivo Pro Móvil" |
| `codigo` | text UNIQUE NOT NULL | Slug interno usado como referencia en `catalogo_categorias_maestro.producto_id` — ej. `movil`, `admin`, `empresa` |
| `descripcion` | text NULL | Opcional |
| `activo` | boolean DEFAULT true | Ocultar como filtro sin borrar categorías asociadas |
| `orden` | integer DEFAULT 0 | Orden de visualización en el filtro |
| `created_at` / `updated_at` | timestamptz | Estándar |

El **Programa Partner** no tiene fila en esta tabla (`01-VISION-DEL-PRODUCTO.md` §3.2).

### `configuracion_regional`

País, moneda, IGV, zona horaria (`PE` inicial).

### `catalogo_sectores` · `catalogo_plantillas` · `catalogo_categorias_maestro` · `catalogo_partidas_maestro`

Catálogo Maestro oficial (Doc 21). Sustituye el lookup prototipo `categorias_servicios`.

### `planes_catalogo` · `partner_comisiones` · `comprobante_series`

Metadata comercial y series globales.

---

# 5. Relaciones (diagrama lógico)

```
auth.users
    ├── perfiles (1:1)
    ├── clientes (1:N)
    ├── presupuestos (1:N) ── cliente_id → clientes
    │       └── presupuesto_items (1:N)
    ├── facturas (1:N) ── from_quote_id → presupuestos
    ├── categorias / partidas_propias / precios_usuario (1:N)
    ├── precios_historial / calculos_log / ia_uso_diario (1:N)
    └── cotizacion_series (1:1)

productos_master → catalogo_categorias_maestro → catalogo_partidas_maestro
catalogo_sectores → catalogo_plantillas
configuracion_regional · planes_catalogo · comprobante_series (independientes)
empresas · partners · soporte_* · suscripciones · gastos (ecosistema multi-producto)
```

---

# 6. IDs y claves

| Entidad | PK | FKs principales |
|---------|-----|-----------------|
| Perfil | `perfiles.id` = user uuid | auth.users |
| Cliente | uuid | user_id |
| Cotización | uuid | user_id, cliente_id? |
| Línea cotización | uuid | presupuesto_id |
| Factura | inv_id uuid | user_id, from_quote_id? |
| Serie COT | user_id | auth.users |
| Serie comprobante | serie text | — |

**Regla Visión §14:** relaciones por ID, no por teléfono/nombre. Teléfono único es índice de deduplicación (`clientes_user_telefono_idx`), no FK.

---

# 7. Índices relevantes

| Índice | Tabla | Propósito |
|--------|-------|-----------|
| `idx_clientes_user` | clientes | listado por tenant |
| `idx_clientes_nombre` | clientes | búsqueda por nombre |
| `clientes_user_telefono_idx` | clientes | UNIQUE teléfono/usuario |
| `presupuestos_user_cot_num_idx` | presupuestos | UNIQUE COT/usuario |
| `idx_presupuestos_cliente` | presupuestos | ficha cliente |
| `idx_presupuestos_wa_enviado` | presupuestos | reportes WA |
| `idx_precios_historial_*` | precios_historial | auditoría precios |
| `idx_calculos_log_*` | calculos_log | auditoría cálculos |
| `idx_perfiles_onboarding` | perfiles | usuarios pendientes onboarding |

---

# 8. RLS — resumen

| Tabla | Modelo |
|-------|--------|
| perfiles, presupuestos, facturas, partidas_propias, precios_usuario, categorias, precios_historial, calculos_log, ia_uso_diario, cotizacion_series | `auth.uid() = user_id` (o id en perfiles) |
| presupuesto_items | subquery cotización del usuario |
| clientes | 4 políticas CRUD explícitas |
| productos_master, configuracion_regional, catalogo_* | SELECT autenticados; admin vía `is_darivo_admin()` |
| comprobante_series | SELECT autenticados (sin aislamiento por tenant) |

---

# 9. Deuda técnica y dominios pendientes

| ID | Descripción | Tarea catálogo |
|----|-------------|----------------|
| DT-02-01 | `comprobante_series` no usada; numeración factura en app | Escalabilidad / futuro |
| DT-02-02 | Catálogo Maestro objetivo (Doc 21) vs `categorias` overlay | Tarea 05/Admin |
| DT-02-03 | Tablas multiempresa, suscripciones, partners | Tareas Admin / futuro |
| DT-02-04 | Proveedor IA — OpenAI implementado (Tarea 07) | ✅ Resuelta |
| DT-02-05 | `04-SIMBOLOS-Y-BOTONES.md` ausente | Documentación Móvil |

---

# 10. Historial de migraciones

| Versión | Archivo | Contenido |
|---------|---------|-----------|
| Baseline oficial | `20260705120000_baseline_v2.sql` | 32 tablas · funciones · triggers · RLS · storage · realtime |
| Seed | `supabase/seed.sql` | Productos, planes, catálogo maestro, series |

Migraciones incrementales futuras: `YYYYMMDDHHMMSS_descripcion.sql` en `supabase/migrations/`.

---

# 11. Estado del documento

**Versión:** 2.0

**Estado:** Documento Oficial — esquema V2 completo · inicio producto (05/07/2026).

---

## Protección del documento

Este documento MD forma parte de la documentation oficial de Darivo Pro.

**Solo el propietario del proyecto está autorizado a crear, modificar, reorganizar o eliminar este documento.**

**Fin del documento.**
