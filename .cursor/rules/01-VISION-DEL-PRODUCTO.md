# 01 – VISIÓN DEL PRODUCTO – ECOSISTEMA DARIVO PRO

**Versión:** 2.16

**Estado:** Visión oficial aprobada

---

# 1. Objetivo

Este documento es el **documento maestro del ecosistema Darivo Pro**.

Define la visión oficial del ecosistema, todos los principios estratégicos del proyecto y constituye la **referencia principal** para comprender Darivo Pro.

Su objetivo es describir los productos que forman el ecosistema, su propósito, la relación entre ellos y los principios generales de funcionamiento.

Este documento no define el detalle de arquitectura técnica, esquemas de base de datos, APIs, diseño de pantallas ni reglas de implementación.

Sí define los principios estratégicos de arquitectura y base de datos del ecosistema (sección 14).

Este documento **no define**:

* nombres de los planes
* límites de almacenamiento
* límites de uso
* características comerciales
* precios

Toda esa información pertenece exclusivamente al documento oficial de **Suscripciones** (sección 19) y es administrada desde el **Panel Administrador**.

La **jerarquía documental oficial** del ecosistema se define en la sección 12.

Es la referencia oficial para comprender el ecosistema Darivo Pro antes de consultar la Arquitectura Maestra o la documentación específica de cada producto.

---

# 2. Ecosistema Darivo Pro

Darivo Pro es un ecosistema de aplicaciones diseñado para ayudar a profesionales y empresas a gestionar su trabajo de forma rápida, sencilla y centralizada.

Todo el ecosistema comparte:

* Una única lógica de negocio.
* Una única arquitectura funcional.
* Una única fuente oficial de documentación.

Cada producto tiene una responsabilidad diferente dentro del ecosistema, pero todos utilizan las mismas reglas de negocio y la misma información oficial.

---

# 3. Productos del ecosistema

Actualmente el ecosistema está compuesto por los siguientes productos:

* Darivo Pro Admin.
* Darivo Pro Móvil.
* Darivo Pro Empresa.

Cada uno tiene una función específica dentro del ecosistema.

## 3.1 Productos como criterio de clasificación del Catálogo Maestro

Los productos del ecosistema (Darivo Pro Admin, Darivo Pro Móvil, Darivo Pro Empresa) constituyen también el **primer nivel de clasificación** del Catálogo Maestro (sección 11). Cada categoría del Catálogo Maestro pertenece a uno o varios de estos productos.

El **Programa Partner** (sección 3.2) no es un producto del ecosistema y **no participa** como criterio de clasificación del Catálogo Maestro.

La administración de este nivel de clasificación corresponde exclusivamente a Darivo Pro Admin, conforme al principio de administración exclusiva del Catálogo Maestro (sección 11).

## 3.2 Programa Partner

Darivo Pro dispone de un **Programa Partner**: un sistema de colaboración con personas o cuentas externas (influencers y colaboradores) que promocionan Darivo Pro a cambio de una comisión por resultado.

El Programa Partner **no es un producto** del ecosistema (sección 3) ni forma parte de la clasificación del Catálogo Maestro (sección 3.1).

Su administración —partners, códigos, enlaces y tabla oficial de comisiones— corresponde exclusivamente a **Darivo Pro Admin**.

Cada partner accede a su propio panel de consulta (**Panel Partner**) para ver su actividad y comisiones, sin capacidad de administración.

Cada comisión generada debe quedar registrada de forma histórica y auditable, no solo como un cálculo en vivo del tramo vigente — detalle completo en `02-darivo-pro-admin/06-PANEL-ADMIN-PARTNERS.md` §5.2.

**Nota terminológica:** "Referidos" es el nombre antiguo de este programa. Toda la documentación oficial y la interfaz deben usar únicamente "Partners" / "Programa Partner". "Referidos" queda eliminado del ecosistema.

---

# 4. Darivo Pro Admin

Darivo Pro Admin es la plataforma utilizada exclusivamente por el equipo de Darivo.

Su función es administrar el ecosistema completo.

Desde Darivo Pro Admin se gestionan, entre otros elementos oficiales:

* Catálogo Maestro.
* Tarifa Pro.
* Planes de suscripción.
* Soporte.
* Configuración global.
* Información general del ecosistema.

Darivo Pro Admin no realiza el trabajo diario de los clientes.

Su función es administrar la información que posteriormente utilizan Darivo Pro Móvil y Darivo Pro Empresa.

---

# 5. Darivo Pro Móvil

Darivo Pro Móvil es la herramienta de trabajo diario.

Permite utilizar las funcionalidades documentadas del ecosistema desde un dispositivo móvil.

## Navegación oficial

La navegación principal de Darivo Pro Móvil está formada **exclusivamente** por seis módulos:

* Inicio
* Clientes
* IA
* Facturas
* Cierre
* Más

Esta estructura constituye la **navegación oficial** de Darivo Pro Móvil.

El módulo **IA** (posición 3) se presenta como botón central destacado en la barra de navegación, conforme al diseño oficial aprobado.

El módulo **Más** (posición 6) concentra las funcionalidades secundarias, administrativas y de configuración del cliente (sección 16).

## Excepción oficial — usuario con únicamente Darivo Pro Móvil

Cuando un usuario contrata únicamente Darivo Pro Móvil, una sola persona desempeña simultáneamente las funciones de:

* Gerente.
* Técnico.

