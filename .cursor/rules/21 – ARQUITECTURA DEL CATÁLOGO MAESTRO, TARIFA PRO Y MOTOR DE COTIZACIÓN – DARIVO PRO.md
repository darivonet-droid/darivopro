# 21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO

**Versión:** 1.4

**Estado:** Arquitectura oficial propuesta

**Cambio principal (v1.4):** corregida numeración de pasos del wizard de cotización en §13 y §15 (líneas antes referenciadas como "Paso 2 — Resumen") para alinear con la secuencia oficial de 4 pasos de `05-MODULO-COTIZACIONES.md` v1.6 (Paso 1 Selección, Paso 2 Cantidades, Paso 3 Resumen, Paso 4 Cliente). Sin cambio de contenido funcional.

**Cambio principal (v1.3):** añadida sección 4.1 — incorporación de `productos_master` como nivel superior a Sectores en la jerarquía del Catálogo Maestro, sincronizado con `01-VISION-DEL-PRODUCTO.md` §3.1 y `02-BASE-DATOS.md` §4.7.

**Cambio principal (v1.2):** corregida referencia rota a "07 – MÓDULO CONFIGURACIÓN" (archivo inexistente) → "07 – MÓDULO MÁS" (`07-MODULO-MAS.md`), sincronizado con `01-VISION-DEL-PRODUCTO.md` §5 y §16.

---

# 1. Objetivo

Este documento define la arquitectura oficial del funcionamiento del **Catálogo Maestro**, **Tarifa Pro**, **Mis Tarifas** y el **Motor de Cotización** de Darivo Pro.

Su objetivo es que cualquier empresa pueda comenzar a trabajar desde el primer minuto, sin tener que configurar manualmente categorías, partidas o precios.

---

# 2. Filosofía

Darivo Pro prepara toda la inteligencia del sistema.

La empresa únicamente trabaja y personaliza aquello que necesita.

La configuración nunca será un requisito para empezar a utilizar la aplicación.

---

# 3. Arquitectura General

La arquitectura se divide en cuatro componentes principales:

- Darivo Pro Admin
- Configuración (Darivo Pro)
- Cotizaciones
- Resumen de Cotización

Cada componente tiene responsabilidades claramente definidas.

---

# 4. Darivo Pro Admin

Darivo Pro Admin es el único lugar donde Darivo administra el conocimiento del sistema.

El **Catálogo Maestro** tiene una única administración oficial. Su gestión corresponde exclusivamente a **Darivo Pro Admin**. Desde Darivo Pro Admin se crean, modifican, actualizan y mantienen los servicios, materiales, categorías y la Tarifa Pro. Ningún otro producto puede administrar el Catálogo Maestro.

Desde este módulo se gestionan:

- Sectores profesionales
- Plantillas de negocio
- Categorías
- Partidas
- Tipos de cálculo
- Tipos de precio
- Tarifa Pro
- Estados
- Actualizaciones

La empresa nunca modifica esta información.

## 4.1 Nivel de Producto (`productos_master`)

El Catálogo Maestro tiene un nivel de clasificación adicional, superior a Sectores: el **Producto del ecosistema** (`01-VISION-DEL-PRODUCTO.md` §3.1; `02-BASE-DATOS.md` §4.7).

Jerarquía completa:

```
Producto (Darivo Pro Admin / Móvil / Empresa — tabla productos_master)
    ↓
Sector profesional (sección 5)
    ↓
Categoría
    ↓
Partida
```

* El **Producto** determina qué aplicación puede consumir esa parte del catálogo (Móvil, Empresa o Admin). Es un filtro independiente de **Sector** — Sector filtra por actividad profesional (construcción, electricidad, etc.); Producto filtra por aplicación del ecosistema.
* El **Programa Partner** no participa en esta clasificación — no es un producto (`01-VISION-DEL-PRODUCTO.md` §3.2).
* La administración de este nivel corresponde exclusivamente a Darivo Pro Admin, igual que el resto del Catálogo Maestro.

---

# 5. Sectores Profesionales

Cada plantilla pertenece a uno o varios sectores.

Ejemplos:

- Construcción
- Electricidad
- Gasfitería
- Pintura
- Carpintería
- Drywall
- Climatización
- Jardinería
- Mantenimiento
- Limpieza
- Otros

---

# 6. Plantillas de Negocio

Cada sector dispone de una plantilla preparada por Darivo.

Cada plantilla contiene:

- Categorías
- Partidas
- Tipo de cálculo
- Tipo de precio
- Tarifa Pro
- Estado

Estas plantillas representan el conocimiento profesional de cada sector.

---

# 7. Registro y filtrado del Catálogo Maestro

