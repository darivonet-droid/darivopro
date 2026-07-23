# 12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN

**Versión:** 1.7

**Estado:** Documento oficial

**Cambio principal (v1.7 — 23/07/2026, autorizado explícitamente por el propietario):** §7.2 sincroniza la **aprobación** de los roles personalizados (antes propuesta pendiente en `03-darivo-pro-empresa/11-ROLES-PLANES-PERMISOS-EMPRESA.md` §6.1, ahora aprobada y pendiente solo de construcción). Se confirma sin duplicar cifras que el **límite máximo de roles personalizados se administra por cuenta desde Suscripciones** (`04-PANEL-ADMIN-SUSCRIPCIONES.md`), no como valor fijo por plan.

**Cambio principal (v1.6):** §7 ampliado a 3 planes (Básico, Pro, Business); añadido §7.1 (límite de Técnicos, solo Business, configurable por empresa) y §7.2 (roles personalizados, solo Business, límite por empresa); §14 con las reglas correspondientes.

---

# 1. Objetivo

Este documento define la arquitectura oficial de **Roles, Planes de Suscripción y Permisos** para **Darivo Pro Admin** y forma parte de la documentación sincronizada del ecosistema Darivo Pro.

Es la fuente oficial para determinar:

* Los roles del sistema.
* Los planes de suscripción disponibles.
* Los permisos de acceso y uso de las funcionalidades.

Estos tres conceptos son independientes y constituyen la base del sistema de control de acceso de Darivo Pro.

---

# 2. Imagen oficial

**Archivo de imagen:** Pendiente de diseño oficial.

**Imagen:** Pendiente.

### Reglas de uso

* Solo podrán utilizarse imágenes oficiales aprobadas.
* Cualquier modificación requerirá la aprobación del propietario.

---

# 3. Diseño oficial

El diseño deberá seguir el sistema oficial correspondiente a:

* Darivo Pro Admin.
* Darivo Pro Empresa.
* Darivo Pro.

No podrán modificarse componentes, estructura, navegación ni diseño sin aprobación oficial.

---

# 4. Navegación

Este documento aplica a:

* Darivo Pro Admin.
* Darivo Pro Empresa.
* Darivo Pro.

---

# 5. Estructura del módulo

El sistema se divide en tres bloques independientes:

* Roles.
* Planes de Suscripción.
* Permisos.

Estos conceptos nunca deberán mezclarse.

---

# 6. Roles oficiales

Los roles del ecosistema se dividen en dos grupos según `01-VISION-DEL-PRODUCTO.md` §8:

* **Roles de plataforma** — equipo de Darivo.
* **Roles del cliente** — empresa cliente.

## 6.1 Administrador Darivo

Rol de **plataforma**.

Responsable de la administración completa de la plataforma.

Tiene acceso total a Darivo Pro Admin.

## 6.2 Gerente de Empresa

Rol del **cliente**.

Responsable de administrar únicamente su empresa.

Puede gestionar empleados y configurar sus permisos respetando siempre las limitaciones del plan contratado.

Desde **Darivo Pro Empresa** y **Darivo Pro Móvil**, el Gerente administra **Mis Tarifas** (`01-VISION-DEL-PRODUCTO.md` §11; Doc 21 §8 y §19):

* personalizar precios;
* activar o desactivar partidas;
* gestionar únicamente las tarifas de su empresa.

Estas acciones nunca modifican el Catálogo Maestro.

## 6.3 Empleado / Técnico

Rol del **cliente**.

Utiliza Darivo Pro para realizar su trabajo diario.

No administra la empresa.

Solo puede utilizar las funcionalidades habilitadas por el Gerente.

El **Técnico** no administra el Catálogo Maestro ni **Mis Tarifas**. Únicamente consulta y utiliza la información necesaria conforme a los permisos asignados (`01-VISION-DEL-PRODUCTO.md` §11; Doc 21 §8 y §19).

---

# 7. Planes de suscripción

Los planes de suscripción son administrados exclusivamente desde el módulo **Suscripciones** de **Darivo Pro Admin**.

El **Administrador Darivo** podrá:

* Crear nuevos planes de suscripción.
* Modificar los planes existentes.
* Activar o desactivar planes.
* Eliminar planes cuando corresponda.
* Configurar las funcionalidades disponibles para cada plan.

