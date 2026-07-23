# 16-SISTEMA-DE-DISEÑO-EMPRESA.md

# DARIVO PRO — SISTEMA DE DISEÑO OFICIAL (EMPRESA)

Versión: 2.7

Última actualización: 22/07/2026

Changelog v2.7 (22/07/2026, pedido explícito del propietario): eliminado el módulo "Más" del sidebar (§5.1) — sus 7 funcionalidades pasan a tener entrada directa en el panel lateral, igual que Darivo Pro Admin (`00-PANEL-ADMIN-DASHBOARD.md` §4, sin agrupador intermedio). §6.7 "Patrón Más" sustituida por §6.7 "Patrón navegación directa (ex-Más)". Solo reorganización de navegación — ninguna lógica ni funcionalidad cambia (`01-VISION-DEL-PRODUCTO.md` §16 v2.19).

Changelog v2.6 (20/07/2026): quitado "Multiempresa" de la lista de
adjetivos de marca (§2, PRINCIPIOS/ADN) — no representa ninguna función
real del producto (un Gerente pertenece a una sola empresa,
`empresas.gerente_user_id` es `UNIQUE`) y podía sembrar confusión.

Este documento reutiliza el sistema de diseño oficial de 
02-darivo-pro-admin/16-SISTEMA-DE-DISEÑO-ADMIN.md (Visión §10, v2.14). 
Empresa no tiene diseño visual propio e independiente — solo adapta 
la disposición de contenido (patrones de esta página) sobre la base 
visual de Admin.

## 6.3 Patrón Cotizaciones

Spec: `05-MODULO-COTIZACIONES-EMPRESA.md` v1.0 · imagen `05 – MÓDULO COTIZACIONES – DARIVO PRO EMPRESA.png`.

| Lógica (Móvil) | Presentación (Empresa) |
|----------------|------------------------|
| Wizard pantalla única móvil | Vista 3 paneles simultáneos |
| FloatBar inferior | Panel resumen derecho fijo |
| StepDots | Header wizard |
| Sin nav principal | Acceso desde Inicio · Clientes · IA |

## 6.4 Patrón Facturas

Spec: `06-MODULO-FACTURAS-EMPRESA.md` v1.0 · imagen `06 - MODULO FACTURAS - DARIVO PRO EMPRESA.png` ✅.

| Lógica (Móvil) | Presentación (Empresa) |
|----------------|------------------------|
| `InvoicesScreen` cards | Tabla principal + toolbar |
| Chips filtro horizontales | Bajo header (Móvil §2) |
| Banner cotiz. aprobadas | Fila banner ámbar sobre tabla |
| `InvoiceEditor` pantalla única | Editor dos columnas (§4.2 MD Facturas) |
| `InvoiceModal` | Modal centrado escritorio |
| Bottom nav Facturas | Sidebar posición 4 |

**Producción §15:** §6.1 Inicio ✅ · §6.2 Clientes ✅ · §6.3 Cotizaciones ✅ · §6.4 Facturas ✅ · §6.5 Cierre ✅ · §6.6 IA ✅ · §6.7 Navegación directa (ex-Más) ✅ doc / ⏳ 7 imágenes · §6.8 Empleados ✅ · §6.9 Roles ✅ (fase global §7 completada 02/07/2026 — §6.7 reorganizada 22/07/2026)

## 6.5 Patrón Cierre

Spec: `09-MODULO-CIERRE-EMPRESA.md` v1.0 · imagen `09 - MODULO CIERRE - DARIVO PRO EMPRESA.png` ✅.

| Lógica (Móvil) | Presentación (Empresa) |
|----------------|------------------------|
| Dos pestañas superiores | Pestañas bajo header escritorio |
| Acentos morados/violetas | Tarjetas destacadas + primarios morados |
| Lista gastos recientes (cards) | Tabla + panel lateral revisión |
| Flujo 4 pasos revisar gasto | Panel lateral derecho con StepDots |
| Expediente + selectores mes/año | Columna principal + panel resumen/export |
| Bottom nav Cierre | Sidebar posición 5 |

