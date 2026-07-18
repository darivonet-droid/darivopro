# LANDING-PAGE-DARIVO-PRO.md

# DARIVO PRO — LANDING PAGE PÚBLICA (darivopro.com)

**Versión:** 1.5

**Estado:** ✅ Documento oficial — actualizado por Claude Code a pedido explícito del propietario (17/07/2026)

**Cambio principal (v1.5, 17/07/2026):** rediseño de la landing pedido explícitamente por el propietario ("se ve genérica"), con libertad de diseño/estructura. Cambios: (1) el header gana un menú "Productos" (desktop: dropdown; móvil: dentro del menú ☰ nuevo) con acceso directo a los 3 productos del ecosistema — Darivo Pro Empresa, Móvil y Partner, cada uno a su subdominio real (`empresa.`/`app.`/`partner.darivopro.com` — **aún sin conectar en DNS**, ver `frontend/src/middleware.ts` `SUBDOMAIN_ROUTING_ENABLED`, así que estos enlaces no resuelven todavía en producción); (2) nueva sección "Un Darivo Pro para cada parte de tu negocio" (casos de uso por tipo de usuario, dobla como acceso a los 3 productos también en el cuerpo de la página, no solo en el header); (3) nueva franja de confianza con 4 hechos verificables del producto — **nunca testimonios ni cifras de usuarios inventadas**, la prohibición de §4.1 sigue intacta; (4) nuevo widget de chat flotante (burbuja fija, esquina inferior derecha) para visitantes sin cuenta con dudas de planes/precios/funcionamiento — formulario simple (nombre/contacto/mensaje) que envía un correo best-effort a `soporte@darivopro.com` (mismo patrón que los 9 eventos transaccionales de `lib/email/send.ts`) y siempre confirma recepción en pantalla; **completamente independiente del sistema de tickets interno** (`soporte_tickets`/`/api/soporte/*`), sin compartir componente ni backend; sin número de WhatsApp (no existe todavía, se agrega en un prompt aparte cuando lo haya); (5) corregido un subtítulo preexistente ("Miles de maestros y técnicos ya cotizan...") que era una cifra de usuarios no verificable — mismo criterio que la prohibición de testimonios de §4.1, aunque no fuera técnicamente un testimonio. El resto de la estructura v1.3/v1.4 (Hero, Así de fácil, Hecho para tu chamba, Todo lo que necesitas, CTA final, Footer) se mantiene sin cambios de contenido, solo estilo/orden.

**Cambio principal (v1.4, 12/07/2026):** corregido typo en §7 (Footer) — el email de contacto real es `info@darivopro.com`, no `hola@darivo.pro` (dominio distinto de `darivopro.com`, que la empresa no posee — era un error de tipeo, no una decisión de negocio). Alineado con el código (`frontend/src/app/(public)/contacto/page.tsx`), que usaba el mismo typo.

**Cambio principal (v1.3):** el propietario reemplazó la estructura simple de 2 bloques (v1.1/v1.2) por una landing completa de estilo SaaS tradicional, a partir de un diseño de referencia entregado directamente. Esto **deroga explícitamente** la regla de la v1.1 "nada de scroll largo multi-sección al estilo landing SaaS tradicional" — ver §2 actualizado. Cambios: (1) header ampliado con nav "Precios"/"¿Cómo funciona?" y 3 botones (Iniciar sesión, Registrarse, Empieza gratis); (2) el bloque Planes deja de vivir en la landing — ahora se accede vía el enlace "Precios" del header a la página `/precios` ya existente; (3) se añaden las secciones "Así de fácil", "Hecho para tu chamba" (categorías) y "Todo lo que necesitas en tu celular" (features), antes eliminadas en v1.1; (4) vídeo del hero pospuesto — sección omitida por completo en esta versión, sin placeholder, hasta que se grabe sobre la app real; (5) testimonios: la prohibición de la v1.1 (§4.1) **se mantiene vigente sin cambios** — la sección "Maestros que ya lo usan" del diseño de referencia se omite por completo en esta versión, no se implementa con datos de ejemplo; (6) regla nueva de producto: el término "IA" no puede aparecer en ningún texto de cara al usuario — usar siempre "Calculadora inteligente" (ver §5); (7) nuevas imágenes requeridas: foto de maestro de obra en el hero + 4 fotos de categoría (§3) — pendientes, la implementación actual usa placeholders visuales marcados en el código.

