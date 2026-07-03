# 03 – MÓDULO CLIENTES – DARIVO PRO EMPRESA

**Versión:** 1.0

**Estado:** ✅ Producción completada (Reglas §15 — 02/07/2026)

**Relacionado:** `01-VISION-DEL-PRODUCTO.md` §5, §6, §9 · `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §5–§6.2

⚠️ Este documento es la **única fuente autorizada** para la adaptación a escritorio del **Módulo Clientes** en Darivo Pro Empresa.

---

# 0. Fuentes consultadas (Reglas §7.2 · §15 FASE 1)

| Fuente | Documento | Uso en este MD |
|--------|-----------|----------------|
| Lógica de negocio | `01-darivo-pro-movil/03-MODULO-CLIENTES.md` v1.3 | Datos, lista, ficha, historial, flujos, reglas |
| Referencia diseño escritorio | `02-darivo-pro-admin/03-PANEL-ADMIN-USUARIOS.md` v1.1 | Tabla + barra herramientas + panel lateral |
| Sistema de Diseño Empresa | `16-SISTEMA-DE-DISEÑO-EMPRESA.md` v2.4 | Sidebar, header, tablas, paneles, §6.2 |

> **Lógica de negocio:** exclusivamente Móvil. **Presentación:** patrones Admin Usuarios (tabla + panel lateral), sin lógica de plataforma (planes globales, importación masiva, bloqueo plataforma, etc.).

---

# 1. Objetivo

Cliente es el **centro del flujo** de Darivo Pro Empresa — conecta Cotizaciones y Facturas (Móvil §1).

Permite al **Gerente** listar, buscar, crear, editar y eliminar clientes, y acceder a la ficha con historial de cotizaciones y acciones asociadas.

**Acceso:** sidebar posición **Clientes** (2) · equivalente Móvil bottom nav posición 2.

---

# 2. Imagen oficial

**Archivo:** `03 - MODULO CLIENTES - DARIVO PRO EMPRESA.png`

![Módulo Clientes — Darivo Pro Empresa](./03%20-%20MODULO%20CLIENTES%20-%20DARIVO%20PRO%20EMPRESA.png)

La imagen es referencia visual derivada de este MD. Prevalece siempre este MD ante cualquier diferencia.

---

# 3. Navegación

| Elemento | Valor |
|----------|-------|
| Sidebar | Posición **Clientes** (2) |
| Vistas | **Lista** (por defecto) · **Ficha** (panel lateral al seleccionar cliente) |
| Equivalente Móvil | `ClientsScreen` → `ClientDetail` (Móvil §3–§4) |

**Retorno desde ficha:** cerrar panel lateral o acción «← Clientes» (Móvil §4 · `I.back`).

---

# 4. Layout general

```
┌─────────────┬──────────────────────────────┬─────────────────────┐
│  SIDEBAR    │  LISTA DE CLIENTES           │  PANEL FICHA        │
│  240px      │  Header + toolbar + tabla    │  (al seleccionar)   │
│             │                              │  §6                 │
└─────────────┴──────────────────────────────┴─────────────────────┘
```

* Lista ocupa ancho principal; panel ficha ~360–400px a la derecha cuando hay cliente seleccionado (patrón Admin §5 panel lateral · Sistema Diseño §5.3).
* Sin panel lateral visible hasta seleccionar un cliente.

---

# 5. Vista — Lista de clientes

Equivalente funcional `ClientsScreen` (Móvil §3). Presentación tipo Admin Usuarios §5 (tabla + toolbar).

## 5.1 Header

| Elemento | Descripción | Origen |
|----------|-------------|--------|
| Título | «Clientes» | Móvil §3 |
| Subtítulo | «[N] contactos» | Móvil §3 |
| Buscador | Input «Buscar cliente…» — filtro en tiempo real por nombre | Móvil §3 |
| Notificaciones / usuario | Patrón header Empresa (Sistema Diseño §5.2) | Sistema Diseño |

**Excluido** (Admin Usuarios §5 — lógica plataforma): filtros por plan, estado onboarding, método de acceso, importación masiva.

## 5.2 Barra de herramientas

| Botón | Acción | Origen |
|-------|--------|--------|
| **+ Nuevo cliente** | Abre formulario mínimo (Nombre + Teléfono obligatorios) | Móvil §3 |

## 5.3 Tabla principal

Sustituye las cards móviles (Móvil §3 · Admin §6 listado):

| Columna | Contenido |
|---------|-----------|
| Cliente | Avatar circular (inicial, gradiente `T.blue`→`T.blueL`) + nombre |
| Ciudad | Ciudad del cliente (si existe) |
| Cotizaciones | Nº total (tiempo real, relación `cliente_id`) |
| Aprobadas | Nº cotizaciones aprobadas |
| Total S/ | Importe acumulado (`T.blue`, bold) |
| Acción | Chevron / seleccionar → abre panel ficha |

* Orden: más reciente actividad primero (Móvil §3).
* Cabecera tabla: `T.navyLight` (Sistema Diseño §6).
* Clic en fila → abre panel ficha §6.

---

# 6. Vista — Ficha de cliente (panel lateral)

Equivalente funcional `ClientDetail` (Móvil §4). Panel lateral derecho (Admin Usuarios §5 «Panel lateral»).

## 6.1 Cabecera del panel

| Elemento | Descripción |
|----------|-------------|
| «← Clientes» | `I.back` — cierra panel / vuelve a lista |
| Avatar | 56px, gradiente azul, inicial del nombre |
| Nombre | Bold, 20px |
| Ciudad | Si existe, texto secundario |

## 6.2 Acciones rápidas de contacto

Fila de 3 botones (Móvil §4):

| Botón | Icono | Acción |
|-------|-------|--------|
| WhatsApp | `I.wa` (#25D366) | Abre `wa.me` con teléfono del cliente |
| Llamar | `I.phone` (`T.green`) | Abre `tel:` |
| Email | `I.mail` (`T.blue`) | Si no hay email → Toast informativo |

## 6.3 Tarjetas de estadísticas

Tres cards en fila (Móvil §4):

| Stat | Token |
|------|-------|
| Cotizaciones | `T.blue` |
| Aprobadas | `T.green` |
| Total S/ | `T.amber` |

## 6.4 Card de contacto

Card blanca · editable al tocar (Móvil §4):

* Teléfono (`I.phone`)
* Ciudad (`I.tag`)

## 6.5 Historial de cotizaciones

**Encabezado:** «Historial» + botón **+ Nuevo** (`T.blue`) → wizard cotización con cliente preseleccionado (Móvil §4).

Cada cotización del cliente muestra (Móvil §4):

* Resumen de partidas (primeras palabras)
* Fecha · nº partidas
* Importe total (`T.blue`, bold)
* Chips estado: Borrador / Pendiente / Aprobado (tocables)
* Botón `[I.pdf PDF]` (secundario)

**Fila de acciones** por cotización (Móvil §4 · Fable 5 §5.2):

| Botón | Icono | Condición |
|-------|-------|-----------|
| Editar | `I.edit` | Secundario |
| Re-cotizar | `I.convert` | Secundario borde azul |
| Compartir | `I.share` | Secundario |
| Facturar | `I.receipt` | Solo si estado **Aprobado** |
| Eliminar | `I.trash` | Destructivo, alineado derecha |

## 6.6 Eliminar cliente

Acción destructiva en ficha — DELETE real; error visible si falla (Móvil §4 · §5).

---

# 7. Datos del cliente (referencia Móvil §2)

| Campo | Obligatorio | Cuándo |
|-------|-------------|--------|
| Nombre | ✅ | Crear (manual o automático) |
| Teléfono | ✅ | Crear (manual o automático) |
| Ciudad | ❌ | Opcional |
| RUC/DNI | ❌ | Solo al **facturar** |
| Notas | ❌ | Opcional |

**Normalización teléfono** y **anti-duplicados:** Móvil §2 (reglas críticas — sin alteración).

**Formas de alta:** manual (Clientes) · automática (cotización) — Móvil §1.

---

# 8. Botones y acciones (resumen)

| Contexto | Elementos |
|----------|-----------|
| Lista | Buscador · + Nuevo cliente · seleccionar fila |
| Ficha | ← Clientes · WhatsApp · Llamar · Email · editar contacto · + Nuevo · acciones por cotización · eliminar cliente |

---

# 9. Funcionalidad (referencia Móvil §3–§5)

* Buscador filtra por nombre en tiempo real.
* Conteo cotizaciones en tiempo real (no cacheado).
* Crear cliente: Nombre + Teléfono mínimos.
* Ficha: historial solo de **ese** cliente.
* Facturar desde cotización aprobada: pide RUC (Empresa) o DNI (Particular).
* Eliminar cliente desvincula cotizaciones (`cliente_id = NULL`), no las borra.
* Un cliente = único por (usuario + teléfono normalizado).

---

# 10. Relaciones con otros módulos

| Módulo | Relación |
|--------|----------|
| Inicio (02) | Acceso rápido desde card Clientes |
| Cotizaciones (05) | Wizard desde ficha · alta automática de cliente |
| Facturas (06) | Facturar desde historial · consulta facturas del cliente |
| IA (08) | Sin acceso directo |
| Cierre (09) | Sin acceso directo |
| Más (07) | Sin acceso directo |

Flujos oficiales: Móvil §9.

---

# 11. Permisos

Usuario: **Gerente** en Darivo Pro Empresa (`01-VISION-DEL-PRODUCTO.md` §6).

Detalle granular: `11-ROLES-PLANES-PERMISOS-EMPRESA.md` (producción pendiente — no bloquea diseño del módulo).

---

# 12. Validación (Reglas §9 · §15)

* [x] Lógica ↔ Móvil `03-MODULO-CLIENTES.md`
* [x] Diseño ↔ Admin Usuarios §5 + Sistema Diseño §6.2
* [x] MD completo · imagen validada ↔ MD
* [x] Alcance ↔ Visión §5, §6, §9

---

# 13. Estado

✅ **Producción completada** — Reglas §15 (02/07/2026).

**Fin del documento.**
