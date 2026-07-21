# Auditoría 12/07/2026 — Admin/Empresa/Partner (sesión continua, 3 agentes en paralelo)

Auditoría de solo lectura + correcciones puntuales. Corregido en el momento (ver commit `fix: hallazgos de auditoría Admin/Empresa/Partner`): silent failures en `AdminEmpresasView`/`AdminPartnersView` (la UI daba por bueno un cambio que en realidad había fallado en Supabase), KPI "Onboarding pendiente" duplicado/engañoso, sección "Tiempos de pago" faltante en Panel Partner (el MD la agregó el 11/07 y nadie la había conectado a la UI todavía), color de estado "Suspendido" mostrado en verde.

**Pendiente — hallazgos reales, no corregidos todavía (requieren más que un fix puntual, o una decisión de alcance):**

- ~~**Admin — Usuarios**~~ ✅ **Resuelto 12/07/2026** — ver arriba.
- ~~**Admin — Partners**~~ ✅ **Resuelto 12/07/2026** — ver arriba.
- ~~**Empresa — Cotizaciones**~~ ✅ **Resuelto 12/07/2026** — ver arriba.
- ~~**Empresa — Ficha de Cliente**~~ ✅ **Resuelto 12/07/2026**: panel lateral dentro de `EmpresaShell`, ver arriba.
- ~~**Nota relacionada:** el wizard de cotización sigue sin adaptarse al layout de 3 paneles de escritorio...~~ ✅ **Resuelto 14/07/2026** — ver "Auditoría MD↔código Empresa" más abajo (`NuevoCotizacionWizardEscritorio.tsx`, los 3 puntos de entrada reales ya enlazan ahí). Esta nota había quedado desactualizada, escrita antes de ese trabajo.
- ~~**Empresa — Invitar empleado**~~ ✅ **Resuelto 13/07/2026** — ver arriba. Decisión de diseño tomada: reutiliza el propio invite de Supabase Auth (no una tabla de tokens propia ni uno de los 9 emails transaccionales).
- ~~**Empresa — Empleados:** faltan las acciones "Editar" y "Permisos" por fila; "Última actividad" nunca se escribe~~ ✅ **Resuelto el mismo 12/07/2026** — ver "Cambios mergeados a main" más abajo (acciones Editar/Permisos añadidas, columna "Última actividad" real conectada a login).
- ~~**Partner — visibilidad de comisiones**~~ ✅ **Resuelto 12/07/2026** (sesión continua siguiente): `mapPartner()` consulta `partner_comisiones_historial`, `PartnerPanel.tsx` muestra totales + listado.
- ~~**Partner — acceso tras suspensión:** `/partner` se gatea solo por allowlist de email, independiente de `partners.estado`~~ ✅ **Resuelto el mismo 12/07/2026** — ver "Cambios mergeados a main" más abajo (`esPartnerAutorizado()` ahora consulta `partners.estado` real, deniega si `Suspendido`).