**Cambio principal (v1.2):** añadida sección 3 — Imágenes oficiales (icono, logotipo, landscape/Open Graph), con nombre de archivo y ruta exacta para Next.js. Renumeradas las secciones siguientes.

**Cambio principal (v1.1):** estructura simplificada a solo 2 bloques (Hero + Planes) + footer — eliminados pasos, categorías y features como secciones separadas. Añadido vídeo de 47s-1min en el hero (sustituye captura estática). Añadida regla explícita: prohibidos los testimonios hasta tener 3 clientes reales verificables. Aclarado que cualquier mockup compartido durante el desarrollo es solo referencia, nunca la especificación oficial (esta lo es).

**Relacionado:** `01-VISION-DEL-PRODUCTO.md` §3.1, §19 · `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6 (fuente única de planes y precios) · `16-SISTEMA-DE-DISEÑO-ADMIN.md` (no aplica aquí — ver §2)

---

# 1. Objetivo

`darivopro.com` (raíz, sin subdominio) es la página pública de marketing de Darivo Pro — el primer contacto de un maestro de obra o empresa constructora con el producto, antes de registrarse.

**No es un producto del ecosistema** (`01-VISION-DEL-PRODUCTO.md` §3) — es la puerta de entrada. No requiere sesión, no tiene navegación de app, no comparte diseño con Admin/Empresa (`16-SISTEMA-DE-DISEÑO-ADMIN.md` no aplica) ni con Fable 5 (Móvil).

## Relación con subdominios

* `darivopro.com` → esta landing.
* `app.darivopro.com` → Darivo Pro Móvil (Fable 5).
* `empresa.darivopro.com` → Darivo Pro Empresa.
* `admin.darivopro.com` → Darivo Pro Admin.
* `partner.darivopro.com` → Panel Partner.

El botón de acceso ("Empieza gratis") redirige a `/registro`, que vive en este mismo dominio público (`frontend/src/app/(public)/registro`) — el registro no está detrás de un subdominio de producto.

---

# 2. Filosofía de diseño (decisión del propietario)

**Vigente desde v1.3:** el propietario decidió una landing de scroll largo multi-sección tipo SaaS tradicional, a partir de un diseño de referencia — **deroga expresamente** la restricción de v1.1 "nada de scroll largo multi-sección al estilo landing SaaS tradicional". El resto de esta sección sigue vigente.

**Lo que NO debe tener:**

* Nada de gradientes morados/violeta genéricos de SaaS.
* Nada de iconos 3D flotantes.
* Nada de frases genéricas tipo "Revoluciona tu negocio con IA" o similares.
* ~~Nada de scroll largo multi-sección al estilo landing SaaS tradicional~~ — derogado en v1.3, ver arriba.
* **La palabra "IA" no puede aparecer en ningún texto de cara al usuario** (nuevo en v1.3, ver §5) — el producto se comunica siempre como "Calculadora inteligente", nunca como IA.

**Lo que SÍ debe tener:**

* Estética natural, cercana al maestro de obra peruano — no corporativa, no fría.
* Misma filosofía que el producto: **menos es más, más rápido es mejor** (aplica al tono y al copy, ya no al número de secciones — ver derogación arriba).
* Inspiración estructural (no visual) en ManyChat: mensaje directo, poco texto, una acción clara — sigue aplicando dentro de cada sección individual.
* Un timer real en el hero, **"0:47"**, conectado al mensaje **"Una factura en un minuto"** — debe sentirse creíble, no como una promesa vacía.
* El CTA principal del hero es **"Empieza gratis" → `/registro`**. Desde v1.3 el header sí incluye navegación adicional (Precios, ¿Cómo funciona?, Iniciar sesión, Registrarse) — la regla de "único CTA" aplica al hero en sí, no al header.

---

# 3. Imágenes oficiales

Tres imágenes oficiales para esta landing, con nombre de archivo y ruta fijados para que Next.js las reconozca automáticamente:

| Imagen | Nombre de archivo | Ruta | Uso |
|---|---|---|---|
| **Icono** | `icon.png` | `frontend/src/app/icon.png` | Favicon del navegador — solo la calculadora, sin texto |
| **Logotipo** | `logo-darivo-pro.png` | `frontend/public/logo-darivo-pro.png` | Header de la landing y demás usos de marca completa (calculadora + "DARIVO PRO" + eslogan) |
| **Landscape** | `opengraph-image.png` | `frontend/src/app/opengraph-image.png` | Vista previa al compartir el enlace `darivopro.com` por WhatsApp/redes sociales |

⚠️ **Estado real verificado (09/07/2026):** `logo-darivo-pro.png` está corrupto en el repositorio — el archivo es un HTML de WhatsApp Web guardado por error con extensión `.png`, no una imagen. El header usa temporalmente un wordmark de texto ("DARIVO PRO") hasta que se suba el archivo real. `icon.png` es un JPEG válido pero con extensión incorrecta (funciona en navegador, formato mal etiquetado). Solo `opengraph-image.png` es un PNG real y correcto.

Ninguna de las tres sustituye al vídeo del hero (sección 4) — son elementos de marca/SEO, no el contenido visual principal de la página.

## 3.1 Imágenes nuevas requeridas por la estructura v1.3

Añadidas por el diseño de referencia de esta versión — **pendientes, sin archivo real todavía**. La implementación actual usa placeholders visuales (marcados como "Foto pendiente" en el código) hasta que existan:

| Imagen | Sección | Uso |
|---|---|---|
| Foto de maestro de obra con celular | Hero | Junto al mockup del teléfono |
| Foto de categoría — Construcción | Hecho para tu chamba | Tarjeta de categoría |
| Foto de categoría — Fontanería | Hecho para tu chamba | Tarjeta de categoría |
| Foto de categoría — Pintura | Hecho para tu chamba | Tarjeta de categoría |
| Foto de categoría — Electricidad | Hecho para tu chamba | Tarjeta de categoría |

No se fija todavía ruta/nombre de archivo exacto para estas 5 — pendiente de decisión del propietario cuando existan las fotos reales.

---

# 4. Estructura de la página (vigente — v1.5, 17/07/2026)

⚠️ Sustituye por completo la estructura simple de 2 bloques de v1.1/v1.2 (Hero + Planes + Footer). Base: diseño de referencia de v1.3 (7 secciones) + rediseño v1.5 (header con Productos, 2 secciones nuevas, widget de chat) — es la especificación vigente:

```
1. HEADER (frontend/src/components/landing/LandingHeader.tsx)
   - Logo "DARIVO PRO"
   - Nav: "Precios" (→ /precios) · "¿Cómo funciona?" (ancla a la
     sección "Así de fácil") · "Productos" (dropdown desktop / dentro
     del menú ☰ en móvil — nuevo en v1.5): Darivo Pro Empresa/Móvil/
     Partner, cada uno a su subdominio real (sin conectar en DNS
     todavía, ver nota de v1.5 arriba)
   - 3 botones a la derecha: "Iniciar sesión" (→ /login, estilo
     discreto) · "Registrarse" (→ /registro, estilo discreto) ·
     "Empieza gratis" (→ /registro, estilo destacado — mismo peso
     visual que el CTA original)
   - Menú ☰ en móvil (nuevo en v1.5): repite todo el nav de arriba,
     no cabía en el header compacto de celular

