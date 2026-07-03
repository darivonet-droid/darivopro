# 23 – METODOLOGÍA OFICIAL – UNA TAREA, DOS AGENTES – DARIVO PRO

**Versión:** 2.9

**Estado:** Documento Oficial — **continuidad en tarea autorizada · prompt oficial · restauración al cierre**

**Referencia:** `22 – METODOLOGÍA OFICIAL DE IA – DARIVO PRO.md` · `01-VISION-DEL-PRODUCTO.md` §12 y §14 · `24 – PROMPT OFICIAL – PRODUCCIÓN E IMPLEMENTACIÓN – DARIVO PRO.md` v1.8 · `25 – CATÁLOGO OFICIAL DE TAREAS – IMPLEMENTACIÓN DARIVO PRO.md` v1.9

**Sesiones Composer 2.5:** `23-A` Sesión Producción · `23-B` Sesión Auditoría

> **Nombre histórico del archivo:** incluye «trabajo en paralelo» — la metodología vigente es **una sola tarea activa** con **dos agentes** en roles distintos (producción → auditoría). No implica dos tareas simultáneas.

---

# Objetivo

Trabajar de forma **ordenada, lenta y segura**.

La **calidad** tiene prioridad absoluta sobre la **velocidad**.

Solo existirá **una tarea activa** y **una subtarea activa** (Tareas 01 y 02) en cada momento.

Los dos agentes trabajarán sobre **esa misma subtarea**, pero con responsabilidades diferentes.

La Landing Page queda excluida de esta metodología.

La **documentación oficial** es la fuente única de verdad. Composer 2.5 ejecuta **§Prompt oficial — Completar la tarea autorizada** (`24` v1.8) con **continuidad automática** dentro de la tarea autorizada — ver §Regla oficial — Continuidad dentro de la tarea autorizada.

**La autorización del propietario siempre tiene prioridad** sobre la ejecución automática.

---

# Regla oficial — Alcance de la autorización del propietario

Conforme `24` §Regla oficial — Alcance de la autorización del propietario:

* Trabajar **únicamente** sobre la **tarea autorizada** y sus **subtareas**.
* Ejecutar **automáticamente** todas las fases (1–13), correcciones, auditorías y sincronización **dentro de esa tarea**.
* Al **cerrar la tarea autorizada**: marcar completada · actualizar catálogo · informe final · **restaurar metodología oficial** · **detener** — esperar **nueva autorización**.
* **No iniciar** la siguiente tarea del catálogo sin autorización expresa del propietario.
* En conflicto: **prevalecen las instrucciones del propietario**.
* **Continuidad:** no solicitar confirmaciones entre fases · subtareas · correcciones · reauditorías · informes · sincronizaciones — continuar hasta completar la tarea.

---

# Regla oficial — Continuidad dentro de la tarea autorizada

Conforme `24` §Regla oficial — Continuidad dentro de la tarea autorizada:

* Continuar **automáticamente** hasta finalizar la tarea autorizada.
* **No solicitar confirmaciones** intermedias.
* **Detenerse solo** ante §Detención obligatoria.
* Al completar → §Regla oficial — Finalización de la tarea y restauración de la metodología.

---

Conforme `24` §Regla oficial — Finalización de la tarea y restauración de la metodología:

Cuando la tarea autorizada y **todas** sus subtareas estén implementadas, auditadas, corregidas, validadas, sincronizadas y cerradas:

1. Actualizar catálogo (`25`) y estado de la tarea.
2. Generar **informe final de la tarea**.
3. **Restaurar la metodología oficial vigente** — finalizar autorización extraordinaria; eliminar modo automático para tareas posteriores.
4. **Detener** — el propietario asigna la siguiente tarea con nueva autorización.

**Regla obligatoria:** no continuar con la siguiente tarea del catálogo sin **nueva autorización expresa** del propietario.

# Modo de ejecución automática (alcance limitado)

Trabajar **automáticamente** hasta completar la **tarea autorizada** — no el catálogo completo sin autorización.

**No existe límite de tiempo.** **Calidad > velocidad.**

---

# Implementación lenta, controlada y auditada

Cada subtarea deberá quedar: **implementada · auditada · corregida · validada · sincronizada · cerrada**.

