# 10 – MÓDULO EMPLEADOS – DARIVO PRO EMPRESA

**Versión:** 1.0

**Estado:** ✅ Producción completada — imagen oficial (fase global §7 — 02/07/2026).

**Relacionado:** `01-VISION-DEL-PRODUCTO.md` §6, §8 · `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §6.8 · `11-ROLES-PLANES-PERMISOS-EMPRESA.md`

⚠️ Este documento es la **única fuente autorizada** del **Módulo Empleados** en Darivo Pro Empresa.

> **Módulo exclusivo Empresa** — no existe equivalente en Darivo Pro Móvil. Lógica estratégica: Visión §6. **No** confundir con empleados internos Darivo (`02-darivo-pro-admin/07-PANEL-ADMIN-EMPLEADOS.md`).

---

# 0. Fuentes consultadas (Reglas §7.2 · §15 FASE 1)

| Fuente | Documento | Uso |
|--------|-----------|-----|
| Estrategia | `01-VISION-DEL-PRODUCTO.md` §6, §8 | Gerente, Técnicos, Móvil |
| Referencia diseño escritorio | `02-darivo-pro-admin/03-PANEL-ADMIN-USUARIOS.md` | Tabla + toolbar (sin lógica plataforma) |
| Roles Admin | `02-darivo-pro-admin/12 – ROLES… ADMIN.md` §6.2–§6.3, §16 | Roles cliente · alcance Empresa |
| Permisos Empresa | `11-ROLES-PLANES-PERMISOS-EMPRESA.md` | Enlace editar permisos |
| Sistema Diseño | `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §6.8 | |

**Informe módulo anterior (Navegación directa ex-Más):** ✅ Doc completada — sin incidencias bloqueantes.

---

# 1. Objetivo

Permitir al **Gerente** gestionar **empleados de su empresa cliente** (Técnicos) desde escritorio.

Diferencia funcional exclusiva de Darivo Pro Empresa respecto a Móvil (Visión §6).

**Acceso:** módulo exclusivo sidebar **Empleados** — no agrupado con las pantallas de configuración de `07-MODULO-MAS-EMPRESA.md` (ex-Más, `01-VISION-DEL-PRODUCTO.md` §16).

Los **Técnicos** utilizan **Darivo Pro Móvil** para trabajo diario; no esta pantalla (Visión §6).

---

# 2. Imagen oficial

**Archivo:** `10 - MODULO EMPLEADOS - DARIVO PRO EMPRESA.png`

![Módulo Empleados — Darivo Pro Empresa](./10%20-%20MODULO%20EMPLEADOS%20-%20DARIVO%20PRO%20EMPRESA.png)

**Estado:** ✅ Imagen oficial generada (fase global §7 — 02/07/2026).

---

# 3. Navegación

| Elemento | Valor |
|----------|-------|
| Sidebar | **Empleados** (módulo exclusivo Empresa — Sistema Diseño §5.1) |
| Vistas | Lista (default) · Formulario invitar/editar |
| Usuario | Solo **Gerente** |

---

# 4. Layout general

Patrón Admin Usuarios (tabla + toolbar) — **sin** funcionalidades de plataforma Admin:

```
┌─────────────┬──────────────────────────────────────────────────┐
│  SIDEBAR    │  HEADER — Empleados · subtítulo                  │
│             ├──────────────────────────────────────────────────┤
│  Empleados ●│  TOOLBAR — [+ Invitar empleado] · buscador       │
│             ├──────────────────────────────────────────────────┤
│             │  TABLA PRINCIPAL §5                              │
└─────────────┴──────────────────────────────────────────────────┘
```

**Excluido** (Admin `07-PANEL-ADMIN-EMPLEADOS.md` — empleados **internos Darivo**): importación masiva Excel/CSV, departamentos, cargos plataforma, guías Admin.

---

# 5. Tabla principal

| Columna | Contenido |
|---------|-----------|
| Empleado | Nombre |
| Email / teléfono | Contacto invitación |
| Rol | **Técnico** (único rol asignable por Gerente) |
| Estado | Activo · Invitación pendiente · Desactivado |
| Última actividad | Fecha último acceso Móvil (si aplica) |
| Acciones | Editar · **Permisos** → `11-ROLES-PLANES-PERMISOS-EMPRESA.md` · Desactivar |

---

# 6. Funcionalidad (Gerente)

Conforme Visión §6 y Admin §16 (alcance Empresa):

| Acción | Descripción |
|--------|-------------|
| **Invitar empleado** | Email y/o teléfono — envío invitación acceso Móvil |
| **Listar** | Activos + invitaciones pendientes |
| **Asignar rol** | **Técnico** únicamente — Gerente no se auto-asigna aquí |
| **Desactivar acceso** | Revoca acceso; no elimina historial operativo |
| **Editar permisos** | Enlace al módulo 11 — no duplicar matriz aquí |

**Regla:** Técnicos **no** acceden a Darivo Pro Empresa (Visión §6).

---

# 7. Relaciones

| Módulo / documento | Relación |
|--------------------|----------|
| Roles y Permisos (11) | Destino «Editar permisos» |
| Móvil | Destino trabajo diario del Técnico |
| Navegación directa ex-Más (07) | **Sin relación** — empleados no se gestionan desde ahí |
| Admin Empleados (07) | **Ámbito distinto** — equipo Darivo, no empresa cliente |

---

# 8. Permisos

Solo **Gerente** accede a este módulo.

Detalle toggles: `11-ROLES-PLANES-PERMISOS-EMPRESA.md`.

Límites por plan (nº empleados, etc.): `04-PANEL-ADMIN-SUSCRIPCIONES.md` — referencia única.

---

# 9. Validación (Reglas §9 · §15)

* [x] Alcance ↔ Visión §6
* [x] Sidebar independiente — no forma parte de `07-MODULO-MAS-EMPRESA.md` ni de Admin empleados internos
* [x] Rol Técnico único asignable
* [x] Diseño ↔ Sistema Diseño §6.8
* [x] Imagen ↔ MD (fase global §7 — 02/07/2026)

---

# 10. Estado

✅ **Producción completada** — Reglas §15 (02/07/2026).

**Fin del documento.**