2. HERO (fondo navy)
   - Mensaje principal: "Una factura en un minuto"
   - Subtítulo: "Cotiza y factura desde tu celular, PDF directo al
     WhatsApp de tu cliente."
   - 3 chips de valor: "400+ partidas" · "Calculadora inteligente"
     (nunca "IA", ver §5) · "PDF al WhatsApp"
   - Un único CTA: "Empieza gratis" → /registro + micro-copy
     "Sin tarjeta • Sin compromiso • Empieza en 1 minuto"
   - Mockup ilustrativo de teléfono con la UI de cotización (no es
     una captura real de la app — ver nota más abajo)
   - Badge circular "0:47" / "Factura lista en"
   - Foto de un maestro de obra con casco usando su celular
     (pendiente — ver §3.1)
   - SIN vídeo — sección omitida por completo en esta versión,
     sin placeholder. Se decide y añade más adelante.

3. "ASÍ DE FÁCIL" — 3 pasos numerados con flechas
   1. "Elige tu categoría" — construcción, fontanería, pintura,
      electricidad
   2. "La calculadora arma tu cotización" — nunca "La IA arma..."
   3. "PDF al WhatsApp"

4. "UN DARIVO PRO PARA CADA PARTE DE TU NEGOCIO" (nuevo en v1.5)
   3 tarjetas — Darivo Pro Móvil (maestro de obra independiente) ·
   Darivo Pro Empresa (constructora con equipo) · Darivo Pro Partner
   (gana comisión por referir) — cada una enlaza a su subdominio real.
   Casos de uso por tipo de usuario + acceso a producto en el cuerpo
   de la página (no solo en el header).

