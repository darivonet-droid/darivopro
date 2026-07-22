# 05 – FRONTEND – DARIVO PRO

**Versión:** 2.4

**Fecha:** 16/07/2026 (actualizado 21/07/2026)

**Cambio v2.4 (21/07/2026):** auditoría de coherencia MD↔código — corregido §4 (`/admin/empleados` y guard de Admin ya no dependen solo de allowlist env, tabla `darivo_admin_empleados` es la fuente principal desde Etapa 4) y §5 (Persistencia de Partners ya no es JSON interim, es la tabla real `partners` desde 12/07/2026).

**Estado:** Documento técnico oficial — **Post-V1 ecosistema completo cerrada** (Móvil · Empresa · Admin · Partner)

**Cambio v2.3 (16/07/2026):** **DOC-01 resuelto** — pedido explícito del propietario dentro de "Fase 3 — Darivo" (asistente de soporte). Backend real de tickets construido sobre `soporte_tickets`/`soporte_mensajes` (ya existentes en BD, sin cambio de schema). INC-M01/INC-B01 quedan resueltos como consecuencia; DT-05-04 completada. Ver `01-darivo-pro-movil/08-MODULO-IA.md` v1.10 §3-A y `02-darivo-pro-admin/09-PANEL-ADMIN-SOPORTE.md` v1.3.

**Referencias:**

* `01-VISION-DEL-PRODUCTO.md` §5 · §15 · §16
* `01-darivo-pro-movil/` (módulos 02–09, 07)
* `02-darivo-pro-admin/` (00–12)
* `03-darivo-pro-empresa/` (02–11)
* `05-darivo-pro-partner/PANEL-PARTNER.md`
* `11-AUTORIZACION-MULTI-PRODUCTO-DARIVO-PRO.md`
* `16-SISTEMA-DE-DISEÑO-FABLE5.md` · `16-SISTEMA-DE-DISEÑO-EMPRESA.md`

> **Nota numeración:** En el catálogo oficial, **T05 = Frontend (scaffold)** y **T06 = Sistema de Diseño**. La autorización del propietario «Tarea 06 – Frontend» amplió T05 sin modificar T06 Diseño. Ver `informes/INFORME-06-TAREA-FRONTEND-ECOSISTEMA-FINAL.md`. La ampliación **POST-V1-ECO** completó UI Admin/Empresa/Partner — ver `informes/INFORME-POST-V1-ECOSISTEMA-COMPLETO-FINAL.md`.

---

# 1. Objetivo

Documentar la **estructura frontend implementada** para los cuatro productos del ecosistema en el monorepo Next.js (`frontend/`).

No modifica lógica de negocio ni arquitectura aprobada.

---

# 2. Productos y rutas base

| Producto | Prefijo rutas | Layout | Estado |
|----------|---------------|--------|--------|
| **Darivo Pro Móvil** | `/dashboard`, `/clientes`, `/ia`, `/facturas`, `/cierre`, `/mas` | `(auth)` + `BottomNav` | ✅ Módulos principales + integraciones T07–T11 |
| **Darivo Pro Admin** | `/admin/*` | `AdminShell` sidebar | ✅ Post-V1: Dashboard + módulos UI (Roles, Empresas, Empleados, Partners, Soporte*) |
| **Darivo Pro Empresa** | `/empresa/*` | `EmpresaShell` sidebar | ✅ Post-V1: Inicio + 7 módulos Móvil · Empleados UI |
| **Panel Partner** | `/partner` | Página única | ✅ Post-V1: Perfil + enlace sync Admin + registros + comisiones |

\* Admin Soporte: pipeline de tickets real desde 16/07/2026 — **DOC-01 resuelto** (ver §7).

---

# 3. Darivo Pro Móvil

## 3.1 Navegación oficial (Visión §5)

```
Inicio · Clientes · IA · Facturas · Cierre · Más
```

Implementación: `frontend/src/components/ui/BottomNav.tsx`

* Botón IA central: gradiente **morado** (`T.purple`) — Fable 5 §7
* Cotizaciones: flujo secundario wizard (Selección → Cantidades → Resumen → Cliente — `05-MODULO-COTIZACIONES.md` v1.6; no en nav)