## 6.6 Patrón IA

Spec: `08-MODULO-IA-EMPRESA.md` v1.1 · imagen `08 - MODULO IA - DARIVO PRO EMPRESA.png` ✅ (⏳ card Soporte con IA pendiente imagen).

| Lógica (Móvil) | Presentación (Empresa) |
|----------------|------------------------|
| Botón central elevado bottom nav | Ítem sidebar posición 3 |
| `IAMenuScreen` tres cards (§6.8.2 Fable 5) | Dos cards horizontales Agente IA 1 + card ancho completo Agente IA 2 |
| Agente IA 1 — Escribir / Hablar | Misma lógica · formulario/modal escritorio |
| Agente IA 2 — Soporte con IA | Card teal + pantalla Soporte (sidebar 13, `07-MODULO-MAS-EMPRESA.md` §5.6) |
| Destino wizard cotización / factura | `05-MODULO-COTIZACIONES-EMPRESA.md` · `06-MODULO-FACTURAS-EMPRESA.md` |

**Producción §15:** §6.1–§6.9 completos (doc + imágenes — fase global §7 completada 02/07/2026)

## 6.7 Patrón navegación directa (ex-Más)

Spec: `07-MODULO-MAS-EMPRESA.md` v2.0 · imágenes previas de "Más" (`07 - MODULO MAS - DARIVO PRO EMPRESA.png`) **desactualizadas** — pendientes 7 imágenes nuevas, una por entrada directa (Reglas §7.1, no bloquea documentación).

| Lógica (Móvil §6, dentro de "Más") | Presentación (Empresa — entrada directa) |
|----------------------------------|--------------------------------------------|
| Pestaña Categorías + Mis Tarifas | Sidebar posición 6 — pantalla propia, tabla/lista (patrón Admin Catálogo Maestro) |
| Pestaña Empresa (datos) | Sidebar posición 9 — card formulario propia |
| Ítem «Informes» | Sidebar posición 10 — pantalla propia |
| Ítem «Documentos» | Sidebar posición 11 — pantalla propia |
| Ítem «Mi Plan» | Sidebar posición 12 — pantalla propia (patrón Admin Suscripciones, solo lectura + cambio de plan) |
| Ítem «Soporte» | Sidebar posición 13 — pantalla propia (patrón Admin Soporte) |
| Ítem «Perfil» + «IA-Preferencias» + «Preferencias generales» | Sidebar posición 14 «Configuración» — pantalla propia (patrón Admin Configuración `11-PANEL-ADMIN-CONFIGURACION.md`, ampliada con preferencias de producto) |
| Panel lateral fijo «Más opciones» | **Eliminado** — cada entrada es pantalla completa propia, no un panel lateral compartido |
| Bottom nav Más (posición 6 Móvil) | **Sin equivalente en sidebar Empresa** — sustituido por las 7 entradas de arriba |

## 6.8 Patrón Empleados

Spec: `10-MODULO-EMPLEADOS-EMPRESA.md` v1.0 · imagen `10 - MODULO EMPLEADOS - DARIVO PRO EMPRESA.png` ✅ · **exclusivo Empresa**.

| Lógica (Visión §6) | Presentación (Admin Usuarios) |
|--------------------|-------------------------------|
| Invitar / listar Técnicos | Tabla + toolbar |
| Sin equivalente Móvil | Sidebar exclusivo Empresa |

## 6.9 Patrón Roles y Permisos

Spec: `11-ROLES-PLANES-PERMISOS-EMPRESA.md` v1.0 · imagen `11 - MODULO ROLES Y PERMISOS - DARIVO PRO EMPRESA.png` ✅ · **exclusivo Empresa**.

| Lógica (Admin §16) | Presentación (Empresa) |
|--------------------|------------------------|
| Matriz permisos por Técnico | Tabla toggles |
| Plan solo lectura | Badge cabecera |

Fuente técnica autorizada: `docs/03-darivo-pro-empresa/` *(prototipo JSX — pendiente de implementación)*