En este caso no existe gestión de empleados, asignación de roles ni permisos entre diferentes usuarios.

## Usuario que posteriormente contrata Darivo Pro Empresa

Cuando posteriormente ese cliente contrata Darivo Pro Empresa, los roles pueden separarse.

* El **Gerente** administra la empresa.
* Los **Técnicos** continúan utilizando Darivo Pro Móvil con los permisos asignados por el Gerente desde Darivo Pro Empresa.

---

# 6. Darivo Pro Empresa

Darivo Pro Empresa es la versión empresarial del ecosistema Darivo Pro para trabajar desde ordenador.

No es un producto independiente.

No es una arquitectura diferente.

No es una lógica de negocio diferente.

Reutiliza íntegramente la lógica de negocio de Darivo Pro Móvil y consume la información administrada por Darivo Pro Admin.

Su objetivo es permitir que una empresa gestione su actividad desde un entorno de escritorio utilizando exactamente las mismas funcionalidades del ecosistema.

La única diferencia funcional respecto a Darivo Pro Móvil es la gestión interna de la empresa mediante:

* Empleados.
* Roles.
* Permisos.

## El Gerente

El Gerente administra la empresa.

El Gerente administra los empleados.

El Gerente administra los roles.

El Gerente administra los permisos.

## Los Técnicos

Los Técnicos utilizan siempre Darivo Pro Móvil como herramienta de trabajo diario.

No utilizan una aplicación diferente.

Trabajan con las funcionalidades autorizadas por el Gerente mediante permisos.

Darivo Pro Empresa **no sustituye** Darivo Pro Móvil para los Técnicos.

---

# 7. Relación entre los productos

Los tres productos forman un único ecosistema. Cada uno tiene la responsabilidad definida en las secciones 4, 5 y 6:

| Producto | Responsabilidad principal |
| -------- | ------------------------- |
| Darivo Pro Admin | Administra el ecosistema (sección 4). |
| Darivo Pro Móvil | Herramienta de trabajo diario (sección 5). |
| Darivo Pro Empresa | Gestiona empresa, empleados, roles y permisos; reutiliza la lógica de Móvil (sección 6). |

---

# 8. Principio de funcionamiento

Todo el ecosistema sigue siempre la misma secuencia lógica:

```
Suscripción
    ↓
Producto
    ↓
Rol
    ↓
Permisos
    ↓
Funcionalidades
    ↓
Limitaciones
```

## 1. Suscripción

Determina qué producto o productos tiene contratados el cliente.

El ecosistema utiliza un **sistema de planes de suscripción**. Este documento no define ningún plan concreto (ver sección 19).

## 2. Producto

Determina qué aplicación puede utilizar el usuario.

## 3. Rol

Determina la responsabilidad del usuario.

El ecosistema distingue dos grupos de roles oficiales. No deben mezclarse.

### Roles de plataforma

Corresponden al equipo de Darivo.

Actualmente existe:

* **Administrador Darivo**

Responsabilidades:

* Administración completa de la plataforma.
* Gestión de Darivo Pro Admin.
* Gestión de empleados internos de Darivo.
* Administración del ecosistema.
* Configuración global.
* Catálogo Maestro.
* Tarifa Pro.
* Soporte.
* Planes de suscripción.
* Roles, permisos y módulos de administración del Panel Admin, incluidos Partners.

Estos roles pertenecen exclusivamente a la plataforma Darivo.

### Roles del cliente

Corresponden a la empresa cliente.

Actualmente existen, por defecto, en Darivo Pro Empresa:

* **Gerente**
* **Técnico**

Estos roles únicamente gestionan la actividad de la empresa cliente y utilizan Darivo Pro Móvil y, cuando corresponda, Darivo Pro Empresa.

### Roles personalizados (condicionados al plan)

Cuando el plan contratado lo permita, el **Gerente** podrá crear **roles personalizados** adicionales a Gerente y Técnico, dentro del límite máximo de roles personalizados definido por ese plan (sección 19).

Los roles personalizados:

* Se crean y administran exclusivamente por el Gerente desde Darivo Pro Empresa y Darivo Pro Móvil.
* Nunca sustituyen ni eliminan los roles base Gerente y Técnico.
* Están sujetos a las mismas reglas de Permisos (sección 8.4): únicamente activan o desactivan funcionalidades ya existentes, nunca crean funcionalidades nuevas.
* Su disponibilidad y límite máximo dependen exclusivamente del plan contratado, nunca de una decisión del Gerente por sí sola.

La definición funcional detallada de roles, permisos y roles personalizados se documenta en los MD específicos oficiales de cada producto, en sincronía con este documento.

## 4. Permisos

Únicamente activan o desactivan funcionalidades ya existentes.

Nunca crean funcionalidades nuevas.

## 5. Funcionalidades

El usuario utiliza las funcionalidades permitidas por:

* Suscripción.
* Producto.
* Rol.
* Permisos.

Ningún módulo funcional decide quién puede acceder a él. Esa decisión ya ha sido tomada previamente por la Suscripción, el Producto, el Rol y los Permisos.

## 6. Limitaciones

Las Limitaciones se aplican **sobre las funcionalidades ya determinadas**: no deciden qué puede hacer el usuario, sino **cuánto** puede usar de lo que ya tiene disponible (ej. número de cotizaciones, número de empleados, límites de uso de IA).

Dependen exclusivamente del plan contratado.

No dependen del Rol.