Actualmente los planes oficiales son:

* **Básico.**
* **Pro.**
* **Business.**

La matriz completa de funcionalidades por plan (Cotizaciones, Clientes, Catálogo, Facturación, IA, Usuarios) es responsabilidad exclusiva de `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6. Este documento no la duplica.

Los planes determinan las funcionalidades disponibles para cada empresa.

Los planes no son roles ni permisos.

La creación o modificación de un plan no altera la arquitectura oficial de Roles y Permisos definida en este documento.

## 7.1 Límite de Técnicos por plan

Solo el plan **Business** permite la estructura Gerente + Técnicos (`01-VISION-DEL-PRODUCTO.md` §6, §19).

* **Básico** y **Pro**: 1 único usuario (Gerente = Técnico, `01-VISION-DEL-PRODUCTO.md` §5, excepción de usuario único).
* **Business**: 1 Gerente + hasta 5 Técnicos incluidos. Técnicos adicionales son una ampliación cuyo precio no está definido todavía (`04-PANEL-ADMIN-SUSCRIPCIONES.md` §6).

El límite exacto de Técnicos de cada empresa se administra individualmente desde Suscripciones (Panel Admin), no como un número fijo idéntico para todas las empresas del mismo plan.

## 7.2 Roles personalizados

Cuando el plan lo permita, el **Gerente** puede crear roles personalizados adicionales a Gerente y Técnico (`01-VISION-DEL-PRODUCTO.md` §8).

* Disponible únicamente en plan **Business** — es el único plan con estructura multiusuario; Básico y Pro son de un único usuario y no aplican roles personalizados.
* El límite máximo de roles personalizados **se administra individualmente por cuenta desde Suscripciones** (Panel Admin, `04-PANEL-ADMIN-SUSCRIPCIONES.md`), igual que el límite de Técnicos — no es un número fijo por plan. Este documento **no duplica ninguna cifra**; la fuente única es Suscripciones.
* Los roles personalizados nunca crean funcionalidades nuevas — únicamente activan o desactivan funcionalidades ya existentes (`01-VISION-DEL-PRODUCTO.md` §8, Permisos).
* La especificación funcional detallada (pantalla, campos, validaciones) se documenta en `03-darivo-pro-empresa/11-ROLES-PLANES-PERMISOS-EMPRESA.md` §6.1 — **aprobada por el propietario el 23/07/2026** (antes propuesta). Pendiente únicamente su construcción real: el enforcement de los permisos del rol y la alineación del catálogo de permisos con la matriz aprobada (ver §6.2 de ese documento).
* Los roles personalizados se crean y administran **exclusivamente desde Darivo Pro Empresa**, por el Gerente. **Darivo Pro Móvil no los administra** — solo aplica lo definido en Empresa (§16).

---

# 8. Permisos

Los permisos permiten habilitar o deshabilitar funcionalidades para cada empleado.

Los permisos nunca podrán superar las capacidades definidas por el plan de suscripción asignado.

Las matrices de permisos se documentarán conforme se aprueben los módulos oficiales.

---

# 9. Jerarquía

Administrador Darivo

↓

Gerente de Empresa

↓

Empleado / Técnico

Cada nivel únicamente podrá administrar el nivel inferior.

---

# 10. Panel lateral

**Pendiente de diseño oficial.**

---

# 11. Relaciones

Este módulo se relaciona con:

* Darivo Pro Admin.
* Darivo Pro Empresa.
* Darivo Pro.
* Gestión de Empleados.
* Configuración.
* Planes de Suscripción.

---

# 12. Base de datos

**Estado:** Pendiente de documentación oficial.

---

# 13. API

**Estado:** Pendiente de documentación oficial.

---

# 14. Reglas

* Un rol identifica quién es el usuario.
* Un plan determina las funcionalidades contratadas.
* Un permiso determina las acciones autorizadas.
* No reutilizar los planes de suscripción como sistema de permisos.
* No utilizar referencias técnicas como roles oficiales.
* Toda modificación de permisos deberá realizarse desde los módulos oficiales de administración.
* Todo cambio deberá registrarse mediante auditoría.
* Los permisos nunca podrán superar las capacidades definidas por el plan de suscripción asignado.
* Los planes de suscripción serán administrados exclusivamente desde el módulo **Suscripciones** de Darivo Pro Admin.
* El Administrador Darivo podrá crear, modificar, activar, desactivar o eliminar planes de suscripción.
* La creación de nuevos planes no modificará la definición oficial de los roles del sistema.
* Toda modificación de planes de suscripción deberá registrarse mediante auditoría.
* Los roles personalizados solo están disponibles en plan Business y nunca crean funcionalidades nuevas (§7.2).
* El límite de Técnicos y de roles personalizados se administra individualmente por empresa desde Suscripciones, no como valor fijo igual para todas las empresas del mismo plan (§7.1, §7.2).

---

# 15. Estado del documento

Este documento define la arquitectura oficial de Roles, Planes y Permisos para Darivo Pro Admin.

Las matrices detalladas se incorporarán conforme se apruebe la documentación oficial de cada módulo.

---

# 16. Aplicación de Roles, Planes y Permisos

La administración de Roles, Planes de Suscripción y Permisos se distribuye entre los productos del ecosistema Darivo Pro de la siguiente manera:

## Darivo Pro Admin

**Darivo Pro Admin** administra la plataforma y las funciones administrativas que le correspondan.

Es responsable de la administración general de la plataforma.

Desde Darivo Pro Admin se gestionan los procesos administrativos relacionados con Roles, Planes y Permisos cuando corresponda a la plataforma.

**Panel Admin** constituye el centro de administración del ecosistema Darivo Pro y tiene control global sobre la plataforma. Desde este producto se administran, cuando corresponda, los Roles, Planes de Suscripción, Empresas, Usuarios, Suscripciones, Configuración, Auditoría y el resto de módulos administrativos.

---

## Darivo Pro Empresa

**Darivo Pro Empresa** administra su empresa, sus empleados y los permisos de cada empleado, respetando siempre las limitaciones del plan contratado.

Es responsable de la administración de la empresa.

El Gerente de Empresa podrá:

* Gestionar los empleados de su empresa.
* Activar o desactivar permisos para cada empleado.
* Administrar únicamente los recursos pertenecientes a su empresa.

Los permisos asignados deberán respetar siempre las limitaciones del plan de suscripción contratado.

---

## Darivo Pro

**Darivo Pro** no administra Roles, Planes ni Permisos; únicamente aplica la configuración definida por Darivo Pro Empresa y las restricciones del plan de suscripción.

No podrá crear, modificar ni administrar permisos.

---

## Regla general

Los documentos oficiales equivalentes de Roles, Planes y Permisos deberán mantenerse sincronizados en su contenido funcional.

Ningún otro documento del proyecto podrá redefinir estos conceptos. Los módulos únicamente podrán referenciar el documento oficial correspondiente a su producto y documentar el comportamiento específico de su propio módulo.

---

# 17. Sincronización de la documentación

Cada producto del ecosistema Darivo Pro dispondrá de su propio documento oficial de **Roles, Planes y Permisos**, adaptado a su diseño, navegación e imágenes oficiales.

## Documentos oficiales

* **12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md**
* Los demás documentos equivalentes se incorporarán conforme se desarrollen los productos oficiales del ecosistema.

## Regla de sincronización

Los documentos equivalentes deberán mantenerse **sincronizados en todo su contenido funcional**.

Toda modificación relacionada con:

* Roles.
* Planes de Suscripción.
* Permisos.
* Jerarquía.
* Reglas de negocio.
* Arquitectura funcional.

deberá aplicarse simultáneamente a todos los documentos equivalentes una vez estos existan.

Únicamente podrán diferir en:

* El diseño oficial del producto.
* Las imágenes oficiales.
* La navegación.
* La estructura visual de las pantallas.
* Las referencias específicas al producto correspondiente.

Queda prohibido que un documento redefina o contradiga la arquitectura funcional de otro documento equivalente.

Si un cambio funcional afecta a Roles, Planes o Permisos, la actualización de todos los documentos equivalentes será obligatoria una vez estos formen parte de la documentación oficial.

---

# Documento oficial protegido

Este documento forma parte de la documentación oficial de Darivo Pro y constituye la fuente oficial de Roles, Planes de Suscripción y Permisos para **Darivo Pro Admin**, en sincronía con los documentos equivalentes del ecosistema.

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
