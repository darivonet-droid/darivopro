# 02 – PANEL ADMIN – EMPRESAS

**Versión:** 1.1

**Estado:** Diseño oficial aprobado

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

El catálogo oficial de planes (**Básico** y **Pro**) está definido únicamente en `04-PANEL-ADMIN-SUSCRIPCIONES.md`.

Este módulo utiliza ese catálogo para el campo "Plan" asociado a cada empresa.

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
* El cambio de plan se realiza desde este módulo.
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
