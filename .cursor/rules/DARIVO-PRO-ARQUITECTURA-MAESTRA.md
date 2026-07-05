# DARIVO PRO — ARQUITECTURA MAESTRA

**Versión:** 2.8

**Fecha:** 03/07/2026

**Estado:** Documento técnico oficial sincronizado con `01-VISION-DEL-PRODUCTO.md` v2.6

---

# 1. Objetivo y alcance técnico

Este documento es la **referencia técnica oficial** del ecosistema Darivo Pro.

Desarrolla exclusivamente la arquitectura técnica del ecosistema: productos, stack, integraciones, modelo de datos en implementación, flujos técnicos de comunicación, inteligencia artificial a nivel de arquitectura y seguridad.

**No define:**

* Visión, filosofía ni principios estratégicos del producto.
* Reglas de negocio ni comportamiento funcional de módulos.
* Diseño visual, navegación ni pantallas.
* Contenido propio de otros MD oficiales.

**Fuente maestra:** `01-VISION-DEL-PRODUCTO.md`. Ante cualquier contradicción entre este documento y la Visión del Producto, **prevalece la Visión**.

**Ámbito:** Todo el ecosistema Darivo Pro (Admin, Móvil, Empresa, Programa Partner y capas de desarrollo).

---

# 2. Principios de arquitectura

Los siguientes principios son **exclusivamente técnicos**. Los principios estratégicos del ecosistema están definidos en `01-VISION-DEL-PRODUCTO.md` §11.

## 2.1 Arquitectura modular

Cada producto del ecosistema tiene responsabilidades técnicas diferenciadas. Los módulos funcionales se documentan en sus MD específicos; la Arquitectura Maestra describe únicamente cómo se relacionan a nivel técnico.

## 2.2 Separación entre estrategia, arquitectura y módulos

| Nivel | Documento | Contenido |
| ----- | --------- | --------- |
| 1 | `01-VISION-DEL-PRODUCTO.md` | Principios estratégicos del ecosistema |
| 2 | `DARIVO-PRO-ARQUITECTURA-MAESTRA.md` | Arquitectura técnica transversal |
| 3 | MD específicos | Funcionalidad de cada ámbito |

Ningún nivel inferior puede contradecir un nivel superior.

## 2.3 Funcionalidad única compartida

Darivo Pro mantiene una **única lógica funcional** para todo el ecosistema.

Cuando una funcionalidad exista en varios productos, su comportamiento será **siempre el mismo**. No podrán existir implementaciones funcionales diferentes para una misma acción.

Este principio es **oficial de arquitectura** y aplica a:

* Darivo Pro Admin.
* Darivo Pro Móvil.
* Darivo Pro Empresa.

**Referencia estratégica:** `01-VISION-DEL-PRODUCTO.md` §9 y §11.

### 2.3.1 Lógica funcional

* La lógica funcional se documenta **una única vez**.
* Los módulos equivalentes **reutilizan** esa lógica.
* No se duplica.
* No se redefine.

### 2.3.2 Base de datos

* Todos los productos utilizan el **mismo modelo de datos**.
* No existen modelos de datos distintos para Móvil y Empresa en los módulos compartidos.
* La base de datos es **única** para el ecosistema.

### 2.3.3 Funcionalidades

Una misma acción debe tener **exactamente el mismo comportamiento** en cualquier producto donde esté disponible.

Ejemplos de acciones con implementación funcional única:

* Guardar.
* Editar.
* Eliminar.
* Buscar.
* Filtrar.
* Crear Cotización.
* Crear Factura.
* Generar Informe.
* Convertir Cotización en Factura.
* Enviar PDF.
* Aplicar permisos.
* Aplicar planes.

La implementación funcional será siempre la misma. El detalle de cada módulo se documenta en su MD específico oficial.

### 2.3.4 Diseño

Lo único que cambia entre productos es la **capa de presentación**:

* Diseño.
* Distribución de la pantalla.
* Navegación.
* Componentes visuales.
* Experiencia de usuario.

**Nunca** cambia la lógica funcional.

**Referencia estratégica:** `01-VISION-DEL-PRODUCTO.md` §10.

### 2.3.5 Darivo Pro Empresa

Darivo Pro Empresa reutiliza completamente:

* La lógica de negocio.
* La lógica funcional.
* El modelo de datos.
* Las reglas de negocio;

definidas en Darivo Pro Móvil.

Los MD de Darivo Pro Empresa documentarán **únicamente**:

* Diseño.
* Navegación.
* Experiencia de usuario en escritorio.

### 2.3.6 Darivo Pro Admin

Darivo Pro Admin **administra** la información compartida del ecosistema. **No redefine** la lógica de negocio.

