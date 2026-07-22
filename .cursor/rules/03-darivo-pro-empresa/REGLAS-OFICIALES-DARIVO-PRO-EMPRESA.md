# REGLAS OFICIALES DE TRABAJO — DARIVO PRO EMPRESA

**Versión:** 2.6

**Cambio principal (v2.6 — 22/07/2026, pedido explícito del propietario):** actualizadas las referencias al ítem 7 de la tabla de producción (§13, §15) — ya no es la pantalla "Más", sino "Navegación directa (ex-Más)": sus 7 funcionalidades tienen entrada directa en el sidebar (`01-VISION-DEL-PRODUCTO.md` §16 v2.19). Sin cambios de metodología.

**Última actualización:** 22/07/2026

**Fase activa:** §15 — Producción automática Darivo Pro Empresa

**Estado:** Documento oficial — obligatorio para todo trabajo en Darivo Pro Empresa

**Reinicio oficial:** 02/07/2026 — producción documental reiniciada desde cero (§0).

**Documentos relacionados:** `01-VISION-DEL-PRODUCTO.md` · `16-SISTEMA-DE-DISEÑO-EMPRESA.md` · `INDICE-OFICIAL-DARIVO-PRO-EMPRESA.md` · `01-darivo-pro-movil/` · `02-darivo-pro-admin/`

---

# 0. REINICIAR DARIVO PRO EMPRESA

Cuando el propietario ordene **reiniciar** Darivo Pro Empresa:

* Descartar el trabajo documental previo sobre módulos Empresa (MD completos, imágenes, marcas de producción).
* **No reutilizar conclusiones anteriores** si no están verificadas durante el nuevo análisis de cada módulo.
* Conservar este documento de reglas, el índice y el Sistema de Diseño Empresa como marco — pero **revalidar** su contenido módulo a módulo.
* Reiniciar el orden de producción desde el **primer módulo pendiente** del índice.

### Objetivo del reinicio

Construir Darivo Pro Empresa correctamente siguiendo la documentación oficial del proyecto.

Darivo Pro Empresa debe ser **la versión de escritorio de Darivo Pro Móvil**, utilizando el lenguaje visual y los componentes de escritorio del Panel Administrador.

**No** convertir Empresa en una copia del Panel Administrador (lógica).

**No** convertir Empresa en una copia visual de Darivo Pro Móvil (diseño).

---

# 1. Objetivo

Darivo Pro Empresa es la versión de escritorio de Darivo Pro destinada a empresas.

Su desarrollo documental debe realizarse utilizando exclusivamente la documentación oficial del proyecto.

* No crear un producto diferente.
* No inventar funcionalidades.
* No modificar el flujo funcional aprobado.

---

# 2. Filosofía

Darivo Pro Empresa debe conservar exactamente el mismo ADN que Darivo Pro Móvil.

Debe ser:

* Rápido.
* Sencillo.
* Intuitivo.
* Profesional.
* Escalable.
* Preparado para empresas de cualquier tamaño.
* Preparado para crecer a múltiples países.

La diferencia principal será únicamente la experiencia de uso adaptada al escritorio.

---

# 3. FLUJO OFICIAL DE TRABAJO

Todo módulo de Darivo Pro Empresa se construye en **dos fases**. No saltar fases. No modificar documentos en FASE 1.

## FASE 1 — ANÁLISIS

Antes de implementar cualquier módulo, el agente deberá analizar la documentación oficial relacionada.

### Leer obligatoriamente

1. **Visión del Producto** — fuente principal (`01-VISION-DEL-PRODUCTO.md`).
2. **Darivo Pro Móvil** — lógica de negocio y flujo del usuario (`01-darivo-pro-movil/`).
3. **Panel Administrador** — diseño y organización visual de escritorio (`02-darivo-pro-admin/`).
4. **Sistema de Diseño de Darivo Pro Empresa** — `16-SISTEMA-DE-DISEÑO-EMPRESA.md`.
5. **Imágenes oficiales** disponibles (Móvil y Empresa).
6. **Documentos MD relacionados** del módulo.
7. **Este documento** — Reglas Oficiales.

