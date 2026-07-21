# 04 – PANEL ADMIN – GESTIÓN DE SUSCRIPCIONES

**Versión:** 1.10

**Estado:** Diseño oficial aprobado

**Cambio principal (v1.10 — 21/07/2026, autorizado explícitamente por el propietario, Etapa 7 decisión 7):** el catálogo pasa de **solo lectura fija en código** (decisión cerrada en la auditoría del 21/07/2026 más temprano ese mismo día, Etapa 6 — "no se construyó nada, catálogo de solo lectura") a **editable desde BD**, pese a la advertencia de riesgo planteada en esa misma auditoría. Se usó la tabla `planes_catalogo` (ya existía en el schema desde el baseline, sin ningún consumidor real hasta ahora — no se creó una tabla nueva) y se construyó edición real de nombre/precio mensual/precio anual/límites/activo para cada uno de los **3 planes existentes** desde Admin → Suscripciones. **"Nuevo plan" sigue sin aplicar** — no se habilita creación de un 4to plan, ni Importar/Publicar cambios (siguen sin construir). **⚠️ Alcance real, léase antes de asumir control total:** editar un plan aquí actualiza únicamente esta tabla administrativa — el precio real cobrado en checkout, `/precios` y los límites de uso realmente aplicados (`lib/plan-limits.ts`) siguen leyendo la constante de código `PRECIOS_OFICIALES`/`LIMITES_PLAN`, no esta tabla. Hasta que exista una fase 2 que recablee esos consumidores a leer de BD, un cambio aquí es administrativo/visual, sin efecto en el producto real. Detalle completo en `docs-internos/tareas/2026-07-21-etapa7-cierre-celdas-planes-editables.md`.

**Cambio principal (v1.9 — 17/07/2026, autorizado explícitamente por el propietario):** los 3 precios quedan **definitivos** — Básico S/49/mes, **Pro S/89/mes (antes S/79, provisional)**, **Business S/130/mes (antes S/120)**. Precio anual = precio mensual × 10 para los 3 planes, sin descuento adicional (Básico S/490, Pro S/890, Business S/1300). Ya no queda ningún plan "provisional" ni "pendiente" en este documento.

**Cambio principal (v1.8 — 11/07/2026, autorizado explícitamente por el propietario):** precio de **Business fijado como definitivo — S/120/mes, S/1200/año** (ya no es "rango de ejemplo"). Básico (S/49) y Pro (S/79) siguen provisionales — no confirmados como definitivos por el propietario todavía, no se inventa ese dato.

**Cambio principal (v1.7 — 09/07/2026):** corrección documental. §4 añade la entrada real "Productos" del sidebar de Admin.

**Cambio principal (v1.6):** tercer plan renombrado de "Empresa" a **"Business"** (decisión del propietario, evita confusión con el producto Darivo Pro Empresa); incorporada la matriz oficial de funcionalidades por plan (Cotizaciones, Clientes, Catálogo, Facturación, IA por tipo, Usuarios); precios marcados explícitamente como provisionales/ejemplo.

**Cambio principal (v1.5):** catálogo oficial ampliado de 2 a **3 planes** (Básico, Pro, **Empresa** — precio pendiente de definir); añadido principio de precio editable (no fijo, editable por Admin en cualquier momento); añadido qué controla un plan (precio, servicios/módulos, roles y límites, acceso a producto); nota de nomenclatura "Plan Empresa" vs "Darivo Pro Empresa".

**Cambio principal (v1.4):** corregida referencia obsoleta a `01-VISION-DEL-PRODUCTO.md` (v2.5 §18 → v2.11 §19, tras la renumeración de la sección de planes en v2.7).

---

# 1. Objetivo

El módulo **Gestión de Suscripciones** permite administrar los planes oficiales de Darivo Pro desde el Panel Administrador.

Este módulo pertenece al Panel Administrador.

Toda la administración de planes y suscripciones se realiza desde esta pantalla respetando las reglas oficiales del sistema.

---

# 2. Imagen oficial

**Archivo de imagen:**

`04-GESTION DE SUSCRIPCIONES.png`

![Gestión de Suscripciones — Panel Administrador](./04-GESTION%20DE%20SUSCRIPCIONES.png)

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
* Gestión de Suscripciones *(módulo actual)*
* Roles y Permisos
* Empresas
* Empleados
* Configuración de APIs
* Partners
* Soporte
* Configuración

---

# 5. Estructura de la pantalla

## Pestañas

* Planes
* Historial de cambios

## Acciones principales