No podrá iniciarse ninguna nueva subtarea hasta cerrar completamente la anterior conforme §Regla de cierre.

---

# Flujo obligatorio — 13 fases

| Fase | Acción | Responsable |
|------|--------|-------------|
| 1 | Leer documentación oficial (no asumir) | Sesión Producción |
| 2 | Analizar código existente (comprender antes de modificar) | Sesión Producción |
| 3 | Comparar documentación y código (evidencia real) | Sesión Producción |
| 4 | Detectar y clasificar incidencias | Sesión Producción |
| 5 | Planificar correcciones (**no implementar**) | Sesión Producción |
| 6 | Implementar correcciones aprobadas (solo alcance subtarea) | Sesión Producción |
| 7 | Auditoría completa | Sesión Auditoría |
| 8 | Corregir incidencias aprobadas (sin mejoras extra) | Sesión Producción |
| 9 | Nueva auditoría — **repetir 8–9** hasta validación completa | Sesión Auditoría |
| 10 | Cierre oficial (autorización expresa) | Sesión Auditoría |
| 11 | Actualizar catálogo, índices, referencias, historial, estado | Sesión Producción |
| 12 | Informe final de subtarea (trabajo · docs · archivos · auditorías · incidencias · riesgos · estado) | Sesión Producción |
| 13 | Activar siguiente subtarea **de la tarea autorizada** — o cerrar tarea → informe final · **restaurar metodología oficial** · **detener** si era la última | Orquestación automática |

---

# Filosofía del proyecto

Máxima precisión · pensar antes de modificar · **verificar antes de cerrar** · nunca acelerar · nunca omitir auditorías · nunca asumir · nunca inventar · nunca modificar lógica de negocio · nunca modificar arquitectura funcional · nunca modificar decisiones del propietario.

---

# Detención obligatoria

Composer 2.5 **solo** podrá detener el trabajo cuando exista **alguno** de estos casos:

1. **Contradicción** entre documentos oficiales.
2. **Decisión exclusiva** del propietario.
3. Cambio que afecte la **lógica de negocio**.
4. Cambio que afecte la **arquitectura oficial**.
5. Cambio que afecte la **base de datos oficial**.

Fuera de estos casos, **no deberá detenerse**. En cualquier otro caso: **continuar automáticamente dentro de la tarea autorizada** — sin confirmaciones intermedias.

---

# Regla de cierre

Una subtarea solo podrá marcarse como **finalizada** cuando:

* Toda la documentación esté sincronizada.
* El código esté alineado con la documentación oficial.
* No existan contradicciones.
* Todas las incidencias **críticas** y **altas** estén resueltas.
* El Agente 2 autorice expresamente el cierre.

---

# Regla más importante

No importa cuánto tiempo tarde. **Nunca** acelerar el proceso. **Nunca** omitir auditorías. **Nunca** asumir información. **Nunca** inventar.

Si una subtarea requiere varias revisiones, deberán realizarse **todas** las necesarias.

---

# Alcance

Esta metodología se aplica a:

* Darivo Pro Admin.
* Darivo Pro Móvil.
* Darivo Pro Empresa.
* Panel Partner.
* Documentos maestros.
* Arquitectura.
* Base de datos.
* Implementación o actualización **aprobada** por el propietario (documentación y, cuando corresponda, código).

---

# AGENTE 1 — PRODUCCIÓN · Composer 2.5 Sesión Producción

## Responsabilidad exclusiva

* Analizar la subtarea asignada (Fases 1–5).
* Revisar documentación oficial y código existente.
* Realizar la **implementación o actualización aprobada** (Fase 6).
* Entregar al Agente 2 para **Fase 7**.
* Corregir incidencias aprobadas tras auditoría (Fase 8).
* Sincronizar catálogo, índices y referencias (Fase 11).
* Entregar informe final de subtarea (Fase 12).
* Tras **Fase 13** — siguiente subtarea de la **misma tarea autorizada**, o **cierre de tarea** → informe final · restaurar metodología · **detener**.

## Prohibiciones

* **No** realiza auditorías.
* **No** cambia la lógica de negocio.
* **No** inventa funcionalidades, módulos, botones, navegación, flujos, tablas, APIs ni arquitectura.
* **No** modifica la base de datos funcional sin documentación oficial previa.

