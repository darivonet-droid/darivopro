# LANDING-PAGE-DARIVO-PRO.md

# DARIVO PRO — LANDING PAGE PÚBLICA (darivopro.com)

**Versión:** 1.2

**Estado:** ✅ Documento oficial — actualizado por el propietario (07/07/2026)

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

**Lo que NO debe tener:**

* Nada de gradientes morados/violeta genéricos de SaaS.
* Nada de iconos 3D flotantes.
* Nada de frases genéricas tipo "Revoluciona tu negocio con IA" o similares.
* Nada de scroll largo multi-sección al estilo landing SaaS tradicional.

**Lo que SÍ debe tener:**

* Estética natural, cercana al maestro de obra peruano — no corporativa, no fría.
* Misma filosofía que el producto: **menos es más, más rápido es mejor**.
* Inspiración estructural (no visual) en ManyChat: mensaje directo, poco texto, una acción clara.
* Un timer real en el hero, **"0:47"**, conectado al mensaje **"Una factura en un minuto"** — debe sentirse creíble, no como una promesa vacía.
* **Un único CTA**: "Empieza gratis" → `/registro`. No hay CTAs secundarios compitiendo (nada de "Ver demo", "Contactar ventas", etc. en el hero).

---

# 3. Imágenes oficiales

Tres imágenes oficiales para esta landing, con nombre de archivo y ruta fijados para que Next.js las reconozca automáticamente:

| Imagen | Nombre de archivo | Ruta | Uso |
|---|---|---|---|
| **Icono** | `icon.png` | `frontend/src/app/icon.png` | Favicon del navegador — solo la calculadora, sin texto |
| **Logotipo** | `logo-darivo-pro.png` | `frontend/public/logo-darivo-pro.png` | Header de la landing y demás usos de marca completa (calculadora + "DARIVO PRO" + eslogan) |
| **Landscape** | `opengraph-image.png` | `frontend/src/app/opengraph-image.png` | Vista previa al compartir el enlace `darivopro.com` por WhatsApp/redes sociales |

Ninguna de las tres sustituye al vídeo del hero (sección 4) — son elementos de marca/SEO, no el contenido visual principal de la página.

---

# 4. Estructura de la página (definitiva — versión simple, 07/07/2026)

Estructura oficial confirmada por el propietario, sustituye la versión de borrador anterior (que tenía pasos, categorías, features y testimonios):

```
1. HERO
   - Mensaje principal: "Una factura en un minuto"
   - Subtítulo corto: qué hace Darivo Pro, en una frase
   - VÍDEO de 47 segundos a 1 minuto, alojado en YouTube u otra
     plataforma de vídeo — sustituye a la captura estática del móvil.
     El vídeo muestra el producto real en uso.
   - Un único CTA: "Empieza gratis" → /registro
   - Sin timer numérico aparte del propio vídeo (el vídeo ya demuestra
     la velocidad, no hace falta el badge "0:47" si el vídeo lo prueba)

2. PLANES
   - Los 3 planes oficiales: Básico, Pro, Business
   - Fuente única: 04-PANEL-ADMIN-SUSCRIPCIONES.md §6 — no duplicar
     ni inventar precios aquí; leer siempre de esa fuente
   - Precios marcados como provisionales mientras el propietario no
     confirme los definitivos
   - Cada plan tiene su propio botón de acción: "Regístrate" → /registro
     (no hay un único CTA global para los 3 — cada plan registra
     directamente a ese plan)

3. FOOTER
   - Términos y condiciones
   - Política de privacidad
   - Contacto (WhatsApp u otro canal)
```

**No incluir en esta versión** (eliminado respecto al primer borrador/mockup):

* Sección de "Así de fácil" / pasos numerados.
* Grid de categorías (Construcción, Fontanería, Pintura, Electricidad).
* Grid de "Todo lo que necesitas" / features sueltas.
* Testimonios — ver regla explícita en sección 5.1.

No añadir ninguna sección adicional sin aprobación explícita del propietario — la página completa son 2 bloques (Hero + Planes) más el footer, nada más.


---

# 5. Reglas de contenido

* El texto debe hablar en el idioma y tono de un maestro de obra peruano — directo, sin anglicismos innecesarios, sin jerga corporativa.
* La moneda mostrada es siempre S/ (soles).
* Cualquier mención a IA debe ser concreta (qué hace, no "inteligencia artificial revolucionaria") — coherente con `08-MODULO-IA.md`.
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

* Los 3 planes y sus precios: **siempre leer de `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6**, nunca hardcodear un precio distinto en el código de la landing.
* Capturas o vídeo de producto: deben reflejar el diseño real aprobado de Fable 5 (`01-darivo-pro-movil/16-SISTEMA-DE-DISEÑO-FABLE5.md`), nunca un mockup inventado que no coincida con la app real. El vídeo del hero (§4) debe grabarse sobre la app real, no una animación o recreación.

---

# 7. Estado del documento

✅ Documento oficial completo. Sin imagen oficial aprobada todavía — ver mockup de referencia adjunto (no oficial, solo orientativo para iniciar la construcción).

## Protección del documento oficial

Solo el propietario del proyecto está autorizado a modificar este documento. Ninguna IA podrá cambiarlo sin autorización expresa.

**Fin del documento.**
