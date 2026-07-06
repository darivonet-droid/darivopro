# DARIVO PRO — MÓDULO MÁS
## Diseño + Funcionalidad
### Versión: 2.1 — 04/07/2026
### Fuente: diseño Fable 5 (SettingsScreen) + jerarquía de precios (`21 – ARQUITECTURA DEL CATÁLOGO MAESTRO...`) + funcionalidad real + decisión arquitectónica 29/06/2026
### Relacionado: ver `04-PANEL-ADMIN-SUSCRIPCIONES.md`, `09-PANEL-ADMIN-SOPORTE.md`, `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md`, `10-PANEL-ADMIN-CATALOGO-MAESTRO.md` (Darivo Pro Admin) · ver `01-VISION-DEL-PRODUCTO.md` · ver `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO` (arquitectura oficial)

⚠️ Este documento es la ÚNICA fuente autorizada para el diseño y funcionalidad del **Módulo Más**. Ninguna IA puede modificar esto sin aprobación.

> **Sistema de diseño:** Para colores, iconos, componentes, navegación y animaciones → **ver 16-SISTEMA-DE-DISEÑO-FABLE5.md**. En caso de contradicción, prevalece Fable 5.

---

## 1. QUÉ ES MÁS

Pantalla que centraliza las funcionalidades secundarias, administrativas y de configuración del cliente conforme a `01-VISION-DEL-PRODUCTO.md` §5 y §16.

**Acceso en Darivo Pro Móvil:** posición **Más** (6) de la navegación principal (`01-VISION-DEL-PRODUCTO.md` §5).

### Navegación oficial de Darivo Pro Móvil

```
Navegación principal:
  · Inicio
  · Clientes
  · IA
  · Facturas
  · Cierre
  · Más

El módulo Más agrupa funcionalidades oficialmente aprobadas como:
  · Empresa (Datos de la Empresa)
  · SUNAT
  · Catálogo Maestro
  · Integraciones
  · API utilizadas por el cliente
  · Inicio de sesión / Perfil
  · y demás opciones secundarias aprobadas

Regla: ninguna opción de configuración, preferencia o 
ajuste se duplica entre módulos.
```

Todo acceso a preferencias, datos del usuario, informes, plan de suscripción, ajustes de IA, soporte y cualquier otra configuración general se gestiona desde este módulo.

---

## 2. ESTRUCTURA — 3 PESTAÑAS (Fable 5: pill selector)

```
DISEÑO (Fable 5 — SettingsScreen — ver 16-SISTEMA-DE-DISEÑO-FABLE5.md §6.1 y §6.9):
Header DarkHeader (T.navy): título **Más**
+ subtítulo "Categorías · Mis Tarifas · Empresa"

Selector tipo pill (fondo T.slateD, padding 4px, radius 14px):
[ Categorías ] [ Mis Tarifas ] [ Empresa ]
La pestaña activa tiene fondo T.white + sombra suave.
```

---

## 3. PESTAÑA — CATEGORÍAS

```
DISEÑO:
Texto guía: "Activa capítulos y añade tus propias partidas"

Por cada categoría (card blanca, radius 14px — ver 16 §6.3):
- Emoji + nombre + contador de partidas + Toggle 
  (T.blue cuando activo — ver 16-SISTEMA-DE-DISEÑO-FABLE5.md §6.9)
- Al estar activa, despliega la lista de sus partidas:
  nombre + precio (S/, no €) + si es "propia" del 
  usuario: Pill T.purple "Propia" (ver 16 §6.5) + 
  botón eliminar (I.trash roja)
- Botón "+ Añadir partida a [Categoría]" (borde punteado 
  del color de la categoría)

FUNCIONALIDAD:
- Toggle activa/desactiva una categoría completa para 
  ese usuario (no aparece en el wizard de cotización 
  si está desactivada)
- "+ Añadir partida": modal para crear una PARTIDA PROPIA 
  (nombre, tipo de cálculo — ver Doc 21 §12 para los 
  7 tipos oficiales, precio)
- Las categorías BASE vienen precargadas según los 
  sectores seleccionados durante el registro (ver Doc 21 §7).
  El usuario NO crea categorías base, solo las 
  activa/desactiva y añade partidas dentro.
  Ejemplos de categorías base: Construcción, Gasfitería, 
  Electricidad, Pintura, Carpintería, Climatización, 
  Mantenimiento y otras según sector habilitado.
- Albañilería es una SUBCATEGORÍA de Construcción 
  (no una categoría base independiente). Aparece 
  dentro del flujo de navegación de Construcción 
  al crear cotizaciones (ver Doc 21 §15 y 
  05-MODULO-COTIZACIONES.md).
```

