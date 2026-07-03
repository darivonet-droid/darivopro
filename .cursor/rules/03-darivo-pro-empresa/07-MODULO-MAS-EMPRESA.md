# 07 – MÓDULO MÁS – DARIVO PRO EMPRESA

**Versión:** 1.0

**Estado:** ✅ Producción completada — imagen oficial (fase global §7 — 02/07/2026).

**Relacionado:** `01-VISION-DEL-PRODUCTO.md` §11, §16 · `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §6.7 · `01-darivo-pro-movil/07-MODULO-MAS.md` v1.9

⚠️ Este documento es la **única fuente autorizada** para la adaptación a escritorio del **Módulo Más** en Darivo Pro Empresa.

> **Lógica de negocio:** exclusivamente `01-darivo-pro-movil/07-MODULO-MAS.md`. Hub de configuración secundaria — **no** módulo operativo.

---

# 0. Fuentes consultadas (Reglas §7.2 · §15 FASE 1)

| Fuente | Documento | Uso en este MD |
|--------|-----------|----------------|
| Lógica de negocio | `01-darivo-pro-movil/07-MODULO-MAS.md` v1.9 | Pestañas, secciones, reglas, integraciones |
| Estrategia | `01-VISION-DEL-PRODUCTO.md` §11, §16 | Mis Tarifas, límite funcional Más |
| Referencia diseño escritorio | `02-darivo-pro-admin/00-PANEL-ADMIN-DASHBOARD.md` | Cards · layout área principal |
| Referencia configuración | `02-darivo-pro-admin/11-PANEL-ADMIN-CONFIGURACION.md` | Patrón formularios cuenta (solo presentación) |
| Catálogo / precios | `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO…` | Categorías, partidas, jerarquía precios |
| Sistema de Diseño Empresa | `16-SISTEMA-DE-DISEÑO-EMPRESA.md` v2.4 | §6.7 |

**Informe módulo anterior (IA):** ✅ Doc completada — sin incidencias bloqueantes.

---

# 1. Objetivo

Centraliza funcionalidades **secundarias, administrativas y de configuración** del cliente (`01-VISION-DEL-PRODUCTO.md` §16 · Móvil §1).

**Acceso:** sidebar posición **Más** (6).

Equivalente funcional Móvil: `SettingsScreen` — pestañas + secciones «Más opciones» (Móvil §2–§6).

### Límite funcional (obligatorio)

| ✅ Pertenece a Más | ❌ No pertenece a Más (otro módulo) |
|-------------------|-------------------------------------|
| Categorías · Mis Tarifas · Datos empresa | Clientes (03) |
| Perfil · Informes · Documentos | Cotizaciones (05) |
| Mi Plan · Soporte · Preferencias | Facturas (06) · Cierre (09) |
| Preferencias IA (ajustes, no el asistente) | IA asistente (08) |
| | Empleados (10) · Roles y Permisos (11) |

No duplicar opciones entre módulos (Móvil §7 · Visión §16).

---

# 2. Imagen oficial

**Archivo:** `07 - MODULO MAS - DARIVO PRO EMPRESA.png`

![Módulo Más — Darivo Pro Empresa](./07%20-%20MODULO%20MAS%20-%20DARIVO%20PRO%20EMPRESA.png)

**Estado:** ✅ Imagen oficial generada (fase global §7 — 02/07/2026).

---

# 3. Navegación

| Elemento | Valor |
|----------|-------|
| Sidebar | Posición **Más** (6) |
| Pestañas principales | **Categorías** · **Mis Tarifas** · **Empresa** |
| Secciones fijas | **Más opciones** (panel lateral — §6) |
| Equivalente Móvil | Bottom nav posición 6 (Móvil §2) |

---

# 4. Layout general (escritorio)

```
┌─────────────┬──────────────────────────────┬─────────────────────┐
│  SIDEBAR    │  HEADER — Más                │  MÁS OPCIONES       │
│  240px      │  Subtítulo guía              │  ~320px fijo        │
│             ├──────────────────────────────┤  §6                 │
│  Más ●      │  PILLS: Cat | Mis Tarifas |  │  Perfil             │
│             │         Empresa              │  Informes           │
│             ├──────────────────────────────┤  Documentos         │
│             │  CONTENIDO PESTAÑA ACTIVA    │  Mi Plan            │
│             │  §5                          │  IA Preferencias    │
│             │                              │  Soporte            │
│             │                              │  Preferencias gen.  │
└─────────────┴──────────────────────────────┴─────────────────────┘
```

Selector pill (Móvil §2): fondo `T.slateD`, pestaña activa `T.white` + sombra.

Panel **Más opciones** siempre visible a la derecha — equivalente a la lista bajo las pestañas en Móvil §6.

---

# 5. Pestañas principales

Lógica idéntica a Móvil §3–§5. Solo cambia presentación (tablas, formularios amplios, modales centrados).

## 5.1 Categorías

**Guía:** «Activa capítulos y añade tus propias partidas» (Móvil §3).

| Elemento | Comportamiento |
|----------|----------------|
| Card por categoría | Emoji · nombre · contador · **Toggle** activar/desactivar |
| Lista partidas (si activa) | Nombre · precio S/ · Pill «Propia» si aplica · eliminar (`I.trash`) |
| **+ Añadir partida** | Modal partida propia (7 tipos cálculo — Doc 21 §12) |

**Reglas:** categorías base precargadas por sector (Doc 21 §7) — no se crean bases; Albañilería = subcategoría Construcción (Móvil §3).

Presentación escritorio: tabla o lista expandible por categoría.

## 5.2 Mis Tarifas

**Guía:** «Toca para editar · Enter para guardar» (Móvil §4).

Lista agrupada por categoría · editar precio en modal/input (S/).

**Jerarquía precios (Móvil §4 · Visión §11):**

```
1º Mis Tarifas (precios_usuario)
   ↓ si no existe