Administra, entre otros:

* Catálogo Maestro.
* Tarifa Pro.
* Planes.
* Roles.
* Permisos.
* Soporte.
* Configuración global.
* Partners.
* Información compartida.

Los productos consumidores (Móvil y Empresa) **reutilizan** esa información sin duplicar su definición funcional.

## 2.4 Una única fuente de verdad

* **Estrategia:** Visión del Producto.
* **Arquitectura técnica:** este documento.
* **Funcionalidad por ámbito:** MD específico correspondiente.
* **Integraciones externas:** `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md`.
* **Catálogo, Tarifa Pro y Motor de Cotización:** `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO.md`.

## 2.5 No duplicación documental

La Arquitectura Maestra **referencia** los MD oficiales. No copia su contenido funcional ni estratégico.

## 2.6 Desacoplamiento entre productos

Los tres productos oficiales mantienen **superficies y responsabilidades técnicas distintas**, pero comparten backend, lógica funcional única y fuente documental según §2.3 y `01-VISION-DEL-PRODUCTO.md` §7.

## 2.7 Reutilización de componentes

La reutilización de lógica entre productos es obligatoria según §2.3. Darivo Pro Empresa consume la misma implementación funcional y el mismo modelo de datos que Darivo Pro Móvil; la capa adicional de Empresa se limita a presentación de escritorio y gestión de empleados, roles y permisos de empresa cliente.

## 2.8 Escalabilidad del ecosistema

La arquitectura centraliza en Darivo Pro Admin la escritura de datos maestros (catálogo, planes, configuración global) y distribuye el consumo hacia Móvil y Empresa, evitando fuentes de datos paralelas.

## 2.9 Sincronización documental

Toda modificación técnica o funcional debe respetar la jerarquía y la regla de sincronización definidas en `01-VISION-DEL-PRODUCTO.md` §12. La IA de desarrollo sincroniza documentos del mismo nivel con la referencia oficial del ámbito, salvo contradicciones no resueltas entre documentos del mismo nivel.

---

# 3. Jerarquía documental

## 3.1 Jerarquía oficial

```
1. Visión del Producto          → 01-VISION-DEL-PRODUCTO.md
2. Arquitectura Maestra         → DARIVO-PRO-ARQUITECTURA-MAESTRA.md
3. MD específicos               → Por producto y ámbito funcional
```

## 3.2 Mapa de documentos oficiales

### Documento maestro

| Documento | Archivo |
| --------- | ------- |
| Visión del Producto | `01-VISION-DEL-PRODUCTO.md` |

### Arquitectura y metodología transversal

| Ámbito | Archivo |
| ------ | ------- |
| Arquitectura Maestra | `DARIVO-PRO-ARQUITECTURA-MAESTRA.md` |
| Base de datos (esquema implementación) | `02-BASE-DATOS.md` v1.0 |
| Autenticación (Supabase Auth — Móvil) | `03-AUTENTICACION-DARIVO-PRO.md` v1.0 |
| Catálogo Maestro, Tarifa Pro y Motor de Cotización | `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO.md` |
| Metodología Oficial de IA (desarrollo) | `22 – METODOLOGÍA OFICIAL DE IA – DARIVO PRO.md` v1.2 |
| Metodología UNA TAREA, DOS AGENTES | `23 – METODOLOGÍA OFICIAL – TRABAJO EN PARALELO CON DOS AGENTES IA – DARIVO PRO.md` v2.9 |
| Catálogo oficial de tareas — implementación | `25 – CATÁLOGO OFICIAL DE TAREAS – IMPLEMENTACIÓN DARIVO PRO.md` v1.9 |
| Prompt maestro — Producción e implementación | `24 – PROMPT OFICIAL – PRODUCCIÓN E IMPLEMENTACIÓN – DARIVO PRO.md` v1.8 |
| Prompt Agente 1 — Producción | `23-A – PROMPT OFICIAL – AGENTE 1 – PRODUCCIÓN – DARIVO PRO.md` v2.9 |
| Prompt Agente 2 — Auditoría | `23-B – PROMPT OFICIAL – AGENTE 2 – AUDITORÍA DEL ECOSISTEMA – DARIVO PRO.md` v2.9 |

### Darivo Pro Móvil

| Módulo | Archivo |
| ------ | ------- |
| Clientes | `01-darivo-pro-movil/03-MODULO-CLIENTES.md` |
| Cotizaciones | `01-darivo-pro-movil/05-MODULO-COTIZACIONES.md` |
| Facturas | `01-darivo-pro-movil/06-MODULO-FACTURAS.md` |
| Configuración | `01-darivo-pro-movil/07-MODULO-CONFIGURACION.md` |
| IA (producto) | `01-darivo-pro-movil/08-MODULO-IA.md` |
| Sistema de Diseño Fable 5 | `01-darivo-pro-movil/16-SISTEMA-DE-DISEÑO-FABLE5.md` |
| Diseño oficial PDF | `01-darivo-pro-movil/17-DISEÑO-OFICIAL-PDF-DARIVO-PRO.md` |