No dependen de los Permisos.

Los límites concretos de cada plan (incluyendo el límite de roles personalizados y el límite de empleados/Técnicos, configurable por cuenta) se documentan en la sección 19.

---

# 9. Excepción oficial — lógica compartida Móvil y Empresa

Darivo Pro Móvil y Darivo Pro Empresa reutilizan exactamente la misma lógica de negocio.

Comparten:

* Clientes.
* Cotizaciones.
* Facturación.
* Módulo Cierre.
* Módulo Más.
* Gestión documental.
* IA.
* Catálogo Maestro.
* Tarifa Pro.
* Mis Tarifas.
* Motor de Cotización.
* PDF.

No existen diferencias funcionales entre ambos productos.

La única excepción aprobada entre ambos productos es el **diseño visual** (sección 10). Esa diferencia no modifica la lógica de negocio, los procesos ni los flujos funcionales compartidos — incluidos Clientes, Cotizaciones, Facturación, Motor de Cotización y PDF.

Las funcionalidades compartidas del ecosistema tienen como referencia oficial **Darivo Pro Admin** (sección 10).

---

# 10. Principio de diseño y funcionalidad compartida

Darivo Pro separa oficialmente el diseño de la funcionalidad.

## Diseño

Cada producto dispone del siguiente diseño oficial:

* **Darivo Pro Móvil**: Fable 5 es la referencia oficial del diseño visual, la navegación, los componentes, los botones, las imágenes y la experiencia de usuario — exclusiva de Móvil, independiente del resto del ecosistema.
* **Darivo Pro Admin**: dispone de su propio diseño oficial, y este diseño es además **la referencia visual única** para el resto de productos de escritorio del ecosistema (actualmente, Darivo Pro Empresa).
* **Darivo Pro Empresa**: reutiliza el mismo diseño visual de Darivo Pro Admin — mismos componentes, mismos botones, misma paleta — adaptado a su propia navegación y estructura de contenido. No dispone de un diseño visual propio e independiente.

**Razón del principio:** Darivo Pro Admin y Darivo Pro Empresa se utilizan siempre **desde ordenador** — comparten el mismo entorno de uso y, por tanto, el mismo diseño visual. Darivo Pro Móvil se utiliza desde dispositivo móvil y constituye un entorno de uso distinto, con su propio diseño (Fable 5).

Esto significa que cuando se apruebe o modifique un componente visual en Darivo Pro Admin, ese mismo diseño debe aplicarse en Darivo Pro Empresa. Únicamente el **contenido funcional** (el MD específico de cada módulo) puede diferir entre Admin y Empresa — nunca el diseño visual de los componentes compartidos.

### Excepción oficial de Fable 5

Como norma general, **Fable 5** es la referencia oficial del diseño de **Darivo Pro Móvil**, incluyendo el diseño visual, la navegación, los componentes, los botones, las imágenes y la experiencia de usuario.

**Excepción aprobada por el propietario:**

Los módulos **Cierre** y **Más** no existen en el diseño original de Fable 5.

Por tratarse de funcionalidades propias del ecosistema Darivo Pro, su incorporación queda oficialmente autorizada.

En consecuencia:

* **Cierre** y **Más** pasan a formar parte de la navegación oficial de Darivo Pro Móvil.
* El **Módulo Cierre** dispone de diseño oficial aprobado (`09-MODULO-CIERRE.md` e imagen `09 – MÓDULO CIERRE – DARIVO PRO MÓVIL.png`).
* El diseño del **Módulo Más** y demás ampliaciones seguirán el estilo visual de Fable 5 conforme se aprueben.
* Esta incorporación no supone una contradicción con Fable 5, sino una ampliación oficial aprobada por el propietario para adaptarlo a las necesidades de Darivo Pro.
* Cualquier auditoría futura deberá considerar **Cierre** y **Más** como elementos oficiales del diseño de Darivo Pro Móvil y no deberá marcarlos como diferencias o contradicciones respecto al diseño original de Fable 5.

## Funcionalidad

Las funcionalidades compartidas del ecosistema tienen una única referencia oficial: **Darivo Pro Admin**.

Cuando se cree, modifique o apruebe una funcionalidad o el comportamiento de un botón en Darivo Pro Admin, esa funcionalidad deberá sincronizarse con Darivo Pro Móvil y Darivo Pro Empresa.

El aspecto visual de los botones y componentes entre **Darivo Pro Admin y Darivo Pro Empresa debe ser el mismo** (sección 10, Diseño) — comparten diseño por ser ambos productos de escritorio. Únicamente **Darivo Pro Móvil** (Fable 5) mantiene un diseño visual independiente, adaptado a su entorno móvil.

Sin embargo, en los tres productos, el comportamiento, las reglas de negocio y el funcionamiento deberán ser siempre los mismos en todo el ecosistema Darivo Pro.

Este principio garantiza una única lógica funcional para todos los productos y evita duplicidades o comportamientos diferentes para una misma acción.

## Programa Partner

El **Programa Partner** (sección 3.2) dispone de su propio diseño oficial, independiente de Fable 5 y del diseño de Darivo Pro Admin.

A nivel de funcionalidad, el Programa Partner **no genera lógica de negocio propia**: consulta y refleja la información administrada exclusivamente desde Darivo Pro Admin (partners, comisiones, códigos y enlaces — sección 3.2). No aplica la regla de sincronización funcional entre productos (párrafo anterior), porque no es un producto del ecosistema.

