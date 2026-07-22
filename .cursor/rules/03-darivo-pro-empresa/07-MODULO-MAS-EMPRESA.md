# 07 – NAVEGACIÓN DIRECTA (EX-MÓDULO MÁS) – DARIVO PRO EMPRESA

**Versión:** 2.0

**Estado:** ✅ Documentación reorganizada (22/07/2026) — pendientes 7 imágenes oficiales nuevas (una por entrada directa), no bloquea la documentación (Reglas §7.1).

**Cambio principal (v2.0 — 22/07/2026, pedido explícito del propietario):** el "Módulo Más" deja de existir como pantalla contenedora en Darivo Pro Empresa. Sus 7 funcionalidades (antes tabs + panel lateral "Más opciones") pasan a ser **entradas directas del sidebar**, igual que Darivo Pro Admin — sin agrupador intermedio (`01-VISION-DEL-PRODUCTO.md` §16 v2.19, `16-SISTEMA-DE-DISEÑO-EMPRESA.md` v2.7 §5.1). Este archivo conserva su nombre y numeración (`07`) por continuidad de las referencias cruzadas ya existentes en el resto de la documentación de Empresa. **Ninguna lógica ni funcionalidad cambia** — únicamente la navegación: cada apartado de este documento (§5.1–§5.7) es ahora una pantalla propia con su propia posición de sidebar, no una sección dentro de "Más". No aplica a Darivo Pro Móvil, que conserva "Más" en posición 6 de su navegación inferior.