**No modificar ningún documento durante esta fase.**

---

### Resumen del análisis (obligatorio)

Una vez finalizada la lectura, el agente deberá presentar un **resumen ejecutivo** antes de comenzar la implementación.

El resumen deberá indicar:

* Objetivo del módulo.
* Funcionalidades.
* Flujo de negocio.
* Cómo funciona en Darivo Pro Móvil.
* Cómo se adaptará al escritorio.
* Qué elementos visuales reutilizará del Panel Administrador.
* Qué documentos se modificarán en la FASE 2.
* Si existe o no alguna contradicción documental.

**No implementar nada durante esta fase.**

Si el resumen es correcto y no existen contradicciones que impidan continuar, el agente pasará automáticamente a la **Fase 2 — Implementación**.

Si detecta una contradicción entre documentos oficiales o falta información esencial, deberá detenerse, informar al propietario y esperar instrucciones antes de continuar.

---

## FASE 2 — IMPLEMENTACIÓN

**Solo si el análisis confirma que no existen contradicciones:**

1. Revisar las **tres fuentes oficiales** del módulo (§7.2).
2. Definir el **diseño oficial** del módulo (estructura, paneles, botones, tablas, navegación) — §7.
3. Documentar ese diseño en el **MD** del módulo y en `16-SISTEMA-DE-DISEÑO-EMPRESA.md` cuando corresponda.
4. **Esperar aprobación del propietario** del diseño documentado en el MD.
5. Crear la **imagen oficial** basada en el MD aprobado — solo tras el paso 4.
6. Validar imagen ↔ MD (§9.2).
7. Sincronizar únicamente los documentos afectados.
8. Marcar **Producción completada** en el índice.
9. Continuar **automáticamente** con el siguiente módulo (§13).

> **Regla §7.1 — Imagen no bloquea el diseño:** En Darivo Pro Empresa, el diseño oficial del módulo se define primero en el MD. La imagen oficial se crea **después** de que el diseño haya sido aprobado por el propietario. **La ausencia de una imagen no bloquea** la documentación del diseño del módulo.

### Regla fundamental

* **La lógica de negocio y el flujo funcional se obtienen de Darivo Pro Móvil.**
* **El diseño de escritorio se obtiene del Panel Administrador.**
* **La Visión del Producto prevalece siempre** sobre cualquier otro documento.

No convertir Darivo Pro Empresa en una copia del Panel Administrador.

No convertir Darivo Pro Empresa en una copia visual de Darivo Pro Móvil.

Si detecta una **contradicción documental** o **falta información oficial**, detendrá **únicamente ese módulo** e informará al propietario antes de continuar.

---

# 4. REGLA OFICIAL PARA DARIVO PRO EMPRESA

Darivo Pro Empresa se construirá utilizando **tres fuentes oficiales**.

| Fuente | Responsabilidad |
|--------|-----------------|
| **Visión del Producto** | Qué debe hacer el producto |
| **Darivo Pro Móvil** | Cómo funciona el negocio |
| **Panel Administrador** | Cómo se presenta visualmente en escritorio |

## 4.1 Visión del Producto

Documento: `01-VISION-DEL-PRODUCTO.md`

Define:

* Objetivos.
* Funcionalidades.
* Reglas del negocio.
* Alcance del módulo.

**Es la máxima autoridad.**

Si existe una contradicción entre fuentes, prevalece la Visión del Producto.

## 4.2 Darivo Pro Móvil

Carpeta: `01-darivo-pro-movil/`

Es la **referencia funcional**.

De aquí se obtiene:

* Flujo del usuario.
* Lógica de negocio.
* Comportamiento de los módulos.
* Experiencia funcional.
* Relaciones entre módulos.

Darivo Pro Empresa debe comportarse **igual** que Darivo Pro Móvil.

**No inventar nuevos flujos.**

**No copiar el diseño móvil** — solo la lógica y el comportamiento.

Iconografía y marca compartida: `16-SISTEMA-DE-DISEÑO-FABLE5.md` §5 (objeto `I`) y §3 (tokens `T`).

