# DARIVO PRO — MÓDULO INICIO
## Diseño + Funcionalidad
### Versión: 1.1 — 06/07/2026
### Fuente: diseño Fable 5 (`HomeScreen`) + `01-VISION-DEL-PRODUCTO.md` §5

⚠️ Este documento es la ÚNICA fuente autorizada para el diseño y funcionalidad del Módulo Inicio. Ninguna IA puede modificar esto sin aprobación.

> **Sistema de diseño:** Para colores, iconos, componentes, navegación y animaciones → **ver 16-SISTEMA-DE-DISEÑO-FABLE5.md**. En caso de contradicción, prevalece Fable 5.

---

## 1. QUÉ ES EL MÓDULO INICIO

Pantalla de bienvenida y resumen operativo de Darivo Pro Móvil. Ofrece acceso rápido a las acciones más frecuentes sin duplicar la funcionalidad de los demás módulos.

**Acceso en Darivo Pro Móvil:** posición **Inicio** (1) de la navegación principal (`01-VISION-DEL-PRODUCTO.md` §5).

---

## 2. DISEÑO (Fable 5 — `HomeScreen`)

```
HEADER (DarkHeader — ver 16 §6.1):
- Saludo: "¡Hola de nuevo!" (T.textLight, 13px)
- Nombre del usuario (blanco, 24px, bold)
- Badge "DARIVO PRO" (fondo T.blue, radius 14px)

Estadísticas en header (grid 3 columnas, fondo translúcido):
- Aprobados (T.green)
- Pendientes (T.amber)
- Ingresos S/ (T.blueL)

CUERPO (fondo T.slate):

Botón principal — "Nueva cotización":
- Gradiente azul (T.blue → T.blueL), radius 20px
- Icono I.zap en caja translúcida
- Subtítulo: "Combina partidas · menos de 60 seg"
- Acción: abre wizard de cotización (flujo secundario quote)

Capítulos de obra:
- Pills por categoría del catálogo habilitado
- Acción: abre wizard de cotización

Últimos presupuestos:
- Lista de hasta 4 cotizaciones recientes
- Enlace "Ver todos →" → lista secundaria quotes
```

**No forma parte de Inicio:** bloques «Otros productos», enlaces a Darivo Pro Empresa / Admin / Partner, ni accesos rápidos duplicados a Clientes o Presupuestos (esos módulos tienen entrada propia en la navegación principal).

---

## 3. FUNCIONALIDAD

```
✅ Muestra resumen de cotizaciones aprobadas, pendientes e ingresos
✅ Acceso rápido al wizard manual de cotización (Selección → Cantidades → Resumen → Cliente — Regla 1)
✅ Acceso independiente al flujo IA desde nav central (posición 3)
✅ No duplica la gestión de clientes, facturas ni cierre
✅ Las cotizaciones guardadas se consultan en la ficha de cada Cliente 
   (ver 03-MODULO-CLIENTES.md §4) — la lista "Últimos presupuestos" 
   es atajo visual, no sustituye al historial por cliente
```

---

## 4. RELACIÓN CON OTROS MÓDULOS

| Módulo | Relación |
|--------|----------|
| Clientes | Acceso desde nav principal (posición 2) — no desde Inicio |
| IA | Entrada **independiente** al wizard (posición 3) — flujo IA |
| Cotizaciones | Wizard manual desde Inicio + wizard IA — ver `05-MODULO-COTIZACIONES.md` Regla 1 |
| Facturas | Sin acceso directo desde Inicio |
| Cierre | Sin acceso directo desde Inicio |
| Más | Sin acceso directo desde Inicio |

---

## 5. REGLAS DE NEGOCIO (resumen)

```
✅ Inicio es pantalla de resumen y atajos — no almacena datos propios
✅ No forma parte de flujos fiscales ni de cierre mensual
✅ Moneda mostrada: S/ (soles) — ver 05-MODULO-COTIZACIONES.md §4
✅ No muestra enlaces cross-producto ni accesos rápidos redundantes con la BottomNav
```

---

⚠️ **Actualizado v1.1 (06/07/2026)** — eliminados accesos rápidos Clientes/Presupuestos y cualquier bloque «Otros productos» en Inicio; alineado con `HomeScreen` Fable 5 y navegación §5 Visión.

*Este documento describe el Módulo Inicio únicamente. Para navegación oficial, ver `01-VISION-DEL-PRODUCTO.md` §5.*
