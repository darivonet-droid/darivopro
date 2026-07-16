# INVENTARIO DE PROVEEDORES Y SERVICIOS QUE TRATAN DATOS — DARIVO PRO

**Última actualización:** 16/07/2026 (revisión Fase 2 — Legal: corregido el estado de Google Workspace, que ya estaba integrado en código y seguía listado como "no integrado"; añadido GitHub)

**Objetivo:** Lista completa y verificada contra el código real de todo servicio de terceros que trata datos de usuarios de Darivo Pro (clientes, sus clientes, o el propio equipo). Esta lista debe estar **completa y reflejada en `POLITICA-DE-PRIVACIDAD-DARIVO-PRO.md`** antes de publicar la política definitiva — es un requisito de RGPD (UE/España) y de la Ley de Protección de Datos Personales de Perú (Ley N.º 29733).

⚠️ **Revisar y actualizar esta lista cada vez que se añada un proveedor nuevo.** No añadir ninguna integración de terceros al producto sin añadirla aquí primero.

---

## Servicios ya integrados (confirmado en código, revisado 16/07/2026)

| Proveedor | Qué datos toca | Para qué | Dónde en el código |
|---|---|---|---|
| **Supabase** | Todos los datos de la aplicación: usuarios, clientes, cotizaciones, facturas, empleados, roles | Base de datos, autenticación, almacenamiento de archivos (PDF de facturas/cotizaciones vía Storage) | Variables `SUPABASE_*` en `.env` |
| **Vercel** | Todo el tráfico de la aplicación web (indirectamente, como alojamiento) | Hosting/despliegue de la aplicación Next.js | Despliegue del proyecto |
| **Google Workspace / Gmail API** | Email del destinatario, nombre, y el contenido del propio correo transaccional (ej. bienvenida, confirmación de pago, comisión ganada) | Envío de correos transaccionales del servicio, vía domain-wide delegation desde 5 cuentas del dominio (`info@`, `facturacion@`, `noreply@`, `partners@`, `soporte@darivopro.com`) | `frontend/src/lib/email/` (`gmail-client.ts`, `accounts.ts`, `send.ts`, `templates.ts`) — código integrado; envío real pendiente de que el propietario complete el setup de Google Cloud (`GMAIL_SERVICE_ACCOUNT_JSON`) |
| **OpenAI** | Texto de las consultas del usuario al asistente de IA (cotizaciones, análisis de gastos/fotos) | Funcionalidades de inteligencia artificial (Agente IA 1 y 2) | `frontend/src/lib/openai.ts`, `frontend/src/app/api/ia/*` |
| **dLocal Go** | Datos de pago (Darivo Pro **no** almacena el número completo de tarjeta — el checkout ocurre en dominio de dLocal), email, monto de la suscripción | Procesamiento de pagos de suscripción, vía checkout redirect | `frontend/src/lib/dlocal.ts`, `frontend/src/app/api/pagos/*` |
| **Railway** | Datos que pase el backend Python (uso legacy/opcional, ver README) | Hosting del backend FastAPI, si se usa | `backend/.env` |
| **GitHub** | Código fuente del proyecto únicamente — **no procesa datos personales de usuarios finales de Darivo Pro** | Repositorio de código + pipeline de CI/CD (`.github/workflows/deploy.yml`) | Sin integración funcional en producción (verificado: sin llamadas a la API de GitHub desde el código de la app) |

## Servicios planeados, no integrados todavía

| Proveedor | Qué datos tocaría | Para qué | Estado |
|---|---|---|---|
| **Google (OAuth)** | Email, nombre, foto de perfil de Google | Inicio de sesión con Google para Móvil/Empresa | ❌ No implementado — pendiente (ver conversación 07/07/2026) |
| **Proveedor OSE de facturación electrónica** (Bizlinks u otro) | Datos completos de las facturas emitidas (RUC, montos, líneas) | Emisión de comprobantes electrónicos certificados ante SUNAT | ❌ No contratado — bloqueado hasta respuesta de Bizlinks (`01-VISION-DEL-PRODUCTO.md` §18) |

## Cookies propias del servicio (no son "proveedores", pero tratan datos — ver `POLITICA-DE-COOKIES-DARIVO-PRO.md`)

| Cookie | Qué datos toca | Para qué | Dónde en el código |
|---|---|---|---|
| Cookies de sesión de Supabase Auth | Token de sesión del usuario logueado | Mantener la sesión iniciada | Gestionadas por `@supabase/ssr` vía `middleware.ts` |
| `darivo_ref` | Código de Partner (atribución de referido), 30 días, primera parte, `httpOnly` | Registrar qué Partner refirió al nuevo usuario que se registra | `frontend/src/app/ref/[codigo]/route.ts`, `frontend/src/lib/ecosystem-store.ts` |

**Confirmado en código (16/07/2026): no hay ningún rastreador de analítica/marketing de terceros** (se buscó Google Analytics, Meta Pixel, Hotjar, Clarity, Mixpanel, Amplitude, PostHog — cero coincidencias) ni ningún banner de consentimiento de cookies implementado.

## Herramientas internas del equipo (no del producto, pero pueden contener datos de clientes)

| Herramienta | Qué datos podría contener | Nota |
|---|---|---|
| **WhatsApp (wa.me)** | Ninguno tratado por Darivo Pro — es un enlace que abre WhatsApp del propio usuario, no se envían datos a Meta desde el servidor de Darivo Pro | Aclaración importante: esto NO es un tratamiento de datos por parte de Darivo Pro, es el usuario enviando su propio PDF desde su propio WhatsApp |

---

## Antes de publicar la Política de Privacidad definitiva

- [ ] Confirmar región de los servidores de Supabase (afecta a si hay transferencia internacional de datos fuera de la UE).
- [ ] Confirmar región de los servidores de Vercel.
- [ ] Confirmar si OpenAI usa las consultas para entrenar modelos (revisar configuración de cuenta — normalmente se puede desactivar) y documentarlo.
- [ ] Añadir Google en cuanto se implemente el login (no antes, no dejar mención de algo que no existe).
- [ ] Añadir el proveedor OSE de facturación electrónica en cuanto se contrate.
- [x] Pasar esta lista completa a `POLITICA-DE-PRIVACIDAD-DARIVO-PRO.md` §4 (tabla de proveedores) — hecho 16/07/2026, sigue pendiente la revisión legal final.
- [ ] Confirmar con abogado si Google Workspace necesita mención explícita como encargado de tratamiento (procesa email/nombre de los destinatarios de correos transaccionales del propio producto, no solo uso interno de soporte).
- [ ] Confirmar con abogado si la cookie `darivo_ref` (atribución de Partner) requiere consentimiento previo bajo la normativa de cookies (RGPD/ePrivacy y Perú) o puede tratarse como estrictamente necesaria/funcional sin banner — ver `POLITICA-DE-COOKIES-DARIVO-PRO.md`.

**Recordatorio:** este archivo y la Política de Privacidad se revisan juntos — no se publica la política sin que esta lista esté 100% actualizada y reflejada en ella.