**Relacionado:** `01-VISION-DEL-PRODUCTO.md` §11, §16 · `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §5.1, §6.7 · `01-darivo-pro-movil/07-MODULO-MAS.md` v2.2

⚠️ Este documento es la **única fuente autorizada** para la adaptación a escritorio de las funcionalidades antes agrupadas en "Más" en Darivo Pro Empresa.

> **Lógica de negocio:** exclusivamente `01-darivo-pro-movil/07-MODULO-MAS.md`. Cada apartado de abajo es una pantalla de escritorio independiente — **no** un módulo operativo (Cotizaciones, Clientes, Facturas, Cierre).

---

# 0. Fuentes consultadas (Reglas §7.2 · §15 FASE 1)

| Fuente | Documento | Uso en este MD |
|--------|-----------|----------------|
| Lógica de negocio | `01-darivo-pro-movil/07-MODULO-MAS.md` v2.2 | Contenido funcional de cada pantalla (sin cambios) |
| Estrategia | `01-VISION-DEL-PRODUCTO.md` §11, §16 | Mis Tarifas, excepción de navegación Empresa (22/07/2026) |
| Referencia diseño escritorio | `02-darivo-pro-admin/00-PANEL-ADMIN-DASHBOARD.md` §4 | Sidebar plano, una entrada por módulo |
| Referencia configuración | `02-darivo-pro-admin/11-PANEL-ADMIN-CONFIGURACION.md` | Patrón "Configuración" = solo cuenta personal (perfil, credenciales, sesión) |
| Catálogo / precios | `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO…` | Categorías, partidas, jerarquía precios |
| Sistema de Diseño Empresa | `16-SISTEMA-DE-DISEÑO-EMPRESA.md` v2.7 | §5.1 (sidebar), §6.7 (patrón navegación directa) |

**Informe módulo anterior (IA):** ✅ Doc completada — sin incidencias bloqueantes.

---

# 1. Objetivo

Documentar las **7 pantallas de escritorio** que antes vivían agrupadas bajo "Más" y que ahora son entradas directas del sidebar de Darivo Pro Empresa (`01-VISION-DEL-PRODUCTO.md` §16, excepción de navegación).

Cada una centraliza una funcionalidad **secundaria, administrativa o de configuración** del cliente — nunca operativa (esa sigue en Inicio, Clientes, IA, Facturas, Cierre).

### Límite funcional (obligatorio — igual que antes, Móvil §1)

| ✅ Pertenece a esta redistribución | ❌ No pertenece (otro módulo) |
|-------------------------------------|-------------------------------------|
| Categorías · Mis Tarifas · Datos empresa | Clientes (03) |
| Perfil · Informes · Documentos | Cotizaciones (05) |
| Mi Plan · Soporte · Preferencias | Facturas (06) · Cierre (09) |
| Preferencias IA (ajustes, no el asistente) | IA asistente (08) |
| | Empleados (10) · Roles y Permisos (11) |

No duplicar opciones entre pantallas (Móvil §7 · Visión §16).

---

# 2. Imagen oficial

Las imágenes previas de "Más" (`07 - MODULO MAS - DARIVO PRO EMPRESA.png`) documentaban un layout de tabs + panel lateral que **ya no existe** — quedan desactualizadas por completo tras este cambio de navegación.

**Estado:** ⏳ Pendientes **7 imágenes oficiales nuevas**, una por pantalla (§5.1–§5.7). La ausencia de imagen no bloquea la documentación del diseño (Reglas §7.1).

---

# 3. Navegación — 7 entradas directas del sidebar

| Pos. sidebar | Pantalla | Sección de este MD | Origen (Móvil §6, dentro de "Más") |
|--------------|----------|---------------------|--------------------------------------|
| 6 | **Catálogo · Mis Tarifas** | §5.1 | Pestaña Categorías + Mis Tarifas |
| 9 | **Empresa** | §5.2 | Pestaña Empresa (datos) |
| 10 | **Informes** | §5.3 | Ítem "Informes" |
| 11 | **Documentos** | §5.4 | Ítem "Documentos" |
| 12 | **Mi Plan** | §5.5 | Ítem "Mi Plan" |
| 13 | **Soporte** | §5.6 | Ítem "Soporte" |
| 14 | **Configuración** | §5.7 | Perfil + IA-Preferencias + Preferencias generales |

Posiciones 7–8 (Empleados, Roles y Permisos) ya documentadas en `10-MODULO-EMPLEADOS-EMPRESA.md` y `11-ROLES-PLANES-PERMISOS-EMPRESA.md` — no se repiten aquí.

Orden completo del sidebar Empresa: Inicio(1) · Clientes(2) · IA(3) · Facturas(4) · Cierre(5) · Catálogo·Mis Tarifas(6) · Empleados(7) · Roles y Permisos(8) · Empresa(9) · Informes(10) · Documentos(11) · Mi Plan(12) · Soporte(13) · Configuración(14).

---

# 4. Layout general (escritorio)

Cada pantalla es **independiente**, con su propio header y área de contenido — patrón estándar Empresa (`16-SISTEMA-DE-DISEÑO-EMPRESA.md` §5.2–§5.3):

```
┌─────────────┬──────────────────────────────────────────────────┐
│  SIDEBAR    │  HEADER — [Nombre de la pantalla] · subtítulo     │
│  240px      ├──────────────────────────────────────────────────┤
│  … ●        │  CONTENIDO DE LA PANTALLA (§5.x)                 │
│             │                                                    │
└─────────────┴──────────────────────────────────────────────────┘
```

**Eliminado respecto a v1.0:** el panel fijo "Más opciones" (320px) que agrupaba varias de estas pantallas a la derecha. Cada una ahora ocupa el área de contenido completa como cualquier otro módulo del sidebar.

---

# 5. Pantallas

## 5.1 Catálogo · Mis Tarifas (sidebar 6)

Lógica idéntica a Móvil §3–§4. Solo cambia presentación (tablas, formularios amplios, modales centrados).

**Guía:** «Activa capítulos y añade tus propias partidas» (Móvil §3).

| Elemento | Comportamiento |
|----------|----------------|
| Card por categoría | Emoji · nombre · contador · **Toggle** activar/desactivar |
| Lista partidas (si activa) | Nombre · precio S/ · Pill «Propia» si aplica · eliminar (`I.trash`) |
| **+ Añadir partida** | Modal partida propia (7 tipos cálculo — Doc 21 §12) |

**Reglas:** categorías base precargadas por sector (Doc 21 §7) — no se crean bases; Albañilería = subcategoría Construcción (Móvil §3).

**Mis Tarifas** — pestaña o sección dentro de esta misma pantalla (Móvil §4):

**Guía:** «Toca para editar · Enter para guardar».

Lista agrupada por categoría · editar precio en modal/input (S/).

**Jerarquía precios (Móvil §4 · Visión §11):**

```
1º Mis Tarifas (precios_usuario)
   ↓ si no existe
