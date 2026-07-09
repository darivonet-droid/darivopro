# 06 – PANEL ADMIN – PARTNERS

**Versión:** 1.3

**Estado:** Diseño oficial aprobado

**Cambio principal (v1.3 — 09/07/2026):** corrección documental. §4 añade la entrada real "Productos" del sidebar de Admin.

**Cambio principal (v1.2):** añadida sección 5.1 — plan oficial de comisiones (20% pago único por venta + bono escalonado por hitos 5/20/50/100+, individual por Partner). Derogada la tabla anterior por tramo de registros (S/6–S/12).

---

# 1. Objetivo

El módulo **Partners** permite administrar el programa oficial de Partners de Darivo Pro desde el Panel Administrador.

Este módulo pertenece al Panel Administrador.

El Panel Administrador es la **única fuente autorizada** para administrar los Partners, el programa de Partners, los códigos, los enlaces y la tabla oficial de comisiones.

---

# 2. Imagen oficial

**Archivo de imagen:**

`06-PANEL-ADMIN-PARTNERS.png`

![Partners — Panel Administrador](./06-PANEL-ADMIN-PARTNERS.png)

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
* Empresas
* Empleados
* Configuración de APIs
* Partners *(módulo actual)*
* Soporte
* Configuración

---

# 5. Estructura de la pantalla

## Indicadores superiores

* Total Partners
* Activos
* Pendientes
* Suspendidos

## Pestañas

* Todos los partners
* Activos
* Pendientes
* Suspendidos

## Acciones principales

* Nuevo partner
* Configurar tabla de comisiones
* Filtros

## Herramientas

* Buscar en la tabla
* Ordenar resultados
* Cambio de tipo de vista
* Paginación

## Funcionalidades oficiales

El Panel Administrador permite únicamente:

* Crear Partner.
* Activar Partner.
* Suspender Partner.
* Generar automáticamente un código único.
* Generar automáticamente un enlace único.
* Consultar los registros asociados al enlace del Partner.
* Configurar la tabla oficial de comisiones.
* Administrar el programa de Partners.

No documentar funcionalidades adicionales sin aprobación.

---

## 5.1 Plan oficial de comisiones (aprobado por el propietario 07/07/2026)

⚠️ **Sustituye y deroga por completo** cualquier tabla de comisiones anterior por tramo de registros (S/6–S/12 por registro). Esa tabla queda **oficialmente eliminada** — no debe volver a documentarse ni configurarse en el sistema.

### Comisión por venta

* **20% de comisión**, calculado sobre el primer pago del cliente referido.
* **Pago único** — no es recurrente, no se repite en meses siguientes del mismo cliente.

### Bono por hitos de clientes propios referidos

Bono adicional, calculado como **porcentaje sobre la facturación del tramo de clientes correspondiente a ese hito** (no sobre el acumulado total).

| Hito (clientes propios acumulados) | % del bono sobre ese tramo |
|---|---|
| 5 | 10% |
| 20 | 10% |
| 50 | 15% |
| 100 y cada 50 siguientes (150, 200, 250…) | 20% — techo permanente, no sigue subiendo |

* El hito se calcula **por Partner individual**, nunca de forma agregada entre varios Partners.
* A partir del hito de 100, el bono se mantiene fijo en 20% para todos los tramos posteriores — no hay un quinto escalón.

### Plan regalado

* Cada Partner activo recibe acceso gratuito al **Plan Business** mientras permanezca activo en el programa (`04-PANEL-ADMIN-SUSCRIPCIONES.md` §6).

### Administración

Este plan de comisiones se configura y edita exclusivamente desde este módulo (Panel Admin → Partners → "Configurar tabla de comisiones"). Ningún otro documento ni pantalla puede duplicar estos porcentajes — deben referenciar esta sección.

---

# 6. Información mostrada

El listado principal muestra:

* Partner
* Código único
* Enlace único
* Registros asociados
* Estado
* Acciones

No documentar información adicional no visible en el diseño oficial.

---

# 7. Panel lateral

## Resumen

* Total Partners
* Activos
* Pendientes
* Suspendidos

## Información

Información general sobre el programa de Partners.

## Acciones rápidas

* Nuevo partner
* Configurar tabla de comisiones
* Consultar registros asociados
* Activar partner
* Suspender partner
* Guía de uso

---

# 8. Acciones disponibles

Según el diseño oficial:

* Crear partner
* Activar partner
* Suspender partner
* Consultar registros asociados al enlace
* Configurar tabla de comisiones

No documentar funcionalidades adicionales sin aprobación.

---

# 9. Relaciones

Este módulo forma parte del Panel Administrador (`01-VISION-DEL-PRODUCTO.md` §4 y §8 — rol Administrador Darivo, Partners).

* `01-VISION-DEL-PRODUCTO.md` v2.5 §8 (Partners en roles de plataforma).
* `05-darivo-pro-partner/PANEL-PARTNER.md` (producto Partner).
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
* No inventar relaciones.
* No inventar APIs.
* No inventar tablas.
* No inventar permisos.
* No modificar el diseño oficial.
* No gestionar clientes desde este módulo.
* No gestionar material de marketing desde este módulo.
* No permitir que el Partner gestione su enlace.
* Documentar únicamente la información visible en el diseño aprobado.

## Reglas del enlace y del código

* El código único será generado automáticamente por el sistema al crear el Partner.
* El enlace único será generado automáticamente por el sistema al crear el Partner.
* Cada Partner tendrá un único enlace.
* El Partner no podrá crear, modificar, regenerar ni eliminar su enlace.
* El Panel Administrador es la única fuente autorizada para administrar los Partners.

---

# 14. Estado del documento

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
