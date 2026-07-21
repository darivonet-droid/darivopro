# Problemas abiertos — chequeo 12/07/2026

### 1. Correo de reset-password: a veces muestra la plantilla genérica de Supabase

Investigado (código + búsqueda de issues conocidos de Supabase). Dos causas posibles, no excluyentes:

- **Confirmado por la comunidad de Supabase** (GitHub Discussion #29976): hay un bug conocido donde las plantillas personalizadas configuradas vía el Dashboard **no siempre se aplican en producción** al flujo normal (`resetPasswordForEmail()`), aunque sí funcionan cuando se envía manualmente desde el propio Dashboard (Authentication → Users → "Send password recovery"). Una causa documentada: un error de sintaxis en la plantilla personalizada hace que Supabase caiga en silencio a la plantilla por defecto.
- **Posible bloqueo de plan, más grave si aplica aquí**: desde el 3 de junio de 2026, los proyectos **nuevos** en el tier gratuito de Supabase que usan el proveedor de email por defecto de Supabase **ya no pueden personalizar sus plantillas de Auth en absoluto** — se usan las plantillas por defecto tal cual, sin excepción. Los proyectos gratuitos creados *antes* de esa fecha conservan su plantilla personalizada. **No verificado**: en qué fecha se creó el proyecto `vyrtokggypcmpforglch` y en qué plan está — si se creó después del 3 de junio de 2026 y sigue en tier gratuito con el proveedor de email por defecto, la plantilla personalizada de reset-password simplemente no se puede aplicar vía Dashboard, sin importar cuántas veces se pegue el HTML.

**Acción pendiente del propietario:**
1. Confirmar en Supabase Dashboard → Settings → Billing la fecha de creación del proyecto y el plan actual.
2. Si el proyecto es gratuito y nació después del 3/06/2026: la única forma de tener el texto de marca real en el correo de reset es configurar **SMTP personalizado** (Dashboard → Authentication → SMTP Settings, con las credenciales de `noreply@darivopro.com`) — Supabase sí respeta plantillas personalizadas cuando el envío pasa por SMTP propio, incluso en tier gratuito.
3. Si el proyecto es de pago o nació antes de esa fecha: validar sintaxis de `recovery.html` (sin errores de Go template) y volver a pegarlo, luego probar con un reset real y revisar que llegue con el texto de marca.

No pude verificar la fecha de creación ni el plan desde código — requiere entrar al Dashboard.

### 2. Separación de PWA Móvil vs Admin/Empresa

✅ **Resuelto** — ya en `main` (commit `1b8e7d8`, confirmado en la revisión del 15/07/2026, ver sección "✅ Resuelto — main ya no está detrás de develop" arriba). Verificado en código (no solo en el commit): `manifest: "/manifest.json"` solo está presente en `(auth)/layout.tsx:13` y `onboarding/layout.tsx:10` (rutas de Móvil); `app/layout.tsx:28` documenta explícitamente por qué se quitó de la raíz; Admin/Empresa no lo declaran en ningún layout propio, así que no lo heredan. Sin acción pendiente.