* Nuevo plan *(no aplica — catálogo fijo a 3 planes)*
* Editar plan *(real desde v1.10, 21/07/2026 — nombre/precio/límites/activo)*
* Importar planes (Excel/CSV) *(no construido)*
* Exportar planes *(real)*
* Publicar cambios *(no construido — los cambios se guardan directos)*
* Ver historial *(no construido)*

## Filtros

* Buscar planes
* Estado
* Orden
* Tipo de vista

---

# 6. Planes oficiales

Este módulo es la **fuente única de definición del catálogo oficial de planes de Darivo Pro**.

Todos los demás módulos (Dashboard, Usuarios, Empresas, Soporte, Mi Plan) deberán referenciar este documento para cualquier mención de planes.

No duplicar la definición de planes en otros documentos MD.

## Catálogo oficial v4 (definitivo, 17/07/2026)

| Plan | Tipo | Precio mensual | Precio anual |
|------|------|----------------|--------------|
| **Básico** | Pago | **S/49 (definitivo)** | **S/490 (definitivo)** |
| **Pro** | Pago | **S/89 (definitivo)** | **S/890 (definitivo)** |
| **Business** | Pago | **S/130 (definitivo)** | **S/1300 (definitivo)** |

> Los 3 planes tienen precio **definitivo**, confirmado por el propietario 17/07/2026. Precio anual = precio mensual × 10, sin descuento adicional, para los 3 planes.

> El **Plan Pro** es el plan destacado y recomendado visualmente en Darivo Pro.

> Queda prohibido utilizar cualquier otro nombre de plan en la documentación oficial. No existen Plan Prueba, Plan Autónomo, Premium, Plan Empresa ni ninguna otra denominación fuera de **Básico, Pro y Business**.

No documentar planes adicionales sin aprobación expresa del propietario.

### ⚠️ Nota de nomenclatura — "Plan Business" vs "Darivo Pro Empresa"

**Plan Business** (suscripción, esta sección) y **Darivo Pro Empresa** (producto de escritorio, `01-VISION-DEL-PRODUCTO.md` §6) son conceptos **distintos**, deliberadamente con nombres diferentes para evitar la confusión que existía cuando el plan se llamaba "Empresa":

* El **Plan Business** es el único plan que da acceso al producto **Darivo Pro Empresa** (ver matriz de funcionalidades más abajo — fila "Usuarios").
* Los planes **Básico** y **Pro** son de un único usuario (la misma persona actúa como Gerente y Técnico, conforme a `01-VISION-DEL-PRODUCTO.md` §5, excepción oficial de usuario único).

## Matriz oficial de funcionalidades por plan

| Funcionalidad | Básico | Pro | Business |
|---|:---:|:---:|:---:|
| Cotizaciones | ✅ | ✅ | ✅ |
| Clientes | ✅ | ✅ | ✅ |
| Catálogo Maestro (consulta / Mis Tarifas) | ✅ | ✅ | ✅ |
| Facturación | ❌ | ✅ | ✅ |
| IA para cotizaciones (Agente IA 1 — ver `08-MODULO-IA.md` §2) | Limitada | Amplia | Amplia |
| IA para facturas (Agente IA 1 — ver `08-MODULO-IA.md` §10) | ❌ | ✅ | ✅ |
| IA para cierre/gastos (ver `09-MODULO-CIERRE.md` §14) | ❌ | ✅ | ✅ |
| Usuarios | 1 (Gerente = Técnico, único usuario) | 1 (Gerente = Técnico, único usuario) | 1 Gerente + hasta 5 Técnicos |

**Notas sobre la matriz:**

* "Limitada" en IA para cotizaciones (Básico) significa un límite de uso menor, no ausencia de la funcionalidad. El límite numérico exacto se documenta en `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` cuando se apruebe.
* **Técnicos adicionales en Business:** el plan Business permite añadir más de 5 Técnicos como ampliación. El precio de esa ampliación **no está decidido todavía**. Hasta que se defina, no debe documentarse ningún importe concreto para Técnicos adicionales.
* Esta matriz sustituye y detalla el principio general de "servicios y módulos disponibles por plan" ya establecido en `01-VISION-DEL-PRODUCTO.md` §19.

## Precio editable (no fijo) — implementación real desde el 21/07/2026 (v1.10)

El precio (y el nombre y los límites) de cada uno de los **3 planes existentes** puede ser modificado por el **Administrador Darivo** en cualquier momento desde este módulo, mediante el botón "Editar" de cada plan (tarjeta, tabla o panel de detalle) — persistido en la tabla `planes_catalogo`.

