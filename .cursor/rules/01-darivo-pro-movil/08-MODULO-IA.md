# DARIVO PRO — MÓDULO IA
## Diseño + Funcionalidad
### Versión: 1.6 — 04/07/2026
### Fuente: diseño Fable 5 (`IAMenuScreen`, botón central nav) + regla `05-MODULO-COTIZACIONES.md` + `06-MODULO-FACTURAS.md` + funcionalidad real construida
### Relacionado: ver `01-VISION-DEL-PRODUCTO.md` §13 · ver `04-PANEL-ADMIN-SUSCRIPCIONES.md` · ver `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` · ver `05-MODULO-COTIZACIONES.md` · ver `06-MODULO-FACTURAS.md` · ver `07-MODULO-MAS.md` §6–§8

⚠️ Este documento es la ÚNICA fuente autorizada para el diseño y funcionalidad de IA conversacional en Darivo Pro Móvil. Ninguna IA puede modificar esto sin aprobación.

> **Sistema de diseño:** Para colores, iconos, componentes, navegación y animaciones → **ver 16-SISTEMA-DE-DISEÑO-FABLE5.md**. En caso de contradicción, prevalece Fable 5.

⚠️ **REGLA FUNDAMENTAL (reafirmada en `05-MODULO-COTIZACIONES.md` y `06-MODULO-FACTURAS.md`):** La IA NUNCA genera un documento independiente o de tipo distinto. Siempre termina creando una **Cotización** normal del sistema (número `COT-`) o una **Factura** normal del sistema, con todas las reglas habituales. La IA es un **ATAJO** dentro del flujo de trabajo, no un flujo paralelo.

> **Nota terminológica:** En la interfaz puede aparecer la palabra *presupuesto*; en Darivo Pro el documento oficial equivalente es la **cotización** (`COT-`).

---

## 1. QUÉ ES EL MÓDULO IA

Darivo Pro Móvil dispone de **dos agentes oficiales de Inteligencia Artificial** con responsabilidades exclusivas y separadas.

| Agente | Nombre oficial | Ámbito |
|--------|----------------|--------|
| **Agente IA 1** | Presupuestos y Facturas | Cotizaciones, facturas y conversión entre ambos |
| **Agente IA 2** | Soporte y Tickets | Uso de la app, incidencias y tickets de soporte |

Ningún otro agente conversacional forma parte del producto.

La **IA automática del Módulo Cierre** (análisis de fotografías y documentos en registro de gastos) **no** es uno de estos dos agentes. Es una función transparente del Módulo Cierre documentada en `09-MODULO-CIERRE.md` §14.

---

## 2. AGENTE IA 1 — PRESUPUESTOS Y FACTURAS

### Responsabilidad exclusiva

* Crear presupuestos (cotizaciones).
* Editar presupuestos.
* Crear facturas.
* Convertir presupuestos en facturas.
* Ayudar al usuario durante estos procesos.

### Límite de ámbito

No puede responder consultas fuera de presupuestos, cotizaciones y facturas.

---

## 3. AGENTE IA 2 — SOPORTE Y TICKETS

### Modelo de soporte oficial

Darivo Pro Móvil dispone de un sistema de soporte compuesto por:

| Nivel | Responsable | Función |
|-------|-------------|---------|
| **Primer nivel** | **IA de Soporte** (Agente IA 2) | Atención inmediata, resolución de casos comunes y gestión inicial de tickets |
| **Segundo nivel** | **Soporte Humano** | Incidencias escaladas que la IA no puede resolver con certeza |

El **Soporte Humano** opera desde **Darivo Pro Admin → Soporte** (`09-PANEL-ADMIN-SOPORTE.md`).

### IA de Soporte — primer nivel de atención

La IA es siempre el **primer nivel** de atención. Puede:

* Responder preguntas frecuentes.
* Ayudar con el uso de la aplicación.
* Resolver incidencias comunes.
* Crear tickets de soporte.
* Consultar el estado de un ticket.

### Soporte Humano — segundo nivel

Cuando la IA **no pueda resolver** una incidencia con certeza, el ticket se **escala automáticamente** al equipo de soporte humano.

El soporte humano podrá:

* Revisar el ticket.
* Comunicarse con el usuario.
* Solicitar información adicional.
* Resolver incidencias técnicas.
* Cerrar el ticket una vez solucionado.

### Regla obligatoria

> **La IA nunca debe inventar una solución cuando no tenga certeza.**

Si no puede resolver la consulta, deberá:

1. Informar al usuario con claridad.
2. **Derivar automáticamente** el caso al soporte humano mediante un ticket.

La IA **no** cierra tickets escalados al soporte humano; el cierre corresponde al equipo humano una vez solucionada la incidencia.

### Límite de ámbito

No puede responder consultas fuera del funcionamiento de Darivo Pro Móvil.

Los estados oficiales del ticket (**Nuevo**, **En proceso**, **Resuelto**) y la administración desde Darivo Pro Admin se documentan en `09-PANEL-ADMIN-SOPORTE.md` y `07-MODULO-MAS.md` §8.

---

## 4. ÁMBITO DE LA IA CONVERSACIONAL

### Temas permitidos

Los dos agentes únicamente responderán preguntas relacionadas con:

* Presupuestos y cotizaciones.
* Facturas.
* Soporte de la aplicación.
* Tickets de soporte.

### Temas no permitidos

No responderán preguntas de:

* Cultura general.
* Deportes.
* Noticias.
* Política.
* Medicina.
* Programación.
* Finanzas.
* Temas personales.
* Cualquier otro tema ajeno a Darivo Pro Móvil.

### Comportamiento ante consultas fuera de ámbito

Cuando el usuario realice una consulta fuera del ámbito del producto, la IA indicará que solo puede ayudar con **presupuestos, facturas, soporte y tickets de Darivo Pro Móvil**.

---

## 5. PROTECCIÓN FRENTE A ROBOTS

La IA debe detectar posibles usos automatizados del servicio.

### Señales de comportamiento sospechoso

* 20 o más preguntas consecutivas en un corto período.
* Solicitudes repetitivas.
* Múltiples consultas simultáneas.
* Patrones propios de bots o scripts.

### Acciones oficiales

Si detecta un comportamiento sospechoso:

1. Registrar el evento.
2. Suspender temporalmente las respuestas de IA.
3. Informar al usuario de la actividad detectada.
4. Permitir continuar cuando finalice el período de protección establecido por la aplicación.

Esta protección es independiente de los límites de uso por plan (§10).

---

## 6. ACCESO Y NAVEGACIÓN

Según `01-VISION-DEL-PRODUCTO.md` §5, **IA** es uno de los seis módulos de la navegación principal oficial de Darivo Pro Móvil (posición 3, botón central destacado):

* Inicio · Clientes · **IA** · Facturas · Cierre · Más

### Agente IA 1 — acceso principal

Desde la posición **IA** de la barra de navegación inferior → `IAMenuScreen`.

### Agente IA 2 — accesos oficiales

* Desde **Más → Soporte** (`07-MODULO-MAS.md` §6).
* Desde una entrada en `IAMenuScreen` dedicada al soporte — diseño Fable 5 §6.8.2 (card **Soporte con IA**).

### Diseño (Fable 5 — `IAMenuScreen` + `BottomNav` §6.8)

Implementado en `docs/02-darivo-pro-movil/fable-5-diseño.jsx` conforme a `16-SISTEMA-DE-DISEÑO-FABLE5.md` §6.8 y §7.1:

```
Botón central en BottomNav:
- Icono: I.sparkle
- Fondo: gradiente morado (T.purple → CIERRE_PURPLE_L)
- Tamaño: 52×52px, borderRadius 26, marginTop -16
- Sin etiqueta de texto (solo icono elevado)

Al tocar la posición IA de la nav bar → IAMenuScreen:
- DarkHeader: título "IA" + subtítulo guía

AGENTE IA 1 — Presupuestos y Facturas:
- Card opción 1: ✏️ Escribir con IA (I.edit, fondo T.purplePale)
  → Agente IA 1 — flujo texto (cotización)
- Card opción 2: 🎤 Hablar con IA (I.phone, fondo T.purplePale)
  → Agente IA 1 — flujo voz (cotización)

AGENTE IA 2 — Soporte y Tickets:
- Card opción 3: 🎧 Soporte con IA (I.phone, fondo T.tealPale)
  → Agente IA 2 — conversación de soporte y tickets
  (equivalente funcional a Más → Soporte)
```

