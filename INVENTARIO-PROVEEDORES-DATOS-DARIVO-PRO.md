# INVENTARIO DE PROVEEDORES Y SERVICIOS QUE TRATAN DATOS — DARIVO PRO

**Última actualización:** 07/07/2026

**Objetivo:** Lista completa y verificada contra el código real de todo servicio de terceros que trata datos de usuarios de Darivo Pro (clientes, sus clientes, o el propio equipo). Esta lista debe estar **completa y reflejada en `POLITICA-DE-PRIVACIDAD-DARIVO-PRO.md`** antes de publicar la política definitiva — es un requisito de RGPD (UE/España) y de la Ley de Protección de Datos Personales de Perú (Ley N.º 29733).

⚠️ **Revisar y actualizar esta lista cada vez que se añada un proveedor nuevo.** No añadir ninguna integración de terceros al producto sin añadirla aquí primero.

---

## Servicios ya integrados (confirmado en código, 07/07/2026)

| Proveedor | Qué datos toca | Para qué | Dónde en el código |
|---|---|---|---|
| **Supabase** | Todos los datos de la aplicación: usuarios, clientes, cotizaciones, facturas, empleados, roles | Base de datos, autenticación, almacenamiento de archivos | Variables `SUPABASE_*` en `.env` |
| **Vercel** | Todo el tráfico de la aplicación web (indirectamente, como alojamiento) | Hosting de la aplicación Next.js | Despliegue del proyecto |
| **OpenAI** | Texto de las consultas del usuario al asistente de IA (cotizaciones, análisis de gastos/fotos) | Funcionalidades de inteligencia artificial (Agente IA 1 y 2) | `frontend/src/lib/openai.ts`, `frontend/src/app/api/ia/*` |
| **dLocal Go** | Datos de pago (no el número completo de tarjeta), email, monto de la suscripción | Procesamiento de pagos de suscripción | `frontend/src/lib/dlocal.ts`, `frontend/src/app/api/pagos/*` |
| **Railway** | Datos que pase el backend Python (uso legacy/opcional, ver README) | Hosting del backend FastAPI, si se usa | `backend/.env` |

## Servicios planeados, no integrados todavía

| Proveedor | Qué datos tocaría | Para qué | Estado |
|---|---|---|---|
| **Google (OAuth)** | Email, nombre, foto de perfil de Google | Inicio de sesión con Google para Móvil/Empresa | ❌ No implementado — pendiente (ver conversación 07/07/2026) |
| **Proveedor OSE de facturación electrónica** (Bizlinks u otro) | Datos completos de las facturas emitidas (RUC, montos, líneas) | Emisión de comprobantes electrónicos certificados ante SUNAT | ❌ No contratado — bloqueado hasta respuesta de Bizlinks (`01-VISION-DEL-PRODUCTO.md` §18) |

## Herramientas internas del equipo (no del producto, pero pueden contener datos de clientes)

| Herramienta | Qué datos podría contener | Nota |
|---|---|---|
| **Google Workspace** | Correos de soporte con clientes, datos que un cliente comparta por email/WhatsApp al equipo | Uso interno del equipo (Mohamed + freelancers), no integrado en el producto |
| **WhatsApp (wa.me)** | Ninguno tratado por Darivo Pro — es un enlace que abre WhatsApp del propio usuario, no se envían datos a Meta desde el servidor de Darivo Pro | Aclaración importante: esto NO es un tratamiento de datos por parte de Darivo Pro, es el usuario enviando su propio PDF desde su propio WhatsApp |

---

## Antes de publicar la Política de Privacidad definitiva

- [ ] Confirmar región de los servidores de Supabase (afecta a si hay transferencia internacional de datos fuera de la UE).
- [ ] Confirmar región de los servidores de Vercel.
- [ ] Confirmar si OpenAI usa las consultas para entrenar modelos (revisar configuración de cuenta — normalmente se puede desactivar) y documentarlo.
- [ ] Añadir Google en cuanto se implemente el login (no antes, no dejar mención de algo que no existe).
- [ ] Añadir el proveedor OSE de facturación electrónica en cuanto se contrate.
- [ ] Pasar esta lista completa a `POLITICA-DE-PRIVACIDAD-DARIVO-PRO.md` §4 (tabla de proveedores) antes de la revisión legal final.
- [ ] Confirmar con abogado si Google Workspace (uso interno del equipo) necesita mención explícita al no ser parte del producto pero sí tocar datos de clientes vía soporte.

**Recordatorio:** este archivo y la Política de Privacidad se revisan juntos — no se publica la política sin que esta lista esté 100% actualizada y reflejada en ella.