---

# 11. Principios del ecosistema

Todo el ecosistema Darivo Pro se rige por los siguientes principios:

* Una única lógica de negocio.
* Una única fuente oficial de documentación.
* Un único Catálogo Maestro.
* Una única Tarifa Pro.
* Un único Motor de Cotización.
* Un único sistema de Facturación.
* Un único módulo Cierre.
* Un único módulo Más.
* Una única gestión documental transversal.
* Un único diseño oficial de PDF.
* Una única arquitectura funcional compartida.

Cada producto adapta únicamente su ámbito de utilización sin modificar las reglas oficiales del ecosistema.

## Gestión del Catálogo Maestro y Mis Tarifas

### Catálogo Maestro

El **Catálogo Maestro** tiene una única administración oficial.

Su gestión corresponde exclusivamente a **Darivo Pro Admin**.

Desde Darivo Pro Admin se crean, modifican, actualizan y mantienen los servicios, materiales, categorías y la Tarifa Pro.

Ningún otro producto puede administrar el Catálogo Maestro.

### Mis Tarifas

**Mis Tarifas** es la personalización del Catálogo Maestro para cada empresa.

Su gestión corresponde al **Gerente** desde:

* **Darivo Pro Empresa**.
* **Darivo Pro Móvil**.

Desde ambos productos el gerente puede:

* personalizar precios;
* activar o desactivar partidas;
* gestionar únicamente las tarifas de su empresa.

Estas acciones nunca modifican el Catálogo Maestro.

### Técnico

El **Técnico** no administra:

* el Catálogo Maestro;
* Mis Tarifas.

El Técnico únicamente consulta y utiliza la información necesaria para realizar su trabajo, conforme a los permisos asignados.

### Principio oficial

Existe un único Catálogo Maestro para todo el ecosistema Darivo Pro.

Cada empresa dispone de sus propias **Mis Tarifas**, derivadas del Catálogo Maestro.

Las personalizaciones realizadas por una empresa no modifican el Catálogo Maestro ni afectan a otras empresas.

---

# 12. Sistema de documentación oficial

La documentación oficial de Darivo Pro se rige por los siguientes principios de organización y sincronización.

## Jerarquía documental

**1. Visión del Producto**

* Documento maestro del ecosistema.
* Contiene todos los principios estratégicos del proyecto.
* Es la referencia principal para todo el ecosistema.

**2. Arquitectura Maestra**

* Desarrolla únicamente la arquitectura técnica.
* Debe basarse en la Visión del Producto.
* No puede contradecir la Visión.

**3. MD específicos**

* Desarrollan únicamente su ámbito funcional.
* Amplían la información definida en la Visión del Producto y en la Arquitectura Maestra.
* No pueden contradecir los documentos de nivel superior.

## Principios de contenido

* **Todo principio estratégico** del proyecto debe aparecer en la Visión del Producto.
* La **Arquitectura Maestra** desarrollará únicamente la parte técnica del ecosistema, a partir de los principios de la sección 14.
* Cada **MD específico** desarrollará únicamente su ámbito funcional.
* Ningún principio estratégico debe existir únicamente en un documento específico.
* Los documentos específicos desarrollan los principios de la Visión, pero nunca los sustituyen.

## Documentos de referencia por ámbito funcional

Cada ámbito funcional del ecosistema dispone de un **documento oficial de referencia** que concentra la definición aprobada de ese ámbito.

| Ámbito | Documento oficial de referencia |
| ------ | ------------------------------- |
| Inicio | `01-darivo-pro-movil/02-MODULO-INICIO.md` |
| Clientes | `01-darivo-pro-movil/03-MODULO-CLIENTES.md` |
| Cotizaciones | `01-darivo-pro-movil/05-MODULO-COTIZACIONES.md` |
| Facturación | `01-darivo-pro-movil/06-MODULO-FACTURAS.md` |
| Catálogo Maestro, Tarifa Pro y Motor de Cotización | `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO.md` |
| Panel Administrador (índice) | `02-darivo-pro-admin/INDICE-OFICIAL-PANEL-ADMIN.md` |
| Planes, límites y suscripciones | `04-PANEL-ADMIN-SUSCRIPCIONES.md` |
| Roles, planes y permisos (Admin) | `02-darivo-pro-admin/12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` |
| Módulo Cierre | `01-darivo-pro-movil/09-MODULO-CIERRE.md` |
| Módulo Más | `01-darivo-pro-movil/07-MODULO-MAS.md` |
| Darivo Pro Empresa (índice) | `03-darivo-pro-empresa/INDICE-OFICIAL-DARIVO-PRO-EMPRESA.md` |
| Reglas de trabajo Empresa | `03-darivo-pro-empresa/REGLAS-OFICIALES-DARIVO-PRO-EMPRESA.md` |
| Sistema de Diseño Empresa | `03-darivo-pro-empresa/16-SISTEMA-DE-DISEÑO-EMPRESA.md` |

Durante las sincronizaciones documentales, la IA de desarrollo deberá utilizar esos documentos de referencia conforme a la **Metodología de sincronización documental** de esta sección.

## Regla de sincronización — planes y límites

Ningún documento del ecosistema podrá duplicar:

* nombres de planes
* límites
* precios
* almacenamiento
* restricciones comerciales

Siempre deberá **referenciar** el documento oficial de Suscripciones (`04-PANEL-ADMIN-SUSCRIPCIONES.md`).