---

## 7. FLUJO AGENTE IA 1 — ESCRIBIR CON IA (COTIZACIÓN)

```
DISEÑO:
Pantalla/modal con:
- Textarea grande, placeholder: ejemplo de descripción 
  ("Ej: cambio de 3 caños de agua y pintado de 2 
  habitaciones de 4x5 metros")
- Botón "Generar cotización" (azul, gradiente)
- Skeleton loader mientras procesa (máximo 5 segundos)

FUNCIONALIDAD:
El texto se envía a la **OpenAI API** (registro oficial `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.2)
con un system prompt que:
- Convierte la descripción en items estructurados: 
  {descripción, cantidad, unidad, precio_unit, total}
- Usa precios de mercado peruano (Lima) como referencia
- Usa vocabulario correcto: "gasfitero" (no fontanero), 
  "maestro de obra" (no albañil)
- Calcula subtotal + IGV (18%) + total
- Solo responde dentro del ámbito del Agente IA 1 (§4)
```

---

## 8. FLUJO AGENTE IA 1 — HABLAR CON IA (COTIZACIÓN)

```
DISEÑO:
Misma pantalla que "Escribir", pero con botón de 
micrófono grande, animación de "escuchando" mientras 
graba

FUNCIONALIDAD:
- Usa Web Speech API del navegador para transcribir voz 
  a texto
- El texto transcrito pasa por el MISMO proceso que 
  "Escribir con IA" (mismo system prompt, mismo resultado)
- Si el navegador no soporta reconocimiento de voz, 
  se ofrece el modo "Escribir" como alternativa
```

---

## 9. DESPUÉS DE GENERAR COTIZACIÓN — SIEMPRE TERMINA IGUAL

```
Los items generados por la IA:
1. Se incorporan al Paso 2 (Resumen) del wizard normal como
   partidas editables — controles por tipo según Catálogo Maestro
   (Reglas 5–7 de 05-MODULO-COTIZACIONES.md §4)
2. El usuario completa el Resumen (Regla 8) y pasa al
   Paso 3 (Cliente) — MISMO flujo que la creación manual
3. Al confirmar (Guardar), recibe su número COT- normal
4. NO existe un "tipo de documento IA" distinto
5. Reglas 6–10 del módulo Cotizaciones aplican igualmente
   (conservación mediciones, sincronización, sesión wizard)
```

---

## 10. FLUJO AGENTE IA 1 — FACTURAS

El Agente IA 1 puede asistir en:

* Crear una factura desde cero (mismas reglas que `06-MODULO-FACTURAS.md`).
* Convertir una cotización aprobada en factura.
* Ayudar durante la validación previa al envío de facturación electrónica.

```
REGLAS:
- Siempre termina en una Factura normal del sistema
- Respeta tipo de comprobante (Boleta / Factura), RUC/DNI, 
  detracción SUNAT y numeración oficial (06-MODULO-FACTURAS.md)
- Respeta el flujo de facturación electrónica (06 §7): 
  Borrador → validación → En proceso → Emitida / Rechazada / 
  Pendiente de envío
- No sustituye la validación de Darivo Pro ni la API oficial 
  de facturación electrónica futura
- Solo responde dentro del ámbito del Agente IA 1 (§4)
```

---

## 11. FLUJO AGENTE IA 2 — SOPORTE Y TICKETS

```
MODELO DE DOS NIVELES:

Usuario → IA de Soporte (primer nivel)
              │
              ├─ Incidencia común resuelta → fin (sin ticket o ticket informativo)
              │
              └─ Sin certeza / no resuelta → ticket escalado → Soporte Humano

CONVERSACIÓN (IA — primer nivel):
- El usuario describe su duda, error o incidencia
- La IA responde únicamente sobre Darivo Pro Móvil (§4)
- Intenta resolver con preguntas frecuentes, guía de uso o 
  solución de incidencias comunes
- NUNCA inventa una solución si no tiene certeza (§3)