### Darivo Pro Empresa

| Ámbito | Archivo |
| ------ | ------- |
| Índice oficial | `03-darivo-pro-empresa/INDICE-OFICIAL-DARIVO-PRO-EMPRESA.md` |
| Reglas oficiales | `03-darivo-pro-empresa/REGLAS-OFICIALES-DARIVO-PRO-EMPRESA.md` |
| Módulos funcionales | `03-darivo-pro-empresa/` (`02`–`11`, `16`) — misma lógica que Móvil; capa de presentación escritorio |

### Darivo Pro Admin

| Módulo | Archivo |
| ------ | ------- |
| Índice oficial | `02-darivo-pro-admin/INDICE-OFICIAL-PANEL-ADMIN.md` |
| Dashboard | `02-darivo-pro-admin/00-PANEL-ADMIN-DASHBOARD.md` |
| Empresas | `02-darivo-pro-admin/02-PANEL-ADMIN-EMPRESAS.md` |
| Usuarios | `02-darivo-pro-admin/03-PANEL-ADMIN-USUARIOS.md` |
| Gestión de Suscripciones | `02-darivo-pro-admin/04-PANEL-ADMIN-SUSCRIPCIONES.md` |
| Partners | `02-darivo-pro-admin/06-PANEL-ADMIN-PARTNERS.md` |
| Empleados (internos Darivo) | `02-darivo-pro-admin/07-PANEL-ADMIN-EMPLEADOS.md` |
| Configuración de APIs | `02-darivo-pro-admin/08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` |
| Soporte | `02-darivo-pro-admin/09-PANEL-ADMIN-SOPORTE.md` |
| Catálogo Maestro | `02-darivo-pro-admin/10-PANEL-ADMIN-CATALOGO-MAESTRO.md` |
| Configuración (cuenta admin) | `02-darivo-pro-admin/11-PANEL-ADMIN-CONFIGURACION.md` |
| Roles, Planes y Permisos | `02-darivo-pro-admin/12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` |

> El número **05** del índice Admin permanece reservado. Ver `INDICE-OFICIAL-PANEL-ADMIN.md`.

### Programa Partner

| Ámbito | Archivo |
| ------ | ------- |
| Panel Partner | `05-darivo-pro-partner/PANEL-PARTNER.md` |
| Gestión desde Admin | `02-darivo-pro-admin/06-PANEL-ADMIN-PARTNERS.md` |

### Documentos referenciados pero inexistentes en el repositorio

| Referencia | Estado |
| ---------- | ------ |
| `04-SIMBOLOS-Y-BOTONES.md` | No existe en `.cursor/rules/`. Citado por algunos MD de Móvil. |

---

# 4. Arquitectura del ecosistema Darivo Pro

## 4.1 Topología técnica

El ecosistema está compuesto por **tres productos oficiales** más el **Programa Partner** como componente administrado.

```
┌─────────────────────────────────────────────────────────────┐
│                    DARIVO PRO ADMIN                          │
│  Plataforma de administración del ecosistema (equipo Darivo) │
│  Escritura: Catálogo, Tarifa Pro, Planes, Soporte, Partners │
└──────────────────────────┬──────────────────────────────────┘
                           │ consumo de datos maestros
           ┌───────────────┴───────────────┐
           ▼                               ▼
┌──────────────────────┐       ┌──────────────────────┐
│  DARIVO PRO MÓVIL    │◄─────►│ DARIVO PRO EMPRESA   │
│  Herramienta diaria  │ misma │  Entorno escritorio  │
│  (técnicos, gerente) │ lógica│  (gerente, empleados)│
└──────────────────────┘       └──────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PROGRAMA PARTNER (componente del ecosistema)                │
│  Administrado desde Admin · consulta desde Panel Partner     │
└─────────────────────────────────────────────────────────────┘
```

## 4.2 Darivo Pro Admin

* Superficie técnica de administración de plataforma.
* Responsable de la **escritura** de información maestra consumida por Móvil y Empresa.
* Módulos documentados en `02-darivo-pro-admin/` (ver mapa §3.2).
* No ejecuta el trabajo operativo diario del cliente.

**Referencia funcional:** `01-VISION-DEL-PRODUCTO.md` §4.

## 4.3 Darivo Pro Móvil