Esto garantiza una única fuente oficial de verdad y evita inconsistencias cuando los planes cambien.

**Nota (21/07/2026):** desde `04-PANEL-ADMIN-SUSCRIPCIONES.md` v1.10, el nombre/precio/límites de los 3 planes existentes son editables desde Admin (tabla `planes_catalogo`) — esto **no** cambia esta regla ni habilita un 4to plan; `04-PANEL-ADMIN-SUSCRIPCIONES.md` sigue siendo la única referencia oficial, ahora también como fuente administrativa de esos valores.

## Metodología de sincronización documental

La Visión del Producto constituye la **referencia principal** del ecosistema Darivo Pro.

Toda modificación funcional o de negocio deberá incorporarse **primero** a la Visión del Producto cuando afecte a los principios generales del ecosistema.

Una vez aprobada la actualización de la Visión del Producto, únicamente se sincronizarán los **documentos oficiales afectados** por dicho cambio.

Queda **prohibido** realizar auditorías o revisiones completas de toda la documentación cuando el cambio afecte únicamente a documentos concretos.

Los prompts deberán indicar expresamente:

* el documento que debe actualizarse;
* los apartados concretos afectados;
* la referencia correspondiente en la Visión del Producto.

La IA de desarrollo **no deberá** revisar ni modificar otros documentos fuera del alcance autorizado por el propietario.

Esta metodología tiene como objetivo reducir duplicidades, acelerar el mantenimiento de la documentación y mantener una única fuente oficial para los principios generales del ecosistema.

## Regla de sincronización documental

* Si existe un documento oficial de referencia para un ámbito funcional, la IA de desarrollo deberá **sincronizar el resto de documentos con esa referencia** sin solicitar confirmación adicional.
* La IA de desarrollo **solo deberá detenerse** cuando existan contradicciones entre documentos del **mismo nivel jerárquico** y no exista una fuente oficial previamente definida por el propietario para resolverlas.

En ese caso deberá informar al propietario y esperar instrucciones antes de continuar.

---

# 13. Inteligencia Artificial en el ecosistema

El ecosistema Darivo Pro contempla **dos tipos de IA oficiales** con funciones distintas: la **IA conversacional del producto** y la **IA de desarrollo**.

## IA conversacional de Darivo Pro Móvil

Darivo Pro Móvil dispone de **dos agentes oficiales de Inteligencia Artificial** con responsabilidades exclusivas:

| Agente | Responsabilidad |
|--------|-----------------|
| **Agente IA 1 — Presupuestos y Facturas** | Crear y editar cotizaciones, crear facturas, convertir cotizaciones en facturas y asistir en esos procesos. |
| **Agente IA 2 — Soporte y Tickets** | Primer nivel de soporte: preguntas frecuentes, uso de la app, incidencias comunes y tickets. Escala automáticamente al **Soporte Humano** cuando no tiene certeza (`08-MODULO-IA.md` §3). |

Principios:

* Son un **atajo** dentro del flujo de trabajo del usuario; no sustituyen la lógica de negocio ni generan documentos paralelos al sistema.
* Solo responden sobre **presupuestos, cotizaciones, facturas, soporte y tickets** de Darivo Pro Móvil.
* El **soporte al usuario** sigue un modelo de **dos niveles**: IA de Soporte (primer nivel) y Soporte Humano en Darivo Pro Admin (segundo nivel, vía escalado automático).
* La IA de Soporte **nunca inventa soluciones sin certeza**; deriva al soporte humano mediante ticket.
* Incluyen **protección frente a robots** (detección de uso automatizado, registro, suspensión temporal e informe al usuario).
* Su comportamiento se documenta en `01-darivo-pro-movil/08-MODULO-IA.md`.

## IA automática del Módulo Cierre

Además de los dos agentes conversacionales, el **Módulo Cierre** incorpora IA **automática y transparente** para el análisis de fotografías y documentos en el registro de gastos.

* **No** es un tercer agente conversacional.
* El usuario no conversa con ella; actúa dentro del flujo de registro de gastos.
* Su comportamiento se documenta en `01-darivo-pro-movil/09-MODULO-CIERRE.md` §14.

## IA de desarrollo

Herramientas de Inteligencia Artificial utilizadas para **analizar, desarrollar, auditar y mantener** Darivo Pro siguiendo la documentación oficial del proyecto.

Ejemplos: Cursor, Claude, ChatGPT, Gemini, GitHub Copilot u otras herramientas equivalentes.

* Deben respetar la jerarquía documental definida en este documento.
* Deben aplicar la regla de sincronización documental de la sección 12.
* No pueden modificar la Visión del Producto ni ningún documento oficial sin autorización expresa del propietario.

---

# 14. Arquitectura y Base de Datos

Darivo Pro está diseñado como un ecosistema SaaS preparado para crecer de forma continua.

Desde el primer día, toda la arquitectura del sistema y la base de datos deberán diseñarse pensando en la escalabilidad, el mantenimiento y la evolución del producto.

## Principios de arquitectura

La arquitectura deberá cumplir los siguientes principios:

* Modular.
* Escalable.
* Mantenible.
* Desacoplada.
* Fácil de ampliar.
* Fácil de auditar.

Cada módulo tendrá una única responsabilidad.

Las funcionalidades nunca deberán mezclarse entre módulos.

## Principios de la base de datos