## 4.3 Panel Administrador

Carpeta: `02-darivo-pro-admin/`

Es la **referencia visual de escritorio**.

De aquí se obtiene:

* Diseño.
* Sidebar.
* Header.
* Tablas.
* Formularios.
* Paneles laterales.
* Distribución de la información.
* Componentes visuales.

Referencia principal de layout: `00-PANEL-ADMIN-DASHBOARD.md` §4–§5.

**No copiar la lógica de negocio del Panel Administrador.**

Solo reutilizar su **diseño y organización visual**.

## 4.4 Sistema de Diseño Empresa

Documento: `16-SISTEMA-DE-DISEÑO-EMPRESA.md`

Concreta para Darivo Pro Empresa la aplicación de los patrones visuales del Panel Administrador (§4.3): sidebar de módulos, header, tablas, paneles y componentes oficiales del producto Empresa.

No define lógica de negocio — esa permanece en Móvil (§4.2).

## 4.5 Regla de decisión

Antes de implementar cualquier módulo, el agente deberá responder:

* **¿Cómo funciona este módulo en Darivo Pro Móvil?** → Esa será la **lógica del negocio**.
* **¿Cómo se representa este tipo de información en el Panel Administrador?** → Ese será el **diseño de escritorio**.
* **¿Coincide con la Visión del Producto?** → Si la respuesta es **sí**, implementar. Si **no**, detenerse e informar al propietario.

Esta regla separa completamente las responsabilidades y evita mezclar la lógica del Admin con la de Empresa, manteniendo una experiencia coherente en todo el ecosistema Darivo Pro.

---

# 5. Adaptación visual (escritorio)

Darivo Pro Empresa no es una copia visual del móvil.

El agente adapta la **presentación** al escritorio (§4.3) manteniendo la **lógica** de Móvil (§4.2):

| Presentación móvil | Presentación escritorio (Admin) |
|--------------------|----------------------------------|
| Pantallas individuales | Vistas con tablas y paneles |
| Navegación inferior | Sidebar |
| Formularios simplificados | Formularios amplios |
| Una columna | Varias columnas |
| Información secuencial | Información simultánea |

El flujo funcional y la lógica de negocio permanecen **exactamente iguales**.

---

# 6. Flujo funcional

Conforme a la **§4.5 Regla de decisión**: la lógica del módulo se obtiene exclusivamente de Darivo Pro Móvil.

**Nunca crear un flujo diferente.**

---

# 7. Diseño (orden dentro de FASE 2)

Para cada módulo deberá trabajar, **en este orden**:

1. **Diseño oficial** — estructura, paneles, botones, tablas y navegación (en `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §6.x y/o sección de diseño del MD del módulo).
2. **Documento MD** — completar o actualizar `NN-MODULO-[NOMBRE]-EMPRESA.md` con el diseño definido.
3. **Aprobación del propietario** — el diseño documentado en el MD queda pendiente de aprobación explícita antes de crear la imagen.
4. **Imagen oficial** — `[NN] – MÓDULO [NOMBRE] – DARIVO PRO EMPRESA.png`, creada **únicamente** a partir del MD aprobado.
5. **Validación** — comprobar que la imagen coincide con el MD (§9).

## 7.1 Regla — Imagen posterior al diseño aprobado

> En Darivo Pro Empresa, el diseño oficial del módulo se define primero en el MD. La imagen oficial se crea después de que el diseño haya sido aprobado por el propietario. **La ausencia de una imagen no bloquea la documentación del diseño del módulo.**

La imagen **no es el punto de partida** — es el **resultado visual** del diseño ya aprobado en documentación escrita.

## 7.2 Regla — Tres fuentes antes de documentar el diseño

Antes de documentar el diseño de cada módulo, el agente deberá revisar **obligatoriamente** estas tres fuentes oficiales:

1. El **MD equivalente de Darivo Pro Móvil** — lógica de negocio y comportamiento funcional.
2. El **MD equivalente de Darivo Pro Admin** — referencia de diseño de escritorio **cuando exista** para ese tipo de pantalla.
3. El **Sistema de Diseño de Darivo Pro Empresa** (`16-SISTEMA-DE-DISEÑO-EMPRESA.md`) — marco visual y patrones del producto Empresa.

Con esas tres referencias elaborará el diseño del MD de Darivo Pro Empresa.

**Prohibido:** inventar funcionalidades · alterar la lógica de negocio · copiar la lógica de negocio del Panel Administrador.

Si no existe MD Admin equivalente (p. ej. módulos exclusivos Empresa), usar patrones visuales del Admin más cercano documentado en el Sistema de Diseño Empresa, sin inventar lógica.

---

# 8. Sincronización

Cuando termine un módulo deberá sincronizar únicamente:

* MD del módulo.
* Imagen oficial.
* Sistema de Diseño Empresa.
* Visión del Producto (solo secciones afectadas).
* Referencias cruzadas relacionadas.

**Nunca sincronizar todo el proyecto.**

---

# 9. Validación (cierre de FASE 2)

### 9.1 Validación del diseño (antes de la imagen)

Tras documentar el diseño en el MD — **sin requerir imagen**:

* [ ] La lógica de negocio coincide con Darivo Pro Móvil (§4.2).
* [ ] El diseño de escritorio coincide con Panel Administrador y Sistema Diseño Empresa (§4.3–§4.4).
* [ ] El MD documenta estructura, navegación, botones y funcionalidades del módulo.
* [ ] La funcionalidad y el alcance coinciden con la Visión del Producto (§4.1).

Pendiente de aprobación del propietario antes de crear la imagen (§7 paso 3).

### 9.2 Validación final (cierre del módulo)

Tras crear la imagen oficial — obligatoria para **Producción completada**:

* [ ] La imagen coincide con el MD aprobado.
* [ ] Sincronización acotada completada (§8).

---

# 10. Reutilización

Siempre que sea posible reutilizar:

* Funcionalidades de Darivo Pro Móvil.
* Componentes del Panel Administrador (solo patrones visuales de escritorio).
* Terminología oficial.
* Iconografía oficial (`16-SISTEMA-DE-DISEÑO-FABLE5.md` §5 — objeto `I`).
* Reglas oficiales.
* Documentación ya aprobada.

No duplicar documentación innecesariamente. Referenciar el MD Móvil equivalente para la lógica de negocio.

---

# 11. Exclusiones

Durante esta fase no trabajar en:

* Arquitectura Maestra.
* Base de Datos.
* Código fuente.
* APIs.
* Implementación técnica.

Estas tareas se realizarán únicamente durante la **fase técnica final**.

---

# 12. Resultado esperado

Al finalizar Darivo Pro Empresa deberán existir:

* Sistema de Diseño oficial (`16-SISTEMA-DE-DISEÑO-EMPRESA.md`).
* Todos los MD oficiales (`INDICE-OFICIAL-DARIVO-PRO-EMPRESA.md`).
* Todas las imágenes oficiales.
* Todos los módulos sincronizados con la Visión del Producto.
* Referencias cruzadas correctas.

Darivo Pro Empresa deberá ser la **adaptación oficial para escritorio** de la lógica de negocio de Darivo Pro Móvil (§4.2), con la **presentación visual del Panel Administrador** (§4.3), dentro del marco definido por la **Visión del Producto** (§4.1).

---

# 13. Modo de producción autónomo

Durante la fase **EN PRODUCCIÓN** de Darivo Pro Empresa, el agente trabaja de forma **totalmente autónoma** entre módulos.

## Jerarquía obligatoria (recordatorio)

1. **Visión del Producto** → estrategia y reglas del negocio.
2. **Darivo Pro Móvil** → lógica de negocio, flujo y comportamiento.
3. **Panel Administrador** → diseño, layout y componentes visuales de escritorio.
4. **Sistema de Diseño Empresa** → adaptación visual oficial para Darivo Pro Empresa.

## Orden de módulos (producción FASE 2)

Seguir el **recorrido natural del usuario** — no el avance documental previo ni el orden numérico de archivos. Orden oficial:

| Orden | Nº | Módulo |
|-------|-----|--------|
| 1 | 02 | Inicio |
| 2 | 03 | Clientes |
| 3 | 05 | Cotizaciones |
| 4 | 06 | Facturas |
| 5 | 09 | Cierre |
| 6 | 08 | IA |
| 7 | 07 | Navegación directa (ex-Más) |
| 8 | 10 | Empleados |
| 9 | 11 | Roles, Planes y Permisos |

Este orden coincide con `INDICE-OFICIAL-DARIVO-PRO-EMPRESA.md` §4.

> **Nota:** el orden de producción documental **no modifica** la navegación del sidebar (Sistema Diseño Empresa §5.1), definida por la Visión del Producto §5.
>
> **Nota (22/07/2026):** el ítem 7 ya no es una pantalla única "Más" — desde `01-VISION-DEL-PRODUCTO.md` §16 v2.19, sus 7 funcionalidades tienen entrada directa propia en el sidebar (`07-MODULO-MAS-EMPRESA.md` §5.1–§5.7). Se conserva como un único ítem de esta tabla de producción por continuidad documental, no porque exista como pantalla agrupadora.

## Continuación automática

Tras completar FASE 2 de un módulo (validación §9 + marca **Producción completada** en el índice), el agente:

1. Iniciará **automáticamente** FASE 1 del siguiente módulo pendiente.
2. Presentará el resumen ejecutivo y pasará a FASE 2 si no hay bloqueos.
3. **No solicitará confirmación** al propietario entre módulos.

## Únicas causas de detención

El agente **solo se detendrá** si:

* Existe una **contradicción real** entre documentos oficiales.
* **Falta documentación oficial imprescindible** para continuar.
* El propietario escribe **Proyecto congelado** o **Proyecto terminado**.

En cualquier otro caso, avanzará hasta completar todos los módulos del índice.

---

# 14. FASE AUDITORÍA — DISEÑO OFICIAL DE MÓDULOS

Cuando el propietario active la **auditoría de diseño**, el agente trabajará módulo a módulo **sin implementar** hasta recibir aprobación explícita.

## Objetivo

Verificar el estado del diseño oficial de cada módulo de Darivo Pro Empresa, respetando la documentación del proyecto.

## FASE 1 — Análisis (auditoría)

Antes de cualquier cambio:

* Leer la documentación oficial de Darivo Pro.
* Leer la Visión del Producto.
* Leer los documentos oficiales de Darivo Pro Empresa.
* Leer documentos maestros relacionados (Roles, Planes y Permisos, Catálogo Maestro, Sistema de Diseño, etc.).

### Reglas obligatorias

* No inventar diseños, pantallas, módulos, botones, funcionalidades, flujos ni navegación.
* No modificar la lógica de negocio.
* Si falta información → marcar **Pendiente de documentación oficial**.

### Objetivo del análisis (por módulo)

Verificar:

* ¿Dispone de diseño oficial **aprobado por el propietario**?
* ¿Estructura documentada?
* ¿Navegación documentada?
* ¿Botones documentados?
* ¿Funcionalidades documentadas?
* ¿Existe imagen oficial Empresa?

### Si el módulo NO tiene diseño oficial aprobado

**No crear uno nuevo.** Entregar informe con:

* Qué información existe.
* Qué información falta.
* Qué documentos oficiales son necesarios antes de diseñarlo.

### Si el módulo YA tiene diseño oficial aprobado

Actualizar **únicamente** la documentación para adaptarla al diseño aprobado. No modificar la lógica.

### Resultado esperado (auditoría)

Informe por módulo:

* Estado del diseño.
* Estado de la documentación.
* Información disponible.
* Información pendiente.

**Prohibido en esta fase:** generar imágenes · crear nuevos diseños · implementar código · pasar a FASE 2 sin aprobación del propietario.

### Suspensión del modo autónomo de implementación

Mientras §14 esté activo, **§13 no ejecuta producción** automáticamente. El agente entrega informes y **espera aprobación** del propietario.

> **§14 sustituido por §15** cuando el propietario active la producción automática.

---

# 15. PRODUCCIÓN AUTOMÁTICA — DARIVO PRO EMPRESA

Cuando el propietario active la **producción automática**, el agente ejecutará el flujo completo por módulo **sin solicitar autorización entre pasos**, salvo contradicción documental o decisión pendiente del propietario.

## Objetivo

Completar la documentación oficial de Darivo Pro Empresa de forma automática, siguiendo la metodología oficial del proyecto.

## Flujo automático por módulo

### FASE 1 — Análisis

1. Leer la Visión del Producto.
2. Leer las Reglas Oficiales.
3. Leer el Sistema de Diseño Darivo Pro Empresa.
4. Leer el MD equivalente de Darivo Pro Móvil.
5. Leer el MD equivalente de Darivo Pro Admin *(cuando exista)*.
6. Leer los documentos maestros relacionados.

### FASE 2 — Documentación

Actualizar el MD del módulo: diseño · navegación · estructura · paneles · botones · funcionalidades · relaciones · permisos.

**No inventar información.** Aplicar §7.2 (tres fuentes).

### FASE 3 — Auditoría documental

Auditoría completa del módulo. Verificar:

* Plantilla oficial.
* Coherencia con Visión del Producto, Móvil, Admin, Empresa, Sistema de Diseño, Roles/Planes/Permisos.
* Ausencia de contradicciones e elementos inventados.

Corregir automáticamente incidencias respaldadas por documentación oficial. **Detener** si requiere decisión del propietario.

### FASE 4 — Imagen oficial

Tras superar la auditoría documental:

* Crear imagen basada **exclusivamente** en el MD.
* No añadir elementos no documentados (§7.1).

### FASE 5 — Auditoría imagen ↔ MD

Verificar: botones · funcionalidades · ausencia de elementos adicionales · coincidencia imagen ↔ MD.

Corregir automáticamente diferencias documentadas.

### FASE 6 — Sincronización

Actualizar únicamente: Índice · Sistema de Diseño (si procede) · referencias cruzadas necesarias.

### FASE 7 — Auditoría transversal

Tras cada módulo: revisar coherencia entre Admin · Móvil · Empresa.

### FASE 8 — Limpieza documental

Eliminar únicamente: referencias obsoletas · enlaces rotos · estados antiguos · duplicados.

**Nunca** eliminar información oficial aprobada.

### FASE 9 — Informe final del módulo

Informe con: estado · auditorías · correcciones · documentos sincronizados · incidencias pendientes.

Marcar **Producción completada** solo si todas las auditorías superadas.

## Orden oficial de producción

Coincide con §13 (Inicio → Clientes → Cotizaciones → Facturas → Cierre → IA → Navegación directa ex-Más → Empleados → Roles y Permisos).

## Regla de detención (§15)

Detener el flujo automático **solo** cuando:

* Contradicción entre documentos oficiales.
* Decisión pendiente del propietario.
* Documentación oficial insuficiente para continuar.

En cualquier otro caso, continuar automáticamente hasta completar el proceso del módulo y pasar al siguiente.

## Relación con §7 y §13

* §7.1 (imagen posterior al MD) permanece vigente — la FASE 4 de §15 la implementa.
* §13 (modo autónomo entre módulos) queda integrado en §15.
* No solicitar confirmación entre pasos ni entre módulos mientras §15 esté activo.

---
## Formato de cierre (obligatorio — §13, cuando §14 no esté activo)

### Estado

Indicar qué documentos quedaron sincronizados (✅).

### Resultado

Recordar la jerarquía obligatoria de fuentes (§13 — cuatro niveles).

### Continuación

* Confirmar si existen o no contradicciones que impidan continuar.
* Indicar el **siguiente módulo pendiente** según el índice.
* Recordar: **no solicitar confirmación** entre módulos.
* Recordar las **únicas causas de detención** (contradicción, documentación imprescindible faltante, **Proyecto congelado** / **Proyecto terminado**).

---

## Protección del documento oficial

Este documento MD forma parte de la documentación oficial de Darivo Pro.

**Solo el propietario del proyecto está autorizado a crear, modificar, reorganizar o eliminar este documento.**

**Fin del documento.**