* Superficie técnica de trabajo diario en dispositivo móvil.
* Consume datos administrados por Admin y aplica la lógica de negocio compartida del ecosistema.
* Autenticación y persistencia vía Supabase compartido.

**Referencia funcional:** `01-VISION-DEL-PRODUCTO.md` §5.

## 4.4 Darivo Pro Empresa

* Superficie técnica de escritorio para empresas cliente.
* **No** es un producto independiente ni una arquitectura de negocio distinta.
* Reutiliza la misma lógica de negocio y backend que Darivo Pro Móvil.
* Añade capa técnica de gestión de empleados, roles y permisos de empresa cliente.
* **No sustituye** Darivo Pro Móvil para los Técnicos.

**Referencia funcional:** `01-VISION-DEL-PRODUCTO.md` §6.

## 4.5 Programa Partner

El **Programa Partner** es un **componente del ecosistema** administrado desde Darivo Pro Admin (`06-PANEL-ADMIN-PARTNERS.md`).

**No constituye un producto independiente.**

* **Admin:** gestión y fuente de verdad de partners.
* **Panel Partner:** superficie de consulta para el partner; sincroniza con Admin (`PANEL-PARTNER.md`).

## 4.6 Secuencia técnica de acceso

La secuencia lógica del ecosistema (suscripción → producto → rol → permisos → limitaciones → funcionalidades) se define estratégicamente en `01-VISION-DEL-PRODUCTO.md` §8.

A nivel técnico, cada capa de la secuencia se resuelve en backend (Supabase + reglas de aplicación) antes de exponer funcionalidades en la interfaz del producto correspondiente.

**Detalle de roles, planes y permisos:** `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` y `04-PANEL-ADMIN-SUSCRIPCIONES.md`.

---

# 5. Stack tecnológico

Stack aprobado para la implementación actual del ecosistema:

| Capa | Tecnología | Notas |
| ---- | ---------- | ----- |
| Frontend / aplicación | Next.js 14 | Aplicación unificada desplegada en Vercel |
| Hosting | Vercel | Entornos de producción y pruebas |
| Base de datos | Supabase (PostgreSQL) | Datos, autenticación y almacenamiento |
| Autenticación | Supabase Auth | Vinculada a tabla `perfiles` |
| Generación PDF | Next.js Route Handlers | Sin backend separado para PDF |
| Compartir documentos | Web Share API | Compartición nativa sin backend adicional |
| Control de versiones | Git | Ramas `main` (producción) y `develop` (pruebas) |

> Vercel, GitHub, generación local de PDF, Web Speech API del navegador y componentes internos **no** se registran como APIs externas de negocio. **Supabase** sí está registrada oficialmente (`08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.1).

**Sistemas de diseño por producto** (capa de presentación, no arquitectura de datos):

* Darivo Pro Móvil → `16-SISTEMA-DE-DISEÑO-FABLE5.md`
* Darivo Pro Admin → diseño propio de escritorio (MD Admin)
* Darivo Pro Empresa → diseño propio de escritorio (pendiente de MD específico)

**Referencia estratégica:** `01-VISION-DEL-PRODUCTO.md` §10.

---

# 6. Integraciones

## 6.1 Registro oficial

El registro oficial de **todas las integraciones externas** del ecosistema es:

`02-darivo-pro-admin/08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md`

Ningún módulo puede utilizar una API no registrada oficialmente en ese documento.

## 6.2 Arquitectura de integración por categoría

| Categoría | Integraciones aprobadas | Estado |
| --------- | ----------------------- | ------ |
| Infraestructura | **Supabase** (Auth · PostgreSQL · Storage · RLS) | ✅ Aprobada |
| IA de producto | **OpenAI API** | ✅ Aprobada — cotizaciones (`08-MODULO-IA.md`) · análisis gastos (`09-MODULO-CIERRE.md`) |
| Pagos | **dLocal API** | ✅ Aprobada — suscripciones y Mi Plan (`04-PANEL-ADMIN-SUSCRIPCIONES.md`) |
| Facturación tributaria | SUNAT o proveedor autorizado | ⏳ **Pendiente decisión propietario** |

## 6.3 Patrón de integración

```
Servicio externo
      ↕ API
Next.js (Route Handlers / Server Actions)
      ↕
Supabase (persistencia)
      ↕
Productos (Admin / Móvil / Empresa / Panel Partner)
```

La configuración, estado y documentación detallada de cada API pertenece exclusivamente a `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md`.

**Pasarela de pago:** **dLocal API** (`04-PANEL-ADMIN-SUSCRIPCIONES.md` · registro `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.3).

**Excluidas del producto:** Meta WhatsApp Cloud API · Meta Marketing/Ads API — §5.5 del registro oficial. Los botones `wa.me` del producto no son integración Cloud API.

