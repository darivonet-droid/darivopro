# ÍNDICE OFICIAL — DARIVO PRO EMPRESA

**Versión:** 4.3

**Cambio principal (v4.3 — 22/07/2026, pedido explícito del propietario):** eliminado el módulo "Más" del sidebar de Empresa — sus 7 funcionalidades pasan a tener entrada directa, igual que Darivo Pro Admin (`01-VISION-DEL-PRODUCTO.md` §16 v2.19). Fila 7 de §4 actualizada; §6 (imágenes) y §8 (APIs) actualizados para reflejar las 7 pantallas nuevas en vez de una sola "Más".

**Estado:** ✅ **Proyecto Documental Finalizado** — fases §7.1–§7.6 completadas (02/07/2026); navegación reorganizada 22/07/2026 (ver cambio principal arriba)

**Informe fase final:** `INFORME-FASE-FINAL-DARIVO-PRO-EMPRESA.md` v1.0

**Reglas de trabajo:** `REGLAS-OFICIALES-DARIVO-PRO-EMPRESA.md` v2.6

**Referencia estratégica:** `01-VISION-DEL-PRODUCTO.md` §6, §9 y §10

---

# 1. Objetivo

Índice oficial de la documentación de **Darivo Pro Empresa** (`empresa.darivopro.com`).

---

# 2. Documentos transversales

| Documento | Versión | Estado |
|-----------|---------|--------|
| `REGLAS-OFICIALES-DARIVO-PRO-EMPRESA.md` | 2.6 | ✅ Oficial — §15 producción automática |
| `16-SISTEMA-DE-DISEÑO-EMPRESA.md` | 2.7 | ✅ §6.1–§6.9 completos · §6.7 reorganizada (ex-Más) |
| `INFORME-FASE-FINAL-DARIVO-PRO-EMPRESA.md` | 1.0 | ✅ Fases 7.1–7.6 |

---

# 3. Flujo de trabajo (agente)

**Fase activa:** ✅ Completada — no iniciar nuevos módulos sin instrucción del propietario.

### Jerarquía obligatoria

1. `01-VISION-DEL-PRODUCTO.md` — estrategia y reglas del negocio.
2. `01-darivo-pro-movil/` — lógica de negocio, flujo y comportamiento.
3. `02-darivo-pro-admin/` — diseño, layout y componentes visuales de escritorio.
4. `16-SISTEMA-DE-DISEÑO-EMPRESA.md` — adaptación visual oficial Empresa.

---

# 4. Módulos — orden oficial de producción

| Orden | Nº | Módulo | MD Empresa | Imagen | Estado |
|-------|-----|--------|------------|--------|--------|
| 1 | 02 | Inicio | `02-MODULO-INICIO-EMPRESA.md` v2.3 | ✅ | ✅ Producción completada |
| 2 | 03 | Clientes | `03-MODULO-CLIENTES-EMPRESA.md` v1.1 | ✅ | ✅ Producción completada |
| 3 | 05 | Cotizaciones | `05-MODULO-COTIZACIONES-EMPRESA.md` v1.3 | ✅ | ✅ Producción completada — pantalla "lista global" (§3.1) pendiente de imagen |
| 4 | 06 | Facturas | `06-MODULO-FACTURAS-EMPRESA.md` v1.4 | ✅ | ✅ Producción completada |
| 5 | 09 | Cierre | `09-MODULO-CIERRE-EMPRESA.md` v1.0 | ✅ | ✅ Producción completada |
| 6 | 08 | IA | `08-MODULO-IA-EMPRESA.md` v1.4 | ✅ | ✅ Producción completada |
| 7 | 07 | Navegación directa (ex-Más) — 7 pantallas (§3) | `07-MODULO-MAS-EMPRESA.md` v2.0 | ⏳ 7 pendientes | ✅ Documentación reorganizada — imágenes pendientes |
| 8 | 10 | Empleados | `10-MODULO-EMPLEADOS-EMPRESA.md` v1.0 | ✅ | ✅ Producción completada |
| 9 | 11 | Roles y Permisos | `11-ROLES-PLANES-PERMISOS-EMPRESA.md` v1.6 | ✅ | ✅ Producción completada |

**Auditoría de sincronización funcional Móvil↔Empresa (22/07/2026):** 7 módulos compartidos auditados contra su equivalente Móvil vigente; 6 tenían gaps funcionales por desincronización de versión (Empresa se había quedado en una versión antigua de Móvil) — corregidos en esta fecha, ver changelog de cada MD. Cierre no tenía gaps. Detalle: `docs-internos/tareas/2026-07-22-auditoria-sincronizacion-funcional-movil-empresa.md`.

**Corrección de navegación (22/07/2026):** el módulo "Más" (fila 7) se eliminó como pantalla — sus 7 funcionalidades ahora son entradas directas del sidebar (posiciones 6, 9–14). Detalle: `docs-internos/tareas/2026-07-22-eliminacion-modulo-mas-navegacion-directa.md`.