2º Tarifa Pro (Catálogo Maestro — Admin)
```

Solo afecta a **esta empresa**. Nunca modifica Catálogo Maestro.

**Gerente** administra Mis Tarifas desde Empresa y Móvil (Visión §11). **Técnico** no administra.

## 5.3 Empresa

Card formulario (Móvil §5):

| Campo | Uso |
|-------|-----|
| Razón social / Nombre | PDF cotizaciones y facturas |
| RUC | Encabezados · badge facturación |
| Dirección fiscal | PDF |
| Teléfono | Contacto empresa |
| Cuenta Banco de la Nación | Detracciones SUNAT (`06-MODULO-FACTURAS.md`) |
| Moneda por defecto | PEN (S/) / USD — default PEN |

Card informativa «Backend · Supabase» (estado conexión — solo lectura).

---

# 6. Panel — Más opciones

Secciones oficiales **únicamente** las documentadas en Móvil §6. Cada ítem: card con icono 40×40, título, subtítulo, chevron `I.chevron`.

| Ítem | Icono | Función | Fuente datos |
|------|-------|---------|--------------|
| **Perfil del usuario** | `I.user` · `T.blue` | Nombre, foto, acceso cuenta | Cuenta usuario |
| **Informes** | `I.brief` · `T.green` | Semana / Mes / Anual — consolida Clientes, Cotizaciones, Facturación (consulta) | Móvil §8 Informes |
| **Documentos** | `I.folder` · `T.amber` | Facturas y cotizaciones por período (historial) | Móvil §6 |
| **Mi Plan** | `I.building` · `T.purple` | Plan actual, renovación, cambiar plan | `04-PANEL-ADMIN-SUSCRIPCIONES.md` |
| **IA — Preferencias** | `I.sparkle` · `T.purple` | Ajustes del asistente — **no** abre el flujo IA | Móvil §6 |
| **Soporte** | `I.phone` · `T.teal` | Crear/consultar tickets (Asunto + Descripción) | `09-PANEL-ADMIN-SOPORTE.md` |
| **Preferencias generales** | `I.gear` · `T.textMid` | Idioma, notificaciones, moneda | Móvil §6 |

### Reglas de acceso cruzado

* **Asistente IA** (cotizaciones voz/texto): módulo **IA** (08) — `08-MODULO-IA.md`.
* **Mi Plan:** consulta Admin Suscripciones; pasarela **dLocal API** (`08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.3 · Móvil §8).
* **Soporte:** estados Nuevo / En proceso / Resuelto (Admin §5).
* **Informes / Documentos:** no generan datos propios — consultan módulos operativos (Móvil §8).

**No incluir** en Más: Integraciones, API, SUNAT como pantallas separadas si no están en Móvil §6 (SUNAT vía datos empresa §5.3). **No incluir** Empleados ni Roles.

---

# 7. Integraciones (referencia Móvil §8)

| Apartado | Admin (fuente) | Empresa (consumo) |
|----------|------------------|-------------------|
| Mi Plan | `04-PANEL-ADMIN-SUSCRIPCIONES.md` | Consulta + cambio plan |
| Soporte | `09-PANEL-ADMIN-SOPORTE.md` | Crear / consultar tickets |
| Catálogo / Tarifa Pro | `10-PANEL-ADMIN-CATALOGO-MAESTRO.md` · Doc 21 | Solo vía Mis Tarifas |
| Roles / permisos plataforma | `12 – ROLES… ADMIN.md` §16 | No administra — aplica restricciones |

---

# 8. Reglas de negocio (referencia Móvil §7)

* Más = único hub de configuración secundaria.
* Categorías base: activar/desactivar; partidas propias permitidas.
* Jerarquía precios: Mis Tarifas → Tarifa Pro.
* Moneda default **S/** (Perú).
* Tarifa Pro actualizada desde Admin **no** borra personalizaciones empresa.

---

# 9. Permisos

**Gerente:** acceso completo a Más incl. Mis Tarifas (Visión §11).

**Técnico:** no administra Catálogo ni Mis Tarifas; consulta según permisos (`11-ROLES-PLANES-PERMISOS-EMPRESA.md` — pendiente matriz detallada).

---

# 10. Relaciones

| Módulo | Relación |
|--------|----------|
| Cotizaciones (05) | Categorías activas filtran wizard |
| Facturas (06) | Datos empresa en PDF |
| IA (08) | Preferencias aquí; asistente en módulo IA |
| Empleados (10) | **Sin relación** — módulo sidebar exclusivo |
| Roles (11) | **Sin relación** — permisos en módulo propio |

**APIs:** dLocal API ✅ (`08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.3 · Mi Plan) · Soporte vía Supabase + Admin (sin API externa) · Integraciones Visión §16 — pendiente detalle funcional.

---

# 11. Validación (Reglas §9 · §15)

* [x] Lógica ↔ Móvil `07-MODULO-MAS.md` v1.9
* [x] Sin funcionalidades ajenas a Más
* [x] Sin duplicar Empleados / Roles / módulos operativos
* [x] Diseño ↔ Sistema Diseño §6.7
* [x] Imagen ↔ MD (fase global §7 — 02/07/2026)

---

# 12. Estado

✅ **Producción completada** — Reglas §15 (02/07/2026).

**Fin del documento.**
