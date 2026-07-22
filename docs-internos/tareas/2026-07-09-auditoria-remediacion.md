# Estado de remediación — Auditoría 09/07/2026 (leer antes de continuar)

Se ejecutó una auditoría de solo lectura (4 agentes en paralelo + verificación directa en producción) comparando MD ↔ BD ↔ código ↔ producción. Nada se modificó en esa sesión. Esta sección es el registro vivo de esos hallazgos — se marca cada punto aquí mismo al corregirlo, no se crean informes nuevos.

**Regla de trabajo:** un punto a la vez, en el orden de abajo. Para cada uno: releer el archivo:línea citado → aplicar el cambio mínimo → verificar en vivo/local que el síntoma desaparece → marcar `[x]` aquí.

### Prioridad 1 — Crítico (páginas públicas / venta)

- [x] **Plan Business ausente en `/precios`.** ✅ Ya resuelto (verificado 11/07/2026): `planes.ts` ya trae los 3 planes desde `PRECIOS_OFICIALES`/`roles-planes-oficial.ts`, y la metadata de `/precios` ya dice "Planes Básico, Pro y Business". Sin cambios necesarios.
- [x] **"IA" visible al usuario.** ✅ Empresa/Admin ya estaban migrados a "Calculadora inteligente" (commit `f1b329a`). Completado Móvil (11/07/2026, sesión continua): `BottomNav.tsx` (aria-label; caption "IA" retirado — no cabe en 7px, icono+aria-label bastan), `(auth)/ia/page.tsx`, `(auth)/mas/ia-preferencias/page.tsx`, `MasOpcionesList.tsx`, `IACotizacionFlow.tsx` (toasts/copys), `planes.ts`, `UpgradeModal.tsx`, `plan-limits.ts`, `PwaShell.tsx`, `CierreView.tsx`. Rutas (`/ia`, `/empresa/ia`, `/mas/ia-preferencias`) y nombres internos (`08-MODULO-IA.md`, `IACotizacionFlow`, etc.) **no se tocaron** — decisión ya implícita en el patrón de Empresa/Admin: solo copy visible cambia, arquitectura/rutas se quedan igual. Pendiente de decisión explícita (no tocado): el dato guardado `"Notas IA: ..."` dentro del texto de la cotización (`IACotizacionFlow.tsx:94`).

### Prioridad 2 — Incumplimiento de MD / bug funcional

- [x] **Bug de facturación:** ✅ Ya resuelto (commit `0a61ae5`, verificado 11/07/2026): `verificarLimiteFactura` (`lib/plan-limits.ts:101-103`) ya bloquea `gratis` igual que `basico`. Sin cambios necesarios.
- [x] **Logout ausente en Admin/Empresa/Partner** — ✅ Ya resuelto (commit `a750f1c`, verificado 11/07/2026): `CerrarSesionButton.tsx` compartido, montado en `AdminShell.tsx`, `EmpresaShell.tsx` y `PartnerPanel.tsx`.
- [x] **Logout enterrado en Móvil** — ✅ Resuelto (11/07/2026, sesión continua): añadido botón real al final de `MasOpcionesList.tsx` (fila roja, mismo estilo de las demás opciones), reutilizando `CerrarSesionButton` (misma lógica que `cerrarSesion` de `AjustesForm.tsx`). Sigue existiendo también en Más → Empresa (`AjustesForm.tsx:141-147`), sin cambios ahí.

### Prioridad 3 — Contradicciones de precio/nombre entre MD

