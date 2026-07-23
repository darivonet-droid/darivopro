# 02 – PANEL ADMIN – EMPRESAS

**Versión:** 1.3

**Estado:** Diseño oficial aprobado

**Cambio principal (v1.3 — 23/07/2026, Tarea 3):** confirmado que la vía de cambio de plan de este módulo **es legítima y se mantiene** — opera sobre el gerente de **una empresa concreta**, que es el contexto propio del módulo, a diferencia del cambio genérico por cuenta que salió de Usuarios hacia Suscripciones. Lo que sí cambia: **ya no escribe el plan directamente**. Delega en la lógica única de cambio de plan, así que **queda auditado** igual que las otras vías (§5.1). Añadido además el registro del **plan Business que asigna el alta de empresa**, que hasta entonces no dejaba ningún rastro. Ningún cambio de plan hecho por un operador desde este módulo queda ya sin registro.

**Cambio principal (v1.2 — 09/07/2026):** corrección documental. §4 añade la entrada real "Productos" del sidebar; §8 actualiza el catálogo de planes de 2 a los 3 planes reales (Básico/Pro/Business). Módulo migrado en código de lectura de `perfiles` a la tabla real `empresas` (cambiar plan / activar / desactivar).

---

# 1. Objetivo

El módulo **Empresas** permite administrar todas las empresas registradas en Darivo Pro desde el Panel Administrador.

Este módulo pertenece al Panel Administrador.

Su finalidad es gestionar la cuenta de cada empresa dentro de la plataforma.

Desde este módulo el administrador podrá:

* Registrar nuevas empresas.
* Consultar la información general de cada empresa.
* Cambiar el plan asignado a una empresa.
* Activar una empresa.
* Desactivar una empresa.
* Consultar el estado de la cuenta.
* Consultar la actividad general de la empresa.
* Consultar la información de contacto.

## 5.1 Cambio de plan desde este módulo — legítimo y auditado (23/07/2026)

El selector de Plan de la tabla de empresas **se mantiene**. Su alcance es el que corresponde a este módulo: cambia el plan del **gerente de una empresa concreta**, en el contexto de esa empresa. Es distinto del cambio de plan genérico por cuenta, que dejó de estar en el módulo Usuarios y ahora vive en `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6.1.

**Ningún cambio de plan queda sin registro.** Esta acción ya no escribe el plan por su cuenta: delega en la lógica única del ecosistema, de modo que cada cambio hecho desde aquí se anota en el log de auditoría (quién, qué cuenta, plan anterior → nuevo, cuándo, motivo) y es consultable desde Suscripciones → "Historial de cambios" (`04-PANEL-ADMIN-SUSCRIPCIONES.md` §6.2). Como el selector de la tabla no pide motivo, el registro queda con un motivo automático que identifica la vía; para dejar constancia de una razón concreta, usar la pestaña "Cuentas" de Suscripciones.

**El alta de empresa también queda registrada.** Registrar una nueva empresa desde este módulo asigna automáticamente el **plan Business** a su gerente —sin ese plan no podría ni entrar al producto Empresa— y esa asignación **se anota igualmente en el log de auditoría**, con plan anterior vacío (la cuenta se acaba de invitar, no tenía plan previo) y motivo automático "Alta de empresa desde Admin con plan Business". Antes del 23/07/2026 esta asignación no dejaba ningún rastro.
* Solicitar la eliminación de una empresa mediante el procedimiento administrativo correspondiente.

Este módulo también permite conocer el estado general de las empresas registradas mediante indicadores visibles en el Panel Administrador.

La gestión de los usuarios pertenecientes a una empresa **no forma parte de este módulo** y se realiza exclusivamente desde el módulo **Usuarios**.

---

# 2. Imagen oficial

**Archivo de imagen:**

`02 - PANEL ADMIN - EMPRESAS.jpg`

![Empresas — Panel Administrador](./02%20-%20PANEL%20ADMIN%20-%20EMPRESAS.jpg)

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

---

# 3. Diseño oficial

La referencia visual es el diseño oficial aprobado de Darivo Pro Admin.

No modificar:

* Diseño.
* Colores.
* Tipografía.
* Componentes.
* Navegación.
* Iconografía.

---

# 4. Navegación del Panel Administrador

* Dashboard
* Productos
* Catálogo Maestro
* Usuarios
* Gestión de Suscripciones
* Roles y Permisos
* Empresas *(módulo actual)*
* Empleados
* Configuración de APIs
* Partners
* Soporte
* Configuración

---

# 5. Estructura de la pantalla

## Pestañas

* Empresas.
* Solicitudes de empresa.
* Historial de cambios.

## Acciones principales

* Nueva empresa.
* Importar empresas (Excel/CSV).
* Exportar empresas.
* Publicar cambios.
* Ver historial.

## Filtros

* Buscar empresa.
* Estado.
* Orden.
* Tipo de vista.

---

# 6. Información mostrada

El listado principal muestra:

* Empresa.
* Tipo de negocio.
* Plan.
* Estado.
* Fecha de alta.
* Última actividad.
* Datos de contacto.
* Acciones.

---

# 7. Panel lateral

## Resumen de empresas

* Total de empresas.
* Autónomos.
* Empresas.
* Empresas activas.
* Empresas suspendidas.
* Empresas inactivas.

## Trabajo en equipo

Visualización de la actividad de los administradores del Panel Administrador sobre las empresas.

## Acciones rápidas

* Nueva empresa.
* Importar empresas (Excel/CSV).
* Descargar plantilla de importación.
* Guía de uso.

---

# 8. Relaciones

Este módulo forma parte del Panel Administrador.

Mantiene relación con:

* Usuarios.
* Gestión de Suscripciones.
* Roles y Permisos.

La gestión de usuarios pertenece exclusivamente al módulo **Usuarios**.

## Catálogo de planes

El catálogo oficial de planes (**Básico**, **Pro** y **Business**) está definido únicamente en `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6 (fuente única de precios y límites — no duplicar aquí).

