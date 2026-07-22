# 08 – MÓDULO IA – DARIVO PRO EMPRESA

**Versión:** 1.4

**Estado:** ✅ Documentación sincronizada con Móvil v1.10 — imagen oficial previa (fase global §7 — 02/07/2026); **card Soporte con IA** pendiente de nueva imagen.

**Cambio v1.4 (22/07/2026):** este documento se declaraba "sincronizado con Móvil v1.10" en la cabecera, pero citaba internamente v1.6/v1.5 como fuente que "prevalece" (§0, §1, §11, §13) — el contenido añadido en Móvil v1.7–v1.10 nunca se incorporó. Añadidas a §10: identidad y fuente de conocimiento de Darivo (Móvil §3-A — nunca se presenta como IA/bot/chatbot, fuente única `DARIVO-CONOCIMIENTO-SOPORTE.md`, no revela documentación interna) y la sub-capacidad de ayuda a armar cotización (Móvil §3-B — nunca crea la cotización él mismo, pregunta en vez de inventar precios). Corregida la contradicción de §12: Plan Básico **sí** tiene IA de cotizaciones (limitada), no "sin acceso"; añadida la exención del Agente IA 2 de la matriz de planes. Todas las citas internas a Móvil actualizadas de v1.5/v1.6 a v1.10. Solo contenido funcional — sin cambios de diseño.