La base de datos deberá estar preparada para soportar el crecimiento del producto sin necesidad de rediseñar su estructura principal.

Cada tabla tendrá una única responsabilidad.

Ejemplos:

* Empresas.
* Clientes.
* Empleados.
* Cotizaciones.
* Facturas.
* Gastos.
* Roles.
* Planes.
* Permisos.

No se deberá mezclar información de distintas responsabilidades en una misma tabla.

## Identificadores

Todas las tablas deberán disponer de un identificador único (**ID**) como clave primaria.

Las relaciones entre tablas deberán realizarse mediante IDs.

Nunca mediante nombres, teléfonos, correos electrónicos u otros datos que puedan cambiar.

## Relaciones

Las relaciones entre tablas deberán ser claras, simples y normalizadas.

Cada tabla almacenará únicamente la información que le corresponde.

La información compartida se relacionará mediante claves foráneas.

## Escalabilidad

Toda la arquitectura deberá permitir el crecimiento del ecosistema para soportar:

* Miles de empresas.
* Millones de empleados.
* Millones de clientes.
* Millones de cotizaciones.
* Millones de facturas.
* Millones de documentos.
* Nuevos módulos.
* Nuevos productos.
* Nuevos planes.
* Nuevos roles.
* Nuevos permisos.

Sin necesidad de rediseñar la arquitectura principal.

## Supabase y PostgreSQL

La arquitectura deberá seguir las buenas prácticas de Supabase y PostgreSQL.

Las tablas deberán estar correctamente normalizadas, con claves primarias, claves foráneas, índices cuando sean necesarios e integridad referencial.

La estructura deberá facilitar el uso de Row Level Security (RLS), consultas eficientes y un mantenimiento sencillo.

## Principio general

Antes de crear o modificar cualquier tabla, relación o componente de la arquitectura, deberá verificarse que respeta estos principios y que no compromete la escalabilidad, el rendimiento ni la evolución futura del ecosistema Darivo Pro.

El detalle técnico de arquitectura y base de datos se desarrollará en la Arquitectura Maestra y en los documentos oficiales correspondientes, sin contradecir esta sección.

---

# 15. Módulo Cierre

El ecosistema Darivo Pro dispone del módulo oficial **Cierre**, compartido por Darivo Pro Móvil y Darivo Pro Empresa.

Constituye uno de los seis módulos de la **navegación oficial** de Darivo Pro Móvil (sección 5), en posición **Cierre** (5).

Permite registrar y organizar los gastos generados por la actividad del cliente, y preparar la documentación del período seleccionado mediante el **expediente mensual**.

## Diseño oficial

El diseño visual oficial del Módulo Cierre está aprobado y documentado en:

* `01-darivo-pro-movil/09-MODULO-CIERRE.md`
* Imagen oficial: `09 – MÓDULO CIERRE – DARIVO PRO MÓVIL.png`
* Referencia en el Sistema de Diseño Fable 5 (`16-SISTEMA-DE-DISEÑO-FABLE5.md`)

El módulo se organiza en dos áreas: **Gastos** (registro y consulta) y **Expediente Mensual** (selección de período, generación y exportación).

## ADN del módulo

El Módulo Cierre respeta el ADN de Darivo Pro:

* Rapidez.
* Simplicidad.
* IA invisible para el usuario.
* Menos clics.
* Menos configuración.

## Objetivo

Preparar y organizar la documentación generada por Darivo Pro durante el período seleccionado para facilitar su revisión por la gestoría del cliente.

Incorpora el registro de gastos, el **expediente mensual** del período seleccionado y los resúmenes oficiales del período.

La documentación se organizará por períodos mediante selectores de **mes** y **año**.

Darivo Pro **no sustituye** el trabajo de la gestoría ni de SUNAT.

La gestoría revisará la documentación generada por Darivo Pro y podrá completarla con la documentación externa que corresponda antes de continuar con sus procedimientos habituales y el cumplimiento de las obligaciones tributarias.

## Exportación

El módulo Cierre podrá obtenerse mediante los formatos oficiales aprobados por el ecosistema.

Los formatos oficiales podrán incluir:

* Exportar en PDF.
* Descargar ZIP.
* Carpeta organizada.

Todos los formatos contendrán **exactamente la misma información**.

Únicamente cambiará la forma de presentación y entrega.

## Documentación funcional

El funcionamiento detallado se documenta en `01-darivo-pro-movil/09-MODULO-CIERRE.md`.

Este documento no define Base de Datos, API, arquitectura, procesos técnicos ni formatos de exportación del módulo.

---

# 16. Módulo Más

El ecosistema Darivo Pro dispone del módulo oficial **Más**, compartido por Darivo Pro Móvil y Darivo Pro Empresa.

En Darivo Pro Móvil, el **Módulo Más** ocupa la posición 6 de la **navegación oficial** (sección 5).

## Principio oficial

El Módulo Más centraliza las funcionalidades secundarias, administrativas y de configuración general del cliente.

Entre otros elementos oficiales podrá incluir:

* Empresa (Datos de la Empresa).
* SUNAT.
* Catálogo Maestro.
* Integraciones.
* API utilizadas por el cliente.
* Inicio de sesión / Perfil.
* Configuraciones generales oficialmente aprobadas.

Las futuras funcionalidades que no formen parte del flujo principal de trabajo deberán incorporarse en el **Módulo Más**, siempre que sean aprobadas oficialmente.

