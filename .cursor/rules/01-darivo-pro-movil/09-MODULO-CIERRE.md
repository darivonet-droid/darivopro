# 09 – MÓDULO CIERRE – DARIVO PRO MÓVIL

**Versión:** 2.0

**Estado:** Diseño oficial aprobado

**Relacionado:** ver `01-VISION-DEL-PRODUCTO.md` §5, §15 y §17 · ver `16-SISTEMA-DE-DISEÑO-FABLE5.md` · ver `04-PANEL-ADMIN-SUSCRIPCIONES.md` · ver `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` · ver `22 – METODOLOGÍA OFICIAL DE IA – DARIVO PRO.md`

⚠️ Este documento es la **única fuente autorizada** para el diseño y funcionalidad del **Módulo Cierre** en Darivo Pro Móvil. Ninguna IA puede modificarlo sin aprobación del propietario.

> **Sistema de diseño:** Para colores, iconos, componentes, navegación y animaciones → **ver `16-SISTEMA-DE-DISEÑO-FABLE5.md`**. La imagen oficial de este módulo forma parte de las referencias visuales del Sistema de Diseño Fable 5.

---

# 1. Objetivo

Este documento define el diseño y el funcionamiento oficial del **Módulo Cierre** en Darivo Pro Móvil.

El módulo es compartido por Darivo Pro Móvil y Darivo Pro Empresa (`01-VISION-DEL-PRODUCTO.md` §15).

El **Módulo Cierre** abarca:

* registro y organización de los gastos generados por la actividad del cliente;
* preparación y organización de la documentación del período seleccionado mediante el **expediente mensual**;
* exportación de la documentación del período en los formatos oficiales.

Su objetivo es permitir el registro y la organización de los gastos generados por la actividad del cliente, siguiendo el ADN oficial de Darivo Pro:

* Rapidez.
* Simplicidad.
* Mínimo número de clics.
* IA invisible para el usuario (sin configuración manual; la asistencia IA está integrada en el flujo).

Este documento define el comportamiento funcional y el diseño oficial de pantalla del módulo.

No define Base de Datos, API, permisos, planes de suscripción ni arquitectura técnica.

---

# 2. Imagen oficial

**Archivo de imagen:**

`09 – MÓDULO CIERRE – DARIVO PRO MÓVIL.png`

![Módulo Cierre — Darivo Pro Móvil](./09%20%E2%80%93%20M%C3%93DULO%20CIERRE%20%E2%80%93%20DARIVO%20PRO%20M%C3%93VIL.png)

> La imagen oficial corresponde al diseño aprobado por el propietario.

### Uso de la imagen oficial

La imagen oficial tiene como único propósito servir como referencia visual del diseño aprobado.

La imagen permite identificar la distribución general de la pantalla, los componentes visibles y la apariencia del diseño.

La imagen **no constituye la documentación funcional del módulo**.

La descripción escrita de este documento MD es la única fuente oficial para documentar el comportamiento del módulo.

Si existe cualquier diferencia entre la imagen y el contenido del documento MD:

* Prevalece siempre el contenido del MD.
* No interpretar la imagen para crear funcionalidades.
* No inventar procesos, módulos, tablas, APIs, permisos o relaciones basándose únicamente en la imagen.
* Si existe cualquier duda o contradicción, detener el trabajo e informar al propietario antes de continuar.

La imagen oficial forma parte de las **referencias visuales del Sistema de Diseño Fable 5** (`16-SISTEMA-DE-DISEÑO-FABLE5.md`).

---

# 3. Diseño oficial

El módulo deberá respetar el sistema oficial de diseño de Darivo Pro Móvil (`16-SISTEMA-DE-DISEÑO-FABLE5.md`) y la imagen oficial de este documento (§2).

El diseño aprobado del Módulo Cierre utiliza acentos en tonos morados/violetas para acciones principales, pestañas activas y tarjetas destacadas, conforme a la imagen oficial.

No podrá modificar sin autorización:

* navegación
* estructura de pestañas
* componentes
* iconografía
* tipografía
* experiencia móvil

---

# 4. Navegación

El **Módulo Cierre** forma parte de la navegación principal oficial de Darivo Pro Móvil (`01-VISION-DEL-PRODUCTO.md` §5):

* Inicio · Clientes · IA · Facturas · **Cierre** · Más

**Acceso en Darivo Pro Móvil:** posición **Cierre** (5) de la navegación principal.

La navegación seguirá exclusivamente la estructura oficial definida en `16-SISTEMA-DE-DISEÑO-FABLE5.md` §7.

---