**Relacionado:** `01-VISION-DEL-PRODUCTO.md` §5, §13 · `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §6.6 · `01-darivo-pro-movil/08-MODULO-IA.md` v1.10 · `01-darivo-pro-movil/16-SISTEMA-DE-DISEÑO-FABLE5.md` §6.8.2

⚠️ Este documento es la **única fuente autorizada** para la adaptación a escritorio del **Módulo IA** en Darivo Pro Empresa.

> **Lógica de negocio:** exclusivamente `01-darivo-pro-movil/08-MODULO-IA.md` v1.10. Dos agentes oficiales. Modelo soporte IA + humano. La IA es un **atajo** — nunca un flujo paralelo.

---

# 0. Fuentes consultadas (Reglas §7.2 · §15 FASE 1)

| Fuente | Documento | Uso en este MD |
|--------|-----------|----------------|
| Lógica de negocio | `01-darivo-pro-movil/08-MODULO-IA.md` v1.10 | Dos agentes, identidad Darivo, modelo soporte IA+humano, anti-robots |
| Cotizaciones | `01-darivo-pro-movil/05-MODULO-COTIZACIONES.md` | Destino wizard post-IA (Agente 1) |
| Facturas | `01-darivo-pro-movil/06-MODULO-FACTURAS.md` | Flujos Agente IA 1 |
| Soporte | `01-darivo-pro-movil/07-MODULO-MAS.md` §6–§8 | Acceso Agente IA 2 |
| Cotizaciones Empresa | `05-MODULO-COTIZACIONES-EMPRESA.md` v1.0 | Presentación wizard escritorio |
| Diseño Móvil | `16-SISTEMA-DE-DISEÑO-FABLE5.md` §6.8.2 | Cards IAMenuScreen (referencia visual) |
| Sistema de Diseño Empresa | `16-SISTEMA-DE-DISEÑO-EMPRESA.md` v2.4 | Sidebar, header, §6.6 |

> **Sin MD Admin equivalente** del Módulo IA producto.

---

# 1. Objetivo

Darivo Pro Empresa comparte la **misma lógica de IA conversacional** que Darivo Pro Móvil: **dos agentes oficiales** con responsabilidades exclusivas (`01-VISION-DEL-PRODUCTO.md` §13 · Móvil §1–§5).

| Agente | Nombre | Ámbito |
|--------|--------|--------|
| **Agente IA 1** | Cotizaciones y Facturas | Cotizaciones, facturas, conversión |
| **Agente IA 2** | Soporte y Tickets | Uso de la app, errores, tickets |

La **IA automática del Módulo Cierre** (gastos) **no** es un agente conversacional — ver `09-MODULO-CIERRE-EMPRESA.md`.

**Acceso:** sidebar posición **IA** (3) · equivalente Móvil bottom nav posición 3.

En escritorio **no** se replica el botón flotante elevado de la bottom nav móvil; el acceso es el ítem **IA** del sidebar (`16-SISTEMA-DE-DISEÑO-EMPRESA.md` §5.1).

No define Base de Datos, APIs técnicas ni permisos granulares.

---

# 2. Imagen oficial

**Archivo:** `08 - MODULO IA - DARIVO PRO EMPRESA.png`

![Módulo IA — Darivo Pro Empresa](./08%20-%20MODULO%20IA%20-%20DARIVO%20PRO%20EMPRESA.png)

**Estado:** ✅ Imagen previa (Escribir / Hablar — 02/07/2026). ⏳ **Actualización visual pendiente** para incluir card **Soporte con IA** (Agente IA 2) conforme §4.

---

# 3. Navegación

| Elemento | Valor |
|----------|-------|
| Sidebar | Posición **IA** (3) |
| Vistas | **Menú IA** (por defecto) · **Escribir con IA** · **Hablar con IA** · **Soporte con IA** · wizard Cotizaciones / Facturas (destino) |
| Equivalente Móvil | `IAMenuScreen` §6.8.2 · flujos Móvil §7–§11 |

**Agente IA 2 — acceso adicional:** pantalla **Soporte** (`07-MODULO-MAS-EMPRESA.md` §5.6, sidebar 13).

---

# 4. Layout general — Menú IA

Área central con **tres cards** (adaptación escritorio de `16-SISTEMA-DE-DISEÑO-FABLE5.md` §6.8.2):

```
┌─────────────┬──────────────────────────────────────────────────┐
│  SIDEBAR    │  HEADER — IA · subtítulo guía · usuario            │
│  240px      ├──────────────────────────────────────────────────┤
│             │  ┌─────────────────────┐ ┌─────────────────────┐│
│  IA ●       │  │  Escribir con IA    │ │  Hablar con IA      ││
│             │  │  I.edit · purplePale│ │  I.phone · purplePale│
│             │  └─────────────────────┘ └─────────────────────┘│
│             │  ┌───────────────────────────────────────────────┐│
│             │  │  Soporte con IA · I.phone · tealPale (ancho   ││
│             │  │  completo) — Agente IA 2                      ││
│             │  └───────────────────────────────────────────────┘│
└─────────────┴──────────────────────────────────────────────────┘
```

| Elemento | Descripción | Origen |
|----------|-------------|--------|
| Título | «IA» | Móvil §6 · Fable 5 §6.8.2 |
| Subtítulo | Guía breve (ej. *Elige cómo quieres que te ayude*) | Fable 5 §6.8.2 |
| Card 1 | **Escribir con IA** — Agente IA 1 · fondo `T.purplePale` · `I.edit` | Fable 5 §6.8.2 |
| Card 2 | **Hablar con IA** — Agente IA 1 · fondo `T.purplePale` · micrófono/`I.phone` | Fable 5 §6.8.2 |
| Card 3 | **Soporte con IA** — Agente IA 2 · fondo `T.tealPale` · `I.phone` · `T.teal` | Fable 5 §6.8.2 |

Cards 1–2 en fila 50/50 en viewport ≥1024px; card 3 ancho completo debajo. En viewport estrecho: las tres apiladas.

---

# 5. Agente IA 1 — Cotizaciones y Facturas

Referencia completa: Móvil §2, §7–§10.

### Responsabilidad exclusiva

* Crear y editar cotizaciones.
* Crear facturas y convertir cotizaciones en facturas.
* Asistir durante estos procesos.

### Límite

No responde fuera de cotizaciones y facturas (Móvil §4).

---

# 6. Flujo — Escribir con IA

Equivalente Móvil §7. Presentación escritorio: vista modal o página dedicada con formulario amplio.

## 6.1 Diseño

| Elemento | Descripción |
|----------|-------------|
| Textarea | Grande, placeholder de ejemplo (Móvil §7) |
| Botón | **Generar cotización** — primario azul gradiente |
| Loader | Skeleton mientras procesa (máx. ~5 s) |

## 6.2 Funcionalidad

* Texto → **OpenAI API** según Móvil §7 · `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.2.
* Items estructurados, precios referencia mercado peruano, vocabulario peruano, IGV 18%.
* Solo responde dentro del ámbito Agente IA 1.

---

# 7. Flujo — Hablar con IA

Equivalente Móvil §8.