## Límite funcional

El Módulo Más **no podrá utilizarse** para incorporar funcionalidades operativas del producto que requieran un módulo propio.

Toda nueva funcionalidad operativa aprobada deberá disponer de su **propio módulo oficial** dentro del ecosistema.

## Documentación funcional

Los documentos específicos desarrollarán el funcionamiento del Módulo Más sin duplicar este principio.

Documento oficial de referencia: `01-darivo-pro-movil/07-MODULO-MAS.md`.

---

# 17. Gestión documental transversal

Darivo Pro incorpora oficialmente una **gestión documental transversal** en todo el ecosistema.

## Objetivo

Permitir almacenar y asociar documentación de la actividad empresarial de forma centralizada, reutilizable y accesible desde los módulos del ecosistema.

## Tipos de documento

* Fotografías.
* PDF.
* Documentos compatibles.

## Asociaciones

Los documentos podrán asociarse a:

* Registro de gastos (Módulo Cierre).
* Presupuestos (cotizaciones).
* Facturas.
* Informes.
* Clientes.
* Empresa.
* Futuros módulos del ecosistema.

## Relación con el Módulo Cierre

La documentación almacenada en el ecosistema podrá integrarse en el **Módulo Cierre** (sección 15) para su revisión por la gestoría del cliente.

## Almacenamiento

El ecosistema incorpora almacenamiento documental centralizado para la gestión documental transversal.

Los límites de almacenamiento, el sistema técnico de almacenamiento y las restricciones por plan se documentan exclusivamente en `04-PANEL-ADMIN-SUSCRIPCIONES.md` y en la Arquitectura Maestra.

---

# 18. Facturación electrónica — flujo oficial

Darivo Pro incorporará **facturación electrónica** como parte del módulo compartido de **Facturación** (sección 9), con el mismo flujo funcional en Darivo Pro Móvil y Darivo Pro Empresa.

> **La API de facturación electrónica oficial todavía no ha sido seleccionada por el propietario. La implementación se realizará una vez se apruebe el proveedor oficial.**

Este apartado define **únicamente el flujo funcional**. No define proveedor, integraciones técnicas, endpoints ni arquitectura de implementación.

## Principio

1. El usuario crea la factura en Darivo Pro.
2. Darivo Pro valida toda la información requerida.
3. Darivo Pro enviará la factura a la **API oficial de facturación electrónica** que el propietario apruebe en el futuro.
4. Mientras se procesa el envío, la factura queda en estado **En proceso**.
5. Darivo Pro interpreta la respuesta de la API y actualiza el estado correspondiente.

## Respuestas oficiales de la API

| Resultado | Comportamiento en Darivo Pro |
|-----------|------------------------------|
| **Emitida** | Factura aceptada. Mostrar estado **Emitida**. |
| **Rechazada** | Mostrar el motivo del rechazo. Permitir corregir la factura. Permitir reenviar. |
| **Error de comunicación** | Guardar como **Pendiente de envío**. Permitir **Reintentar**. |

## Estados oficiales de facturación electrónica

| Estado | Significado funcional |
|--------|------------------------|
| **Borrador** | Factura creada o en edición; aún no enviada a la API. |
| **En proceso** | Enviada a la API; esperando respuesta. |
| **Emitida** | Aceptada por la API oficial. |
| **Rechazada** | Rechazada por la API; el usuario puede corregir y reenviar. |
| **Pendiente de envío** | Error de comunicación; pendiente de reintento. |

## Reglas funcionales

* Una factura **Emitida** no puede editarse ni eliminarse; su información queda protegida.
* Una factura **Borrador**, **Rechazada** o **Pendiente de envío** puede corregirse según las reglas del módulo Facturas.
* Darivo Pro **no sustituye** el cumplimiento tributario del usuario ni el trabajo de su gestoría; facilita la emisión electrónica cuando el proveedor oficial esté aprobado.

## Documentación funcional detallada

`01-darivo-pro-movil/06-MODULO-FACTURAS.md` (y su equivalente en Darivo Pro Empresa).

---

# 19. Gestión de planes y límites

## Sistema de suscripción

Darivo Pro utiliza un **sistema de planes de suscripción** como parte del principio de funcionamiento del ecosistema (sección 8).

Este documento establece únicamente que existen planes y que determinan productos, limitaciones y acceso a funcionalidades.

**No define ningún plan concreto.**

## Administración oficial

Todos los planes del ecosistema son creados, modificados, activados, desactivados y gestionados **únicamente** desde el módulo **Gestión de Suscripciones** del Panel Administrador.

Documento oficial: `04-PANEL-ADMIN-SUSCRIPCIONES.md`.

Desde Darivo Pro Admin se administra toda la información relativa a:

* planes
* límites de almacenamiento
* límites de uso
* características comerciales
* precios
* servicios y módulos del producto disponibles por plan (ej. acceso a IA, Cierre u otras funcionalidades sujetas a plan)
* límites de roles personalizados por plan (sección 8)
* límites de empleados/Técnicos por plan

### Principio de control total

**Ningún servicio, módulo, límite o funcionalidad configurable del ecosistema puede quedar fuera del control del módulo Gestión de Suscripciones.**

Si una funcionalidad nueva necesita estar sujeta a un plan, su configuración (activación, límite o disponibilidad) debe incorporarse a este módulo antes de poder documentarse como disponible en cualquier producto. Ningún otro documento ni producto puede definir por su cuenta si una funcionalidad está o no sujeta a un plan.