# 5. Estructura del módulo

El Módulo Cierre se organiza en **dos pestañas superiores**:

| Pestaña | Función |
| ------- | ------- |
| **Gastos** | Registro, consulta y gestión de gastos |
| **Expediente Mensual** | Selección de período, generación del expediente y exportación |

### Cabecera de pantalla

* Marca **Darivo Pro** en la parte superior.
* Icono de notificaciones con indicador de alertas cuando corresponda.
* Título de área: **Gastos** (pestaña activa de registro).
* Subtítulo: *Registra y gestiona todos tus gastos*.

---

# 6. Pestaña — Gastos

## 6.1 Tarjeta «Registrar gasto»

Tarjeta destacada (fondo oscuro/morado) con:

* Título: **Registrar gasto**
* Iconografía de cámara y asistencia **IA**
* Texto: *La IA analizará tu documento automáticamente*

## 6.2 Orígenes de registro

Desde la tarjeta de registro, el usuario puede elegir:

* **Tomar fotografía**
* **Seleccionar imagen**
* **Subir documento PDF**
* **Registro manual**

Flujo oficial:

```
Seleccionar origen
    ↓
Procesamiento automático mediante IA (cuando aplique)
    ↓
Extracción automática de información
    ↓
Validación por el usuario
    ↓
Guardar gasto
    ↓
Guardar documento asociado
    ↓
Disponible en Gastos recientes
```

## 6.3 Gastos recientes

Sección **Gastos recientes** con enlace **Ver todos**.

Cada ítem de la lista muestra:

* Categoría del gasto
* Nombre del proveedor
* Fecha
* Importe en **S/** (soles; nunca €)
* Estado del gasto (ej. **Aprobado**)

---

# 7. Flujo — Revisar gasto

Al procesar un documento mediante IA, se muestra un flujo por pasos:

| Paso | Etiqueta |
| ---- | -------- |
| 1 | Documento |
| 2 | Información |
| 3 | Revisar |
| 4 | Guardar |

### Pantalla de revisión (paso Documento / Información)

* Vista previa del documento analizado.
* Mensaje de confirmación: **Documento analizado** — *La IA ha extraído la información automáticamente*.
* Campos editables poblados por la IA:

| Campo | Descripción |
| ----- | ----------- |
| Proveedor | Nombre del emisor del gasto |
| Fecha | Fecha del documento |
| Categoría | Selector entre categorías oficiales y personalizadas |
| Método de pago | Forma de pago utilizada |
| Total | Importe total en S/ |
| Descripción | Texto descriptivo del gasto |

Campos adicionales de extracción cuando existan en el documento:

* impuestos
* moneda
* número de documento

Botón principal: **Continuar** (avance al siguiente paso del flujo hasta **Guardar**).

---

# 8. Categorías oficiales

Las categorías oficiales del sistema son:

* Materiales
* Herramientas
* Combustible
* Transporte
* Alimentación
* Servicios
* Otros

Estas categorías pertenecen al sistema oficial.

No podrán eliminarse.

---

# 9. Categorías personalizadas

Cada empresa podrá:

* crear categorías propias
* modificar categorías propias
* desactivar categorías propias

Las categorías personalizadas:

* pertenecen únicamente a la empresa
* no modifican las categorías oficiales
* no afectan a otras empresas

---

# 10. Pestaña — Expediente Mensual

## 10.1 Tarjeta principal

Tarjeta destacada con:

* Título: **Expediente mensual**
* Iconografía de carpeta y asistencia **IA**
* Texto: *Genera automáticamente toda la documentación de tu actividad*

## 10.2 Selección de período

Selectores oficiales:

| Selector | Función |
| -------- | ------- |
| **Mes** | Mes del período a generar |
| **Año** | Año del período a generar |

## 10.3 Generar expediente

Botón principal: **Generar expediente**.

Al pulsarlo, el sistema prepara la documentación del período seleccionado.

## 10.4 Contenido del expediente

Bloque informativo **¿Qué incluye tu expediente?**

El expediente mensual incorpora:

* Facturas del período
* Gastos del período
* Comprobantes asociados
* Resumen del período

**Referencia estratégica:** `01-VISION-DEL-PRODUCTO.md` §15.

---

# 11. Pantalla — Expediente generado

Tras generar el expediente correctamente:

* Iconografía de éxito (carpeta con confirmación).
* Título: **¡Expediente listo!**
* Subtítulo con mes y año del período generado.

### Resumen del período

| Dato | Descripción |
| ---- | ----------- |
| Facturas | Número de facturas del período |
| Gastos | Número de gastos del período |
| Comprobantes | Número total de comprobantes |
| Total período | Importe acumulado en S/ |

### Acciones posteriores

* **Ver expediente** — consulta del expediente generado.
* **Generar otro expediente** — reinicio del flujo para otro período.

---

# 12. Exportación

El **Módulo Cierre** podrá obtenerse mediante los formatos oficiales aprobados por el ecosistema.

## Formatos oficiales

Sección **Formatos disponibles** con tres opciones:

| Formato | Descripción |
| ------- | ----------- |
| **Exportar en PDF** | Documento PDF completo |
| **Descargar ZIP** | Archivo comprimido |
| **Carpeta organizada** | Carpeta estructurada |

## Regla de contenido

Todos los formatos contendrán **exactamente la misma información**.

Únicamente cambiará la forma de presentación y entrega.

## Límite funcional

Darivo Pro **no sustituye** el trabajo de la gestoría ni de SUNAT.

La gestoría revisará la documentación generada por Darivo Pro y podrá completarla con la documentación externa que corresponda.

---

# 13. Gestión documental

El **Módulo Cierre** utiliza el sistema oficial de **Gestión Documental** definido en `01-VISION-DEL-PRODUCTO.md` §17.

Podrán asociarse documentos al gasto utilizando el sistema transversal del ecosistema.

La documentación almacenada podrá integrarse en el propio **Módulo Cierre** y en el expediente mensual.

Este documento no define el sistema de gestión documental transversal.

---

# 14. Inteligencia Artificial

La IA analiza automáticamente fotografías y documentos en el registro de gastos y en la generación del expediente mensual.

La IA trabaja de forma transparente para el usuario: no requiere configuración manual.

El comportamiento de IA en el ecosistema se documenta en `01-VISION-DEL-PRODUCTO.md` §13 y en `08-MODULO-IA.md` en su ámbito correspondiente.

---

# 15. Base de Datos

**Pendiente de documentar.**

La Base de Datos será definida únicamente en el documento oficial correspondiente.

---

# 16. API

Registro oficial: `02-darivo-pro-admin/08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` v2.1.

| API | Uso en Cierre |
|-----|---------------|
| **OpenAI API** ✅ | Análisis automático de fotografías y documentos en registro de gastos y expediente mensual (`§7`, `§14`) |
| **Supabase** ✅ | Persistencia de gastos y documentos |

SUNAT y demás integraciones no aprobadas — §5.5 del registro oficial.

---

# 17. Roles, Planes y Permisos

Este documento no define permisos.

Los permisos oficiales se encuentran exclusivamente en `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md`.

Los planes, límites y almacenamiento pertenecen exclusivamente a `04-PANEL-ADMIN-SUSCRIPCIONES.md`.

---

# 18. Reglas de sincronización

Este documento deberá mantenerse sincronizado con:

* `01-VISION-DEL-PRODUCTO.md`
* `16-SISTEMA-DE-DISEÑO-FABLE5.md`
* `22 – METODOLOGÍA OFICIAL DE IA – DARIVO PRO.md`
* `04-PANEL-ADMIN-SUSCRIPCIONES.md`
* `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md`

Nunca duplicará información perteneciente a dichos documentos.

---

# 19. Estado del documento

**Versión:** 2.0

**Estado:** Diseño oficial aprobado.

**Cambio principal (v2.0):** incorporación del diseño oficial completo conforme a la imagen aprobada — pestañas Gastos y Expediente Mensual, flujo de registro con IA, expediente mensual, exportación y navegación oficial sincronizada.

Documento funcional y de diseño oficial del **Módulo Cierre** para Darivo Pro Móvil.

---

# 20. Protección documental

Este documento forma parte de la documentación oficial de Darivo Pro.

**Solo el propietario del proyecto está autorizado a crear, modificar, reorganizar o eliminar este documento.**

Toda modificación deberá respetar la **Metodología Oficial de IA – Darivo Pro** (`22 – METODOLOGÍA OFICIAL DE IA – DARIVO PRO.md`).

No podrá modificarse contradiciendo:

* `01-VISION-DEL-PRODUCTO.md`
* `16-SISTEMA-DE-DISEÑO-FABLE5.md`
* `04-PANEL-ADMIN-SUSCRIPCIONES.md`
* `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md`

Si una IA detecta un posible error, contradicción o información incompleta, deberá:

* Detener el trabajo.
* Informar al propietario.
* Esperar instrucciones.

Queda prohibido modificar este documento por iniciativa propia.

No asumir, completar o inventar información bajo ningún concepto.

**Fin del documento.**