## 3.2 Módulos

| Módulo | Ruta | Componente / MD |
|--------|------|-----------------|
| Inicio | `/dashboard` | `02-MODULO-INICIO.md` — accesos rápidos, capítulos, 4 recientes, enlaces multi-producto |
| Clientes | `/clientes`, `/clientes/[id]` | `03-MODULO-CLIENTES.md` |
| IA | `/ia` | `08-MODULO-IA.md` — OpenAI T07 |
| Facturas | `/facturas`, `/facturas/nueva` | `06-MODULO-FACTURAS.md` |
| **Cierre** | `/cierre` | `09-MODULO-CIERRE.md` — `CierreView` + IA gastos T07 |
| **Más** | `/mas` | `07-MODULO-MAS.md` — `MasTabs` + `MasOpcionesList` |

### Más — subpáginas

| Ruta | Función |
|------|---------|
| `/mas/perfil` | Perfil usuario |
| `/mas/informes` | Informes (Semana/Mes/Anual) |
| `/mas/documentos` | Historial cotizaciones/facturas |
| `/mas/plan` | Mi Plan + checkout dLocal (T08) |
| `/mas/soporte` | Darivo (chat) + `SoporteTicketsView` (tickets reales, API `/api/soporte/tickets`) |
| `/mas/ia-preferencias` | Enlace al módulo IA (T07 activo) |
| `/mas/preferencias` | Preferencias generales |

Compatibilidad: `/ajustes` → redirect `/mas`

## 3.3 Multi-producto (T11)

`ProductosEcosistemaLinks` en `/dashboard` — enlaces a Admin, Empresa y Partner según `acceso-producto.ts`.

## 3.4 Auth y onboarding

Sin cambios — ver `03-AUTENTICACION-DARIVO-PRO.md` v1.0 · guards T11 en middleware.

---

# 4. Darivo Pro Admin

Rutas bajo `/admin` con menú lateral oficial (`00-PANEL-ADMIN-DASHBOARD.md` §4):

| Ruta | MD referencia | Estado UI |
|------|---------------|-----------|
| `/admin` | Dashboard | ✅ KPIs Supabase (service role) · tickets KPI real desde 16/07/2026 |
| `/admin/catalogo` | Catálogo Maestro | ✅ Lectura tablas 015 |
| `/admin/usuarios` | Usuarios | ✅ Listado perfiles + emails |
| `/admin/suscripciones` | Suscripciones | ✅ Catálogo oficial + distribución |
| `/admin/roles` | Roles y Permisos | ✅ `AdminRolesView` — catálogo oficial + límites |
| `/admin/empresas` | Empresas | ✅ `AdminEmpresasView` — perfiles Supabase |
| `/admin/empleados` | Empleados | ✅ `AdminEmpleadosInternosView` — tabla `darivo_admin_empleados` |
| `/admin/apis` | Configuración APIs | ✅ `ApisRegistroView` — §5.1–5.3 |
| `/admin/partners` | Partners | ✅ `AdminPartnersView` — JSON servidor + Server Actions |
| `/admin/soporte` | Soporte | ✅ `AdminSoporteView` — tickets reales, filtros y cambio de estado (16/07/2026) |
| `/admin/configuracion` | Configuración | ✅ Perfil admin |

Shell: `frontend/src/components/admin/AdminShell.tsx`

Guard: `requireProducto("admin")` → `esAdministradorDarivo()` (tabla `darivo_admin_empleados`, fallback allowlist env — T11 v1.1).

**Persistencia Partners:** tabla real `public.partners` (Supabase) vía `lib/ecosystem-store.ts` + `app/admin/partners/actions.ts` — ya no es el JSON interim (`ecosystem-partners.json`) documentado originalmente, migrado a BD real desde 12/07/2026.

---

# 5. Darivo Pro Empresa

Rutas bajo `/empresa` — 9 módulos (`INDICE-OFICIAL-DARIVO-PRO-EMPRESA.md`):