---

## 4. PESTAÑA — MIS TARIFAS

```
DISEÑO:
Texto guía: "Toca para editar · Enter para guardar"

Lista agrupada por categoría, cada partida (card blanca — ver 16 §6.3):
- Nombre + "Por [unidad]" o "Precio cerrado"
- Precio actual (color de la categoría, bold, grande)
- Icono editar (I.edit, T.textMid)
- Al tocar: modal deslizante (bottom-sheet — ver 16 §6.10) 
  con input grande para el nuevo precio (S/, no €)
  Botones: [Cancelar] [Guardar]

FUNCIONALIDAD — JERARQUÍA DE PRECIOS (crítica):
El precio que ve y usa el usuario sigue SIEMPRE esta 
prioridad descendente (ver `10-PANEL-ADMIN-CATALOGO-MAESTRO.md` 
§8 y `01-VISION-DEL-PRODUCTO.md` §11):

1º Mis Tarifas (precio personalizado de la empresa)
   ↓ si no existe
2º Tarifa Pro (precio oficial del Catálogo Maestro)

Mis Tarifas incluye tanto las partidas propias creadas 
en la pestaña Categorías como los precios personalizados 
sobre partidas del Catálogo Maestro editados en esta pestaña.

Si el usuario edita un precio aquí en "Mis Tarifas", 
se guarda en `precios_usuario` y desde ese momento gana 
sobre el precio del Catálogo Maestro — pero SOLO para 
ese usuario, nunca afecta a otros usuarios ni al 
catálogo base.
```

---

## 5. PESTAÑA — EMPRESA

```
DISEÑO:
Card blanca con campos editables:
- Razón social / Nombre
- RUC
- Dirección fiscal
- Teléfono

Card "Moneda por defecto": selector PEN (S/) / USD ($) 
— por defecto y casi siempre PEN para Perú

Card navy "Backend · Supabase" (estado de conexión, 
informativo): muestra módulos conectados con punto verde

FUNCIONALIDAD:
- Estos datos aparecen en TODAS las cotizaciones y 
  facturas del usuario (encabezado del PDF)
- El campo "Cuenta Banco de la Nación" (para detracciones 
  SUNAT) también vive aquí — ver 06-MODULO-FACTURAS.md
```

---

## 6. SECCIONES ADICIONALES (debajo de las 3 pestañas, siempre visibles)

Todas las secciones siguientes viven dentro del **Módulo Más** y no forman parte de los módulos Clientes, Cotizaciones ni Facturación.

```
DISEÑO (Fable 5 — lista de cards debajo de las 3 pestañas):
Título sección: "Más opciones" (uppercase, T.textMid, 12px)
Cada ítem: card blanca radius 14px, borde T.slateD, padding 14px 16px,
icono en caja de color (40×40, radius 10), título bold 14px, 
subtítulo 12px T.textMid, chevron I.chevron a la derecha.

👤 Perfil del usuario (I.user, T.blue)
   Nombre, foto, datos de acceso y cuenta personal

📊 Informes (I.brief, T.green)
   Semana / Mes / Anual

📄 Documentos (I.folder, T.amber)
   Facturas y cotizaciones por período (consulta/historial)

💼 Mi Plan (I.building, T.purple)
   "Planes que escalan contigo" — plan actual (Básico, Pro o Business), 
   fecha de renovación, botón cambiar plan
   Fuente oficial: `04-PANEL-ADMIN-SUSCRIPCIONES.md`
   Pasarela oficial: **dLocal API** (`08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.3 · producto dLocal Go)

🤖 IA — Preferencias (I.sparkle, T.purple)
   Ajustes de uso de los agentes de Inteligencia Artificial
   Los agentes IA (Cotizaciones y Facturas · Soporte y Tickets) 
   se acceden desde el módulo **IA** de la navegación principal 
   y desde **Soporte** en este módulo — ver `08-MODULO-IA.md` 
   y `01-VISION-DEL-PRODUCTO.md` §13