Este módulo utiliza ese catálogo para el campo "Plan" asociado a cada empresa. Asignarlo o cambiarlo pasa siempre por la lógica única con auditoría (§5.1).

No duplicar la definición de planes en este documento.

Las relaciones con la Base de Datos y la Arquitectura Maestra se documentarán cuando dichos documentos estén finalizados y aprobados.

---

# 9. Base de datos

Pendiente de documentación oficial.

No crear tablas.

No crear relaciones.

---

# 10. API

Pendiente de documentación oficial.

No crear endpoints.

---

# 11. Permisos

Los permisos oficiales del ecosistema están definidos en `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` (§6–§8, §16).

Este MD no define permisos propios. En Darivo Pro Admin, el acceso a este módulo corresponde al rol **Administrador Darivo** (plataforma), conforme a `01-VISION-DEL-PRODUCTO.md` §8.

---

# 12. Reglas

* No inventar funcionalidades.
* No inventar procesos.
* No inventar relaciones.
* No inventar APIs.
* No inventar tablas.
* No inventar permisos.
* No modificar el diseño oficial.
* Este módulo administra exclusivamente empresas.
* La gestión de usuarios pertenece al módulo **Usuarios**.
* El cambio de plan **de la empresa** (su gerente) se realiza desde este módulo, y **siempre queda registrado** en el log de auditoría — ver §5.1. Ninguna vía puede escribir el plan sin dejar rastro.
* El cambio de plan **genérico por cuenta** no pertenece a este módulo: vive en `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6.1.
* La activación y desactivación de empresas se realiza desde este módulo.
* La eliminación definitiva de una empresa forma parte de un procedimiento administrativo autorizado por Darivo Pro.
* Documentar únicamente la información visible y aprobada oficialmente.

---

# 13. Estado del documento

🟡 Documento de diseño oficial.

La documentación funcional se completará cuando el resto de documentos oficiales del proyecto estén finalizados y aprobados.

---

## Protección del documento oficial

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
