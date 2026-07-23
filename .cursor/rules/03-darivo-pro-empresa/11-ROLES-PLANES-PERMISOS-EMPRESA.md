# 11 – ROLES, PLANES Y PERMISOS – DARIVO PRO EMPRESA

**Versión:** 1.8

**Cambio principal (v1.8 — 23/07/2026, Fase 2 construida, decisión del propietario):** el rol personalizado deja de ser inerte. (1) §5.2 fija el **catálogo cerrado del rol personalizado a Factura + Informe** (se eliminó de la UI el toggle de Mis Tarifas, que contradecía la regla cerrada). (2) §6.2 registra el **enforcement real construido**: `obtenerContextoAcceso()` aplica la **regla de combinación** aprobada — rol asignado ⇒ el permiso del rol reemplaza los flags individuales Factura/Informe; sin rol ⇒ rigen los flags. Borrado el "pendiente/❌ inerte" que ya no aplica. Pendiente solo: verificación en vivo (sin mergear a `main`) e imagen oficial (§2).

**Cambio principal (v1.7 — 23/07/2026, aprobación explícita del propietario):** §6.1 **Roles personalizados** deja de ser una propuesta: pasa de "⚠️ propuesta, pendiente de aprobación" a **✅ aprobada**, tal como estaba escrita (solo Business · nombre único y no reservado · mismo catálogo de permisos de la matriz §5.2 · asignable a varios Técnicos como plantilla editable · al eliminar el rol, sus Técnicos vuelven al rol Técnico base). Añadido §6.2 con el estado real de construcción. Sigue pendiente, sin bloquear nada de backend, la **nueva imagen oficial** de §2.

**Cambio principal (v1.6 — 22/07/2026):** corrección de referencia interna (§0) — citaba `12 – ROLES… ADMIN.md` v1.5, desactualizada frente a la v1.6 real (que añadió §7.1 Límite de Técnicos y §7.2 Roles personalizados). Verificado: el contenido funcional de §7.2 ya estaba correctamente incorporado en este documento desde v1.1 (§6.1); el límite de Técnicos (§7.1 Admin) ya se referencia sin duplicar cifras vía `10-MODULO-EMPLEADOS-EMPRESA.md` §8 → `04-PANEL-ADMIN-SUSCRIPCIONES.md`. Sin cambios de contenido funcional — solo corrección de cita.

**Cambio principal (v1.5 — 21/07/2026, reversión mismo día):** §6 — el bloqueo total por dispositivo (v1.4) queda reemplazado por un aviso informativo, no bloqueante y descartable — Gerente en móvil ve el aviso, Técnico en ordenador ve el aviso, ninguno de los dos queda impedido de navegar. Referencia cruzada actualizada a Visión §4.1.

**Cambio principal (v1.4 — 21/07/2026, Etapa 7 continuación, REVERTIDO el mismo día por v1.5):** §6 — añadida la restricción de acceso por dispositivo (Gerente solo ordenador, Técnico solo Móvil), EN FASE DE PRUEBAS, referencia cruzada a Visión §4.1.

**Cambio principal (v1.3 — 21/07/2026, autorizado explícitamente por el propietario, Etapa 7 decisión 3):** reemplaza el modelo de "Técnico = rol fijo con Factura OFF por defecto" — Gerente y Técnico ya NO son cajas cerradas de permisos: el Gerente activa/desactiva **libremente cualquier módulo** (Factura, Informe) por Técnico, en cualquier momento, no solo al invitarlo. Un Técnico puede tener permisos ampliados sin convertirse en un segundo Gerente (nunca administra empleados ni el plan de la empresa — eso sigue exclusivo del Gerente). **Nuevo default real: un Técnico invitado nace con Cotización + Cliente + Factura activas** (antes Factura nacía en `false`, decisión de la Tarea 2 del 17/07/2026, ahora sustituida). Informe sigue opcional, el Gerente lo activa aparte. Cliente es un módulo base sin flag propio (investigado en esta etapa: no existe ni hace falta una 3ra columna de permiso — todo empleado vinculado ve el mismo listado de clientes que el Gerente).