🎧 Soporte (I.phone, T.teal)
   Sistema de soporte oficial: IA de Soporte (primer nivel) 
   + Soporte Humano (escalado automático)
   Resolver dudas frecuentes, ayudar con el uso y gestionar tickets 
   (crear, consultar estado; escalado si la IA no tiene certeza)
   También disponible creación manual: Asunto + Descripción
   Estados: Nuevo / En proceso / Resuelto
   La administración del soporte se realiza desde Darivo Pro Admin.
   Darivo Pro únicamente consume la información autorizada 
   (ver §8 — Integración con otros módulos, `08-MODULO-IA.md` §3 
   y `09-PANEL-ADMIN-SOPORTE.md`).

⚙️ Preferencias generales (I.gear, T.textMid)
   Idioma, notificaciones, moneda por defecto y otras 
   preferencias de la aplicación
```

No documentar funcionalidades adicionales en estas secciones sin aprobación del propietario.

---

## 7. REGLAS DE NEGOCIO (resumen)

```
ARQUITECTURA:
✅ Más es el único hub para todo lo que no 
   pertenece a Clientes, Cotizaciones o Facturación
✅ No duplicar opciones de configuración entre módulos
✅ No mover lógica de negocio de Clientes, Cotizaciones 
   o Facturación a este módulo

CATEGORÍAS Y TARIFAS:
✅ Categorías base: precargadas, no se crean, solo 
   se activan/desactivan
✅ Partidas propias: el usuario puede añadir las suyas 
   sobre cualquier categoría activa
✅ Jerarquía de precios del Motor: Mis Tarifas → Tarifa Pro 
   (ver `10-PANEL-ADMIN-CATALOGO-MAESTRO.md` §8)
✅ Editar un precio en "Mis Tarifas" solo afecta a ESE 
   usuario, nunca al catálogo base compartido
✅ Moneda: SIEMPRE S/ por defecto (Perú)
✅ El Catálogo Maestro / Tarifa Pro (ver Doc 21 §9 y §18) 
   se actualiza desde Darivo Pro Admin — el usuario 
   normal NUNCA edita el catálogo base directamente, 
   solo personaliza encima mediante Mis Tarifas
✅ Las actualizaciones de Tarifa Pro desde Admin nunca 
   eliminan ni sobrescriben las personalizaciones de la empresa
✅ Las categorías mostradas dependen de los sectores 
   habilitados durante el registro de la empresa 
   (filtro permanente — ver Doc 21 §7)