5. "HECHO PARA TU CHAMBA" — 4 tarjetas de categoría
   Construcción · Fontanería · Pintura · Electricidad, cada una con
   foto (pendiente — ver §3.1) + icono superpuesto + descripción corta.

6. "TODO LO QUE NECESITAS EN TU CELULAR" — 5 features solo-icono
   Ahorra tiempo · Precios actualizados · PDF profesional ·
   Envío directo · Seguro y en la nube.

7. FRANJA DE CONFIANZA (nuevo en v1.5)
   4 hechos verificables del producto (no testimonios, no cifras de
   usuarios) — ver §4.1, la prohibición de testimonios/cifras
   inventadas sigue vigente sin excepción.

8. BANNER CTA FINAL (fondo navy)
   "Empieza gratis hoy mismo" + botón "Empieza gratis →"

9. FOOTER (fondo navy)
   - Logo + tagline
   - Contacto: hasta que exista un número de WhatsApp real confirmado,
     enlaza a /contacto (canal real: info@darivopro.com) — nunca inventar
     un número
   - Horario de atención
   - Términos y condiciones · Política de privacidad
   - Copyright

10. WIDGET DE CHAT FLOTANTE (nuevo en v1.5, visible en toda la página,
    no es una sección del scroll)
    Burbuja fija esquina inferior derecha. Al abrir: mensaje de
    bienvenida + formulario (nombre/contacto/mensaje). Envía correo
    best-effort a soporte@darivopro.com, siempre confirma recepción en
    pantalla. Sin backend de IA ni respuestas automáticas. Sin número
    de WhatsApp (no existe todavía). Completamente independiente del
    sistema de tickets interno (soporte_tickets/mensajes) — no
    comparte componente, tabla ni backend con SoporteTicketsView/
    DarivoChat.
```

**Planes (Básico/Pro/Business) ya NO viven en la landing.** Se accede vía el enlace "Precios" del header, que lleva a la página `/precios` ya existente (que sigue leyendo de `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6, fuente única — sin cambios en esa regla).

**Testimonios:** la sección "Maestros que ya lo usan" del diseño de referencia **no se implementa en esta versión** — se omite por completo, igual que el vídeo. La prohibición de §4.1 (no testimonios con nombre/ciudad hasta 3 clientes reales verificables) sigue vigente sin cambios; cuando existan, se añade con un prompt específico.