ESCALADO AUTOMÁTICO (regla obligatoria):
- Si la IA no puede resolver con certeza:
  1. Informa al usuario
  2. Crea o escala un ticket al Soporte Humano automáticamente
  3. El ticket pasa a estado En proceso en Admin

TICKETS (IA):
- Crear ticket cuando proceda el escalado
- Consultar estado de tickets existentes del usuario
- La IA NO cierra tickets escalados al soporte humano

SOPORTE HUMANO (Admin — segundo nivel):
- Revisa el ticket escalado
- Se comunica con el usuario
- Solicita información adicional si es necesaria
- Resuelve incidencias técnicas
- Cierra el ticket (estado Resuelto) una vez solucionado

INTEGRACIÓN:
- Tickets sincronizados con Darivo Pro Admin 
  (09-PANEL-ADMIN-SOPORTE.md)
- Estados oficiales: Nuevo / En proceso / Resuelto
- Acceso usuario: Más → Soporte · IAMenuScreen card Soporte con IA 
  (07-MODULO-MAS.md §6)
```

---

## 12. LÍMITES POR PLAN

```
El acceso a la IA conversacional depende exclusivamente 
de las limitaciones del plan contratado (ver 
`01-VISION-DEL-PRODUCTO.md` §8.5 y 
`04-PANEL-ADMIN-SUSCRIPCIONES.md`).

Plan Básico: sin acceso a IA conversacional.
Plan Pro: acceso a IA según las limitaciones del plan.

Si el usuario intenta usar IA desde Plan Básico, se 
muestra mensaje claro invitando a subir a Plan Pro — 
NUNCA un error técnico confuso.
```

---

## 13. REGLAS DE NEGOCIO (resumen)

```
AGENTES:
✅ Solo existen dos agentes conversacionales oficiales (§2, §3)
✅ Cada agente tiene un ámbito exclusivo; no responde fuera de él
✅ Consultas fuera de ámbito → mensaje de rechazo estándar (§4)

DOCUMENTOS:
✅ La IA es un ATAJO, nunca un documento paralelo
✅ Siempre termina en Cotización (COT-) o Factura normales
✅ Texto y voz usan el mismo procesamiento final en cotizaciones
✅ Resultado SIEMPRE editable antes de guardar (cotizaciones)

SEGURIDAD:
✅ Protección frente a robots activa (§5)
✅ Registro de eventos sospechosos y suspensión temporal

SOPORTE (Agente IA 2):
✅ Modelo de dos niveles: IA de Soporte → Soporte Humano
✅ IA es primer nivel; escala automáticamente si no tiene certeza
✅ La IA NUNCA inventa soluciones sin certeza (§3)
✅ Cierre de tickets escalados: solo Soporte Humano (Admin)

PLANES:
✅ Acceso y límites sujetos al plan contratado (§12)
✅ Darivo Pro Móvil no administra planes; solo aplica restricciones 
   (`12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` §16)

DISEÑO:
✅ Nav IA y menú IAMenuScreen conforme a Fable 5 (§6)
✅ Vocabulario peruano correcto en respuestas del Agente IA 1
```

---

## 14. Estado del documento

**Versión:** 1.6

**Estado:** Diseño y funcionalidad oficial aprobados.

**Cambio principal (v1.6):** modelo oficial de soporte IA + humano (dos niveles), regla obligatoria de no inventar soluciones y escalado automático al soporte humano.

**Cambio principal (v1.5):** definición oficial de los dos agentes de IA (Presupuestos y Facturas · Soporte y Tickets), ámbito permitido y rechazado, protección frente a robots, flujos de facturas y soporte/tickets; aclaración de que la IA del Módulo Cierre no es un agente conversacional.

**Sincronización (04/07/2026):** diseño Fable 5 card «Soporte con IA» documentado en `16-SISTEMA-DE-DISEÑO-FABLE5.md` §6.8.2 · Empresa `08-MODULO-IA-EMPRESA.md` v1.1.

---

*Este documento describe la IA conversacional de Darivo Pro Móvil. Para cotizaciones posteriores, ver `05-MODULO-COTIZACIONES.md`. Para facturas, ver `06-MODULO-FACTURAS.md`. Para soporte desde Más, ver `07-MODULO-MAS.md`. Para IA automática de gastos, ver `09-MODULO-CIERRE.md` §14.*
