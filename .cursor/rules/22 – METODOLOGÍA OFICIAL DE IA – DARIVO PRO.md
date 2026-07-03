# 22 – METODOLOGÍA OFICIAL DE IA – DARIVO PRO

**Versión:** 1.2

**Estado:** Documento Oficial

**Referencia:** `01-VISION-DEL-PRODUCTO.md` §12 (Metodología de sincronización documental) · `24 – PROMPT OFICIAL – PRODUCCIÓN E IMPLEMENTACIÓN – DARIVO PRO.md` v1.0 · `23 – METODOLOGÍA OFICIAL – UNA TAREA, DOS AGENTES – DARIVO PRO.md` v2.1

---

# Objetivo

Este documento define la metodología oficial que deberán seguir todas las Inteligencias Artificiales que participen en el desarrollo de Darivo Pro.

Aplica a Cursor, ChatGPT, Claude y cualquier otra IA utilizada durante el proyecto.

Esta metodología es obligatoria y tiene prioridad sobre cualquier sugerencia automática de la IA.

Está sincronizada con la metodología de sincronización documental definida en `01-VISION-DEL-PRODUCTO.md` §12.

---

# Principios obligatorios

## 1. Documentación oficial

La única fuente oficial de verdad es la documentación de Darivo Pro.

Nunca inventar:

* funcionalidades
* módulos
* procesos
* tablas
* relaciones
* reglas
* arquitectura
* flujos

Si algo no está documentado, indicarlo claramente.

Nunca asumir información.

---

## 2. Jerarquía documental

La **Visión del Producto** (`01-VISION-DEL-PRODUCTO.md`) es la referencia principal del ecosistema Darivo Pro.

Toda modificación deberá respetar obligatoriamente el siguiente orden:

1. Visión del Producto
2. Arquitectura Maestra
3. Documentos MD
4. Código

Nunca modificar un nivel inferior contradiciendo uno superior.

Los principios generales del ecosistema existen únicamente en la Visión del Producto. Los demás documentos los referencian, no los sustituyen.

---

## 3. Sincronización documental

Fuente oficial: `01-VISION-DEL-PRODUCTO.md` §12.

### Principios

* La Visión del Producto es la referencia principal del ecosistema Darivo Pro.
* Toda modificación funcional o de negocio que afecte a principios generales deberá incorporarse **primero** a la Visión del Producto.
* Una vez aprobada la Visión del Producto, únicamente se sincronizarán los **documentos oficiales afectados** por ese cambio.
* Quedan **prohibidas** las auditorías o revisiones completas de toda la documentación cuando el cambio afecte únicamente a documentos concretos.
* El objetivo de esta metodología es reducir duplicidades, acelerar el mantenimiento documental y mantener una única fuente oficial para los principios generales del ecosistema.

### Requisitos del prompt

Los prompts deberán indicar expresamente:

* el documento que debe actualizarse;
* los apartados afectados;
* la referencia correspondiente en la Visión del Producto.

### Alcance de la IA

La IA **no deberá** revisar ni modificar documentos fuera del alcance autorizado por el propietario.

Antes de modificar cualquier documento **autorizado**:

* leer completamente el documento;
* comprender su objetivo;
* identificar relaciones con otros documentos dentro del alcance autorizado;
* indicar qué documentos afectados requerirán sincronización posterior, sin revisarlos ni modificarlos si no están autorizados.

---

## 4. No duplicar información

Nunca crear información repetida.

Si una sección ya existe:

* actualizar
* reorganizar
* ampliar

Nunca duplicarla.

---

## 5. Una única fuente de verdad

Cada información debe existir únicamente una vez.

Los demás documentos únicamente deberán **referenciar** esa información.

Los principios generales del ecosistema tienen su única fuente en la Visión del Producto.

---

## 6. ADN Darivo Pro

Todas las decisiones deberán respetar:

* simplicidad
* rapidez
* experiencia móvil primero
* mínimo número de clics
* mínima configuración
* IA invisible para el usuario

---

## 7. No realizar el mismo trabajo dos veces

Antes de crear contenido nuevo:

* comprobar si ya existe
* reutilizar documentación oficial
* evitar duplicaciones
* evitar contradicciones

---

## 8. Reglas para la IA

La IA nunca inventará información.

La IA únicamente propondrá mejoras compatibles con la documentación oficial.

Si existe incertidumbre:

detener la propuesta.

---

## 9. Flujo oficial de trabajo

Siempre trabajar por fases.