```

---

## 8. Integración con otros módulos

El **Módulo Más** actúa como punto de acceso y personalización. No duplica información. Cada apartado consume la información desde su módulo oficial correspondiente. Darivo Pro Admin continúa siendo la fuente oficial de la información compartida.

### Mi Plan

- Mi Plan obtiene toda su información desde **Darivo Pro Admin → Gestión de Suscripciones** (`04-PANEL-ADMIN-SUSCRIPCIONES.md`).
- Darivo Pro únicamente consulta y muestra la información autorizada al usuario.
- La administración de planes y suscripciones se realiza exclusivamente desde Darivo Pro Admin.
- Catálogo oficial de planes: **Básico** y **Pro** (definidos en `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6).
- Pasarela oficial de pago: **dLocal API** (`08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.3 · producto dLocal Go).
- Un pago fallido no cancela inmediatamente el plan del usuario; debe permitirse el reintento antes de bajar el plan (`04` §13).
- La cancelación mantiene el acceso del usuario hasta el fin del periodo pagado (`04` §13).

### Soporte

- Soporte obtiene toda su información desde **Darivo Pro Admin → Soporte** (`09-PANEL-ADMIN-SOPORTE.md`).
- **Modelo oficial de dos niveles** (`08-MODULO-IA.md` §3):
  - **IA de Soporte** (Agente IA 2): primer nivel — preguntas frecuentes, uso de la app, incidencias comunes, creación y consulta de tickets.
  - **Soporte Humano** (Admin): segundo nivel — tickets escalados automáticamente cuando la IA no puede resolver con certeza.
- **Regla obligatoria:** la IA nunca inventa soluciones sin certeza; deriva automáticamente al soporte humano mediante ticket.
- Desde Darivo Pro el usuario interactúa con el **Agente IA 2** vía esta sección o vía Módulo IA (`08-MODULO-IA.md` §11).
- También podrá crear incidencias manualmente (Asunto + Descripción), consultar incidencias y revisar respuestas del soporte humano.
- Estados oficiales del ticket: **Nuevo**, **En proceso**, **Resuelto** (`09` §5).
- El **cierre** del ticket (estado Resuelto) corresponde al **Soporte Humano** en incidencias escaladas.
- No existen categorías de incidencia ni prioridades (`09` §5, §13).
- La administración del soporte se realiza exclusivamente desde Darivo Pro Admin.

### Catálogo

- El Catálogo obtiene el Catálogo Maestro y la Tarifa Pro desde **Darivo Pro Admin → Catálogo Maestro** (`10-PANEL-ADMIN-CATALOGO-MAESTRO.md`).
- El **Catálogo Maestro** tiene una única administración oficial en **Darivo Pro Admin** (`01-VISION-DEL-PRODUCTO.md` §11; Doc 21 §4).
- Ningún otro producto puede administrar el Catálogo Maestro.
- **Mis Tarifas** es la personalización del Catálogo Maestro para cada empresa. Su gestión corresponde al **Gerente** desde **Darivo Pro Empresa** y **Darivo Pro Móvil** (`01-VISION-DEL-PRODUCTO.md` §11; Doc 21 §8 y §19).
- Desde ambos productos el gerente puede personalizar precios, activar o desactivar partidas y gestionar únicamente las tarifas de su empresa.
- La empresa únicamente podrá personalizar: Mis Tarifas, categorías propias, partidas propias y sectores habilitados.
- Nunca podrá modificar la Tarifa Pro ni el Catálogo Maestro.
- Las actualizaciones de Tarifa Pro desde Admin nunca eliminan ni sobrescriben las personalizaciones de la empresa (`10` §8).

### Roles, planes y permisos

- Darivo Pro Móvil no administra Roles, Planes ni Permisos (`12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` §16; `01-VISION-DEL-PRODUCTO.md` §8).
- Únicamente aplica las restricciones del plan de suscripción y los permisos definidos por Darivo Pro Empresa cuando corresponda.
- Los roles del cliente son **Gerente** y **Técnico** (`01-VISION-DEL-PRODUCTO.md` §8).
- El **Gerente** administra **Mis Tarifas** desde Darivo Pro Móvil y Darivo Pro Empresa (`01-VISION-DEL-PRODUCTO.md` §11).
- El **Técnico** no administra el Catálogo Maestro ni Mis Tarifas. Únicamente consulta y utiliza la información necesaria conforme a los permisos asignados (`01-VISION-DEL-PRODUCTO.md` §11; Doc 21 §8 y §19).

### Empresa

- Empresa administra únicamente los datos propios de la empresa.
- No modifica información de otros módulos.

### Informes

- Informes no genera información propia.
- Consolida información procedente de: Clientes, Cotizaciones y Facturación.
- Informes únicamente consulta y presenta la información sin duplicarla.

---

## 9. Regla oficial de Más

- El **Módulo Más** actúa como punto de acceso y personalización.
- No duplica información.
- Cada apartado consume la información desde su módulo oficial correspondiente.
- Darivo Pro Admin continúa siendo la fuente oficial de la información compartida.

---

*Este documento describe el **Módulo Más** de Darivo Pro únicamente. Para planes, ver `04-PANEL-ADMIN-SUSCRIPCIONES.md`. Para soporte Admin, ver `09-PANEL-ADMIN-SOPORTE.md`. Para roles y permisos, ver `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md`. Para el Catálogo Maestro (precios base), ver `10-PANEL-ADMIN-CATALOGO-MAESTRO.md`. Para los agentes IA, ver `08-MODULO-IA.md`.*

---

## 10. Estado del documento

**Versión:** 2.2

**Estado:** Diseño y funcionalidad oficial aprobados.

**Cambio principal (v2.2):** §6 — plan actual ampliado a Básico, Pro o Business (sincronizado con `04-PANEL-ADMIN-SUSCRIPCIONES.md` v1.6).

**Versión:** 2.1

**Estado:** Diseño y funcionalidad oficial aprobados.

**Cambio principal (v2.1):** modelo oficial soporte IA + humano en §6 y §8 — escalado automático, regla de no inventar soluciones, cierre por soporte humano.

**Cambio principal (v2.0):** sincronización con `08-MODULO-IA.md` v1.5 — Agente IA 2 en Soporte e IA — Preferencias actualizado para dos agentes oficiales.
