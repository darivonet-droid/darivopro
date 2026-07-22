# Cuenta de prueba QA (permanente)

Para probar cualquier feature (facturación, IA, roles personalizados, Empresa) sin depender de una cuenta real:

- **Email:** `demo@darivopro.com`
- **Plan:** `business` (acceso total — facturación, IA ilimitada, roles personalizados, producto Empresa)
- **Credenciales (las 4 cuentas demo — admin/partner/empresa/móvil): en `.env.test` (raíz del repo), no versionado — pedir al owner si no está presente en el entorno local.** Formato del archivo:
  ```
  QA_ADMIN_EMAIL=
  QA_ADMIN_PASSWORD=
  QA_PARTNER_EMAIL=
  QA_PARTNER_PASSWORD=
  QA_EMPRESA_EMAIL=
  QA_EMPRESA_PASSWORD=
  QA_MOVIL_EMAIL=
  QA_MOVIL_PASSWORD=
  ```
  `QA_MOVIL_EMAIL` corresponde a `demo@darivopro.com` de arriba. No pegar estos valores en el chat aunque se lean — usarlos solo para iniciar sesión en el navegador de la preview.
- **Creación:** Supabase Dashboard → Authentication → Users → Add user (email de arriba, contraseña a elección, "Auto Confirm User"). El trigger `handle_new_user()` crea el `perfiles` automáticamente en plan `gratis`/`onboarding_done=false` — después de crear el usuario, correr en el SQL Editor:
  ```sql
  UPDATE public.perfiles
  SET plan_tipo = 'business', onboarding_done = true, razon_social = 'Constructora Demo QA'
  WHERE id = (SELECT id FROM auth.users WHERE email = 'demo@darivopro.com');
  ```
- **Datos de ejemplo:** un cliente + una cotización de muestra (para probar historial de cliente, "Re-cotizar" y PDF desde el primer momento) — SQL opcional:
  ```sql
  WITH u AS (SELECT id FROM auth.users WHERE email = 'demo@darivopro.com'),
  c AS (
    INSERT INTO public.clientes (user_id, nombre, telefono, ciudad)
    SELECT id, 'Cliente Demo QA', '51987654321', 'Lima' FROM u
    RETURNING id, user_id
  ),
  q AS (
    INSERT INTO public.cotizaciones (user_id, cliente_id, client_name, phone, city, margin, total_base, total_labor, total_final, status)
    SELECT c.user_id, c.id, 'Cliente Demo QA', '51987654321', 'Lima', 40, 850, 340, 1190, 'Aprobado' FROM c
    RETURNING id
  )
  INSERT INTO public.cotizacion_items (cotizacion_id, svc_id, cat_label, svc_label, calc_type, base_price, unit, qty, unit_price, subtotal)
  SELECT q.id, 'alb-muro', 'Albañilería', 'Muro de ladrillo', 'm2', 85, 'm²', 10, 85, 850 FROM q;
  ```
  La factura de prueba es mejor crearla en vivo desde la app (prueba el flujo real de numeración/detracción/PDF) en vez de insertarla directo en BD.
- No documentar aquí ninguna otra cuenta de prueba de **Móvil** — reutilizar siempre `demo@darivopro.com` para que quede permanente entre sesiones.

### Cuenta de prueba QA — Partner (permanente, 15/07/2026)

- **Email:** `demo1@gmail.com` (ya existía en Authentication, proyecto `vyrtokggypcmpforglch`) — corresponde a `QA_PARTNER_EMAIL` de `.env.test` de arriba.
- **Fila en `partners`:** `codigo='DEMO1'`, `enlace='https://darivopro.com/ref/DEMO1'`, `estado='Activo'`, `nombre='Partner Demo QA'` — creada vía SQL entregado en esta sesión (`INSERT ... ON CONFLICT (email) DO UPDATE`, ver historial de chat si hace falta reconstruirla).
- **Allowlist:** el email debe estar en `DARIVO_PARTNER_EMAILS` (env var, coma-separada) para que `esPartnerAutorizado()` conceda acceso — confirmar que está puesta tanto en `.env.local` como en Vercel Production si se quiere probar en ambos entornos; no se pudo confirmar en esta sesión si Vercel Production ya la tiene (no soy yo quien la puso — el propietario logró entrar a `/partner` en producción, así que a esa altura ya estaba configurada correctamente, pero no verifiqué el valor exacto).
- Reutilizar esta cuenta para cualquier verificación futura del Panel Partner — no crear otra.