| Módulo | Ruta | Implementación |
|--------|------|----------------|
| Inicio | `/empresa` | ✅ `EmpresaInicioView` (MD Inicio Empresa) |
| Clientes | `/empresa/clientes` | `ClientesView` (Supabase) |
| Cotizaciones | `/empresa/cotizaciones` | `PresupuestosList` |
| Facturas | `/empresa/facturas` | `FacturasView` |
| Cierre | `/empresa/cierre` | `CierreView` |
| IA | `/empresa/ia` | `IAPresupuestoFlow` |
| Más | `/empresa/mas` | `MasTabs` + `MasOpcionesList` |
| Más → Soporte | `/empresa/mas/soporte` | ✅ `SoporteTicketsView` embedded |
| Empleados | `/empresa/empleados` | ✅ `EmpresaEmpleadosView` (localStorage interim) |
| Roles | `/empresa/roles` | `RolesPermisosView` (T11) |

Shell: `frontend/src/components/empresa/EmpresaShell.tsx`

Principio: misma lógica funcional que Móvil, presentación escritorio (AM §2.3).

---

# 6. Panel Partner

Ruta única: `/partner` — `PANEL-PARTNER.md`

| Sección | Estado |
|---------|--------|
| Mi perfil | ✅ Datos de `perfiles` + auth |
| Mi enlace | ✅ Sync Admin vía `getPartnerByEmail` (JSON servidor) |
| Registros | ✅ Lista desde registro partner |
| Comisiones | ✅ Tabla oficial placeholder (solo lectura) |
| Copiar enlace | ✅ Client-side clipboard |

Componente: `frontend/src/components/partner/PartnerPanel.tsx`

Guard: `requireProducto("partner")` (T11).

---

# 7. Deuda técnica

| ID | Descripción | Tarea / Estado |
|----|-------------|----------------|
| DT-05-01 | Tabla BD `gastos` + Storage documentos Cierre | 02 / propietario |
| DT-05-02 | ~~IA análisis gastos~~ | ✅ T07 |
| DT-05-03 | Export expediente mensual | 09 / propietario |
| **DOC-01** | ~~Soporte Móvil ↔ Admin~~ — contradicción `09-PANEL-ADMIN-SOPORTE.md` §11 vs sync | ✅ **Resuelta 16/07/2026** — decisión propietario (Fase 3, Darivo) |
| DT-05-04 | ~~Soporte Móvil ↔ Admin (pipeline autorizado)~~ | ✅ Construido 16/07/2026 |
| DT-05-05 | UI completa Admin por módulo | ✅ Soporte completado 16/07/2026 (DOC-01) |
| DT-05-06 | UI Empresa Empleados | 🟡 Parcial — UI implementada · BD pendiente |
| DT-05-07 | ~~Auth rol Administrador / Partner~~ | ✅ T11 |
| DT-05-08 | Informe Anual dedicado (vs trimestral) | Propietario |
| DT-05-09 | Partner enlace real desde Admin Partners | 🟡 Parcial — JSON interim · BD pendiente |
| DT-05-10 | Matriz permisos Empresa granular | Doc 11 §5.2 |

### Incidencias bloqueadas (post-V1)

| ID | Descripción | Motivo |
|----|-------------|--------|
| ~~INC-M01~~ | ~~Admin Soporte: Ver / Responder ticket (§8)~~ | ✅ Resuelta 16/07/2026 (junto con DOC-01) |
| ~~INC-B01~~ | ~~Filtro por plan en Admin Soporte~~ | ✅ Resuelta 16/07/2026 (junto con DOC-01) |

---

# 8. Validación

| Check | Resultado |
|-------|-----------|
| `npm run typecheck` | ✅ OK (03/07/2026 — post-V1 Fase 8) |
| `npm run build` | ✅ OK — 57 rutas |
| Navegación Móvil Visión §5 | ✅ |
| Guards multi-producto T11 | ✅ |
| Integración Supabase módulos Móvil/Empresa | ✅ |
| Sin `/api/soporte/tickets` | ✅ conforme §11 |

---

# 9. Estado del documento

**Versión:** 2.2 · **Post-V1 ecosistema completo cerrada** (03/07/2026)

**Fin del documento.**
