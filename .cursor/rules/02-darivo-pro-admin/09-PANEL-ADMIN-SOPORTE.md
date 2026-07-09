# 09 – PANEL ADMIN – SOPORTE

**Versión:** 1.2

**Estado:** Diseño oficial aprobado. Endpoint desactivado a propósito (INC-A01) — este documento solo corrige los estados a los reales de BD, no reactiva el pipeline.

---

# 1. Objetivo

El módulo **Soporte** permite gestionar los tickets de soporte de los usuarios de Darivo Pro desde el Panel Administrador.

Este módulo pertenece al Panel Administrador.

El equipo Darivo visualiza, responde y gestiona el estado de las solicitudes recibidas desde Darivo Pro.

El **Soporte Humano** es el **segundo nivel** del modelo oficial de soporte (IA de Soporte → Soporte Humano). Documentación del primer nivel: `01-darivo-pro-movil/08-MODULO-IA.md` §3.

---

# 2. Imagen oficial

**Archivo de imagen:**

`09-PANEL-ADMIN-SOPORTE.png`

> La imagen oficial será añadida por el propietario.

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
* Empresas
* Empleados
* Configuración de APIs
* Partners
* Soporte *(módulo actual)*
* Configuración

---

# 5. Estructura de la pantalla

## Listado principal

Muestra los tickets de soporte registrados.

## Incidencias

Cada ticket contiene únicamente:

* Asunto
* Descripción

No existen categorías de incidencia.

No existen prioridades.

## Estados

Estados reales de `soporte_tickets` (`supabase/migrations/20260705120000_baseline_v2.sql`, CHECK de la columna `estado`):

* Abierto
* En progreso
* Resuelto
* Cerrado

## Modelo oficial — Soporte Humano (segundo nivel)

Los tickets llegan al Panel Administrador por:

* **Escalado automático** desde la IA de Soporte cuando no puede resolver con certeza (`08-MODULO-IA.md` §3, §11).
* **Creación manual** del usuario (Asunto + Descripción) desde Darivo Pro Móvil (`07-MODULO-MAS.md` §8).

El **Soporte Humano** podrá:

* Revisar el ticket.
* Comunicarse con el usuario.
* Solicitar información adicional.
* Resolver incidencias técnicas.
* Marcar el ticket como solucionado (estado **Resuelto**) y cerrarlo (estado **Cerrado**).

> La IA de Soporte **nunca inventa soluciones sin certeza** y deriva automáticamente al soporte humano mediante ticket cuando no puede resolver.

## Filtros

* Estado
* Plan del usuario

---

# 6. Información mostrada

El listado principal muestra:

* Usuario
* Contacto
* Plan
* Asunto
* Estado
* Fecha de creación
* Última respuesta
* Acciones

Los datos del usuario se obtienen del módulo **Usuarios**.

Soporte no crea usuarios.

Soporte no duplica la información del módulo Usuarios.

---

# 7. Panel lateral

## Resumen

* Abierto
* En progreso
* Resuelto
* Cerrado

## Información

Información general sobre la gestión de tickets de soporte.

## Acciones rápidas

* Guía de uso

---

# 8. Acciones disponibles

Según el diseño oficial:

* Ver ticket
* Responder ticket
* Cambiar estado
* Ver historial de conversación

No documentar funcionalidades adicionales sin aprobación.

---

# 9. Relaciones

## Relación con el módulo Usuarios

* El módulo **Usuarios** gestiona las personas.
* El módulo **Soporte** gestiona los tickets de esos usuarios.
* Soporte no crea usuarios.
* Soporte utiliza la información existente del módulo Usuarios para mostrar los datos del usuario en cada ticket.
* No duplicar información.

## Relación con Darivo Pro Móvil

* Los usuarios acceden al soporte desde **Más → Soporte** y desde el **Módulo IA** — card Soporte con IA (`07-MODULO-MAS.md` §8 · `08-MODULO-IA.md` §6, §11).
* **Primer nivel:** IA de Soporte (Agente IA 2) — preguntas frecuentes, uso de la app, incidencias comunes, creación y consulta de tickets.
* **Segundo nivel:** este módulo (Soporte Humano) — tickets escalados o creados manualmente.
* Estados oficiales del ticket (reales en BD): **Abierto**, **En progreso**, **Resuelto**, **Cerrado** (§5 de este documento).

## Otras relaciones

* `01-VISION-DEL-PRODUCTO.md` v2.5 §4 (Panel Administrador).
* `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md`.

Las relaciones técnicas con Base de Datos y Arquitectura Maestra quedan reservadas para la fase final del proyecto.

---

# 10. Base de datos

Pendiente de documentación oficial.

No crear tablas.

No crear relaciones.

---

# 11. API

Pendiente de documentación oficial.

No crear endpoints.

---

# 12. Permisos

Los permisos oficiales del ecosistema están definidos en `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` (§6–§8, §16).

Este MD no define permisos propios. En Darivo Pro Admin, el acceso a este módulo corresponde al rol **Administrador Darivo** (plataforma), conforme a `01-VISION-DEL-PRODUCTO.md` §8.

---

# 13. Reglas

* No inventar funcionalidades.
* No inventar procesos.
* No inventar permisos.
* No inventar relaciones.
* No inventar categorías de incidencia.
* No inventar prioridades.
* No modificar el diseño oficial.
* Documentar únicamente lo visible en el diseño aprobado.

---

# 14. Estado del documento

**Versión:** 1.2

🟡 Documento de diseño oficial.

**Cambio principal (v1.1):** modelo oficial Soporte Humano (segundo nivel), escalado desde IA de Soporte, regla de no inventar soluciones y relación actualizada con Móvil v1.6.

**Cambio principal (v1.2 — 09/07/2026):** corrección puramente documental. Este MD documentaba 3 estados (Nuevo/En proceso/Resuelto); la tabla real `soporte_tickets` tiene 4 (`Abierto`/`En progreso`/`Resuelto`/`Cerrado`, CHECK en `20260705120000_baseline_v2.sql`). Se actualizan §5, §7 y §9 a los estados reales. No se reactiva el endpoint de Soporte (desactivado a propósito por INC-A01) — este cambio es solo de documentación, sin efecto en código.

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
