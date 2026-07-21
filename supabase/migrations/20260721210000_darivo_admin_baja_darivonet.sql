-- ════════════════════════════════════════════════════════════════════════════
-- DARIVO PRO — ETAPA 5 (21/07/2026), pregunta abierta #3 (decisión confirmada
-- por el propietario): darivonet@gmail.com queda ELIMINADO como Admin.
-- El único Admin real es yatriye@gmail.com.
-- ⚠️ ENTREGADA SIN EJECUTAR (regla permanente de BD): Mohamed la corre en el
--    SQL Editor de Supabase, en SEXTO lugar, DESPUÉS de
--    20260721120000_pago_fallido_solo_lectura.sql,
--    20260721160000_rls_etapa2_correcciones.sql,
--    20260721180000_facturas_bizlinks_esquema.sql,
--    20260721190000_perfiles_ruc_emisor_check.sql y
--    20260721200000_factura_items_tabla_preparada.sql
--    (orden cronológico de timestamp; técnicamente esta no depende de ninguna
--    de las anteriores — solo toca una fila de darivo_admin_empleados).
--
-- ── VERIFICACIÓN DE SCHEMA (regla permanente CLAUDE.md 11/07/2026) ──────────
-- public.darivo_admin_empleados — CREATE TABLE en
-- 20260705120000_baseline_v2.sql:446-455 (extracto literal):
--
--   CREATE TABLE public.darivo_admin_empleados (
--     id           uuid         DEFAULT uuid_generate_v4() PRIMARY KEY,
--     user_id      uuid         NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
--     email        text         NOT NULL,
--     nombre       text,
--     cargo        text,
--     departamento text,
--     activo       boolean      NOT NULL DEFAULT true,   -- ← columna clave
--     created_at   timestamptz  DEFAULT now()
--   );
--
-- ALTER TABLE posteriores sobre esta tabla (búsqueda exhaustiva 21/07/2026 en
-- las 23 migraciones): SOLO baseline_v2.sql:787 (ENABLE ROW LEVEL SECURITY) —
-- ninguno modifica columnas. La tabla real es exactamente la del extracto.
--
-- ── DECISIÓN: DESACTIVAR (activo=false), no DELETE ──────────────────────────
-- La tabla tiene columna `activo` y TODO el código que decide quién es Admin
-- filtra por ella, no por existencia de fila:
--   · is_darivo_admin() (RLS, baseline_v2.sql:599-604): `AND d.activo = true`.
--   · esAdministradorDarivo() (app, frontend/src/lib/acceso-producto.ts,
--     Etapa 4 #1): consulta solo filas `activo=true`.
--   · El panel Admin → Empleados ya gestiona Activar/Desactivar como flujo
--     normal (soft-toggle), nunca borra filas.
-- Desactivar es por tanto el patrón coherente de la tabla: corta el acceso de
-- forma idéntica a un DELETE (ambas fuentes filtran activo=true) y además
-- conserva la fila como rastro auditable de que esa cuenta FUE admin y se dio
-- de baja — preferible en una auditoría de seguridad a un borrado sin rastro.
--
-- ── IDEMPOTENCIA / SEGURIDAD ─────────────────────────────────────────────────
-- UPDATE con WHERE por email (case-insensitive): si la fila no existe, afecta
-- 0 filas y termina sin error; si ya está `activo=false`, la deja igual.
-- Se puede correr N veces con el mismo resultado.
--
-- ── EFECTO SOBRE EL ACCESO (ya garantizado por el fix #1 de la Etapa 4) ──────
-- Tras correr esto, darivonet@gmail.com NO puede entrar a admin.darivopro.com:
-- `esAdministradorDarivo()` usa la tabla como fuente principal (solo filas
-- activas) y la env `DARIVO_ADMIN_EMAILS` es solo fallback de arranque — que
-- según la instrucción #2 debe contener ÚNICAMENTE yatriye@gmail.com en Vercel
-- Production. No hace falta tocar más código.
-- ⚠️ Antes o después de correr esto, confirmar que yatriye@gmail.com SÍ tiene
-- fila activa en esta tabla (Admin → Empleados) — si darivonet fuera la única
-- fila activa y se desactiva, la tabla queda sin filas activas y el acceso cae
-- al fallback env (que con #2 aplicado = solo yatriye@gmail.com; sin lockout
-- en ningún caso, pero mejor dejar la tabla como fuente real con su fila).
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

UPDATE public.darivo_admin_empleados
SET    activo = false
WHERE  lower(email) = 'darivonet@gmail.com'
  AND  activo = true;

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- Verificación posterior (opcional, solo lectura):
--   SELECT email, activo, created_at
--   FROM public.darivo_admin_empleados
--   ORDER BY created_at;
-- Esperado: ninguna fila con lower(email)='darivonet@gmail.com' y activo=true;
-- yatriye@gmail.com presente con activo=true.
-- FIN Etapa 5 #3.
-- ════════════════════════════════════════════════════════════════════════════
