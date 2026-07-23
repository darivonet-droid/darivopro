# 2026-07-23 — FASE 1: aprobación de roles personalizados (§6.1) + audit de sincronización Admin↔Empresa↔Partner

**Estado:** cerrada (solo documentación — no se tocó código, por diseño).

## Qué se pidió

**Parte A** — pasar §6.1 de `11-ROLES-PLANES-PERMISOS-EMPRESA.md` de "propuesta pendiente de aprobación" a "aprobado, pendiente de construcción", tal como está escrita, y sincronizar Admin §7.2 y Visión §8. Sin construir código.

**Parte B** — auditar contradicciones entre los MD de roles/permisos de Admin, Empresa y Partner. Corregir las contradicciones que sean solo de texto; **reportar sin tocar** las que sean de comportamiento real en código (eso es Fase 2).

## Parte A — hecho

| Documento | Cambio |
|-----------|--------|
| `03-darivo-pro-empresa/11-ROLES-PLANES-PERMISOS-EMPRESA.md` v1.6 → **v1.7** | §6.1 pasa de ⚠️ propuesta a ✅ **aprobada** tal cual (solo Business · nombre único no reservado · catálogo de permisos de la matriz §5.2 · asignable a varios Técnicos como plantilla editable · al eliminar, sus Técnicos vuelven a Técnico base). "Propuesta de flujo" → "Flujo aprobado". Imagen oficial anotada como pendiente **visual**, explícitamente **no bloqueante del backend**. Nuevo **§6.2** con el estado real de construcción. |
| `02-darivo-pro-admin/12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` v1.6 → **v1.7** | §7.2 sincroniza la aprobación; confirma que el límite máximo de roles vive en Suscripciones **por cuenta**, sin duplicar cifras; añade que Móvil no administra roles personalizados. |
| `01-VISION-DEL-PRODUCTO.md` v2.20 → **v2.21** | §8 (Rol): Business habilita roles personalizados dentro de la secuencia Plan → Rol → Permisos, marcado como aprobado. Eliminado el texto que contradecía "aprobado". |

## Parte B — audit de sincronización

### Contradicciones de TEXTO encontradas y corregidas

1. **Visión §8 decía que los roles personalizados se administran "desde Darivo Pro Empresa y Darivo Pro Móvil".** Contradice Admin §16 ("Darivo Pro no administra Roles, Planes ni Permisos; únicamente aplica") y Empresa §1/§6.1 (módulo exclusivo del sidebar de Empresa, usuario Gerente). → Corregido en Visión: **solo Empresa**. Añadido también como viñeta explícita en Admin §7.2.
2. **Visión §8 y §19 decían que el límite máximo de roles personalizados lo "define el plan".** Contradice Admin §7.2 ("se administra individualmente por empresa desde Suscripciones, no como valor fijo por plan") y el esquema real (`suscripciones.limite_roles_personalizados`, columna **por cuenta**). → Corregido en Visión §8 y §19: disponibilidad por plan, **límite por cuenta**.
3. **Referencia circular sobre quién define el límite.** `04-PANEL-ADMIN-SUSCRIPCIONES.md` decía que el detalle de límites de roles personalizados "pertenece a la matriz de `12 – ROLES… ADMIN.md`", mientras Admin §7.2 decía que se administra desde Suscripciones. → Corregido en Suscripciones: el límite de roles personalizados vive ahí, por cuenta; el documento 12 solo remite.
4. **Referencias de versión desactualizadas** en `04-ROLES-PLANES-PERMISOS-DARIVO-PRO.md` (citaba Admin v1.5 y Empresa v1.0). → Actualizadas a v1.7 / v1.7.

### Sin contradicción (verificado)

- **Nombres de rol**: Administrador Darivo · Gerente · Técnico — idénticos en Visión §8, Admin §6 y Empresa §3/§6. La restricción de nombres reservados de §6.1 coincide con el `CHECK` real de BD (`gerente`/`técnico`/`tecnico`).
- **Quién administra qué**: Admin administra planes; Empresa administra permisos de sus empleados; Móvil solo aplica. Coherente en los 3 documentos.
- **Panel Partner** (`05-darivo-pro-partner/PANEL-PARTNER.md`): §9 dice expresamente "Permisos: pendiente del documento oficial de Roles y Permisos. No documentar permisos en este MD." **No define ningún rol ni permiso propio**, así que no puede contradecir nada. Sin cambios.

### Contradicciones de COMPORTAMIENTO en código — NO tocadas, para Fase 2

1. **§6.1 no está "sin construir": buena parte ya existe desde el 06/07/2026.** Tabla `roles_personalizados` (migración `20260706140000`, con `UNIQUE(empresa_id, nombre)`, `CHECK` de nombres reservados y RLS Gerente+Admin), columna `empresa_empleados.rol_personalizado_id` con `ON DELETE SET NULL` (cumple el punto 5 de §6.1), límite por cuenta en `suscripciones.limite_roles_personalizados`, y pantalla completa de crear/editar/eliminar/asignar en `RolesPermisosView.tsx` gateada a plan Business, más asignación desde `EmpresaEmpleadosView.tsx`. La documentación decía "pendiente de construcción" sin matizar.
2. **El RBAC personalizado es inerte.** Los permisos del rol se guardan pero **no gatean ninguna ruta ni acción**. Confirmado en el propio código: `matriz-permisos.ts` lo declara *"construido pero sin enforcement en rutas (RBAC custom inerte, decisión pendiente)"*. Es la construcción real que falta.
3. **El catálogo de permisos del rol no coincide con la matriz aprobada.** `MODULOS_PERMISO_ROL` expone 7 módulos (Inicio · Clientes · Cotizaciones · Facturas · Cierre · IA · Más — Mis Tarifas), mientras la matriz cerrada de Empresa §5.2 son **Factura** e **Informe**. Además, exponer un toggle de **Mis Tarifas** contradice frontalmente la regla de §5.2 y Admin §6.3 ("el Técnico no administra Mis Tarifas"), cuyo bloqueo real sí se construyó el 21/07/2026.
4. **`AdminBadge` "🔒 Solo lectura"** se muestra en `RolesPermisosView.tsx` sobre una pantalla que sí es interactiva (crea, edita, elimina y asigna roles). Etiqueta engañosa, no un fallo funcional.

Estos 4 puntos quedaron escritos en `11-ROLES-PLANES-PERMISOS-EMPRESA.md` §6.2 (los 3 primeros) para que la Fase 2 no rehaga lo que ya existe.

## No hecho, a propósito

- No se creó ninguna tabla, RLS ni Server Action de roles personalizados (Fase 2).
- No se tocó el código de la matriz de permisos (tarea aparte, en curso).
- No se tocó ningún archivo `.ts`/`.tsx`/`.sql`.

## Pendiente

- **Nueva imagen oficial** de §6.1 (Empresa §2) — pendiente visual del propietario, no bloquea backend.
- **Fase 2**: enforcement real del rol personalizado + alinear `MODULOS_PERMISO_ROL` con la matriz aprobada (§5.2) + decidir qué hacer con el toggle de Mis Tarifas + corregir el badge "Solo lectura".