**Completados:** **9 / 9 módulos con documentación** (8 con imagen completa; fila 7 con 7 imágenes pendientes tras la reorganización de navegación).

**Estado producción:** ✅ **Proyecto Documental Finalizado**

---

# 5. Exclusiones (fase técnica final)

* Arquitectura Maestra (salvo referencias ya autorizadas en MD de módulo).
* Base de Datos (`02-BASE-DATOS.md` — aún no existe).
* Código e implementación.
* **Documento oficial de APIs** — registro en `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` v2.1 (§8 índice = referencia).

La **identificación** de necesidades API (§8) sí forma parte de esta fase. No equivale a documentar APIs oficiales.

---

# 6. Fase global de imágenes

**Decisión del propietario (02/07/2026):**

* La ausencia de imagen oficial **no bloquea** la producción documental (Reglas §7.1).
* Generación en **fase única** al completar los 9 módulos — ✅ **ejecutada** (§7.2).

| Módulo | Imagen | Estado |
|--------|--------|--------|
| 02 Inicio | `02 - MODULO INICIO - DARIVO PRO EMPRESA.png` | ✅ |
| 03 Clientes | `03 - MODULO CLIENTES - DARIVO PRO EMPRESA.png` | ✅ |
| 05 Cotizaciones | `05 - MODULO COTIZACIONES - DARIVO PRO EMPRESA.png` | ✅ |
| 06 Facturas | `06 - MODULO FACTURAS - DARIVO PRO EMPRESA.png` | ✅ |
| 09 Cierre | `09 - MODULO CIERRE - DARIVO PRO EMPRESA.png` | ✅ |
| 08 IA | `08 - MODULO IA - DARIVO PRO EMPRESA.png` | ✅ |
| 10 Empleados | `10 - MODULO EMPLEADOS - DARIVO PRO EMPRESA.png` | ✅ |
| 11 Roles y Permisos | `11 - MODULO ROLES Y PERMISOS - DARIVO PRO EMPRESA.png` | ✅ |

**07 — Navegación directa (ex-Más), 22/07/2026:** `07 - MODULO MAS - DARIVO PRO EMPRESA.png` queda **obsoleta** (documentaba un layout de tabs + panel lateral que ya no existe). Pendientes **7 imágenes nuevas**, una por pantalla (`07-MODULO-MAS-EMPRESA.md` §5.1–§5.7): Catálogo·Mis Tarifas, Empresa, Informes, Documentos, Mi Plan, Soporte, Configuración. No bloquea la documentación (Reglas §7.1).

**Nomenclatura oficial:** formato ASCII `NN - MODULO … - DARIVO PRO EMPRESA.png` (coherente en los 8 módulos con imagen vigente).

---

# 7. Fase final post-documentación (obligatoria)

| Orden | Fase | Estado |
|-------|------|--------|
| 1 | **Imágenes oficiales** (§6) | ✅ Completada — 02/07/2026 |
| 2 | **Auditoría visual global** | ✅ Completada — ver informe §7.3 |
| 3 | **Auditoría final ecosistema** | ✅ Completada — ver informe §7.4 |
| 4 | **Identificación necesidades API** (§8) | ✅ Actualizado — registro oficial Admin `08` v2.1 |
| 5 | **Informe preparación producción** | ✅ `INFORME-FASE-FINAL-DARIVO-PRO-EMPRESA.md` |

---

# 8. Registro de APIs (referencia al documento oficial)

**Registro oficial:** `02-darivo-pro-admin/08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` v2.1 (02/07/2026).

**Regla:** no añadir APIs · no cambiar proveedores · no documentar integraciones no aprobadas · APIs de marketing documentadas de forma independiente (§5.5).

### APIs aprobadas relevantes para Empresa

| API | Módulos Empresa | Uso |
|-----|-----------------|-----|
| **Supabase** | Todos | Auth · BD · Storage · RLS |
| **OpenAI API** | IA (08) · Cierre (09) | Inteligencia Artificial del producto |
| **dLocal API** | Mi Plan (07 §5.5) | Suscripciones · cobros · pagos |

### Pendientes de aprobación

| Módulo Empresa | MD | Necesidad | Estado |
|----------------|-----|-----------|--------|
| **Facturas** | `06-MODULO-FACTURAS-EMPRESA.md` | Facturación electrónica (SUNAT o proveedor autorizado) | ⏳ **Pendiente decisión propietario** |

### Excluidas del producto (§5.5 registro Admin)

| API | Motivo |
|-----|--------|
| Meta WhatsApp Cloud API | No utilizada por el producto (`wa.me` = enlace navegador) |
| Meta Marketing API / Meta Ads API | Solo campañas publicitarias — ámbito marketing independiente |

### Sin API externa de negocio

Inicio (02) · Clientes (03) · Cotizaciones (05) · Empleados (10) · Roles (11) · Soporte (07 §5.6 — tickets vía Supabase + Admin).

---

**Fin del documento.**