**Facturación electrónica SUNAT:** comprobantes actuales son documentos internos. La integración con OSE/PSE autorizado se documenta funcionalmente en `06-MODULO-FACTURAS.md`.

---

# 7. Modelo de datos

> **Documento canónico de base de datos:** `02-BASE-DATOS.md` v2.0. Fuente de verdad: `supabase/migrations/` + `seed.sql`.

No inventar esquemas.

## 7.1 Snapshot de implementación actual

Ver inventario completo en `02-BASE-DATOS.md` §4. Resumen:

| Tabla | Función técnica | Relación clave |
| ----- | --------------- | -------------- |
| `perfiles` | Perfil de usuario autenticado | 1:1 con `auth.users` |
| `clientes` | Contactos del usuario | `user_id` → auth.users |
| `presupuestos` | Cotizaciones | `user_id`, `cliente_id` → `clientes` |
| `presupuesto_items` | Líneas de cotización | `presupuesto_id` → `presupuestos` |
| `facturas` | Comprobantes emitidos | `user_id`, `from_quote_id` → `presupuestos` |
| `cotizacion_series` | Correlativo COT- por usuario | `user_id` → auth.users |
| `comprobante_series` | Correlativo global B001/F001 | `serie` PK — **no usada por frontend actual** |
| `categorias` | Overlay categorías por usuario | `user_id` → auth.users |
| `precios_usuario` | Precios personalizados (Mis Tarifas) | `user_id` |
| `partidas_propias` | Partidas propias del usuario | `user_id` |
| `precios_historial` | Histórico de cambios de precio | `user_id` |
| `ia_uso_diario` | Conteo IA por usuario y día | `user_id` |
| `calculos_log` | Log de cálculos | `presupuesto_id` → `presupuestos` |
| `productos_master` | Productos ecosistema (lookup) | — |
| `configuracion_regional` | Config regional (lookup) | — |
| `catalogo_categorias_maestro` | Categorías oficiales por producto/sector | `producto_id` → `productos_master` |

## 7.2 Dominios pendientes de documentación BD oficial

Los siguientes dominios están definidos funcionalmente en MD oficiales pero su esquema de base de datos está **pendiente de documentación** en todos los MD Admin que lo referencian:

| Dominio | Referencia funcional | Estado técnico |
| ------- | -------------------- | -------------- |
| Catálogo Maestro (modelo objetivo) | `21`, `10-PANEL-ADMIN-CATALOGO-MAESTRO.md` | Transición desde `categorias` hacia modelo Doc 21 |
| Empresas cliente | `02-PANEL-ADMIN-EMPRESAS.md`, Visión §6 | Producto definido; BD no documentada |
| Empleados de empresa cliente | Visión §6 | Distinto de empleados internos Darivo (`07-PANEL-ADMIN-EMPLEADOS.md`) |
| Suscripciones y pagos | `04-PANEL-ADMIN-SUSCRIPCIONES.md` | dLocal Go implementado (`08-PAGOS-DARIVO-PRO.md`) |
| Partners | `06-PANEL-ADMIN-PARTNERS.md`, `PANEL-PARTNER.md` | BD pendiente de documentación |
| APIs externas (configuración) | `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` | BD pendiente de documentación |
| Auditoría y logs de seguridad | — | No documentado oficialmente |

## 7.3 Limitaciones actuales

* Documento canónico: `02-BASE-DATOS.md` v1.0 (Tarea 02 — 03/07/2026).
* Los MD específicos prohíben crear tablas o relaciones sin documentación oficial previa.
* Cualquier migración debe verificarse contra el esquema real en Supabase, no contra suposiciones documentales.

---

# 8. Flujos técnicos

Esta sección describe **únicamente** integraciones, comunicación entre productos e intercambio de información. Las reglas funcionales de cada flujo pertenecen a los MD específicos indicados.

## 8.1 Admin → productos cliente

```
Darivo Pro Admin
    │ escritura
    ├── Catálogo Maestro / Tarifa Pro ──→ consumo en Móvil y Empresa
    ├── Planes y suscripciones ──────────→ limitaciones técnicas por plan
    ├── Soporte ─────────────────────────→ canal usuario (ref. `09`, `07` Móvil)
    └── Partners ────────────────────────→ sincronización con Panel Partner
```

**Referencias:** `10-PANEL-ADMIN-CATALOGO-MAESTRO.md`, `04-PANEL-ADMIN-SUSCRIPCIONES.md`, `21`.

## 8.2 Móvil ↔ Empresa

```
Darivo Pro Móvil ◄──── misma lógica de negocio ────► Darivo Pro Empresa
         │                                                    │
         └────────────── Supabase (datos compartidos) ────────┘
```