## Fuente única de verdad

La Visión del Producto, la Arquitectura Maestra y el resto de MD del ecosistema **referencian** el documento de Suscripciones.

Nunca duplican nombres de planes, límites, precios, almacenamiento ni restricciones comerciales.

---

# 20. Alcance del documento

Este documento define exclusivamente la visión del producto y los principios estratégicos del ecosistema.

No define el detalle de:

* Arquitectura técnica (sí define los principios estratégicos — sección 14).
* Base de datos (sí define los principios estratégicos — sección 14).
* APIs.
* Diseño visual detallado de interfaces, pantallas y componentes (ver sección 10 y documentación de diseño de cada producto).
* Implementación y código.
* Nombres de planes, límites, precios ni características comerciales (ver sección 19 y `04-PANEL-ADMIN-SUSCRIPCIONES.md`).
* Reglas funcionales detalladas de módulos (ver MD específicos oficiales de cada ámbito, sección 12).

Este documento **sí define** la estructura estratégica de la navegación oficial de Darivo Pro Móvil (sección 5), los principios de diseño y funcionalidad compartida (sección 10) y los principios estratégicos de arquitectura y base de datos (sección 14).

Estos aspectos de detalle se documentarán en sus documentos oficiales correspondientes.

---

# 21. Estado del documento

**Versión:** 2.16

**Estado:** Visión oficial aprobada.

**Cambio principal (v2.16 — 21/07/2026, autorizado explícitamente por el propietario, Etapa 7):** §12 "Regla de sincronización — planes y límites" — nota aclaratoria: desde `04-PANEL-ADMIN-SUSCRIPCIONES.md` v1.10 los 3 planes existentes son editables desde BD (Admin → Suscripciones), sin que eso habilite un 4to plan ni cambie que `04-PANEL-ADMIN-SUSCRIPCIONES.md` sigue siendo la única fuente oficial de nombres/límites/precios.

**Cambio principal (v2.15):** §3.2 — añadida referencia cruzada corta a la decisión de negocio de registro histórico y auditable de comisiones (detalle completo en `06-PANEL-ADMIN-PARTNERS.md` §5.2, sin duplicar aquí).

**Cambio principal (v2.14):** §10 corregido — Darivo Pro Admin y Darivo Pro Empresa comparten el mismo diseño visual (ambos son productos de escritorio); Empresa deja de tener diseño propio independiente. Solo Darivo Pro Móvil (Fable 5) mantiene diseño visual independiente. Corregido también el párrafo de Funcionalidad, que antes permitía aspecto visual distinto entre productos.

**Cambio principal (v2.13):** §8 — invertido el orden oficial de la secuencia: **Funcionalidades antes que Limitaciones** (antes era al revés). Las Limitaciones ahora se definen como restricciones de cantidad/uso aplicadas sobre funcionalidades ya determinadas (ej. número de cotizaciones, empleados), no como filtro previo a su existencia. Referencias sincronizadas en Arquitectura Maestra, `11-ROLES-PLANES-PERMISOS-EMPRESA.md` y `08-MODULO-IA.md`.

**Cambio principal (v2.12):** §8 — añadida la capacidad de roles personalizados creados por el Gerente, condicionada al límite del plan contratado; §19 — reforzado el principio de control total: ningún servicio, módulo, límite o funcionalidad puede quedar fuera del módulo Gestión de Suscripciones. Se mantiene el orden oficial de la secuencia (Limitaciones → Funcionalidades) y el nombre del tercer plan (**Empresa**), ya confirmados por el propietario.

**Cambio principal (v2.11):** §10 — incorporación de la subsección "Programa Partner": diseño propio independiente de Fable 5 y de Admin; sin lógica de negocio propia (solo consulta información administrada por Darivo Pro Admin); no aplica la regla de sincronización funcional entre productos.

**Cambio principal (v2.10):** incorporación de la sección 3.1 (Productos como criterio de clasificación del Catálogo Maestro) y sección 3.2 (Programa Partner); eliminación oficial del término "Referidos" en favor de "Partners".

**Cambio principal (v2.9):** §13 — modelo oficial de soporte IA + humano (dos niveles), escalado automático y regla de no inventar soluciones.

**Cambio principal (v2.8):** actualización de §13 — dos agentes conversacionales oficiales de IA Móvil (Presupuestos y Facturas · Soporte y Tickets), ámbito, protección anti-robots e IA automática del Módulo Cierre diferenciada.

**Cambio principal (v2.7):** incorporación de la sección 18 — flujo oficial de facturación electrónica (estados, validación, envío a API futura y respuestas); renumeración de §19–§21.

**Cambio principal (v2.6):** incorporación de la sección 14 — principios estratégicos de arquitectura y base de datos; actualización de §1, §12 y §19.

**Cambio principal (v2.5):** sincronización del Módulo Cierre — navegación oficial de seis módulos (Inicio), diseño aprobado, expediente mensual e imagen oficial integrada en §15.

**Cambio principal (v2.4):** incorporación de la regla oficial de gestión del Catálogo Maestro y Mis Tarifas (§11).

**Cambio principal (v2.3):** limpieza documental — nomenclatura Cierre/Más, referencias corregidas, eliminación de duplicidades y unificación de apartados (§5, §7, §9, §14 eliminado, §15–§16, §12, §19).