Documentos relacionados: `REGLAS-OFICIALES-DARIVO-PRO-EMPRESA.md` · `01-VISION-DEL-PRODUCTO.md` §6, §9, §10 · `16-SISTEMA-DE-DISEÑO-FABLE5.md` (marca compartida) · `02-darivo-pro-admin/00-PANEL-ADMIN-DASHBOARD.md` (layout escritorio)

---

⚠️ **Este documento es la ÚNICA fuente autorizada del sistema de diseño de Darivo Pro Empresa.** Fable 5 no se aplica a este producto.

Todo trabajo en Empresa debe seguir `REGLAS-OFICIALES-DARIVO-PRO-EMPRESA.md` v2.5 — **§15 producción automática**.

---

# 1. OBJETIVO

Sistema de diseño oficial de **Darivo Pro Empresa** — entorno de **escritorio** (`empresa.darivopro.com`).

Este documento **concreta** la referencia visual del Panel Administrador (Reglas §4.3) para el producto Empresa. No define lógica de negocio.

| Responsabilidad | Fuente oficial |
|-----------------|----------------|
| Reglas del negocio | Visión del Producto (`01-VISION-DEL-PRODUCTO.md`) |
| Lógica de negocio | Darivo Pro Móvil (`01-darivo-pro-movil/`) |
| Diseño de escritorio | Panel Administrador (`02-darivo-pro-admin/`) |
| Aplicación Empresa | Este documento |

* **Marca compartida:** tokens `T` e iconos `I` de `16-SISTEMA-DE-DISEÑO-FABLE5.md` §3 y §5.

---

# 2. PRINCIPIOS (ADN)

Rápido · Sencillo · Intuitivo · Profesional · Escalable · Multi-país.

La adaptación es **solo de presentación visual en escritorio** (Panel Admin), nunca de lógica de negocio (Móvil).

---

# 3. PALETA OFICIAL

Mismos tokens `T` que `16-SISTEMA-DE-DISEÑO-FABLE5.md` §3:

| Token | Hex | Uso en Empresa |
|-------|-----|----------------|
| `navy` | `#0A1628` | Sidebar |
| `navyLight` | `#112240` | Cabeceras de tabla |
| `blue` | `#2563EB` | Acciones primarias |
| `slate` | `#F1F5F9` | Fondo contenido |
| `white` | `#FFFFFF` | Cards, paneles |
| Cierre morado | `#6D28D9` | Módulo Cierre |