Si falta documentación oficial, indicarlo como **Pendiente de documentación oficial**.

**Prompt operativo:** `23-A – PROMPT OFICIAL – AGENTE 1 – PRODUCCIÓN – DARIVO PRO.md`

---

# AGENTE 2 — AUDITORÍA · Composer 2.5 Sesión Auditoría

## Responsabilidad exclusiva

Cuando el Agente 1 complete la Fase 6:

* Ejecutar **auditoría completa** (Fase 7).
* Clasificar incidencias (crítica · alta · media · baja · informativa).
* Validar correcciones del Agente 1 (Fase 9).
* **Autorizar expresamente** el cierre (Fase 10) solo conforme §Regla de cierre.
* **Generar informe de auditoría.**

## Prohibiciones

* **No** implementa funcionalidades.
* **No** modifica la lógica de negocio.
* **No** corrige directamente — devuelve incidencias al Agente 1 (Fase 8).
* **No** sustituye al Agente 1.

Las incidencias documentales e de implementación se **devuelven al Agente 1** con lista exacta — ver `23-B`.

**Prompt operativo:** `23-B – PROMPT OFICIAL – AGENTE 2 – AUDITORÍA DEL ECOSISTEMA – DARIVO PRO.md`

---

# Flujo de trabajo (resumen)

Aplicar las **13 fases** de §Flujo obligatorio a cada subtarea (Tareas 01 y 02) o tarea principal (03–10).

**Nunca habrá dos tareas activas al mismo tiempo.**

**Nunca habrá dos subtareas activas al mismo tiempo** dentro de la tarea activa.

---

# Regla obligatoria

No comenzar una nueva **subtarea** hasta cumplir **§Regla de cierre** completa.

No comenzar una nueva **tarea principal** hasta que la anterior cumpla **§Regla de cierre** — incluyendo **todas** sus subtareas, cuando la tarea esté subdividida (Tareas 01 y 02).

---

# Condiciones de bloqueo

Ambos agentes deberán detener el trabajo únicamente cuando:

* Exista una contradicción documental real entre documentos oficiales.
* Falte una decisión del propietario.
* Sea necesario modificar la lógica de negocio.
* Sea necesario modificar la arquitectura oficial.
* Sea necesario modificar la base de datos funcional.
* No exista documentación oficial suficiente.

En cualquier otro caso, continuar con el flujo de la tarea activa.

---

# Objetivo final

Implementar Darivo Pro respetando **íntegramente** la documentación oficial.

**Finalización del proyecto:** conforme `24` §OBJETIVO FINAL — finalización del proyecto y `25` §Finalización del proyecto.

Es preferible **tardar más** y obtener un producto sólido que avanzar rápido con deuda técnica o documental.

---

# Estado del documento

**Versión:** 2.9

**Estado:** Documento Oficial — continuidad en tarea autorizada (03/07/2026).

Sincronizado con `24` v1.8 · `25` v1.9.

**Prompts operativos oficiales:**

* `25 – CATÁLOGO OFICIAL DE TAREAS – IMPLEMENTACIÓN DARIVO PRO.md` v1.9
* `24 – PROMPT OFICIAL – PRODUCCIÓN E IMPLEMENTACIÓN – DARIVO PRO.md` v1.8 — **§Prompt oficial — Completar la tarea autorizada**
* `23-A – PROMPT OFICIAL – AGENTE 1 – PRODUCCIÓN – DARIVO PRO.md` v2.9
* `23-B – PROMPT OFICIAL – AGENTE 2 – AUDITORÍA DEL ECOSISTEMA – DARIVO PRO.md` v2.9

---

## Protección del documento

Este documento MD forma parte de la documentación oficial de Darivo Pro.

**Solo el propietario del proyecto está autorizado a crear, modificar, reorganizar o eliminar este documento.**

Ninguna IA, herramienta o desarrollador podrá modificar este MD sin la autorización expresa del propietario.

Si una IA detecta un posible error, contradicción o información incompleta, deberá:

* Detener el trabajo.
* Informar al propietario.
* Esperar instrucciones.

Queda prohibido modificar este documento por iniciativa propia.

**Fin del documento.**
