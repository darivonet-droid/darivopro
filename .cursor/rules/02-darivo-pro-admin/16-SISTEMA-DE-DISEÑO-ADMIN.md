# 16-SISTEMA-DE-DISEÑO-ADMIN.md

# DARIVO PRO — SISTEMA DE DISEÑO OFICIAL (ADMIN)

**Versión:** 1.0

**Estado:** ✅ Documento oficial — aprobado por el propietario (06/07/2026), a partir de imagen de referencia entregada directamente.

**Relacionado:** `01-VISION-DEL-PRODUCTO.md` §10 (Admin es la referencia visual única de escritorio) · `03-darivo-pro-empresa/16-SISTEMA-DE-DISEÑO-EMPRESA.md` (debe reutilizar este sistema, no tener uno propio)

---

## 0. Principio oficial

Este documento es la **única fuente de diseño visual** para productos de escritorio del ecosistema Darivo Pro: **Darivo Pro Admin** y **Darivo Pro Empresa** (`01-VISION-DEL-PRODUCTO.md` §10, v2.14).

Darivo Pro Móvil **no** sigue este sistema — usa Fable 5 (`01-darivo-pro-movil/16-SISTEMA-DE-DISEÑO-FABLE5.md`), independiente.

Cualquier componente visual nuevo debe definirse aquí primero. Los MD específicos de cada módulo (Admin o Empresa) documentan su contenido funcional, nunca redefinen el diseño.

---

## 1. Estructura general de pantalla

```
┌──────────────┬──────────────────────────────────────────────────────┐
│  SIDEBAR      │  HEADER: título de página + breadcrumb (Inicio > X)  │
│  fijo, 240px  │  Buscador global (⌘K) centrado                       │
│  aprox.       │  Notificaciones (campana + badge numérico) + Ayuda   │
│              │  (?) + Avatar + nombre rol (ej. "Administrador")     │
│  Logo "D"    ├──────────────────────────────────────────────────────┤
│  + nombre    │  TARJETAS KPI (fila superior, 3-4 tarjetas)          │
│  producto    ├──────────────────────────────────────────────────────┤
│              │  BARRA DE ACCIONES / FILTROS                         │
│  Ítems de    ├──────────────────────────────────────────────────────┤
│  navegación  │  CONTENIDO PRINCIPAL (tabla o listado)   │ PANEL     │
│  (icono +    │                                            │ LATERAL  │
│  texto)      │                                            │ derecho  │
│              │                                            │ (opcional,│
│  Usuario     │                                            │ detalle) │
│  actual      │                                            │          │
│  (abajo)     ├──────────────────────────────────────────────────────┤
│              │  Paginación + selector "por página"                  │
└──────────────┴──────────────────────────────────────────────────────┘
```

El panel lateral derecho es **opcional** — aparece cuando hay un elemento seleccionado con detalle propio (ej. un partner, un ticket). No todas las pantallas lo llevan.

---

## 2. Paleta de color

| Uso | Color | Notas |
|---|---|---|
| **Color de marca / acento principal** | Violeta/morado (ej. `#7C3AED` aprox.) | Logo, ítem de navegación activo, botones primarios, iconos destacados |
| Fondo general | Blanco / gris muy claro | Limpio, sin degradados fuertes |
| Éxito / Activo | Verde | Badges "Activo", iconos de check |
| Alerta / Pendiente | Ámbar/naranja | Badges "Pendiente", iconos de reloj |
| Error / Suspendido | Rojo | Badges "Suspendido", iconos de bloqueo |
| Texto secundario | Gris medio | Subtítulos, metadatos (fechas, IDs) |

**Regla:** los colores de estado (verde/ámbar/rojo) deben ser consistentes en todas las pantallas Admin y Empresa — mismo verde para "Activo" en Usuarios que en Partners, por ejemplo.

---

## 3. Sidebar (navegación lateral)

* Logo "D" + nombre del producto ("Darivo Pro" / "Panel Administrador" o "Panel Empresa" como subtítulo).
* Ítems de navegación: icono + texto, uno por línea.
* Ítem activo: fondo resaltado en el color de marca (violeta claro) + icono/texto en el color de marca.
* Usuario actual fijo en la parte inferior del sidebar (avatar + nombre + rol).

**Los nombres de los ítems del sidebar los define el índice oficial de cada producto** (`INDICE-OFICIAL-PANEL-ADMIN.md` para Admin) — este documento no fija cuáles módulos existen, solo cómo se ven.

---

## 4. Tarjetas KPI (resumen numérico)

Fila de 3-4 tarjetas en la parte superior de cada pantalla de listado:

* Icono circular a la izquierda (color según semántica: violeta neutro, verde éxito, ámbar alerta, rojo error).
* Número grande (dato principal).
* Etiqueta descriptiva debajo (ej. "Todos los usuarios", "86.2% del total").

---

## 5. Buscador y filtros

* Buscador global arriba a la derecha del header, con atajo de teclado visible (`⌘K`).
* Buscador local de tabla + filtros desplegables (Plan, Estado, Método, etc.) en una barra horizontal justo encima de la tabla principal.
* Botón "Limpiar filtros" siempre visible junto a los filtros activos.

---

## 6. Tabla principal

* Encabezados en mayúsculas, gris, tamaño reducido.
* Fila con avatar/inicial + nombre + email (cuando aplica a personas).
* Badges/pills redondeados para estado (Activo verde, Inactivo gris, Suspendido rojo, Pendiente ámbar).
* Columna "Acciones" a la derecha: iconos (ver, editar, más opciones "⋮").
* Paginación numerada al pie + selector "Mostrar N por página".

---

## 7. Panel lateral derecho (detalle contextual)

Cuando existe, se divide en bloques con encabezado propio:

* Bloque de identidad (avatar, nombre, estado).
* Bloques de información agrupada (ej. "Información del enlace", "Registros asociados").
* Bloque de acciones relacionadas o ayuda contextual al final.

---

## 8. Acciones rápidas / acciones de administración

Sección inferior de página (o panel lateral) con accesos directos en forma de lista con icono + texto + subtítulo corto (ej. "Bloquear Usuario — Suspender el acceso").

---

## 9. Botones

* **Primario**: fondo sólido en el color de marca (violeta), texto blanco. Para la acción principal de la pantalla (ej. "+ Nuevo Usuario", "+ Crear Partner").
* **Secundario**: borde sin relleno o fondo neutro, para acciones auxiliares (Exportar, Filtros).
* **Destructivo/advertencia**: rojo o ámbar sólido, para acciones como "Bloquear", "Suspender".

---

## 10. Reutilización Admin ↔ Empresa

Todo lo anterior aplica igual en Darivo Pro Empresa. Los módulos de Empresa (`03-darivo-pro-empresa/*.md`) deben:

* Usar el mismo sidebar, misma paleta, mismas tarjetas KPI, mismo estilo de tabla y badges.
* Adaptar únicamente el **contenido**: qué módulos aparecen en el sidebar, qué columnas tiene cada tabla, qué KPIs se muestran — nunca el estilo visual de esos componentes.

---

## 11. Estado del documento

✅ Documento oficial completo. Sirve de referencia para crear las 2 imágenes pendientes (`06-MODULO-FACTURAS-EMPRESA.md`, `11-ROLES-PLANES-PERMISOS-EMPRESA.md`) y cualquier imagen nueva de Admin o Empresa (ej. `05-PANEL-ADMIN-EDICION-DE-PRODUCTOS.md`).

## Protección del documento oficial

Solo el propietario del proyecto está autorizado a modificar este documento. Ninguna IA podrá cambiarlo sin autorización expresa.

**Fin del documento.**