Ambos productos operan sobre el mismo backend y comparten entidades de negocio (clientes, cotizaciones, facturación, configuración, catálogo, motor de precios, PDF).

**Referencia:** `01-VISION-DEL-PRODUCTO.md` §9.

## 8.3 Motor de precios (integración técnica)

```
Catálogo Maestro (Admin, escritura)
        ↓
Tarifa Pro (Admin, escritura)
        ↓
Mis Tarifas (Móvil/Empresa, personalización usuario)
        ↓
Motor de Cotización (resolución de precio en tiempo de cotización)
```

**Referencia arquitectónica:** `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO.md`.

## 8.4 Flujo de datos cotización → factura (alto nivel)

```
presupuestos (+ presupuesto_items)
        │ vinculación técnica cliente
        ▼
clientes
        │ generación de comprobante
        ▼
facturas (+ comprobante_series)
```

**Reglas funcionales, estados y numeración:** `03-MODULO-CLIENTES.md`, `05-MODULO-COTIZACIONES.md`, `06-MODULO-FACTURAS.md`.

## 8.5 Generación PDF

```
Datos (cotización / factura / configuración usuario)
        ↓
Next.js Route Handlers
        ↓
PDF según diseño oficial
        ↓
Web Share API (compartir)
```

**Diseño PDF:** `17-DISEÑO-OFICIAL-PDF-DARIVO-PRO.md`.

## 8.6 Programa Partner

```
06-PANEL-ADMIN-PARTNERS.md (Admin, fuente de verdad)
        ↕ sincronización
PANEL-PARTNER.md (superficie de consulta partner)
```

---

# 9. Inteligencia Artificial

El ecosistema contempla **dos IA oficiales** con funciones técnicas distintas (`01-VISION-DEL-PRODUCTO.md` §13).

## 9.1 IA del producto