**Estado:** ⚠️ Requiere nueva imagen oficial (roles personalizados, §6.1) — **pendiente exclusivamente visual, no bloquea la construcción del backend**. Especificación funcional cerrada y aprobada — sincronizado con `01-VISION-DEL-PRODUCTO.md` §8, `12 – ROLES… ADMIN.md` v1.7 y `04-PANEL-ADMIN-SUSCRIPCIONES.md` v1.10.

**Relacionado:** `02-darivo-pro-admin/12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` §6–§9, §16–§17 · `01-VISION-DEL-PRODUCTO.md` §8 · `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §6.9

⚠️ Este documento es la **única fuente autorizada** de Roles, Planes y Permisos para **Darivo Pro Empresa**.

> **Sincronización funcional obligatoria** con Admin §16–§17. Solo pueden diferir diseño, navegación e imágenes.

---

# 0. Fuentes consultadas (Reglas §7.2 · §15 FASE 1)

| Fuente | Documento | Uso |
|--------|-----------|-----|
| Arquitectura funcional | `02-darivo-pro-admin/12 – ROLES… ADMIN.md` v1.6 §6–§9, §16 | Roles, planes, permisos, jerarquía |
| Secuencia ecosistema | `01-VISION-DEL-PRODUCTO.md` §8 | Suscripción → Producto → Rol → Permisos → Funcionalidades → Limitaciones |
| Planes | `04-PANEL-ADMIN-SUSCRIPCIONES.md` | Básico / Pro / Business — fuente única |
| Empleados | `10-MODULO-EMPLEADOS-EMPRESA.md` | Origen enlace «Editar permisos» |
| Sistema Diseño | `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §6.9 | |

**Informe módulo anterior (Empleados):** ✅ Doc completada.

---

# 1. Objetivo

Permitir al **Gerente** activar o desactivar **permisos** por empleado (**Técnico**), dentro de las **limitaciones del plan** contratado (Admin §16 · Visión §8).

Darivo Pro Empresa **no** administra planes de suscripción ni roles de plataforma.

**Acceso:** módulo exclusivo sidebar **Roles y Permisos** — no agrupado con las pantallas de configuración de `07-MODULO-MAS-EMPRESA.md` (ex-Más, `01-VISION-DEL-PRODUCTO.md` §16).

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
| **Plan** | Básico / Pro / Business — **solo consulta**; administra Admin (`04`) |
| **Permiso** | Toggle funcionalidad por empleado — **sí administra** Gerente |

Secuencia aplicada (Visión §8):