Nunca saltar fases.

### Fase 1 — Análisis

### Fase 2 — Documentación

### Fase 3 — Implementación

### Fase 4 — Auditoría

La auditoría se limita al **alcance autorizado** por el propietario. No constituye una revisión completa del ecosistema salvo autorización expresa.

La metodología completa se define en la sección **Metodología de las auditorías documentales** (final de este documento).

---

## 10. Auditoría obligatoria

La auditoría se realizará **únicamente** dentro del alcance autorizado por el propietario.

Antes de cualquier modificación autorizada, la IA podrá detectar incidencias **únicamente** en el documento y apartados afectados del alcance autorizado.

Queda **prohibido** realizar auditorías o revisiones completas de toda la documentación cuando el cambio afecte únicamente a documentos concretos (`01-VISION-DEL-PRODUCTO.md` §12).

Toda incidencia deberá clasificarse conforme a la **Metodología de las auditorías documentales** (sección final de este documento).

---

## 11. Actualización documental

### Cambios que afectan principios generales

Si una modificación funcional o de negocio afecta a principios generales del ecosistema:

Actualizar primero:

* Visión del Producto

Esperar la aprobación del propietario.

Una vez aprobada la Visión del Producto, sincronizar **únicamente** los documentos oficiales afectados por ese cambio:

* Arquitectura Maestra (si corresponde)
* MD afectados
* Código (finalmente)

### Cambios acotados a documentos concretos

Si el cambio afecta únicamente a documentos concretos y no modifica principios generales del ecosistema:

* actualizar **únicamente** el documento y los apartados autorizados en el prompt;
* no realizar auditorías ni revisiones del resto de la documentación.

Nunca modificar el código antes de actualizar la documentación oficial.

---

## 12. Filosofía Darivo Pro

El software debe adaptarse al usuario.

Nunca obligar al usuario a adaptarse al software.

Cada decisión debe reducir:

* tiempo
* clics
* complejidad

Este principio tiene prioridad sobre cualquier decisión técnica.

---

## 13. Protección documental

Ninguna IA podrá eliminar documentación oficial sin autorización.

Toda modificación deberá mantener la coherencia del ecosistema.

---

## 14. Gestión de conflictos

Si existen incidencias entre documentos oficiales, la IA deberá clasificarlas conforme a la **Metodología de las auditorías documentales** antes de actuar.

Solo cuando exista una **contradicción documental real** (según la definición oficial de este documento), la IA deberá informar del conflicto y detener la modificación hasta recibir una decisión del propietario.

Las referencias desactualizadas, nomenclaturas distintas, desincronizaciones documentales y duplicidades **no** se tratarán como contradicciones documentales reales.

La IA no decidirá cuál documento es correcto.

---

## 15. Regla de incertidumbre

Si falta información oficial:

Nunca inventarla.

Indicar exactamente qué información falta y esperar la decisión correspondiente.

---

## 16. Resultado obligatorio

Al finalizar cualquier trabajo, la IA deberá indicar:

* documentos analizados (dentro del alcance autorizado)
* documentos modificados
* documentos afectados que requieran sincronización posterior
* documentos pendientes de sincronización
* posibles inconsistencias detectadas en el alcance autorizado
* riesgos identificados
* resumen de cambios realizados

La IA no deberá haber revisado ni modificado documentos fuera del alcance autorizado.

---

## 17. Objetivo final

Mantener un ecosistema único, sincronizado, coherente y escalable.

Toda decisión deberá preservar la calidad de la documentación oficial y evitar retrabajos, duplicidades o inconsistencias.

---

# Metodología de las auditorías documentales

## Principios generales

Toda auditoría documental deberá seguir una metodología estricta.

Su finalidad es conocer el estado real de la documentación oficial.

No tiene como finalidad rediseñar el producto ni tomar decisiones funcionales.

### Tipos de auditoría

Cada auditoría tiene un único objetivo. No podrá ampliar su alcance por iniciativa propia.

| Tipo | Verifica exclusivamente |
| ---- | ----------------------- |
| **Auditoría de sincronización documental** | Documentos sincronizados y no sincronizados; referencias incorrectas; nomenclaturas distintas; duplicidades; contradicciones documentales reales. No propone soluciones. No modifica documentos. No interpreta el producto. |
| **Auditoría funcional** | Que la lógica funcional permanece alineada entre la Visión del Producto y los MD funcionales. No revisa diseño, arquitectura, código ni Base de Datos. |
| **Auditoría técnica** | Arquitectura Maestra, código y Base de Datos. No revisa reglas de negocio. No modifica la Visión del Producto. |

