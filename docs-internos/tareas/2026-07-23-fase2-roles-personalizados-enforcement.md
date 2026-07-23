# 2026-07-23 — FASE 2: roles personalizados, enforcement real (B + A)

**Estado:** construida y verificada en verde (typecheck/lint/build). Pendiente solo: verificación en vivo sobre preview desplegado (código en `develop`, sin mergear a `main`).

## Decisión del propietario (23/07/2026) que desbloqueó Fase 2

En Fase 1 se reportó que construir el enforcement exigía inventar reglas de negocio reservadas al propietario (el catálogo §5.2 seguía "pendiente" y la semántica de combinación no existía). El propietario resolvió:

- **Catálogo del rol personalizado = Factura + Informe únicamente** (el de §5.2 ya aprobado). Nada más.
- **Combinación = reemplazo:** si un Técnico tiene `rol_personalizado_id` asignado, el permiso del ROL rige Factura/Informe y **reemplaza** sus flags individuales (no intersecta). Al desasignar, vuelven a regir los flags individuales (no se borran, quedan en pausa).

## Paso 0 — investigación (resultado)

- **Sin fail-open de seguridad.** Verificado: `roles_personalizados`/`rol_personalizado_id`/`permisos` no se leían en ninguna ruta de decisión de acceso (middleware, layouts, pages, `acceso-producto.ts`, `rol-empleado.ts`) — solo en las 2 vistas de gestión. El acceso real del Técnico lo determinaban solo sus flags + plan; el rol no concedía ni denegaba nada (defecto de UX, no de seguridad).
- El único punto de gating de Factura/Informe del Técnico es `obtenerContextoAcceso()` (`lib/rol-empleado.ts`), consumido por las 5 rutas de `(auth)`: `layout.tsx`, `facturas/page.tsx`, `facturas/nueva/page.tsx`, `mas/informes/page.tsx`, `mas/page.tsx`. Ningún consumidor lee los flags por su cuenta.

## Opción B — honestidad de UX (commits B1, B2)

- **B1** (`lib/roles-personalizados.ts`): `MODULOS_PERMISO_ROL` recortado de 7 módulos a **["Factura", "Informe"]**. El formulario de `RolesPermisosView.tsx` itera esa constante, así que el toggle de **Mis Tarifas** (que contradecía la regla cerrada "el Técnico no administra Mis Tarifas") **se eliminó de raíz**, no solo se ocultó. Inicio/Clientes/Cotizaciones/Cierre/IA no eran permisos toggleables aprobados.
- **B2** (`RolesPermisosView.tsx`): el chip **"🔒 Solo lectura"** contradecía el propio banner ("administrar los permisos") y la capacidad real. Reemplazado por un chip de estado real, condicionado al plan: Business ⇒ "Administras los roles y permisos de tus Técnicos"; sin Business ⇒ "Consulta — requiere plan Business".
- **B3** (aviso de "aún no se aplica"): **no hizo falta** — A se construyó en la misma tanda, así que los permisos del rol sí se aplican.

## Opción A — enforcement real (commit A)

- **A** (`lib/rol-empleado.ts`, `obtenerContextoAcceso()`): en la rama Técnico se selecciona además `rol_personalizado_id`. Si está asignado, se lee `roles_personalizados.permisos` (con guard `.eq("empresa_id", perfil.empresa_id)`) y:
  - `facturaHabilitada = permisos.Factura === true`
  - `informeHabilitado = permisos.Informe === true`
  - reemplazando los flags individuales. Sin rol asignado, rigen los flags (`factura_habilitada`/`informe_habilitado`). Como todas las rutas consumen este objeto, el enforcement aplica en las 5 a la vez — sin duplicar lógica de gating.
- **Sin migración**: A solo lee columnas ya existentes (`rol_personalizado_id`, `roles_personalizados.permisos`), que la UI de asignación ya escribía/leía en producción. **Sin tocar RLS.**

### Aislamiento multi-tenant (paso 6, confirmado, no asumido)

Tres capas garantizan que un rol de Empresa A nunca rija sobre un Técnico de Empresa B:
1. **Tabla**: `roles_personalizados.empresa_id NOT NULL REFERENCES empresas(id)` + `UNIQUE(empresa_id, nombre)`.
2. **RLS** `roles_personalizados_gerente`: lectura/escritura solo de la empresa cuyo `gerente_user_id = auth.uid()`; la lista de asignación de `EmpresaEmpleadosView` es RLS-scoped, así que el Gerente solo puede asignar roles de su empresa.
3. **Guard de lectura** en el enforcement: bajo `service_role` la RLS no aplica, y el filtro `.eq("empresa_id", ...)` ignora cualquier `rol_personalizado_id` cruzado. Si el rol no existe/no es de la empresa, se conservan los flags individuales — nunca se abre acceso por defecto.

## Paso 7 — verificación

- **Verificación estática:** typecheck/lint/build en verde tras cada paso; `next build` completo verde tras A.
- **Traza de la tabla de verdad** (rama Técnico): sin rol ⇒ flags individuales; rol Factura OFF/Informe ON ⇒ pierde Factura, gana Informe; desasignar ⇒ vuelve a flags; rol de otra empresa ⇒ ignorado; Mis Tarifas ⇒ bloqueado siempre (`MasTabs` intacto). Todos los casos coinciden con la spec del propietario.
- **Pendiente — verificación en vivo:** login del Gerente, crear rol Factura OFF/Informe ON, asignarlo a un Técnico de prueba y comprobar el cambio real. Requiere el preview desplegado; el código está en `develop`, **sin mergear a `main`** (no se mergea sin aviso del propietario), y no se usa dev local (regla de proyecto).

## Consideración sobre datos existentes (no bloqueante, sin fail-open)

Roles creados antes de B1 podrían tener `permisos` con claves viejas (p.ej. `"Facturas"`, `"Más — Mis Tarifas"`). El enforcement lee las claves `"Factura"`/`"Informe"`; una clave ausente evalúa a `false` (denegar) — comportamiento **seguro**, no fail-open. Como el sistema era inerte, ninguna conducta en vivo dependía de esos datos; en QA basta re-guardar el rol para adoptar las claves nuevas.

## Documentación actualizada

- `11-ROLES-PLANES-PERMISOS-EMPRESA.md` v1.7 → **v1.8**: §5.2 catálogo cerrado del rol (Factura/Informe); §6.2 tabla de estado con enforcement ✅ + regla de combinación; changelog y §10.
- `matriz-permisos.ts`: celda `roles-personalizados` de `"pendiente"` → `"condicional"`, con `gating` actualizado y comentario citando la decisión del 23/07/2026; corregido también el comentario de cabecera.
- `CLAUDE.md` → ESTADO REAL: cierre de Fase 2 (B+A).

## Commits (rama `develop`, uno por paso)

1. `docs(roles): Fase 1 …` (cierre de Fase 1, que estaba sin commitear)
2. `feat(roles): B1 — catálogo cerrado a Factura + Informe`
3. `fix(roles): B2 — chip de estado real (no "Solo lectura")`
4. `feat(roles): A — enforcement real del rol personalizado`
5. `docs(roles): Fase 2 — cierre (catálogo + enforcement + regla de combinación)`

## No hecho (a propósito)

- No se añadieron módulos al catálogo más allá de Factura/Informe.
- No se inventó una tercera semántica (intersección): es reemplazo.
- No se tocó RLS ni se creó migración. No se mergeó a `main` ni se desplegó.