* Forma parte de **Darivo Pro Móvil** (y comparte lógica con Empresa según Visión §9).
* Asiste al usuario en cotizaciones, facturas e informes dentro del flujo normal del producto.
* Es un **atajo** dentro del flujo de trabajo; no genera documentos paralelos al sistema.
* Proveedor oficial: **OpenAI API** (`08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.2).
* Conteo de uso y límites por plan: tabla `ia_uso_diario`; límites según plan en `04-PANEL-ADMIN-SUSCRIPCIONES.md`.

**Documentación funcional:** `01-darivo-pro-movil/08-MODULO-IA.md`.

## 9.2 IA de desarrollo

* Herramientas utilizadas para analizar, desarrollar, auditar y mantener Darivo Pro.
* Ejemplos: Cursor, Claude, ChatGPT, Gemini, GitHub Copilot u otras autorizadas.

> **La IA de desarrollo no forma parte del producto. Forma parte del ecosistema de desarrollo y mantenimiento de Darivo Pro.**

* Debe respetar la jerarquía documental y la regla de sincronización (`01-VISION-DEL-PRODUCTO.md` §12).
* No puede modificar documentos oficiales sin autorización expresa del propietario.

**Metodología obligatoria:** `22 – METODOLOGÍA OFICIAL DE IA – DARIVO PRO.md`. Este documento no duplica su contenido.

---

# 10. Seguridad

## 10.1 Gestión de credenciales

* Claves de Supabase, OpenAI, dLocal y demás APIs del producto **solo** en `.env.local` / `.env`.
* Nunca exponer credenciales en chat, commits ni documentación pública.
* Si una clave se filtra, regenerarla inmediatamente.

## 10.2 Acceso a base de datos

* Ninguna IA de desarrollo debe conectarse directamente a la base de datos de producción con credenciales sin supervisión explícita del propietario en cada paso.

## 10.3 Control de despliegue

* Rama `develop` para pruebas; `main` para producción.
* Siempre validar en `develop` antes de promover a `main`.
* Mantener control manual sobre ejecución de comandos sensibles en entorno de desarrollo.

## 10.4 Autenticación y autorización

* Autenticación centralizada vía Supabase Auth.
* Documentación de flujos Móvil: `03-AUTENTICACION-DARIVO-PRO.md` v1.0.
* Autorización por suscripción, producto, rol, permisos y limitaciones de plan resuelta en capa de aplicación antes de exponer recursos.

**Detalle funcional de roles y permisos:** `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md`.

## 10.5 Orden técnico de implementación

Para cualquier cambio que afecte persistencia:

1. Verificar esquema real en Supabase (no asumir).
2. Definir o ajustar estructura vía migración documentada.
3. Implementar en capa de aplicación.
4. Probar en rama `develop`.

---

# 11. Deuda técnica

Agrupación del estado técnico pendiente derivado de la documentación oficial vigente.

## 11.1 Integraciones pendientes

| Integración | Estado | Referencia |
| ----------- | ------ | ---------- |
| dLocal API (pagos) | ✅ Aprobada e **implementada** (Tarea 08) | `04-PANEL-ADMIN-SUSCRIPCIONES.md`, `08-PAGOS-DARIVO-PRO.md`, `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.3 |
| OpenAI API (IA producto) | ✅ Aprobada e **implementada** (Tarea 07) | `08-MODULO-IA.md`, `09-MODULO-CIERRE.md`, `07-INTELIGENCIA-ARTIFICIAL-DARIVO-PRO.md`, `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.2 |
| Facturación electrónica (SUNAT o proveedor) | 🛑 Omitida Tarea 09 — pendiente decisión propietario | `09-FACTURACION-ELECTRONICA-DARIVO-PRO.md`, `06-MODULO-FACTURAS.md`, `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.4 |

## 11.2 Documentación técnica pendiente

| Ámbito | Estado |
| ------ | ------ |
| MD canónico de base de datos (`02-BASE-DATOS.md`) | ✅ v1.0 (Tarea 02) |
| Esquema BD de módulos Admin | Pendiente en cada MD Admin |
| Darivo Pro Empresa (MD específico de producto) | Carpeta `03-darivo-pro-empresa/` documentada; pendiente alineación BD y implementación código |
| Implementación PDF según diseño `17` | Fase de implementación posterior al diseño aprobado |
| Flujos IA de facturas e informes en `08-MODULO-IA.md` | Pendientes de documentar |

## 11.3 Transición de datos

| Ámbito | Estado |
| ------ | ------ |
| Modelo Catálogo Maestro (Doc 21) vs tabla `categorias` actual | Transición arquitectónica en curso |
| Dominios `empresas`, suscripciones, partners | Funcionalmente definidos; BD no documentada |

## 11.4 Decisiones documentales abiertas

| Referencia | Descripción |
| ---------- | ----------- |
| Referidos vs Partners | Sin definición de coexistencia (`INDICE-OFICIAL-PANEL-ADMIN.md` §6) |
| `04-SIMBOLOS-Y-BOTONES.md` | Referenciado por MD Móvil; archivo ausente en repositorio |

---

# 12. Estado del documento

| Campo | Valor |
| ----- | ----- |
| Versión | 3.3 |
| Fecha | 03/07/2026 |
| Estado | Sincronizado con `01-VISION-DEL-PRODUCTO.md` v2.6 y MD oficiales vigentes |
| Tipo | Documento técnico exclusivo del ecosistema |

## 12.1 Referencias oficiales principales

* `01-VISION-DEL-PRODUCTO.md` v2.6
* `02-BASE-DATOS.md` v1.0
* `03-AUTENTICACION-DARIVO-PRO.md` v1.0
* `04-ROLES-PLANES-PERMISOS-DARIVO-PRO.md` v1.0
* `05-FRONTEND-DARIVO-PRO.md` v2.0
* `06-SISTEMA-DE-DISEÑO-IMPLEMENTACION-DARIVO-PRO.md` v1.0
* `07-INTELIGENCIA-ARTIFICIAL-DARIVO-PRO.md` v1.0
* `08-PAGOS-DARIVO-PRO.md` v1.0
* `09-FACTURACION-ELECTRONICA-DARIVO-PRO.md` v1.0 (omitida)
* `informes/INFORME-FASE-FINAL-DARIVO-PRO-IMPLEMENTACION.md` v1.0
* `02-darivo-pro-admin/INDICE-OFICIAL-PANEL-ADMIN.md` v1.2
* `03-darivo-pro-empresa/INDICE-OFICIAL-DARIVO-PRO-EMPRESA.md`
* `02-darivo-pro-admin/08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` v2.1
* `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO.md`
* `22 – METODOLOGÍA OFICIAL DE IA – DARIVO PRO.md` v1.2
* `23 – METODOLOGÍA OFICIAL – TRABAJO EN PARALELO CON DOS AGENTES IA – DARIVO PRO.md` v2.9
* `24 – PROMPT OFICIAL – PRODUCCIÓN E IMPLEMENTACIÓN – DARIVO PRO.md` v1.8
* `11-AUTORIZACION-MULTI-PRODUCTO-DARIVO-PRO.md` v1.0
* `25 – CATÁLOGO OFICIAL DE TAREAS – IMPLEMENTACIÓN DARIVO PRO.md` v1.21
* `informes/INFORME-06-TAREA-FRONTEND-ECOSISTEMA-FINAL.md` v1.0

## 12.12 Actualización v3.3 — Ampliación Frontend Ecosistema (T06-FE propietario)

* `05-FRONTEND-DARIVO-PRO.md` v2.0 — Empresa reutiliza lógica Móvil · Admin APIs registro · Partner panel · enlaces multi-producto.

## 12.11 Actualización v3.2 — Tarea 11 Autorización Multi-Producto

* Referencia `11-AUTORIZACION-MULTI-PRODUCTO-DARIVO-PRO.md` v1.0 — guards Admin/Empresa/Partner · Roles Empresa UI.

## 12.2 Correcciones aplicadas (auditoría FASE 1)

| ID | Corrección |
| -- | ---------- |
| K-01 | Topología de **tres productos** oficiales (no dos) |
| K-02 | Empresa como producto vigente; dominios BD pendientes de documentación (no «futuro conceptual») |
| K-03 | Admin documentado (`00`–`12`); eliminado estado «pendiente de construir» |
| K-04 | Configuración Móvil remitida a `07-MODULO-CONFIGURACION.md` (sin fijar pestañas en AM) |
| K-05 | Eliminada ruta `/presupuestos` global (no existe según `05`) |
| K-06 | Eliminado flujo `/ia` como alterno; IA es atajo según Visión §13 y `08-MODULO-IA.md` |
| K-07 | Estados de factura remitidos a `06-MODULO-FACTURAS.md` (sin afirmar inmutabilidad absoluta) |
| K-08 | Diseño Fable 5 eliminado de AM; remitido a `16` (solo Móvil) |
| K-09 | Ecosistema único; Admin no es proyecto separado |
| K-10 | Referidos no afirmados; Partners documentado como componente |
| K-11 | Integraciones remitidas a registro oficial `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` |
| K-12 | Rutas y navegación eliminadas de AM; remitidas a MD específicos |

## 12.4 Actualización v2.2 — Metadatos y mapa documental

* Sincronización con `01-VISION-DEL-PRODUCTO.md` v2.6.
* Mapa §3.2 actualizado con carpeta `03-darivo-pro-empresa/`.
* §11.2 corregido: Empresa ya tiene documentación MD propia.

## 12.11 Actualización v2.8 — Tarea 06 Sistema de Diseño

* Referencia `06-SISTEMA-DE-DISEÑO-IMPLEMENTACION-DARIVO-PRO.md` v1.0 — tokens Fable 5, iconografía I, componentes DS.

## 12.10 Actualización v2.7 — Tarea 05 Frontend

* Referencia `05-FRONTEND-DARIVO-PRO.md` v1.0 — rutas Móvil (6 módulos), Admin, Empresa, Partner.

## 12.9 Actualización v2.6 — Tarea 04 Roles, Planes y Permisos

* Referencia `04-ROLES-PLANES-PERMISOS-DARIVO-PRO.md` v1.0 incorporada al mapa §12.1.
* Capa Móvil: límites por `plan_tipo`, catálogo Básico/Pro, roles implícitos usuario solo Móvil.

## 12.8 Actualización v2.5 — Tarea 03 Autenticación

* Referencia `03-AUTENTICACION-DARIVO-PRO.md` v1.0 incorporada al mapa §3.2 y §10.4.

## 12.7 Actualización v2.4 — Tarea 02 Base de Datos

* Referencia canónica `02-BASE-DATOS.md` v1.0 incorporada.
* §7.1 snapshot ampliado (tablas 015, cliente_id, comprobante_series corregido).
* §7.3 actualizado — ya existe MD canónico de BD.

## 12.6 Actualización v2.3 — Versiones documentales §3.2 y §12.1

* Mapa §3.2 y referencias §12.1 sincronizados con versiones vigentes: docs `23` v2.9 · `24` v1.8 · `25` v1.9 · `23-A` v2.9 · `23-B` v2.9.
* Revalidación Fase 9 subtarea 01.1 (INC-01 residual).

## 12.5 Actualización v2.1 — Funcionalidad única compartida

Incorporado principio arquitectónico oficial §2.3:

* Única lógica funcional para todo el ecosistema.
* Única base de datos compartida.
* Única implementación por funcionalidad.
* Los productos presentan únicamente interfaces adaptadas a cada contexto de uso.
* Reutilización obligatoria de lógica entre Admin, Móvil y Empresa.

## 12.6 Protección del documento

Este documento forma parte de la documentación oficial de Darivo Pro.

**Solo el propietario del proyecto está autorizado a crear, modificar, reorganizar o eliminar este documento.**

Si una IA detecta un posible error, contradicción o información incompleta respecto a la documentación oficial vigente, deberá:

* Detener el trabajo.
* Informar al propietario.
* Esperar instrucciones.

Queda prohibido modificar este documento por iniciativa propia.

**Fin del documento.**