```
Suscripción (plan) → Producto → Rol → Permisos → Funcionalidades → Limitaciones
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

**Matriz detallada fila a fila (Técnico base, por flag individual):** pendiente de aprobación del propietario conforme Admin §8 (*«Las matrices de permisos se documentarán conforme se aprueben los módulos oficiales»*). Hasta entonces: documentar **estructura** y reglas; no inventar lista cerrada de permisos para la matriz general.

**Catálogo cerrado del ROL PERSONALIZADO (aprobado 23/07/2026):** independientemente de lo anterior, el catálogo de permisos toggleables de un **rol personalizado** (§6.1) sí quedó cerrado por decisión del propietario a **Factura** e **Informe** únicamente — son los dos módulos con flag real hoy. Cotización y Cliente son módulos base sin flag (siempre disponibles) y Mis Tarifas nunca es administrable por un Técnico, por eso ninguno figura en ese catálogo. Implementado en `MODULOS_PERMISO_ROL` (`frontend/src/lib/roles-personalizados.ts`).

### Reglas de la matriz

* Permiso **activa/desactiva** funcionalidad existente — nunca crea funcionalidades nuevas (Visión §8).
* **Técnico** no administra Mis Tarifas ni Catálogo (Visión §11 · Admin §6.3) — bloqueo real construido 21/07/2026 (Etapa 7).
* Cambios respetan límites del plan (Admin §16).
* **Darivo Pro Móvil** aplica permisos definidos aquí — no los administra (Admin §16 Darivo Pro).
* **Defaults al invitar un Técnico (v1.3, 21/07/2026):** Cotización y Cliente siempre activas (sin flag, módulo base); **Factura nace activa** (el Gerente puede desactivarla); Informe nace inactivo (el Gerente lo activa si quiere). Ninguno de los 3 es una elección única e irreversible al invitar — el Gerente puede cambiar Factura/Informe en cualquier momento después.

---

# 6. Roles en Empresa (referencia Admin §6.2–§6.3)

| Rol | En Empresa |
|-----|------------|
| **Gerente** | Administra empleados, permisos, Mis Tarifas (Móvil + Empresa) y roles personalizados (solo Business — §6.1) |
| **Técnico** | Permisos asignados; trabajo en Móvil |

Roles base: Gerente y Técnico. Con plan **Business**, el Gerente puede además crear **roles personalizados** (§6.1).

**Aviso informativo por dispositivo (Visión §4.1, reversión 21/07/2026):** si el **Gerente** entra desde móvil, ve un aviso descartable sugiriendo usar Darivo Pro Empresa desde un ordenador; si el **Técnico** entra desde ordenador, ve un aviso descartable sugiriendo usar la app Darivo Pro Móvil desde su teléfono. Ninguno de los dos queda bloqueado — pueden cerrar el aviso y seguir usando el panel con normalidad desde cualquier dispositivo. Implementación real en `frontend/src/components/dispositivo/AvisoDispositivoBanner.tsx` (montado en `empresa/layout.tsx`) vía `frontend/src/lib/restriccion-dispositivo.ts`.

## 6.1 Roles personalizados (solo plan Business)

✅ **Aprobado por el propietario (23/07/2026).** La especificación funcional de abajo queda cerrada tal como está escrita y es la base de construcción. Lo único que sigue pendiente es la **nueva imagen oficial** (§2, que queda desactualizada en este punto) — es un pendiente **visual**, no bloquea la construcción del backend ni de la pantalla.

**Disponibilidad:** únicamente si el plan contratado es **Business** (`12 – ROLES… ADMIN.md` §7.2). Básico y Pro son de un único usuario y no aplican.

**Quién los crea:** exclusivamente el **Gerente**, desde este mismo módulo (Roles y Permisos).

**Flujo aprobado:**

1. Botón **"Crear rol personalizado"**, visible solo si plan = Business y no se ha alcanzado el límite máximo de roles personalizados de la empresa (límite configurado individualmente por cuenta desde Suscripciones — `04-PANEL-ADMIN-SUSCRIPCIONES.md`, `12 – ROLES… ADMIN.md` §7.2).
2. Formulario: **nombre del rol** (obligatorio, único dentro de la empresa, no puede ser "Gerente" ni "Técnico" — nombres reservados) y **selección de permisos** sobre el mismo catálogo de funcionalidades toggleables ya usado en la matriz (§5.2) — nunca funcionalidades nuevas (Visión §8).
3. Una vez creado, el rol personalizado se asigna a un empleado **Técnico** existente desde `10-MODULO-EMPLEADOS-EMPRESA.md`, como una variante con permisos propios — no sustituye el rol base Técnico, lo especializa.
4. **Un rol personalizado puede asignarse a varios Técnicos a la vez** (patrón RBAC estándar de mercado: el rol es una plantilla de permisos reutilizable, no una configuración individual por persona). El Gerente crea el rol una vez y lo asigna a cuantos Técnicos necesite; si edita el rol, el cambio se aplica automáticamente a todos los Técnicos que lo tengan asignado.
5. Eliminar un rol personalizado no elimina al empleado; el/los empleado(s) que lo tenían asignado vuelven a los permisos del rol Técnico base.

## 6.2 Estado real de construcción (Fase 2 cerrada — 23/07/2026)

Todas las piezas del rol personalizado están construidas y verificadas (typecheck/lint/build en verde). Estado por pieza:

| Pieza | Estado real |
|-------|-------------|
| Tabla `roles_personalizados` (nombre único por empresa, `CHECK` de nombres reservados, `permisos` jsonb, RLS por Gerente + Admin) | ✅ Construida (`supabase/migrations/20260706140000_roles_personalizados.sql`) |
| `empresa_empleados.rol_personalizado_id` (`ON DELETE SET NULL` → el Técnico vuelve al rol base) | ✅ Construida, cumple §6.1 punto 5 |
| Límite por cuenta (`suscripciones.limite_roles_personalizados`) | ✅ Construido y aplicado en UI |
| Pantalla: crear / editar / eliminar / asignar a varios Técnicos, gateada a plan Business | ✅ Construida (`RolesPermisosView.tsx`), asignación también desde Empleados |
| Catálogo de permisos del rol | ✅ Cerrado a **Factura** e **Informe** (`MODULOS_PERMISO_ROL`) — el toggle de Mis Tarifas, que contradecía la regla cerrada, fue eliminado (Fase 2 B) |
| **Enforcement real de los permisos del rol** | ✅ Construido (Fase 2 A): `obtenerContextoAcceso()` (`frontend/src/lib/rol-empleado.ts`) — punto único de gating del Técnico — lee `roles_personalizados.permisos` y aplica la regla de combinación de abajo |

### Regla de combinación (aprobada por el propietario, 23/07/2026)

Si un Técnico tiene un **rol personalizado asignado** (`rol_personalizado_id`), el permiso del **ROL rige Factura/Informe y REEMPLAZA sus flags individuales** (`factura_habilitada`/`informe_habilitado`) — es reemplazo, no intersección. Al **desasignar** el rol, vuelven a regir los flags individuales del Técnico: no se borran, quedan en pausa mientras el rol está asignado. Un rol de otra empresa nunca puede regir sobre un Técnico de esta (aislamiento por `empresa_id`, verificado en tabla + RLS + guard de lectura). Mis Tarifas sigue bloqueado para el Técnico en todos los casos.

**Pendiente:** solo la **verificación en vivo** (login del Gerente, crear/asignar rol) sobre el preview desplegado — el código está en `develop`, sin mergear a `main` todavía. Y, aparte, la **nueva imagen oficial** (§2), pendiente exclusivamente visual.

---

# 7. Planes (referencia única)

Catálogo oficial: **Básico** · **Pro** · **Business** (`04-PANEL-ADMIN-SUSCRIPCIONES.md` §6).

Empresa **no** crea, modifica ni elimina planes.

Mi Plan (consulta/cambio): `07-MODULO-MAS-EMPRESA.md` §6.

**Autoservicio de plan — confirmado (23/07/2026).** El Gerente cambia el plan de **su propia cuenta** desde **Mi Plan**, pasando por checkout. Es el único camino de autoservicio y no cambia con la Tarea 3.

Vía de operador, distinta y complementaria: un **Administrador Darivo** puede cambiar el plan de una cuenta desde Admin → Suscripciones → pestaña "Cuentas" (`04-PANEL-ADMIN-SUSCRIPCIONES.md` §6.1), con motivo obligatorio y registro de auditoría. Sirve para cortesías, correcciones de cobro y soporte — nunca sustituye al autoservicio ni permite a Empresa administrar planes ajenos.

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
* [x] Sidebar independiente — no forma parte de `07-MODULO-MAS-EMPRESA.md`
* [x] Secuencia Visión §8 respetada
* [x] Matriz detallada marcada pendiente (coherente con Admin §8)
* [x] Diseño ↔ Sistema Diseño §6.9
* [x] Imagen ↔ MD (fase global §7 — 02/07/2026)

---

# 10. Estado

✅ **Actualizado v1.8 (23/07/2026)** — Fase 2 construida: catálogo del rol cerrado a Factura/Informe (toggle de Mis Tarifas eliminado) y **enforcement real** con regla de combinación (rol reemplaza flag individual) en `obtenerContextoAcceso()`. typecheck/lint/build en verde. Pendiente solo: verificación en vivo (sin mergear a `main`) e imagen oficial (§2).

✅ **Actualizado v1.7 (23/07/2026)** — §6.1 **aprobada** por el propietario (deja de ser propuesta). El enforcement y la alineación del catálogo pasaron a v1.8 (construidos). Pendiente aparte, solo visual: nueva imagen oficial (§2).

✅ **Actualizado v1.3 (21/07/2026)** — modelo de permisos por módulo activable (no roles fijos) confirmado y con default real de Factura ON al invitar Técnico (§5.2). Bloqueo real de Mis Tarifas para Técnico construido en código.

⚠️ **Actualizado v1.2 (05/07/2026)** — cerrada la decisión pendiente: un rol personalizado puede asignarse a varios Técnicos (patrón RBAC estándar). **Pendiente: nueva imagen oficial** (§6.1).

⚠️ **Actualizado v1.1 (05/07/2026)** — añadida propuesta funcional de roles personalizados (§6.1, solo plan Business); sincronizados los 3 planes oficiales en §0, §3 y §7.

⏳ **Matriz detallada de permisos** — pendiente aprobación propietario (Admin §8).

**Fin del documento.**
