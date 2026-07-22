# ✅ Resuelto — `main` ya no está detrás de `develop` (era cierto el 12/07/2026, ya no)

La alarma de abajo (escrita 12/07/2026) quedó obsoleta: verificado hoy (15/07/2026) con `git log main..develop` → **0 commits** — `develop` no tiene nada que `main` no tenga ya. Los 3 puntos que preocupaban en su momento ya están en `main`: el fix de caché offline (`extendDefaultRuntimeCaching: true` presente en `frontend/next.config.mjs:14`), la separación de PWA Admin/Empresa vs Móvil, y el fix de precio Pro en `UpgradeModal` — todo llegó a `main` como parte del trabajo de Admin/Empresa de las sesiones 13–14/07/2026 (commits `1b8e7d8` y posteriores). No hay ninguna acción pendiente aquí.

<details><summary>Texto original de la alarma (12/07/2026), dejado como historial — ya no vigente</summary>

`main` local == `origin/main` exacto (0 commits de diferencia) — es fiel a lo que está desplegado. Pero **`develop` tiene trabajo real que nunca llegó a `main`, y parte de ese trabajo ni siquiera estaba comprometido como commit** (estaba solo en el working tree, sin `git commit`, hasta hoy):

1. 1 commit de `develop` sin mergear a `main`: `a6e8123 fix(plan): leer precio Pro de PRECIOS_OFICIALES en UpgradeModal`.
2. Toda la sesión "Landing page y PWA — mejoras técnicas 12/07/2026" (ver sección propia más abajo) — apple-touch-icon, íconos PWA 192/512/512-maskable, `metadataBase`+OG/Twitter, `aria-hidden` en iconos decorativos, migración de `<a>` a `next/link`, y **el fix del bug real de caché offline** (`extendDefaultRuntimeCaching: true` faltante) — **estuvo sin comitear hasta hoy**. Esto significa que **el bug de caché offline roto sigue vivo en producción ahora mismo** (verificado: `main` no tiene `extendDefaultRuntimeCaching` en `next.config.mjs`).
3. La separación de PWA Admin/Empresa vs Móvil (pedida y construida hoy mismo, ver sección "Problemas abiertos" más abajo) — tampoco comiteada todavía.
4. `develop` está 39 commits por delante de `origin/develop` (tampoco pusheado al remoto) — todo el trabajo vive únicamente en esta máquina local.

</details>

**Acción pendiente de decisión del propietario:** revisar el diff de `develop` (los 3 bloques de arriba), decidir si se comitea/pushea/mergea a `main`, y en qué orden. Nada de esto se comiteó en esta sesión de diagnóstico (era solo lectura, según lo pedido).