Esta sección documenta el comportamiento oficial del registro de empresas y el filtrado del catálogo dentro de la arquitectura del Catálogo Maestro.

## Registro de la empresa

Durante el registro, la empresa deberá seleccionar los sectores o categorías profesionales en los que desarrolla su actividad.

Puede elegir:

- Un sector
- Dos sectores
- Todos los sectores que necesite

Esta selección determina los sectores habilitados para esa empresa dentro del Catálogo Maestro.

Darivo Pro habilita automáticamente esos sectores para la empresa.

## Filtro automático del catálogo

Los sectores seleccionados durante el registro actuarán como un **filtro permanente** del Catálogo Maestro.

Cuando la empresa cree una cotización, Darivo Pro mostrará únicamente los sectores, categorías y partidas correspondientes a su actividad.

El usuario nunca visualizará sectores o categorías que no tenga habilitados.

## Ejemplos

**Empresa de Fontanería**

→ Solo visualizará Fontanería.

**Empresa de Electricidad + Fontanería**

→ Visualizará únicamente Electricidad y Fontanería.

**Empresa de Construcción**

→ Visualizará Construcción y seguirá el flujo oficial documentado en la sección 15:

```
Construcción

↓

Subcategoría

↓

Partidas

↓

Resumen
```

Esta excepción aplica únicamente al sector Construcción debido al gran volumen de partidas.

El resto de sectores mantienen el flujo estándar documentado en la sección 15:

```
Categoría

↓

Partidas

↓

Resumen
```

## Objetivo funcional

- Reducir el número de opciones visibles.
- Adaptar el catálogo al tipo de empresa.
- Evitar mostrar información innecesaria.
- Mantener la rapidez de creación de cotizaciones.
- Mantener la filosofía de Tarifa Pro.

---

# 8. Configuración (Darivo Pro)

Configuración es un módulo opcional.

Su función es permitir que cada empresa personalice su catálogo.

Puede:

- Gestionar Mis Tarifas
- Cambiar precios
- Añadir partidas propias
- Crear categorías propias
- Desactivar partidas
- Añadir nuevos sectores

Nunca modifica la Tarifa Pro.

La gestión de **Mis Tarifas** corresponde al **Gerente** desde **Darivo Pro Empresa** y **Darivo Pro Móvil**. Desde ambos productos el gerente puede personalizar precios, activar o desactivar partidas y gestionar únicamente las tarifas de su empresa. Estas acciones nunca modifican el Catálogo Maestro.

El **Técnico** no administra el Catálogo Maestro ni Mis Tarifas. Únicamente consulta y utiliza la información necesaria conforme a los permisos asignados.

---

# 9. Tarifa Pro

La Tarifa Pro pertenece exclusivamente a Darivo.

Darivo administra:

- Categorías
- Partidas
- Tipos de cálculo
- Tipos de precio
- Precios de referencia
- Sectores
- Actualizaciones

La empresa nunca modifica la Tarifa Pro.

---

# 10. Mis Tarifas

Mis Tarifas pertenecen exclusivamente a la empresa.

Puede:

- Crear precios propios
- Modificar precios
- Crear partidas nuevas
- Crear categorías nuevas
- Desactivar partidas

Los cambios únicamente afectan a esa empresa.

---

# 11. Motor Inteligente de Precios

Cada vez que una empresa crea una cotización Darivo Pro sigue siempre la misma regla.

## Prioridad

1. Buscar la partida en Mis Tarifas.

2. Si existe:

Utilizar ese precio.

3. Si no existe:

Utilizar automáticamente la Tarifa Pro.

El usuario nunca decide qué precio utilizar.

Todo ocurre automáticamente.

---

# 12. Tipos Oficiales de Cálculo

Todas las partidas utilizan uno de los siguientes tipos oficiales.

- Unidad
- Metro cuadrado (m²)
- Metro lineal (ml)
- Metro cúbico (m³)
- Hora
- Día (Jornal)
- Precio fijo

No existen otros tipos de cálculo.

---

# 13. Funcionamiento del Motor de Cálculo

Cada partida conoce internamente su tipo de cálculo.

Cuando el usuario completa el control correspondiente en el **Resumen** del wizard de cotización (`05-MODULO-COTIZACIONES.md` §2 Paso 3 · Reglas 4–7):

Darivo Pro calcula automáticamente el importe.

Ejemplos

Unidad

Cantidad × Precio

m²

Metros cuadrados × Precio

Metro lineal

Metros × Precio

Metro cúbico

m³ × Precio

Hora

Horas × Precio

Día

Jornales × Precio

Precio fijo

Siempre utiliza el mismo importe.

El usuario nunca selecciona el tipo de cálculo.

---

# 14. Tipos de Precio

Cada partida dispone de un precio.

