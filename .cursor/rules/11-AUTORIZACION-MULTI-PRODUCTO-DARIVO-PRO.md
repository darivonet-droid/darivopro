# 11 – AUTORIZACIÓN MULTI-PRODUCTO Y ROLES EMPRESA – DARIVO PRO

**Versión:** 1.1

**Fecha:** 03/07/2026 (actualizado 21/07/2026)

**Estado:** Documento técnico oficial — capa de implementación (Fase 2)

**Referencias:**

* `03-AUTENTICACION-DARIVO-PRO.md` · DT-03-01
* `02-darivo-pro-admin/12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` §6
* `03-darivo-pro-empresa/11-ROLES-PLANES-PERMISOS-EMPRESA.md` §5–§6
* `04-ROLES-PLANES-PERMISOS-DARIVO-PRO.md`
* Informe auditoría AUD-10-03

---

# 1. Objetivo

Implementar **control de acceso** a rutas Admin, Empresa y Partner, y la **UI base** del módulo Roles y Permisos en Darivo Pro Empresa.

**No se crean tablas BD** ni matriz de permisos fila a fila (pendiente propietario — Doc 11 §5.2).

---

# 2. Autorización por producto

| Producto | Ruta | Regla |
|----------|------|-------|
| **Admin** | `/admin/*` | Tabla `darivo_admin_empleados` (`activo=true`) — fuente principal desde 21/07/2026 (Etapa 4 auditoría RLS). Fallback a `DARIVO_ADMIN_EMAILS` solo si la tabla no tiene ninguna fila activa o no se puede consultar. |
| **Partner** | `/partner/*` | Email en `DARIVO_PARTNER_EMAILS` **y** `partners.estado !== 'Suspendido'` (BD, desde 12/07/2026) |
| **Empresa** | `/empresa/*` | `perfiles.plan_tipo === 'business'` **y** ser `empresas.gerente_user_id` (nunca un Técnico) |
| **Móvil** | `(auth)/*` | Sesión + onboarding (Tarea 03) |

**Denegado:** redirect `/dashboard?acceso={razon}` + banner `AccesoDenegadoBanner`.

---

# 3. Arquitectura

```
frontend/src/lib/
  acceso-producto.ts       — verificación email / producto
  guards/require-producto.ts — guard server layouts

frontend/src/middleware.ts — capa 1 (Admin/Partner/Empresa)

frontend/src/app/
  admin/layout.tsx         — capa 2 requireProducto('admin')
  empresa/layout.tsx       — requireProducto('empresa')
  partner/layout.tsx       — requireProducto('partner')

frontend/src/components/
  acceso/AccesoDenegadoBanner.tsx
  empresa/RolesPermisosView.tsx — matriz estructura Doc 11
```

---

# 4. Configuración

| Variable | Uso |
|----------|-----|
| `DARIVO_ADMIN_EMAILS` | CSV emails Administrador Darivo — **fallback**, solo se usa si `darivo_admin_empleados` no tiene ninguna fila `activo=true` o no se puede consultar |
| `DARIVO_PARTNER_EMAILS` | CSV emails Panel Partner |

Si la lista está **vacía** y no hay fuente alternativa (tabla, para Admin), nadie accede a Admin/Partner (denegar por defecto).

---

# 5. Módulo Roles y Permisos (Empresa)

**Ruta:** `/empresa/roles`

**Implementado:**

* Badge plan contratado (lectura `perfiles.plan_tipo`)
* Tabla estructural de módulos sujetos a permiso
* Aviso: matriz detallada pendiente propietario

**No implementado (Doc 11 §5.2):**

* Toggles persistentes por empleado
* Columnas por Técnico (requiere módulo Empleados + BD)

---

# 6. Deuda técnica

| ID | Descripción |
|----|-------------|
| DT-11-01 | ✅ Resuelto (13/07/2026) — tabla `empresa_empleados` (rol, `factura_habilitada`, `informe_habilitado`) |
| DT-11-02 | Matriz permisos fila a fila (propietario) — sigue pendiente, `MATRIZ_PERMISOS_APROBADA=false` |
| DT-11-03 | ✅ Resuelto (14/07/2026) — 11/11 pantallas Admin completas y verificadas en producción |
| DT-11-04 | ✅ Resuelto (21/07/2026, Etapa 4) — `darivo_admin_empleados` es la fuente principal, allowlist env solo fallback |

---

# 7. Historial

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.1 | 21/07/2026 | Auditoría de coherencia MD↔código: §2/§4 actualizados — Admin ya no se gatea solo por allowlist env, la tabla `darivo_admin_empleados` es la fuente principal (Etapa 4, 21/07/2026); Partner y Empresa también corregidos a su regla real vigente. DT-11-01, DT-11-03 y DT-11-04 marcados resueltos. |
| 1.0 | 03/07/2026 | Guards multi-producto + Roles Empresa UI base |
