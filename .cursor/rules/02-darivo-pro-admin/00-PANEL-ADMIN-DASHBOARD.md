# 00 – PANEL ADMIN – DASHBOARD

**Versión:** 1.0  
**Estado:** Diseño oficial aprobado

---

# 1. Objetivo

El Dashboard es la pantalla principal del Panel Administrador de Darivo Pro.

Permite visualizar un resumen general de la plataforma mediante indicadores, gráficos, actividad reciente y accesos rápidos.

---

# 2. Imagen oficial

**Archivo de imagen:**

`00 - PANEL ADMIN - DASHBOARD.jpg`

![Dashboard — Panel Administrador](./00%20-%20PANEL%20ADMIN%20-%20DASHBOARD.jpg)

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

La referencia visual es el diseño oficial aprobado del Panel Administrador.

No modificar:

- Diseño.
- Colores.
- Tipografía.
- Componentes.
- Navegación.
- Iconografía.
- Distribución de la pantalla.

---

# 4. Navegación

Menú lateral mostrado en el diseño:

- Dashboard
- Catálogo Maestro
- Usuarios
- Gestión de Suscripciones
- Roles y Permisos
- Empresas
- Empleados
- Configuración de APIs
- Partners
- Soporte
- Configuración

---

# 5. Estructura

La pantalla está compuesta por:

## Barra superior

- Título
- Descripción
- Buscador
- Notificaciones
- Ayuda
- Usuario administrador
- Selector de rango de fechas

## Tarjetas de resumen

- Usuarios activos
- Suscripciones activas
- Ingresos (mes)
- Nuevos registros
- Tickets abiertos

## Área principal

- Actividad de la plataforma
- Estado de soporte
- Distribución de suscripciones

## Parte inferior

- Actividad reciente
- Acciones rápidas

---

# 6. Información mostrada

Según el diseño aprobado, el Dashboard muestra:

## Indicadores

- Usuarios activos
- Suscripciones activas
- Ingresos del mes
- Nuevos registros
- Tickets abiertos

## Gráfico

- Actividad de la plataforma

## Estado de soporte

- Abiertos
- En proceso
- Resueltos (30 días)

## Distribución de suscripciones

- Básico
- Pro

> Nomenclatura oficial según `04-PANEL-ADMIN-SUSCRIPCIONES.md` (catálogo de planes).

## Actividad reciente

Listado de eventos recientes.

## Acciones rápidas

- Nuevo usuario
- Nueva suscripción
- Nuevo ticket
- Enviar anuncio
- Ver métricas
- Catálogo maestro
- Configuración
- Ver referidos

---

# 7. Panel lateral

El panel lateral contiene el menú principal del Panel Administrador.

En la parte inferior muestra la información del administrador conectado.

---

# 8. Relaciones

Este módulo es la pantalla principal del Panel Administrador (`01-VISION-DEL-PRODUCTO.md` §4).

* Resume información agregada de los módulos administrativos: Usuarios, Empresas, Suscripciones, Partners, Soporte y Catálogo Maestro.
* La información administrada desde Darivo Pro Admin es consumida posteriormente por Darivo Pro Móvil y Darivo Pro Empresa (§7).

Las relaciones técnicas con Base de Datos y Arquitectura Maestra quedan reservadas para la fase final del proyecto.

---

# 9. Base de datos

Pendiente de documentación oficial.

No crear tablas ni relaciones.

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

- No inventar funcionalidades.
- No inventar procesos.
- No inventar reglas de negocio.
- No inventar permisos.
- No inventar relaciones.
- No modificar el diseño oficial.
- No modificar la navegación mostrada en el diseño aprobado.
- Documentar únicamente los elementos visibles en el diseño aprobado.

---

# 13. Estado

🟡 Documento de diseño oficial.

La documentación funcional se completará cuando el resto de los documentos oficiales del proyecto estén finalizados y aprobados.

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