Puede proceder de:

- Mis Tarifas
- Tarifa Pro

La prioridad siempre será:

Mis Tarifas

↓

Tarifa Pro

---

# 15. Flujo de Cotización

## Flujo oficial de navegación del Catálogo Maestro

Todas las categorías del Catálogo Maestro siguen el mismo patrón de navegación.

El usuario nunca selecciona partidas directamente desde la pantalla principal.

Primero selecciona una categoría y posteriormente entra en una pantalla específica de esa categoría.

Esa pantalla reutiliza el mismo diseño oficial de Fable 5.

No existen diseños diferentes para cada categoría.

Únicamente cambia la información mostrada.

## Ejemplo

```
Nueva cotización

↓

Categorías disponibles

- Construcción
- Fontanería
- Electricidad
- Pintura
- Carpintería
- Climatización
- ...

↓

El usuario pulsa una categoría.

↓

Se abre una nueva pantalla utilizando el mismo diseño oficial de Fable 5.
```

## Comportamiento por categoría

### Fontanería

Al entrar en Fontanería se muestran directamente todas las partidas de Fontanería.

Ejemplo:

- Punto de agua
- Cambio de tubería
- Instalación de grifo
- Desagüe
- ...

↓

Resumen

### Electricidad

Al entrar en Electricidad se muestran directamente todas las partidas de Electricidad.

↓

Resumen

### Pintura

Al entrar en Pintura se muestran directamente todas las partidas de Pintura.

↓

Resumen

### Construcción

Construcción es la única excepción.

Debido al elevado número de partidas, la pantalla de Construcción muestra primero subcategorías de navegación.

Ejemplo:

- Albañilería
- Cimentaciones
- Estructuras
- Encofrados
- Techos
- Pisos
- Acabados

Al seleccionar una subcategoría se muestran únicamente sus partidas.

↓

Resumen

## Flujo resumido

**Resto de categorías (flujo estándar):**

```
Categoría

↓

Partidas

↓

Resumen
```

**Construcción (excepción):**

```
Construcción

↓

Subcategoría

↓

Partidas

↓

Resumen
```

## Objetivo de esta arquitectura

- Mantener un único diseño para todas las categorías.
- Reutilizar completamente la interfaz oficial de Fable 5.
- Evitar listas con cientos de partidas.
- Facilitar la búsqueda de servicios.
- Mantener una navegación uniforme en toda la aplicación.
- Conseguir que la creación de una cotización siga siendo rápida y sencilla.

## Reglas de navegación

- No modificar el diseño oficial de Fable 5.
- No crear pantallas diferentes para cada categoría.
- La diferencia entre categorías es únicamente el contenido mostrado.
- Solo Construcción incorpora un nivel adicional de subcategorías debido al volumen de partidas.

## Pasos comunes tras seleccionar partidas

Una vez las partidas están seleccionadas, el usuario accede a **Cantidades** (Paso 2) y luego al **Resumen** (Paso 3 del wizard — `05-MODULO-COTIZACIONES.md`). El flujo continúa igual para todos los sectores:

1. Introducir únicamente el dato necesario por partida (control según tipo)

↓

2. Darivo calcula automáticamente el importe, subtotales y total

↓

3. Validar completitud del Resumen (Regla 8)

↓

4. Cliente → confirmación y guardado definitivo (Regla 10)

---

# 16. Flujo Inteligente del Resumen

El Resumen se construye **dinámicamente** únicamente con las partidas seleccionadas por el usuario (`05-MODULO-COTIZACIONES.md` Reglas 5–7). Solo aparecen las partidas que forman parte de la cotización. No existe calculadora genérica: cada fila adapta sus controles al tipo de cálculo del Catálogo Maestro.

Las partidas se **agrupan por categoría** y respetan el **orden del Catálogo Maestro** (`orden`). El usuario no puede reordenarlas manualmente (Regla 9).

El Resumen representa en todo momento el **estado actual** de la cotización: cualquier modificación recalcula importe de partida, subtotales y total general sin información desactualizada (Reglas 7–8).

Si el usuario vuelve atrás a la selección de partidas, las mediciones se conservan mientras la partida permanezca seleccionada (Regla 6).

El Resumen adapta automáticamente la interfaz.

Si la partida es por unidad:

Mostrar únicamente:

Cantidad

Precio

Total

Si la partida es por m²

Mostrar:

Metros cuadrados

Precio

Total

Si la partida es por metro lineal

Mostrar:

Metros

Precio

Total

Si la partida es por metro cúbico

Mostrar:

m³

Precio

Total

Si la partida es por hora

Mostrar:

Horas

Precio

Total

Si la partida es por día

Mostrar:

Jornales

Precio

Total