2º Tarifa Pro (Catálogo Maestro — Admin)
```

Solo afecta a **esta empresa**. Nunca modifica Catálogo Maestro.

**Gerente** administra Categorías y Mis Tarifas desde Empresa y Móvil (Visión §11). **Técnico** no administra.

Presentación escritorio: tabla o lista expandible por categoría (patrón Admin Catálogo Maestro).

## 5.2 Empresa (sidebar 9)

Card formulario (Móvil §5):

| Campo | Uso |
|-------|-----|
| Razón social / Nombre | PDF cotizaciones y facturas |
| RUC | Encabezados · badge facturación |
| Dirección fiscal | PDF |
| Teléfono | Contacto empresa |
| Cuenta Banco de la Nación | Detracciones SUNAT (`06-MODULO-FACTURAS-EMPRESA.md`) |
| Moneda por defecto | PEN (S/) / USD — default PEN |

Card informativa «Backend · Supabase» (estado conexión — solo lectura).

## 5.3 Informes (sidebar 10)

Consolida Clientes, Cotizaciones y Facturación en modo consulta (Móvil §8):

* Periodicidad: Semana / Mes / Anual.
* No genera datos propios — consulta los módulos operativos (Móvil §8).

## 5.4 Documentos (sidebar 11)

Facturas y cotizaciones por período — historial documental (Móvil §6):

* No genera datos propios — consulta los módulos operativos.
* Relación con gestión documental transversal: `01-VISION-DEL-PRODUCTO.md` §17.

## 5.5 Mi Plan (sidebar 12)

* Plan actual (Básico / Pro / Business), renovación, cambiar plan — referencia única `04-PANEL-ADMIN-SUSCRIPCIONES.md`.
* Pasarela: **dLocal API** (`08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.3 · Móvil §8).
* **Pago fallido:** un pago fallido no cancela inmediatamente el plan de la empresa; debe permitirse el reintento antes de bajar de plan (Móvil §8).
* **Cancelación:** mantiene el acceso de la empresa hasta el fin del período ya pagado (Móvil §8).

Presentación escritorio: patrón Admin Suscripciones, en modo lectura + acción de cambio — Empresa **no** administra planes de otras empresas, solo el propio (Móvil §8, Visión §19).

## 5.6 Soporte (sidebar 13)

Crear y consultar tickets (Asunto + Descripción). Este ítem es la vía de **tickets estructurados**; el agente conversacional Darivo (Agente IA 2) vive en el módulo **IA** (sidebar 3) — ver `08-MODULO-IA-EMPRESA.md` §10.

### Modelo de soporte oficial (Móvil §3, §6, §8 — dos niveles)

| Nivel | Responsable |
|-------|-------------|
| Primer nivel | **IA de Soporte** (Agente IA 2 "Darivo") — módulo IA (sidebar 3) |
| Segundo nivel | **Soporte Humano** (Darivo Pro Admin → Soporte) |

Cuando la IA no puede resolver con certeza → ticket escalado automáticamente al equipo humano (`09-PANEL-ADMIN-SOPORTE.md`). El soporte humano revisa, comunica, solicita información, resuelve y **cierra** el ticket.

> La IA nunca inventa una solución sin certeza. Deriva automáticamente al soporte humano mediante ticket.

Esta pantalla (Soporte, sidebar 13) es donde el Gerente **crea y consulta tickets directamente** (sin pasar por Darivo), y donde ve su estado: **Nuevo / En proceso / Resuelto** (Admin §5).

## 5.7 Configuración (sidebar 14)

Agrupa lo que antes eran 3 ítems distintos del panel "Más opciones" — Perfil, Preferencias de IA y Preferencias generales — en una sola pantalla, siguiendo el patrón de Admin (`11-PANEL-ADMIN-CONFIGURACION.md`: cuenta personal simple) ampliado con las preferencias de producto propias de Empresa que Admin no tiene:

| Bloque | Contenido | Origen |
|--------|-----------|--------|
| **Mi perfil** | Nombre, foto, acceso a la cuenta | Móvil §6 · patrón Admin Configuración §5 |
| **Preferencias de IA** | Ajustes del asistente — **no** abre el flujo conversacional (eso es módulo IA, sidebar 3) | Móvil §6 |
| **Preferencias generales** | Idioma, notificaciones, moneda | Móvil §6 |