| Elemento | Descripción |
|----------|-------------|
| UI | Misma base que Escribir + control micrófono destacado |
| Animación | Estado «escuchando» durante grabación |
| Fallback | Si Web Speech API no disponible → modo Escribir |

Transcripción → **mismo procesamiento** que Escribir con IA.

---

# 8. Flujo — Facturas (Agente IA 1)

Equivalente Móvil §10.

* Crear factura desde cero · convertir cotización aprobada · asistir en validación FE.
* Siempre termina en factura normal del sistema (`06-MODULO-FACTURAS.md`).
* Presentación escritorio: módulo Facturas (06-EMPRESA) o flujo asistido desde IA.

---

# 9. Después de generar cotización — destino Cotizaciones

Regla fundamental (Móvil §9 · Cotizaciones §1):

1. Ítems IA incorporados al **Paso 2 Cantidades** — controles por tipo (Reglas 4–8 · `05-MODULO-COTIZACIONES-EMPRESA.md` §5.2).
2. Usuario completa Cantidades, revisa **Paso 3 Resumen** y continúa al **Paso 4 Cliente** del wizard normal.
3. Al guardar → numeración **COT-** estándar.
4. **No** existe tipo «documento IA» — cotización idéntica a la manual.

---

# 10. Agente IA 2 — Soporte y Tickets

Referencia completa: Móvil §3, §11.

### Identidad y fuente de conocimiento (Móvil §3-A — regla estricta, sin excepción)

* **Nombre único y oficial de cara al usuario: "Darivo".** Nunca se presenta como "asistente de IA", "bot", "chatbot" ni menciona la palabra "IA" en ningún texto visible al usuario. Tono conversacional, sin jerga técnica.
* **Fuente de conocimiento: únicamente `DARIVO-CONOCIMIENTO-SOPORTE.md`** (raíz del repo, sincronizado en `frontend/src/content/darivo/conocimiento.md`). Darivo **no consulta la base de datos, el código fuente ni ningún otro documento** para responder. Crear un ticket (§11 Móvil) es una acción estructurada de la interfaz, no una consulta de datos.
* Darivo nunca da a entender que existe un documento o fuente interna detrás de sus respuestas (sección "NO PÚBLICO" del documento de conocimiento).
* Fuera de ese ámbito, Darivo lo indica con naturalidad y redirige la conversación — nunca responde con conocimiento general ajeno a `DARIVO-CONOCIMIENTO-SOPORTE.md`.

### Sub-capacidad: ayuda para armar una cotización (Móvil §3-B)

Darivo puede ayudar a un usuario a **pensar y organizar** una cotización de forma conversacional (categoría, partidas, cantidades, precios de referencia del catálogo base) — pero **nunca crea la cotización él mismo**: esa responsabilidad sigue siendo exclusiva del Agente IA 1 (§5). Darivo siempre remite al usuario al flujo normal de Cotizaciones (`05-MODULO-COTIZACIONES-EMPRESA.md`) para elegir sus partidas reales y guardar el documento. Si tiene dudas sobre un producto/servicio/precio durante esa conversación, **debe preguntarle al usuario** en vez de asumir o inventar — solo puede citar precios de referencia del catálogo base documentados en `DARIVO-CONOCIMIENTO-SOPORTE.md`, aclarando siempre que son orientativos.

### Modelo de soporte oficial

Mismo modelo de **dos niveles** que Darivo Pro Móvil:

| Nivel | Responsable |
|-------|-------------|
| Primer nivel | **IA de Soporte** (Agente IA 2) |
| Segundo nivel | **Soporte Humano** (Darivo Pro Admin) |

### IA de Soporte — primer nivel

* Responder preguntas frecuentes.
* Ayudar con el uso de la aplicación.
* Resolver incidencias comunes.
* Crear tickets de soporte.
* Consultar el estado de un ticket.

### Soporte Humano — escalado

Cuando la IA no pueda resolver con certeza → ticket escalado automáticamente al equipo humano (`09-PANEL-ADMIN-SOPORTE.md`).

El soporte humano revisa, comunica, solicita información, resuelve incidencias técnicas y **cierra** el ticket.

### Regla obligatoria

> La IA nunca inventa una solución sin certeza. Deriva automáticamente al soporte humano mediante ticket.