### Regla para evitar bucles

Una diferencia documental no constituye automáticamente una contradicción.

La IA no podrá convertir automáticamente una desincronización documental en una contradicción funcional.

Si el flujo funcional aprobado sigue siendo el mismo, deberá clasificar la incidencia como sincronización pendiente.

---

## 1. Alcance

Antes de iniciar una auditoría, la IA deberá identificar exactamente qué documentos forman parte del alcance autorizado por el propietario.

No podrá ampliar el alcance por iniciativa propia.

---

## 2. Clasificación de incidencias

Toda incidencia deberá clasificarse en una única categoría:

* Referencia desactualizada.
* Nomenclatura distinta.
* Desincronización documental.
* Duplicidad.
* Contradicción documental real.

No podrán utilizarse varias categorías para una misma incidencia.

No podrá utilizarse el término «contradicción» mientras la diferencia pueda clasificarse en cualquiera de las cuatro primeras categorías.

---

## 3. Definición de contradicción documental

Solo existe una contradicción documental real cuando dos documentos oficiales del mismo ámbito funcional establecen reglas incompatibles sobre el mismo comportamiento del sistema.

No constituyen contradicción:

* referencias antiguas;
* cambios de versión;
* nomenclaturas distintas;
* rutas de archivos;
* numeración de apartados;
* documentación pendiente de sincronización.

---

## 4. Ámbitos funcionales

Solo los documentos pertenecientes al mismo ámbito funcional podrán generar una contradicción documental real.

Las diferencias entre documentos de distinto nivel jerárquico o distinta responsabilidad deberán clasificarse como:

* desincronización documental;
* duplicidad;
* referencia desactualizada;
* nomenclatura distinta.

Nunca como contradicción funcional.

---

## 5. Neutralidad de la auditoría

Durante una auditoría la IA no podrá:

* proponer soluciones;
* decidir qué documento debe modificarse;
* crear funcionalidades;
* eliminar documentación;
* reinterpretar decisiones del propietario;
* elegir entre varias alternativas.

La auditoría únicamente informa del estado de la documentación.

---

## 6. Decisión del propietario

Corresponde exclusivamente al propietario del proyecto decidir:

* qué documentos modificar;
* qué información mantener;
* qué información eliminar;
* qué solución adoptar.

La IA no tomará decisiones en nombre del propietario.

---

## 7. Resultado esperado

Toda auditoría deberá finalizar indicando únicamente:

* documentos sincronizados;
* documentos no sincronizados;
* referencias desactualizadas;
* nomenclaturas distintas;
* desincronizaciones documentales;
* duplicidades;
* contradicciones documentales reales (solo cuando cumplan la definición oficial).

No deberá incluir propuestas de diseño, arquitectura o funcionalidad, salvo que el propietario las solicite expresamente en una fase posterior.

---

# Estado del documento

**Versión:** 1.2

**Estado:** Documento Oficial.

Metodología obligatoria para cualquier IA que participe en el desarrollo de Darivo Pro.

Sincronizado con `01-VISION-DEL-PRODUCTO.md` v2.6 §12.

**Documento relacionado:** `25 – CATÁLOGO OFICIAL DE TAREAS – IMPLEMENTACIÓN DARIVO PRO.md` v1.0 · `24 – PROMPT OFICIAL – PRODUCCIÓN E IMPLEMENTACIÓN – DARIVO PRO.md` v1.0 · `23 – METODOLOGÍA OFICIAL – UNA TAREA, DOS AGENTES – DARIVO PRO.md` v2.1 · `23-A` y `23-B`.

**Cambio principal (v1.2):** incorporación de la Metodología de las auditorías documentales.

---

## Protección del documento

Este documento MD forma parte de la documentación oficial de Darivo Pro.

**Solo el propietario del proyecto está autorizado a crear, modificar, reorganizar o eliminar este documento.**

Ninguna IA, herramienta o desarrollador podrá modificar este MD sin la autorización expresa del propietario.

Los documentos MD constituyen la única fuente oficial de documentación del proyecto.

Si una IA detecta un posible error, contradicción o información incompleta, deberá:

* Detener el trabajo.
* Informar al propietario.
* Esperar instrucciones.

Queda prohibido modificar este documento por iniciativa propia.

No asumir, completar o inventar información bajo ningún concepto.

**Fin del documento.**