**No incluir** en esta pantalla: administración de empresa (→ Empresa, sidebar 9), empleados (→ Empleados, sidebar 7), roles (→ Roles y Permisos, sidebar 8), plan (→ Mi Plan, sidebar 12).

---

# 6. Reglas de acceso cruzado

* **Asistente IA** (cotizaciones voz/texto y Darivo/soporte conversacional): módulo **IA** (08, sidebar 3) — `08-MODULO-IA-EMPRESA.md`.
* **Soporte (tickets estructurados):** §5.6 de este documento — estados Nuevo / En proceso / Resuelto (Admin §5).
* **Informes / Documentos:** no generan datos propios — consultan módulos operativos (Móvil §8).
* **No incluir** en ninguna de estas 7 pantallas: Empleados ni Roles y Permisos (tienen sidebar propio, posiciones 7–8).

---

# 7. Integraciones (referencia Móvil §8)

| Apartado | Admin (fuente) | Empresa (consumo) |
|----------|------------------|-------------------|
| Mi Plan (§5.5) | `04-PANEL-ADMIN-SUSCRIPCIONES.md` | Consulta + cambio plan |
| Soporte (§5.6) | `09-PANEL-ADMIN-SOPORTE.md` | Crear / consultar tickets |
| Catálogo / Tarifa Pro (§5.1) | `10-PANEL-ADMIN-CATALOGO-MAESTRO.md` · Doc 21 | Solo vía Mis Tarifas |
| Roles / permisos plataforma | `12 – ROLES… ADMIN.md` §16 | No administra — aplica restricciones |

---

# 8. Reglas de negocio (referencia Móvil §7)

* Cada pantalla (§5.1–§5.7) es independiente — ya no existe un hub "Más" que las agrupe.
* Categorías base: activar/desactivar; partidas propias permitidas.
* Jerarquía precios: Mis Tarifas → Tarifa Pro.
* Moneda default **S/** (Perú).
* Tarifa Pro actualizada desde Admin **no** borra personalizaciones empresa.
* **Mi Plan — pago fallido:** un pago fallido no cancela inmediatamente el plan de la empresa; debe permitirse el reintento antes de bajar de plan (Móvil §8).
* **Mi Plan — cancelación:** la cancelación mantiene el acceso de la empresa hasta el fin del período ya pagado (Móvil §8).

---

# 9. Permisos

**Gerente:** acceso completo a las 7 pantallas, incl. Catálogo/Mis Tarifas (Visión §11).

**Técnico:** no administra Catálogo ni Mis Tarifas; no accede a Empresa, Mi Plan ni Configuración de la empresa — consulta según permisos (`11-ROLES-PLANES-PERMISOS-EMPRESA.md` — pendiente matriz detallada).

---

# 10. Relaciones

| Módulo | Relación |
|--------|----------|
| Cotizaciones (05) | Categorías activas (§5.1) filtran wizard |
| Facturas (06) | Datos empresa (§5.2) en PDF |
| IA (08) | Preferencias en §5.7; asistente conversacional (incl. Darivo/soporte) en módulo IA |
| Empleados (10) | Sidebar independiente — sin relación de contenido |
| Roles y Permisos (11) | Sidebar independiente — sin relación de contenido |

**APIs:** dLocal API ✅ (`08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.3 · §5.5 Mi Plan) · Soporte vía Supabase + Admin (sin API externa) · Integraciones Visión §16 — pendiente detalle funcional.

---

# 11. Validación (Reglas §9 · §15)

* [x] Lógica ↔ Móvil `07-MODULO-MAS.md` v2.2
* [x] Navegación ↔ `01-VISION-DEL-PRODUCTO.md` §16 v2.19 (excepción Empresa) · `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §5.1, §6.7
* [x] Sin funcionalidades ajenas a estas 7 pantallas
* [x] Sin duplicar Empleados / Roles / módulos operativos
* [ ] Imágenes oficiales ↔ MD — **7 pendientes** (Reglas §7.1, no bloquea)

---

# 12. Estado

✅ **Documentación reorganizada** — 22/07/2026, pedido explícito del propietario. Reemplaza la "Producción completada" de v1.0 (02/07/2026), que documentaba la pantalla "Más" ya retirada.

**Fin del documento.**