### Acceso escritorio

* Card **Soporte con IA** en Menú IA (§4).
* Pantalla **Soporte** (`07-MODULO-MAS-EMPRESA.md` §5.6, sidebar 13) — tickets estructurados.

### Presentación

Vista conversacional (panel central o modal ancho) con historial de mensajes, campo de texto y estado del ticket cuando corresponda. Estados oficiales: **Abierto** / **En progreso** / **Resuelto** / **Cerrado** (schema real `soporte_tickets.estado`, ver Móvil `08-MODULO-IA.md` v1.10 §11 y `09-PANEL-ADMIN-SOPORTE.md`).

---

# 11. Ámbito y protección (referencia Móvil)

| Tema | Referencia Móvil |
|------|------------------|
| Temas permitidos / rechazados | §4 |
| Mensaje fuera de ámbito | §4 |
| Protección frente a robots | §5 |

No duplicar listas completas — prevalece `08-MODULO-IA.md` v1.10.

---

# 12. Límites por plan

Referencia única: `04-PANEL-ADMIN-SUSCRIPCIONES.md` · matriz real Móvil §12:

* Plan **Básico:** IA para **cotizaciones SÍ**, con uso limitado (límite numérico pendiente de definir en `12 – ROLES… ADMIN.md`); IA para **facturas NO disponible**.
* Plan **Pro y Business:** IA para cotizaciones SÍ (uso amplio); IA para facturas SÍ.
* Si un usuario Básico intenta usar el Agente IA 1 para facturas, o agota su límite de cotizaciones, se muestra un mensaje claro invitando a subir de plan — nunca un error técnico confuso.
* **El Agente IA 2 (Soporte y Tickets — Darivo) no está sujeto a esta tabla:** su disponibilidad no depende del plan, salvo que se documente lo contrario en `04-PANEL-ADMIN-SUSCRIPCIONES.md`.

**Necesidades API:** OpenAI API ✅ aprobada (`08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.2).

---

# 13. Reglas de negocio (referencia Móvil §13)

* Solo dos agentes conversacionales oficiales.
* IA = atajo, nunca documento paralelo.
* Siempre termina en cotización **COT-** o factura normal.
* Texto y voz → mismo procesamiento final en cotizaciones.
* Resultado editable antes de guardar.
* Protección anti-robots activa.
* Restricciones aplicadas por plan contratado.

---

# 14. Relaciones

| Módulo | Relación |
|--------|----------|
| Cotizaciones (05) | Destino obligatorio post-generación Agente IA 1 |
| Facturas (06) | Flujos Agente IA 1 |
| Cierre (09) | IA automática en gastos — flujo distinto, no desde este menú |
| Soporte (07 §5.6) | Tickets estructurados; el agente conversacional Darivo (Agente IA 2) vive en este módulo IA |
| Clientes (03) | Paso 2 wizard tras IA |
| Inicio (02) | Puede ofrecer atajos; acceso principal = sidebar IA |

---

# 15. Permisos

**Gerente** (`01-VISION-DEL-PRODUCTO.md` §6).

Detalle: `11-ROLES-PLANES-PERMISOS-EMPRESA.md` — **matriz detallada pendiente aprobación propietario**.

---

# 16. Validación (Reglas §9 · §15)

* [x] Lógica ↔ Móvil `08-MODULO-IA.md` v1.10
* [x] Modelo soporte IA + humano ↔ Móvil §3
* [x] Diseño cards ↔ Fable 5 §6.8.2 · Sistema Diseño Empresa §6.6
* [x] Destino cotización ↔ `05-MODULO-COTIZACIONES-EMPRESA.md`
* [x] Facturas ↔ `06-MODULO-FACTURAS.md` (referencia Móvil)
* [x] Soporte ↔ `07-MODULO-MAS-EMPRESA.md` · Admin `09-PANEL-ADMIN-SOPORTE.md`
* [ ] Imagen oficial actualizada con card Soporte con IA (pendiente propietario)

---

# 17. Estado

✅ **Documentación v1.3 sincronizada** (16/07/2026) — Agente IA 2 con nombre oficial "Darivo", estados de ticket corregidos.

⏳ Imagen oficial §2 — actualización visual card Agente IA 2.

**Fin del documento.**
