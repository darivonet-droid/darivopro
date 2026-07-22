# CI/CD — job de Supabase eliminado a propósito (12/07/2026)

`deploy.yml` **ya no tiene** un job `supabase-migrate` (que hacía `supabase db push` automático en cada push a `main`). Se eliminó deliberadamente, no se rompió por error — si en el futuro aparece un fallo de CI mencionando Supabase/migraciones, **no reconstruyas ese job**, primero confirma con el propietario.

Motivo: ese job saltaba en silencio la regla permanente de este documento ("Migraciones de base de datos — cómo entregarlas") de que el SQL se entrega escrito en el chat y **Mohamed lo corre él mismo en el SQL Editor** — nunca un push automático a la BD real. Además fallaba en cada ejecución por un bug de resolución de ruta (`content_path` de `supabase/config.toml` se resolvía relativo al directorio de ejecución del CLI, no al de `config.toml`, así que nunca encontraba `supabase/templates/recovery.html` aunque el archivo sí existía y estaba comiteado). Se decidió eliminar el job en vez de arreglar la ruta, porque el flujo automático en sí ya no se usa y viola la política de "Base de datos" de más arriba (una de las 2 excepciones que siempre requieren confirmación explícita).

`test-frontend`, `test-backend` y `deploy-backend` (Railway) siguen intactos — no tocan la base de datos.