**Lo que NO existe todavía** (a diferencia de lo que sugerían versiones anteriores de este documento): no hay pestaña **Historial de cambios** funcional, no hay acción **Publicar cambios** (los cambios se guardan directos, sin flujo borrador/publicado) y **"Nuevo plan" sigue sin aplicar** — el catálogo permanece fijo a Básico/Pro/Business, nunca se crea un 4to plan.

**⚠️ Repetido a propósito — alcance real:** esta edición es administrativa. NO cambia el precio real cobrado en checkout ni los límites de uso realmente aplicados, hasta que exista una fase 2 de recableado (ver Cambio principal v1.10 arriba y `CLAUDE.md`).

## Qué controla un plan

Cada plan de suscripción determina, como mínimo:

* **Precio** (mensual y anual — editable desde Admin en cualquier momento, ver arriba; ya definitivo para los 3 planes, ver Catálogo oficial).
* **Servicios/módulos disponibles** (ver matriz de funcionalidades arriba).
* **Roles y límites de uso**: número de Técnicos (solo Business, ampliable), límites de uso de IA, y demás restricciones cuantitativas (`12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md`).
* **Producto(s) accesibles**: únicamente **Business** da acceso a Darivo Pro Empresa como producto (ver nota de nomenclatura arriba).

El detalle fino de límites numéricos de IA y roles personalizados **no se define en este documento** — pertenece a la matriz de `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md`, que deberá sincronizarse con esta sección.

---

# 7. Información mostrada

El listado principal muestra:

* Plan
* Precio mensual
* Precio anual
* Estado
* Orden
* Acciones

---

# 8. Panel lateral

## Resumen del catálogo

* Planes activos
* Planes inactivos
* Total de planes

## Información

Información general sobre la gestión de suscripciones.

## Acciones rápidas

* Importar planes (Excel/CSV)
* Exportar planes (Excel/CSV)
* Guía de uso

---

# 9. Relaciones

Este módulo forma parte del Panel Administrador.

## Relación con Mi Plan (Darivo Pro)

* El módulo **Gestión de Suscripciones** (Admin) y la sección **Mi Plan** del **Módulo Más** (`07-MODULO-MAS.md` §6) comparten la misma fuente de datos.
* Cuando **dLocal API** confirma un pago exitoso, el estado se actualiza automáticamente en ambos sistemas.
* Si el pago falla, el estado se refleja en ambos lados sin demora.
* No existe duplicación de datos: es una única fuente de verdad leída en tiempo real.

## Pasarela de pago

* La pasarela oficial es **dLocal API** (registro `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.3; producto comercial **dLocal Go**).
* No cambiar la pasarela sin nueva decisión documentada por el propietario.
* dLocal Go: sin cuota fija, aproximadamente 2,99 % de comisión por transacción.
* El usuario paga en soles (tarjeta o billetera local peruana).
* Pendiente de integración cuando existan usuarios reales listos para pagar.

## Otras relaciones

* `01-VISION-DEL-PRODUCTO.md` v2.11 §19 (planes, límites y administración oficial).
* `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` (planes y permisos de plataforma).

Las relaciones técnicas con Base de Datos y Arquitectura Maestra quedan reservadas para la fase final del proyecto.

---

# 10. Base de datos

Desde v1.10 (21/07/2026): tabla real `public.planes_catalogo` (existía en el
schema desde el baseline, sin consumidor real hasta esta versión) —
`id, slug, nombre, precio_mensual, precio_anual, activo, limites jsonb,
created_at`. Escritura restringida a Administrador Darivo por RLS. Es un
catálogo ADMINISTRATIVO — no la fuente que usan checkout/límites reales (ver
advertencia de alcance arriba).

No crear tablas adicionales.

No crear relaciones adicionales.

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
* No inventar planes.
* No inventar procesos.
* No inventar permisos.
* No inventar relaciones.
* No modificar el diseño oficial.
* Documentar únicamente lo visible en el diseño aprobado.

## Reglas de negocio de pagos (aprobadas)

* **dLocal API** es la pasarela oficial (`08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.3). No cambiar sin nueva decisión documentada.
* Un solo estado de verdad compartido entre Gestión de Suscripciones (Admin) y Mi Plan (Darivo Pro).
* Un pago fallido **no cancela inmediatamente** el plan del usuario. Debe permitirse el reintento antes de bajar el plan.
* La cancelación mantiene el acceso del usuario hasta el fin del periodo pagado.

## Pendiente de resolución

* La vista de suscripciones por usuario (tabla: usuario, plan, monto, estado de pago, fechas, MRR) se incorporará en una fase posterior.

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