**Nota sobre el mockup del teléfono:** es una recreación ilustrativa con CSS (no una captura real de la app) — a diferencia del vídeo del hero, no está sujeto a la regla de §6 de "reflejar el diseño real aprobado de Fable 5" porque no pretende ser una captura fiel, es un elemento decorativo genérico. Si más adelante se reemplaza por una captura real, sí debe cumplir esa regla.


---

# 5. Reglas de contenido

* El texto debe hablar en el idioma y tono de un maestro de obra peruano — directo, sin anglicismos innecesarios, sin jerga corporativa.
* La moneda mostrada es siempre S/ (soles).
* ⚠️ **Nuevo en v1.3 — regla dura, sin excepciones:** la palabra **"IA" no puede aparecer en ningún texto visible de la landing**. Donde el copy original decía "IA" o "IA inteligente", usar siempre **"Calculadora inteligente"**. El producto se comunica como una calculadora propia, nunca como IA, de cara al usuario en esta página. (Esto reemplaza la regla anterior de v1.2 sobre "menciones a IA deben ser concretas" — ya no aplica ninguna mención, concreta o no, en la landing específicamente. `08-MODULO-IA.md` sigue rigiendo el resto del producto donde sí se puede mencionar IA.)
* No mencionar SUNAT, facturación electrónica certificada, ni ningún proveedor OSE hasta que exista contrato confirmado (`01-VISION-DEL-PRODUCTO.md` §18) — evitar promesas que el producto no puede cumplir todavía.
* La página debe verse como el producto profesional de una empresa real — no debe transmitir que es un proyecto pequeño hecho por una sola persona con ayuda de IA.

## 4.1 Testimonios — prohibidos hasta tener clientes reales

⚠️ **No incluir testimonios de clientes en la landing hasta que existan al menos 3 clientes reales, verificables y con permiso explícito para usar su nombre/negocio.**

* Ningún diseño o mockup previo (incluidos ejemplos ya construidos en Cursor) debe tratarse como aprobado en este punto — cualquier testimonio mostrado hasta ahora es de ejemplo, no real, y debe eliminarse o quedar genérico sin nombre/ciudad hasta cumplir la condición anterior.
* Cuando existan los 3 clientes reales, se creará un prompt específico para añadir esa sección — no se añade por defecto ni automáticamente.
* Motivo: mostrar testimonios con nombre y ciudad sin que sean reales y verificables es publicidad engañosa.

## 4.2 Nota sobre diseños/mockups de referencia

Cualquier imagen o mockup que el propietario comparta durante el desarrollo (incluido cualquier diseño ya construido en Cursor) es **siempre un ejemplo de trabajo en curso, nunca la especificación oficial**. La especificación oficial es únicamente el texto de este documento. Si un mockup contradice este documento, prevalece este documento, no el mockup.


---

# 6. Relación con otros documentos

* Los 3 planes y sus precios: **siempre leer de `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6**, nunca hardcodear un precio distinto. Desde v1.3 esto aplica a la página `/precios` (ya no hay tarjetas de plan en la landing misma).
* Capturas o vídeo de producto real: deben reflejar el diseño real aprobado de Fable 5 (`01-darivo-pro-movil/16-SISTEMA-DE-DISEÑO-FABLE5.md`), nunca un mockup inventado que no coincida con la app real. Si se graba el vídeo del hero (pendiente, ver §4) debe ser sobre la app real, no una animación o recreación. El mockup de teléfono decorativo actual (CSS, no captura real) no está sujeto a esta regla — ver nota en §4.

---

# 7. Estado del documento

✅ Documento oficial completo, versión 1.5. Reemplaza v1.4. Imágenes pendientes: logo real (§3, el actual está corrupto), foto de hero y 4 fotos de categoría (§3.1). Pendiente adicional de v1.5: los enlaces a los 3 productos del header/sección 4 no resuelven hasta que se conecte el subdominio en DNS (`SUBDOMAIN_ROUTING_ENABLED`).

## Protección del documento oficial

Solo el propietario del proyecto está autorizado a modificar este documento. Ninguna IA podrá cambiarlo sin autorización expresa.

**Fin del documento.**
