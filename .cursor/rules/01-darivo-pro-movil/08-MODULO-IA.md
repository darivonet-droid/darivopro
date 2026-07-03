# DARIVO PRO — MÓDULO IA
## Diseño + Funcionalidad
### Versión: 1.4 — 01/07/2026
### Fuente: diseño Fable 5 (`IAMenuScreen`, botón central nav) + regla `05-MODULO-COTIZACIONES.md` + funcionalidad real construida
### Relacionado: ver `01-VISION-DEL-PRODUCTO.md` §8, §13 · ver `04-PANEL-ADMIN-SUSCRIPCIONES.md` · ver `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` · ver `05-MODULO-COTIZACIONES.md`

⚠️ Este documento es la ÚNICA fuente autorizada para el diseño y funcionalidad de IA. Ninguna IA puede modificar esto sin aprobación.

> **Sistema de diseño:** Para colores, iconos, componentes, navegación y animaciones → **ver 16-SISTEMA-DE-DISEÑO-FABLE5.md**. En caso de contradicción, prevalece Fable 5.

⚠️ **REGLA FUNDAMENTAL (reafirmada en `05-MODULO-COTIZACIONES.md`):** La IA NUNCA genera un documento independiente o de tipo distinto. Siempre termina creando una Cotización normal del sistema, con su número COT- y todas las reglas habituales. La IA es un ATAJO para llenar el wizard, no un flujo paralelo.

---

## 1. QUÉ ES EL MÓDULO IA

Asistente integrado en Darivo Pro Móvil que permite crear una cotización describiendo el trabajo en lenguaje natural (texto o voz), en lugar de navegar manualmente el catálogo de categorías y partidas.

Según `01-VISION-DEL-PRODUCTO.md` §13, la IA de producto está orientada a asistir al usuario en la creación y gestión de **cotizaciones, facturas e informes** dentro del flujo normal del producto. Este documento desarrolla actualmente el ámbito de **cotizaciones**. Los flujos de facturas e informes quedan pendientes de documentar en este MD cuando el propietario lo autorice.

---

## 2. ACCESO — NAVEGACIÓN PRINCIPAL

Según `01-VISION-DEL-PRODUCTO.md` §5, **IA** es uno de los seis módulos de la navegación principal oficial de Darivo Pro Móvil (posición 3, botón central destacado):

* Inicio · Clientes · **IA** · Facturas · Cierre · Más

El acceso al módulo IA se realiza desde la posición **IA** de la barra de navegación inferior.

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
- Card opción 1: ✏️ Escribir con IA (I.edit, fondo T.purplePale)
  → abre wizard de cotización (quote)
- Card opción 2: 🎤 Hablar con IA (I.phone, fondo T.purplePale)
  → flujo de voz (Web Speech API)
```

---

## 3. FLUJO — ESCRIBIR CON IA

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
```

---

## 4. FLUJO — HABLAR CON IA

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

## 5. DESPUÉS DE GENERAR — SIEMPRE TERMINA IGUAL

```
Los items generados por la IA:
1. Se muestran al usuario como una lista EDITABLE 
   (puede corregir cantidades, precios, eliminar 
   o añadir líneas) — usando la MISMA calculadora 
   libre que el wizard manual (ver 05-MODULO-COTIZACIONES.md)
2. El usuario pasa al Paso 2 (Cliente) del wizard normal — 
   MISMO flujo que la creación manual desde este punto
3. Al guardar, recibe su número COT- normal, igual que 
   cualquier otra cotización
4. NO existe un "tipo de documento IA" distinto en la 
   base de datos — es una cotización idéntica a las 
   creadas manualmente, solo que su origen fue IA
```

---

## 6. LÍMITES POR PLAN

```
El acceso a la IA depende exclusivamente de las limitaciones 
del plan contratado (ver `01-VISION-DEL-PRODUCTO.md` §8.5 
y `04-PANEL-ADMIN-SUSCRIPCIONES.md`).

Plan Básico: sin acceso a IA.
Plan Pro: acceso a IA según las limitaciones del plan.

Si el usuario intenta usar IA desde Plan Básico, se 
muestra mensaje claro invitando a subir a Plan Pro — 
NUNCA un error técnico confuso.
```

---

## 7. REGLAS DE NEGOCIO (resumen)

```
✅ La IA es un ATAJO, nunca un documento paralelo
✅ Siempre termina en una Cotización normal con su COT-
✅ Texto y voz usan el mismo procesamiento final
✅ Resultado SIEMPRE editable antes de guardar
✅ Vocabulario peruano correcto en las respuestas de IA
✅ El acceso y los límites de uso están sujetos a las 
   limitaciones del plan contratado (`01-VISION-DEL-PRODUCTO.md` §8.5)
✅ Darivo Pro Móvil no administra planes ni permisos; 
   solo aplica las restricciones del plan (`12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` §16)
✅ Diseño visual de nav IA y menú IAMenuScreen implementado en Fable 5
```

---

*Este documento describe IA únicamente. Para el flujo posterior de la cotización generada, ver 05-MODULO-COTIZACIONES.md.*