- [x] **Precio Básico: S/39 vs S/49.** ✅ Resuelto (11/07/2026, sesión continua): `04-ROLES-PLANES-PERMISOS-DARIVO-PRO.md` §3 tenía S/39 (v1.3) — unificado a S/49, añadida fila Business (S/120, definitivo) que faltaba. `08-PAGOS-DARIVO-PRO.md` (v1.1) también corregido (mismo precio stale + checkout ya soporta `business`, solo documentaba Básico/Pro). **Pendiente, no tocado:** `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6 sigue marcando S/49 y S/115–120 como "ejemplo/no decidido" pese a que Business ya tiene precio definitivo en código — este documento tiene protección explícita ("queda prohibido modificar por iniciativa propia... informar al propietario y esperar instrucciones"), así que se informa aquí en vez de editarlo: Mohamed debe confirmar y actualizar esa tabla él mismo (o autorizar el cambio explícitamente).
- [x] **Nombre del 3er plan inconsistente dentro del mismo MD** — ✅ Resuelto junto con el punto anterior: `04-ROLES-PLANES-PERMISOS-DARIVO-PRO.md` §4 documentaba `empresa` como "valor técnico legacy", pese a que la migración `20260706123000_plan_tipo_business.sql` ya renombró ese valor a `business` en el CHECK constraint real (confirmado leyendo la migración). Corregido a `business` en todo el documento.

### Prioridad 4 — Documentación desactualizada (no bloquea producto)

- [x] `00-ECOSISTEMA-DARIVO-PRO.md` (`docs/00-ECOSISTEMA-DARIVO-PRO.md`, no en `.cursor/rules/`) — ✅ Resuelto (11/07/2026, sesión continua): dominio actualizado a `darivopro.com`, "Multiempresa" eliminado, Panel Partner añadido (`partner.darivopro.com`, aclarando que no es un producto), referencia rota a `01-VISION-DEL-PRODUCTO.md` corregida, rutas de carpetas de documentación verificadas contra el árbol real.
- [x] `02-BASE-DATOS.md` — ✅ Regenerado por completo (11/07/2026, autorizado explícitamente por Mohamed pese a la cláusula de protección del documento): v3.0. `presupuestos`/`presupuesto_items` → `cotizaciones`/`cotizacion_items` en toda la documentación; eliminadas `perfiles.categorias` y `productos_master.orden`/`updated_at` (no existen en el esquema real); añadidas al inventario `empresas`, `empresa_empleados`, `roles_personalizados`, `partners`, `partner_referidos`, `partner_comisiones_historial`, `soporte_tickets`, `soporte_mensajes`, `suscripciones`, `pagos_eventos`, `darivo_admin_empleados`, `gastos` (12 tablas que solo se mencionaban de pasada). Recuento real verificado: **34 tablas** (no 33 — el baseline crea 32, más `roles_personalizados` y `partner_comisiones_historial` de migraciones incrementales; ninguna se eliminó). Historial de migraciones (§10) completado con las 10 migraciones reales. Nueva deuda técnica documentada (DT-02-06): el trigger de comisiones Partner asume `pagos_eventos.estado='exitoso'` como placeholder sin `CHECK` constraint ni integración real de webhook dLocal todavía — confirmar antes de activar pagos Partner en producción.
- [x] Versionados internos inconsistentes — ✅ Resuelto (11/07/2026, autorizado explícitamente por Mohamed pese a la cláusula de protección del documento): `DARIVO-PRO-ARQUITECTURA-MAESTRA.md` ahora v3.5, cabecera y §12 sincronizados. Referencias a `22`–`25`/`23-A`/`23-B` y a la carpeta `informes/` (todos eliminados en la Tarea 0) quitadas de §3.2, §9.2 y §12.1, remitidas a `CLAUDE.md`. `04-SIMBOLOS-Y-BOTONES.md` sigue documentado como ausente en §3.2/§11.4 (archivo real no existe, no se inventó contenido).
- [x] "Referidos" vs "Partners" — ✅ Resuelto junto con el punto anterior: §11.4 ya no lo presenta como decisión abierta, cerrado alineado con Visión.

### Prioridad 5 — Deuda conocida, no urgente (requiere decisión de negocio)

- [x] La jerarquía "Suscripción → Producto → Rol → Permisos" solo está implementada hasta la mitad — ✅ ARQUITECTURA-MAESTRA §4.6 corregida (11/07/2026, autorizado): ya no la presenta como "secuencia vigente", documenta el estado real (allowlist de emails para Producto, RBAC inerte por `MATRIZ_PERMISOS_APROBADA=false`). **Sigue sin activarse de verdad** — eso sigue pendiente de decisión de Mohamed, no se tocó código, solo la documentación.

### Verificado como coherente en la auditoría — no tocar

Migraciones de terminología cotización (completo) · `roles-planes-oficial.ts` ↔ `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6 · Middleware de subdominios (correctamente apagado) · Landing v1.3 ↔ MD v1.3 · los 3 botones del header · RLS activo en todas las tablas de usuario.