Si la partida es por precio fijo

Mostrar únicamente:

Precio

Total

Nunca solicitar cantidad.

---

# 17. Regla de Diseño

Darivo Pro nunca muestra al usuario:

- Tipo de cálculo
- Tipo de precio
- Fórmulas

Solo muestra los campos que necesita completar.

No existe calculadora genérica en el Resumen: cada partida expone únicamente el control de su tipo (Regla 5 — `05-MODULO-COTIZACIONES.md` §4).

Toda la lógica permanece oculta.

---

# 18. Actualización de Tarifa Pro

Cuando Darivo mejora el sistema puede:

- Añadir nuevas partidas
- Añadir categorías
- Añadir sectores
- Mejorar plantillas
- Actualizar precios de referencia

Nunca:

- Elimina Mis Tarifas
- Modifica precios personalizados
- Sobrescribe categorías propias
- Sobrescribe partidas propias

Si una empresa no tiene una tarifa propia continuará utilizando automáticamente la Tarifa Pro actualizada.

---

# 19. Responsabilidades

## Darivo (Darivo Pro Admin)

- Administra exclusivamente el Catálogo Maestro.
- Administra el conocimiento.
- Mantiene la Tarifa Pro.
- Actualiza plantillas.
- Investiga nuevos sectores.
- Mejora continuamente el catálogo.

## Gerente (Darivo Pro Empresa y Darivo Pro Móvil)

- Gestiona Mis Tarifas.
- Personaliza precios.
- Activa o desactiva partidas.
- Añade partidas propias.
- Añade nuevos sectores.
- Gestiona únicamente las tarifas de su empresa.
- Utiliza el sistema para crear cotizaciones.

Las acciones del Gerente nunca modifican el Catálogo Maestro.

## Técnico

- No administra el Catálogo Maestro.
- No administra Mis Tarifas.
- Consulta y utiliza la información necesaria conforme a los permisos asignados.

## Principio oficial

- Existe un único Catálogo Maestro para todo el ecosistema Darivo Pro.
- Cada empresa dispone de sus propias Mis Tarifas, derivadas del Catálogo Maestro.
- Las personalizaciones realizadas por una empresa no modifican el Catálogo Maestro ni afectan a otras empresas.

---

# 20. Objetivo Final

El objetivo de esta arquitectura es que cualquier empresa pueda:

- Registrarse.
- Seleccionar uno o varios sectores.
- Empezar a trabajar inmediatamente.

Sin configurar:

- Categorías
- Partidas
- Tipos de cálculo
- Precios
- Fórmulas

Darivo Pro prepara toda la inteligencia.

La empresa únicamente trabaja.

Esta arquitectura materializa la promesa del producto:

> **"Una cotización, un minuto. Una factura, un minuto."**

---

# 21. Integración con otros módulos

El **Resumen** es el punto oficial de integración entre los módulos de Cotizaciones, Clientes y Facturación.

## Flujo 1

Cotización

↓

Categoría

↓

Partida

↓

Resumen

↓

Cliente

↓

Factura

## Flujo 2

Cliente

↓

Nueva Cotización

↓

Resumen

↓

Factura

La arquitectura completa de Clientes y Facturación se documenta en sus respectivos documentos oficiales.

---

# 22. Relación con otros documentos

Este documento es la referencia oficial para:

- 03 – MÓDULO CLIENTES – DARIVO PRO.
- 05 – MÓDULO COTIZACIONES – DARIVO PRO.
- 06 – MÓDULO FACTURACIÓN – DARIVO PRO.
- 07 – MÓDULO MÁS – DARIVO PRO.
- 10 – PANEL ADMIN – CATÁLOGO MAESTRO – DARIVO PRO ADMIN.
- 22 – METODOLOGÍA OFICIAL DE IA – DARIVO PRO.

Todos estos documentos deberán respetar la arquitectura definida en este documento y no podrán definir una lógica diferente.

---

# 23. Referencias cruzadas

- El Documento 21 es la arquitectura oficial del Catálogo Maestro, Tarifa Pro, Mis Tarifas y Motor de Cotización.
- Los documentos 03, 05, 06, 07 y 10 implementan esa arquitectura en sus respectivos módulos.
- El documento 05 define las **Reglas 1–10** del flujo manual de cotizaciones (v1.5).
- El Documento 22 define la metodología oficial que deberán seguir todas las IA al analizar o implementar esta arquitectura.

---

# Estado del documento

**Estado:** Arquitectura oficial propuesta.

Este documento será la referencia funcional para:

- Darivo Pro Admin
- Darivo Pro
- Más
- Cotizaciones
- Motor de cálculo
- Tarifa Pro
- Mis Tarifas
- Futuras implementaciones