Moneda: **S/** (PEN).

---

# 4. TIPOGRAFÍA E ICONOGRAFÍA

* Tipografía: **Inter** (Fable 5 §4).
* Iconos: objeto **`I`** de Fable 5 §5 (misma iconografía oficial).

---

# 5. LAYOUT ESCRITORIO (referencia Admin)

Patrones tomados de `00-PANEL-ADMIN-DASHBOARD.md`:

## 5.1 Sidebar (240px)

Fondo `navy`. Módulos en lista vertical con icono + etiqueta.

### Módulos compartidos (lógica Móvil — `01-VISION-DEL-PRODUCTO.md` §5)

| Pos | Módulo | MD Empresa | MD funcional Móvil |
|-----|--------|------------|-------------------|
| 1 | Inicio | `02-MODULO-INICIO-EMPRESA.md` | `02-MODULO-INICIO.md` |
| 2 | Clientes | `03-MODULO-CLIENTES-EMPRESA.md` | `03-MODULO-CLIENTES.md` |
| 3 | IA | `08-MODULO-IA-EMPRESA.md` | `08-MODULO-IA.md` |
| 4 | Facturas | `06-MODULO-FACTURAS-EMPRESA.md` | `06-MODULO-FACTURAS.md` |
| 5 | Cierre | `09-MODULO-CIERRE-EMPRESA.md` | `09-MODULO-CIERRE.md` |

Cotizaciones: flujo secundario, sin ítem propio de sidebar — `05-MODULO-COTIZACIONES-EMPRESA.md` / `05-MODULO-COTIZACIONES.md`.

### Módulos exclusivos Empresa (§6 Visión)

| Módulo | MD |
|--------|-----|
| Empleados | `10-MODULO-EMPLEADOS-EMPRESA.md` |
| Roles y Permisos | `11-ROLES-PLANES-PERMISOS-EMPRESA.md` |

### Navegación directa — antiguo Módulo Más (`01-VISION-DEL-PRODUCTO.md` §16, excepción 22/07/2026)

"Más" **no existe** como pantalla en el sidebar de Empresa. Sus 7 funcionalidades tienen entrada directa, igual que Darivo Pro Admin (`00-PANEL-ADMIN-DASHBOARD.md` §4 — sin agrupador intermedio). Mismo contenido funcional que Móvil §6, solo cambia el contenedor de navegación:

| Pos | Módulo (sidebar) | MD Empresa (sección) | Origen (Móvil §6 / Más) |
|-----|-------------------|------------------------|--------------------------|
| 6 | Catálogo · Mis Tarifas | `07-MODULO-MAS-EMPRESA.md` §5.1 | Pestaña Categorías + Mis Tarifas |
| 9 | Empresa | `07-MODULO-MAS-EMPRESA.md` §5.2 | Pestaña Empresa (datos) |
| 10 | Informes | `07-MODULO-MAS-EMPRESA.md` §5.3 | Ítem "Informes" |
| 11 | Documentos | `07-MODULO-MAS-EMPRESA.md` §5.4 | Ítem "Documentos" |
| 12 | Mi Plan | `07-MODULO-MAS-EMPRESA.md` §5.5 | Ítem "Mi Plan" |
| 13 | Soporte | `07-MODULO-MAS-EMPRESA.md` §5.6 | Ítem "Soporte" (Agente IA 2 vive en IA, sidebar 3 — este ítem es solo tickets) |
| 14 | Configuración | `07-MODULO-MAS-EMPRESA.md` §5.7 | Perfil + IA-Preferencias + Preferencias generales |

Empleados (7) y Roles y Permisos (8) mantienen su posición ya documentada, entre Cierre (5) y Catálogo (6)/Empresa (9) — orden completo del sidebar: Inicio(1) · Clientes(2) · IA(3) · Facturas(4) · Cierre(5) · Catálogo·Mis Tarifas(6) · Empleados(7) · Roles y Permisos(8) · Empresa(9) · Informes(10) · Documentos(11) · Mi Plan(12) · Soporte(13) · Configuración(14).

El archivo `07-MODULO-MAS-EMPRESA.md` se conserva con ese nombre por continuidad de referencias cruzadas del ecosistema — documenta las 7 entradas anteriores, ya no una pantalla "Más" única (ver su propio changelog).

## 5.2 Header superior

Barra sobre el área de contenido (no en sidebar):

* Título del módulo + descripción breve.
* Buscador (cuando aplique — patrón Admin §5).
* Notificaciones / usuario Gerente (esquina derecha).

## 5.3 Área de contenido

* Fondo `slate`, padding 24–32px en escritorio (≥1024px) · 16px en teléfono. Diseñado para escritorio (ancho de referencia 1024px+); desde 23/07/2026 también responsive en teléfono (menú en cajón, columnas apiladas, tablas con scroll horizontal) — ver `docs-internos/tareas/2026-07-23-responsive-empresa-admin-precios.md`.
* **Tablas** para listas (Clientes, Facturas, Empleados).
* **Paneles laterales** para fichas de detalle (Cliente, cotización).
* **Cards** radius 14px (Fable 5 §6.3).
* **Filtros** en chips horizontales (patrón Admin Suscripciones/Usuarios).

---

# 6. COMPONENTES OFICIALES

| Componente | Origen | Uso Empresa |
|------------|--------|-------------|
| Cards | Fable 5 §6.3 | KPIs, bloques de formulario |
| `Pill` / chips | Fable 5 §6.5 | Estados cotización / factura |
| Botones | Fable 5 §5.3 | Mismas jerarquías primario/secundario/destructivo |
| Tablas | Admin | Listas principales |
| Modales | Fable 5 §6.10 | Edición, confirmaciones |
| Formularios amplios | Admin | Dos columnas cuando el móvil usa una |

## 6.1 Patrón Inicio

Spec: `02-MODULO-INICIO-EMPRESA.md` v2.0 · imagen ⏳ (Reglas §7.1).

| Lógica (Móvil) | Presentación (Admin Dashboard) |
|----------------|--------------------------------|
| KPIs en `DarkHeader` | Fila 3 cards KPI (§5 tarjetas resumen) |
| CTA «Nueva cotización» | Card gradiente ancho completo |
| Accesos Clientes · Cotizaciones | 2 cards horizontales (§6 acciones rápidas) |
| Pills capítulos obra | Fila pills/chips |
| Lista 4 cotizaciones | Tabla compacta (§5 actividad reciente) |
| Bottom nav Inicio | Sidebar posición 1 |

## 6.2 Patrón Clientes

Spec: `03-MODULO-CLIENTES-EMPRESA.md` v1.0 · imagen `03 – MÓDULO CLIENTES – DARIVO PRO EMPRESA.png`.

| Lógica (Móvil) | Presentación (Admin Usuarios) |
|----------------|-------------------------------|
| `ClientsScreen` cards | Tabla principal + toolbar |
| Buscador en header | Header + buscador (Móvil §3) |
| Card clickeable | Fila tabla → panel lateral |
| `ClientDetail` pantalla completa | Panel lateral derecho §6 |
| Acciones contacto + historial | Mismo contenido en panel |
| Bottom nav Clientes | Sidebar posición 2 |

---

# 7. ORDEN DE PRODUCCIÓN POR MÓDULO

**FASE 1:** análisis documental + resumen ejecutivo (Reglas §3). Sin implementación.

**FASE 2** — conforme a Reglas §3, §7, §7.1 y §7.2:

1. Revisar tres fuentes oficiales (Móvil · Admin · Sistema Diseño Empresa).
2. Diseño oficial (este documento §6.x + MD del módulo).
3. MD completo con el diseño documentado.
4. Aprobación del propietario.
5. Imagen oficial — **solo tras aprobación**, basada en el MD.
6. Validación imagen ↔ MD (Reglas §9.2).
7. Sincronización acotada.
8. Marcar **Producción completada** en índice.

> Orden de módulos: Reglas §13 · Índice §4. La ausencia de imagen **no bloquea** los pasos 1–4 (Reglas §7.1).

---

# 8. IMÁGENES OFICIALES

Nomenclatura: `[NN] – MÓDULO [NOMBRE] – DARIVO PRO EMPRESA.png`

Ubicación: `03-darivo-pro-empresa/`

| Módulo | Imagen | Estado |
|--------|--------|--------|
| Todos | `[NN] – MÓDULO [NOMBRE] – DARIVO PRO EMPRESA.png` | ⏳ |

Obligatorias para **Producción completada** (Reglas §9.2), **después** de aprobar el diseño en el MD (Reglas §7.1). La ausencia de imagen no bloquea la documentación del diseño.

---

# 9. VALIDACIÓN POR MÓDULO

Checklist obligatorio (`REGLAS-OFICIALES-DARIVO-PRO-EMPRESA.md` §9 — alineado con §4):

* Lógica de negocio ↔ Darivo Pro Móvil.
* Diseño escritorio ↔ Panel Administrador + este documento.
* MD ↔ diseño.
* Imagen ↔ MD.
* Funcionalidad y alcance ↔ Visión del Producto.

---

# 10. REGLAS OBLIGATORIAS

* No bottom nav ni `maxWidth: 390` (Fable 5 móvil).
* No funcionalidades exclusivas de Admin (Catálogo Maestro global, Partners plataforma, etc.).
* Ante duda de **reglas o alcance** → Visión del Producto.
* Ante duda de **lógica o comportamiento** → MD Móvil equivalente.
* Ante duda de **diseño escritorio** → Panel Administrador + este documento.

---

**Fin del documento 16-SISTEMA-DE-DISEÑO-EMPRESA.md**
