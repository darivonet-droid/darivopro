# 05 – PANEL ADMIN – EDICIÓN DE PRODUCTOS

**Versión:** 1.1

**Estado:** ✅ Documento oficial — aprobado por el propietario (05/07/2026). Pendiente únicamente de imagen oficial (§2). Código implementado (`frontend/src/app/admin/productos/`).

**Relacionado:** `01-VISION-DEL-PRODUCTO.md` §3, §3.1, §3.2, §4, §11 · `02-BASE-DATOS.md` §4.7 · `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO.md` §4.1 · `10-PANEL-ADMIN-CATALOGO-MAESTRO.md`

---

## Historial de aprobación

* **05/07/2026:** número oficial **05** asignado en `INDICE-OFICIAL-PANEL-ADMIN.md` v1.5. Esquema de columnas de `productos_master` definido en `02-BASE-DATOS.md` v2.1. Doc 21 ya incorporaba la jerarquía desde su v1.3 (§4.1). Corregida la lista de productos: **el Programa Partner no participa** (`01-VISION-DEL-PRODUCTO.md` §3.2) — se elimina de todas las listas de este documento respecto a la versión propuesta original.
* **09/07/2026 (v1.1):** el esquema real de `productos_master` (`supabase/migrations/20260705120000_baseline_v2.sql`) es `id, slug, nombre, descripcion, activo, created_at` — **no existen** las columnas `codigo`, `orden` ni `updated_at` documentadas en v1.0. Este MD ya no reflejaba el esquema real de BD (que prevalece siempre — `CLAUDE.md` §"Fuente de verdad del esquema"). Se reemplazan las referencias a `codigo` por `slug` y se marcan `orden`/`updated_at` como no implementadas en §7 y §9. Módulo ya construido en código (`frontend/src/app/admin/productos/`, `frontend/src/lib/admin-queries.ts`).

---

# 1. Objetivo

El módulo **Edición de Productos** permite administrar los **productos oficiales del ecosistema Darivo Pro** que sirven de cabecera para el Catálogo Maestro.

Este módulo pertenece al **Panel Administrador**.

Cada producto (**Móvil, Admin, Empresa**) actúa como filtro de primer nivel: las categorías del Catálogo Maestro (`10-PANEL-ADMIN-CATALOGO-MAESTRO.md`) se asocian a uno o varios productos mediante `producto_id`.

**El Programa Partner no es un producto** (`01-VISION-DEL-PRODUCTO.md` §3.2) y no aparece en este módulo ni en su listado.

## Administración exclusiva

La gestión de Productos tiene una única administración oficial: **Darivo Pro Admin** (`01-VISION-DEL-PRODUCTO.md` §4, §11).

Ningún otro producto del ecosistema puede crear, editar o eliminar productos.

---

# 2. Imagen oficial

**Pendiente.** No existe todavía diseño visual aprobado por el propietario para este módulo — único punto abierto de este documento.

Hasta que exista imagen oficial, el diseño descrito en este documento sigue el mismo patrón visual que el resto del Panel Administrador (`10-PANEL-ADMIN-CATALOGO-MAESTRO.md`, `03-PANEL-ADMIN-USUARIOS.md`) por consistencia, **no por diseño aprobado**.

---

# 3. Diseño oficial

Pendiente de imagen oficial (§2). Mientras tanto, se aplican las reglas generales de diseño de Darivo Pro Admin:

* No modificar diseño, colores, tipografía ni componentes sin aprobación.
* Mismo lenguaje visual que el resto del Panel Administrador.

---

# 4. Navegación del Panel Administrador

Número oficial: **05** (`INDICE-OFICIAL-PANEL-ADMIN.md` v1.5).

* Dashboard
* Productos *(módulo actual)*
* Catálogo Maestro
* Usuarios
* Gestión de Suscripciones
* Roles y Permisos
* Empresas
* Empleados
* Configuración de APIs
* Partners
* Soporte
* Configuración

---

# 5. Estructura de la pantalla

* Listado de productos (Móvil, Admin, Empresa)
* Panel de edición por producto seleccionado
* Historial de cambios

---

# 6. Acciones visibles

* Editar producto
* Activar / Desactivar producto
* Ver categorías asociadas
* Buscar
* Ver historial

No existe acción "Nuevo producto": los 3 productos del ecosistema están definidos en `01-VISION-DEL-PRODUCTO.md` §3 y no se crean desde este panel — solo se editan (§12).

---

# 7. Información mostrada

Por producto:

* Nombre del producto
* Identificador interno (`slug`) — antes documentado como `codigo` en v1.0, no existe esa columna en BD
* Descripción
* Estado (Activo / Inactivo)
* Número de categorías asociadas (`catalogo_categorias_maestro` vía `producto_id`)
* ~~Última actualización~~ — no implementada, `productos_master` no tiene columna `updated_at`
* ~~Usuario que realizó la actualización~~ — no implementada, sin tabla de auditoría

---

# 8. Arquitectura funcional oficial

## Jerarquía del Catálogo Maestro

```
Producto (Móvil / Admin / Empresa — tabla productos_master)
    ↓
Sector profesional (Doc 21 §5)
    ↓
Categoría (catalogo_categorias_maestro)
    ↓
Partida (catalogo_partidas_maestro)
```

Fuente: `02-BASE-DATOS.md` §4.7 · Doc 21 §4.1.

## Relación con Catálogo Maestro

* Cada categoría del Catálogo Maestro (`10-PANEL-ADMIN-CATALOGO-MAESTRO.md`) pertenece a uno o varios productos.
* Desactivar un producto no elimina sus categorías ni partidas; solo lo oculta como filtro activo.

## Productos oficiales

Según `01-VISION-DEL-PRODUCTO.md` §3: **Darivo Pro Admin, Darivo Pro Móvil, Darivo Pro Empresa**. Son los únicos 3. El Programa Partner se administra por separado (`06-PANEL-ADMIN-PARTNERS.md`) y no es un producto (§3.2).

**No se crean productos nuevos desde este panel.** Si en el futuro se lanza un nuevo producto del ecosistema, deberá aprobarse primero en `01-VISION-DEL-PRODUCTO.md` §3 antes de poder editarse aquí (regla de jerarquía documental — Visión §12).

---

# 9. Base de datos

Tabla: `productos_master` (`02-BASE-DATOS.md` §4.7).

Esquema real (v1.1, verificado en `supabase/migrations/20260705120000_baseline_v2.sql` — prevalece sobre cualquier versión anterior de este MD):

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | `uuid_generate_v4()` |
| `slug` | text UNIQUE NOT NULL | Identificador interno — `movil`, `admin`, `empresa`. Reemplaza a `codigo`, que **no existe** en BD. |
| `nombre` | text NOT NULL | Ej. "Darivo Pro Móvil" |
| `descripcion` | text NULL | Opcional |
| `activo` | boolean DEFAULT true | |
| `created_at` | timestamptz | Estándar |

**No existen** `orden` ni `updated_at` — quedan fuera del esquema real hasta que se apruebe y ejecute una migración que las añada.

Este panel edita `nombre`, `descripcion` y `activo` de las 3 filas ya existentes (Móvil, Admin, Empresa). `slug` no se edita (clave funcional referenciada por FKs del Catálogo Maestro). No crea ni elimina filas.

---

# 10. API

Pendiente de documentación oficial (junto con el resto de rutas API del Panel Admin — sin prioridad específica sobre otros módulos).

---

# 11. Permisos

Acceso exclusivo al rol **Administrador Darivo** (plataforma), conforme a `01-VISION-DEL-PRODUCTO.md` §8.

Este MD no define permisos propios; los permisos oficiales del ecosistema están en `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md`.

---

# 12. Reglas

* No crear ni eliminar productos desde este panel — solo editar los 3 ya definidos en `01-VISION-DEL-PRODUCTO.md` §3.
* El Programa Partner nunca aparece en este módulo (§3.2).
* No inventar campos de base de datos fuera del esquema de §9.
* No inventar botones ni pantallas adicionales.
* No inventar permisos.
* Cualquier producto nuevo requiere aprobación previa en la Visión del Producto antes de poder editarse aquí.

---

# 13. Estado del documento

✅ **Documento oficial completo y sincronizado con el esquema real de BD (v1.1)**, salvo:

* Imagen oficial (§2) — único punto pendiente.
* Historial de cambios / auditoría (§7) — no implementado, requiere `updated_at` y tabla de auditoría (fuera de alcance sin migración aprobada).

---

## Protección del documento oficial

Este documento forma parte de la documentación oficial de Darivo Pro y constituye la fuente oficial del módulo Edición de Productos para Darivo Pro Admin.

**Solo el propietario del proyecto está autorizado a crear, modificar, reorganizar o eliminar este documento.**

Ninguna IA, herramienta o desarrollador podrá modificar este MD sin la autorización expresa del propietario.

**Fin del documento.**
