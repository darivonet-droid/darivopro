# 11 – ROLES, PLANES Y PERMISOS – DARIVO PRO EMPRESA

**Versión:** 1.0

**Estado:** ✅ Producción completada — imagen oficial (fase global §7 — 02/07/2026).

**Relacionado:** `02-darivo-pro-admin/12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` §6–§9, §16–§17 · `01-VISION-DEL-PRODUCTO.md` §8 · `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §6.9

⚠️ Este documento es la **única fuente autorizada** de Roles, Planes y Permisos para **Darivo Pro Empresa**.

> **Sincronización funcional obligatoria** con Admin §16–§17. Solo pueden diferir diseño, navegación e imágenes.

---

# 0. Fuentes consultadas (Reglas §7.2 · §15 FASE 1)

| Fuente | Documento | Uso |
|--------|-----------|-----|
| Arquitectura funcional | `02-darivo-pro-admin/12 – ROLES… ADMIN.md` v1.5 §6–§9, §16 | Roles, planes, permisos, jerarquía |
| Secuencia ecosistema | `01-VISION-DEL-PRODUCTO.md` §8 | Suscripción → Producto → Rol → Permisos → Limitaciones |
| Planes | `04-PANEL-ADMIN-SUSCRIPCIONES.md` | Básico / Pro — fuente única |
| Empleados | `10-MODULO-EMPLEADOS-EMPRESA.md` | Origen enlace «Editar permisos» |
| Sistema Diseño | `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §6.9 | |

**Informe módulo anterior (Empleados):** ✅ Doc completada.

---

# 1. Objetivo

Permitir al **Gerente** activar o desactivar **permisos** por empleado (**Técnico**), dentro de las **limitaciones del plan** contratado (Admin §16 · Visión §8).

Darivo Pro Empresa **no** administra planes de suscripción ni roles de plataforma.

**Acceso:** módulo exclusivo sidebar **Roles y Permisos** — **no** en Módulo Más.

---

# 2. Imagen oficial

**Archivo:** `11 - MODULO ROLES Y PERMISOS - DARIVO PRO EMPRESA.png`

![Módulo Roles y Permisos — Darivo Pro Empresa](./11%20-%20MODULO%20ROLES%20Y%20PERMISOS%20-%20DARIVO%20PRO%20EMPRESA.png)

**Estado:** ✅ Imagen oficial generada (fase global §7 — 02/07/2026).

---

# 3. Conceptos (no mezclar — Admin §5)

| Concepto | Responsabilidad Empresa |
|----------|-------------------------|
| **Rol** | Gerente · Técnico (roles cliente — Visión §8) |
| **Plan** | Básico / Pro — **solo consulta**; administra Admin (`04`) |
| **Permiso** | Toggle funcionalidad por empleado — **sí administra** Gerente |

Secuencia aplicada (Visión §8):

```
Suscripción (plan) → Producto → Rol → Permisos → Limitaciones → Funcionalidades
```

Los permisos **nunca** superan el plan (Admin §8).

---

# 4. Navegación

| Elemento | Valor |
|----------|-------|
| Sidebar | **Roles y Permisos** (exclusivo Empresa) |
| Entrada alternativa | Desde Empleados (10) → «Editar permisos» empleado |
| Usuario | **Gerente** |

---

# 5. Layout — Matriz de permisos

Presentación escritorio (patrón tabla Admin):

```
┌─────────────┬──────────────────────────────────────────────────┐
│  SIDEBAR    │  HEADER — Roles y Permisos                       │
│             │  Badge plan actual (consulta — §6)               │
│  Roles ●    ├──────────────────────────────────────────────────┤
│             │  MATRIZ §5.2                                     │
└─────────────┴──────────────────────────────────────────────────┘
```

## 5.1 Cabecera informativa

| Elemento | Fuente |
|----------|--------|
| Plan contratado | `04-PANEL-ADMIN-SUSCRIPCIONES.md` — solo lectura |
| Badges límites plan | Referencia §04 — no duplicar cifras en este MD |

## 5.2 Matriz

| Dimensión | Contenido |
|-----------|-----------|
| **Filas** | Funcionalidades oficiales del ecosistema sujetas a permiso (módulos Móvil compartidos: Inicio, Clientes, IA, Facturas, Cierre, flujos Cotizaciones, etc.) |
| **Columnas** | Empleados **Técnicos** activos de la empresa |
| **Celda** | Toggle activar/desactivar permiso |

**Matriz detallada fila a fila:** pendiente de aprobación del propietario conforme Admin §8 (*«Las matrices de permisos se documentarán conforme se aprueben los módulos oficiales»*).

Hasta entonces: documentar **estructura** y reglas; no inventar lista cerrada de permisos.

### Reglas de la matriz

* Permiso **activa/desactiva** funcionalidad existente — nunca crea funcionalidades nuevas (Visión §8).
* **Técnico** no administra Mis Tarifas ni Catálogo (Visión §11 · Admin §6.3).
* Cambios respetan límites del plan (Admin §16).
* **Darivo Pro Móvil** aplica permisos definidos aquí — no los administra (Admin §16 Darivo Pro).

---

# 6. Roles en Empresa (referencia Admin §6.2–§6.3)

| Rol | En Empresa |
|-----|------------|
| **Gerente** | Administra empleados, permisos y Mis Tarifas (Móvil + Empresa) |
| **Técnico** | Permisos asignados; trabajo en Móvil |

No existen otros roles cliente documentados oficialmente.

---

# 7. Planes (referencia única)

Catálogo oficial: **Básico** · **Pro** (`04-PANEL-ADMIN-SUSCRIPCIONES.md` §6).

Empresa **no** crea, modifica ni elimina planes.

Mi Plan (consulta/cambio): `07-MODULO-MAS-EMPRESA.md` §6.

---

# 8. Relaciones

| Documento | Relación |
|-----------|----------|
| `10-MODULO-EMPLEADOS-EMPRESA.md` | Lista empleados → matriz |
| `07-MODULO-MAS-EMPRESA.md` | Mis Tarifas = Gerente; no duplicar permisos |
| `12 – ROLES… ADMIN.md` | Fuente funcional sincronizada |
| Módulos Móvil 02–09 | Aplican restricciones de permisos |

---

# 9. Validación (Reglas §9 · §15)

* [x] Sincronizado funcionalmente con Admin §16–§17
* [x] Separado de Módulo Más
* [x] Secuencia Visión §8 respetada
* [x] Matriz detallada marcada pendiente (coherente con Admin §8)
* [x] Diseño ↔ Sistema Diseño §6.9
* [x] Imagen ↔ MD (fase global §7 — 02/07/2026)

---

# 10. Estado

✅ **Producción completada** — Reglas §15 (02/07/2026).

⏳ **Matriz detallada de permisos** — pendiente aprobación propietario (Admin §8).

**Fin del documento.**
