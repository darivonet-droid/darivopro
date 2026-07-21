/**
 * DARIVO PRO — Matriz de Roles y Permisos (fuente real, no placeholder)
 *
 * Construida 21/07/2026 (Etapa 6) a partir EXCLUSIVAMENTE de reglas de negocio
 * ya cerradas por el propietario:
 * - Admin: acceso total a su propio panel, aislado, sin condición de pago.
 * - Partner: no es producto — programa gestionado desde Admin; bloqueo/activación
 *   manual vía `partners.estado`, sin regla automática de pago.
 * - Móvil independiente (sin empresa): aislado.
 * - Empresa (Etapa 7, 21/07/2026, decisión 3 — reemplaza el modelo anterior
 *   de la Tarea 2 del 17/07/2026): Gerente = acceso completo dentro del plan,
 *   y activa/desactiva LIBREMENTE cualquier módulo de cada Técnico en
 *   cualquier momento — no son "roles fijos" (Gerente/Técnico como cajas
 *   cerradas), son MÓDULOS ACTIVABLES por empleado
 *   (`empresa_empleados.factura_habilitada`/`informe_habilitado`). Un
 *   Técnico puede tener permisos ampliados sin volverse un segundo Gerente
 *   (nunca administra empleados ni el plan de la empresa, eso sigue exclusivo
 *   del Gerente). Cotización y Cliente son módulos base sin flag, siempre
 *   disponibles. Técnico nuevo invitado nace con Cotización + Cliente +
 *   Factura activas (antes Factura nacía en `false`); Informe sigue opcional
 *   (el Gerente lo activa aparte). Nunca ve "Mis planes".
 * - Técnico vinculado comparte los datos de su empresa aunque entre por Móvil.
 * - Empresa y Móvil: 3 días de gracia tras fallo de pago → solo lectura.
 *   Admin y Partner exentos.
 * - Planes: catálogo de solo lectura, fijo a 3 (Básico/Pro/Business).
 *
 * Toda celda SIN regla cerrada que la defina queda `"pendiente"` — nunca se le
 * asigna un valor por defecto silencioso. La lista de pendientes es una
 * decisión de negocio de Mohamed, no del código.
 *
 * RELACIÓN CON EL GATING REAL (campo `gating`, NO se renderiza en UI):
 * esta matriz es la fuente declarativa única; los puntos de gating ya
 * construidos ANTES de esta etapa siguen implementados en sus propias
 * funciones (middleware/RLS/layouts) y aquí quedan DOCUMENTADOS como reflejo
 * de la matriz — cualquier cambio futuro de una celda debe ir acompañado del
 * cambio en su `gating` citado, y viceversa. Re-cablear cada punto para leer
 * esta constante en runtime es un refactor aparte, no hecho en esta etapa a
 * propósito (decisión documentada en CLAUDE.md, Etapa 6).
 *
 * NO confundir con "Roles personalizados" (RBAC custom por empresa,
 * `roles_personalizados` en BD + RolesPermisosView.tsx) — es un sistema
 * DISTINTO, con su propia decisión de negocio pendiente. Esta matriz cubre los
 * 5 roles del ecosistema, no los roles custom de cada empresa.
 *
 * IMPORTANTE (regla permanente del proyecto): las `nota` y `accion` de este
 * archivo SÍ se renderizan en la UI de Admin — nunca citar en ellas nombres de
 * archivos .md, "§" ni "Doc N". Las referencias documentales van solo en
 * comentarios de código.
 */

export const ROLES_MATRIZ = [
  { id: "admin", label: "Admin" },
  { id: "gerente", label: "Gerente" },
  { id: "tecnico", label: "Técnico" },
  { id: "partner", label: "Partner" },
  { id: "movil", label: "Móvil independiente" },
] as const;

export type RolMatriz = (typeof ROLES_MATRIZ)[number]["id"];

/**
 * - "si": permitido por regla cerrada.
 * - "no": denegado por regla cerrada.
 * - "condicional": depende de un flag/plan real (la nota dice cuál).
 * - "noaplica": la acción pertenece a otro producto y el rol está aislado de él
 *   por regla cerrada (Admin aislado, Partner no-producto, Móvil sin empresa).
 * - "pendiente": SIN regla cerrada — requiere decisión del propietario.
 */
export type ValorPermiso = "si" | "no" | "condicional" | "noaplica" | "pendiente";

export interface CeldaPermiso {
  valor: ValorPermiso;
  /** Se renderiza en la UI — sin nombres de .md, sin "§", sin "Doc N". */
  nota?: string;
}

export interface PermisoMatriz {
  id: string;
  /** Agrupador visual en la UI. */
  modulo: string;
  /** Fila: acción/permiso concreto. Se renderiza en la UI. */
  accion: string;
  celdas: Record<RolMatriz, CeldaPermiso>;
  /**
   * Dónde vive HOY el gating real en código (archivo/función), o null si la
   * fila es declarativa (sin enforcement construido). No se renderiza en UI.
   */
  gating: string | null;
}

const SI: CeldaPermiso = { valor: "si" };
const NO: CeldaPermiso = { valor: "no" };
const NA: CeldaPermiso = { valor: "noaplica" };
const PEND: CeldaPermiso = { valor: "pendiente" };

export const MATRIZ_PERMISOS: PermisoMatriz[] = [
  // ───────────────────────── Acceso a productos ─────────────────────────
  {
    id: "acceder-admin",
    modulo: "Acceso a productos",
    accion: "Acceder al Panel Admin",
    celdas: {
      admin: { valor: "si", nota: "Empleados internos activos (tabla en BD; variable de entorno solo como respaldo de arranque)" },
      gerente: NO,
      tecnico: NO,
      partner: NO,
      movil: NO,
    },
    gating:
      "middleware.ts:85 + admin/layout.tsx requireProducto('admin') → esAdministradorDarivo() (lib/acceso-producto.ts) + errorSiNoEsAdmin()/requireAdmin() en las Server Actions",
  },
  {
    id: "acceder-empresa",
    modulo: "Acceso a productos",
    accion: "Acceder al Panel Empresa (escritorio)",
    celdas: {
      admin: { valor: "noaplica", nota: "Admin opera aislado en su propio panel" },
      gerente: { valor: "condicional", nota: "Requiere plan Business y ser el gerente titular de la empresa" },
      tecnico: { valor: "no", nota: "Nunca, aunque herede plan Business — trabaja desde Móvil" },
      partner: NA,
      movil: { valor: "no", nota: "Sin empresa no hay panel de escritorio" },
    },
    gating: "puedeAccederEmpresa() (lib/acceso-producto.ts) — plan business + empresas.gerente_user_id; middleware.ts:91",
  },
  {
    id: "acceder-partner",
    modulo: "Acceso a productos",
    accion: "Acceder al Panel Partner",
    celdas: {
      admin: NA,
      gerente: NO,
      tecnico: NO,
      partner: { valor: "condicional", nota: "Autorización manual desde Admin; se bloquea si el estado es Suspendido" },
      movil: NO,
    },
    gating: "esPartnerAutorizado() (lib/acceso-producto.ts) — allowlist + partners.estado; middleware.ts:97",
  },
  {
    id: "acceder-movil",
    modulo: "Acceso a productos",
    accion: "Usar Darivo Pro Móvil",
    celdas: {
      admin: { valor: "no", nota: "Decidido — Admin trabaja restringido a ordenador, nunca desde Móvil" },
      gerente: SI,
      tecnico: { valor: "si", nota: "Es su herramienta de trabajo diario" },
      partner: {
        valor: "condicional",
        nota: "Decidido — un Partner puede usar Móvil solo si Admin lo activa explícitamente (toggle por partner, nunca automático)",
      },
      movil: SI,
    },
    // Admin: decisión de negocio ya cerrada (21/07/2026), sin bloqueo real por
    // dispositivo construido todavía — eso es una etapa aparte. Partner:
    // columna partners.acceso_movil (toggle desde Admin) ya persiste la
    // decisión administrativa; el enforcement real en (auth)/layout.tsx (leer
    // ese flag y bloquear sesión) NO se construyó en esta pasada, mismo
    // criterio que el bloqueo de Admin — decisión declarativa primero.
    gating: "(auth)/layout.tsx — hoy solo exige sesión; sin gate por rol construido para ninguno de los 2 casos (declarativo por ahora)",
  },
  {
    id: "datos-empresa-movil",
    modulo: "Acceso a productos",
    accion: "Trabajar con los datos de su Empresa desde Móvil",
    celdas: {
      admin: NA,
      gerente: SI,
      tecnico: { valor: "si", nota: "Comparte los datos de su empresa aunque entre desde Móvil" },
      partner: NA,
      movil: { valor: "noaplica", nota: "No tiene empresa vinculada" },
    },
    gating: "empresa_empleados (vínculo user_id↔empresa_id) + obtenerContextoAcceso() (lib/rol-empleado.ts)",
  },

  // ───────────────────────── Cotizaciones ─────────────────────────
  {
    id: "crear-cotizacion",
    modulo: "Cotizaciones",
    accion: "Crear cotización",
    celdas: {
      admin: NA,
      gerente: { valor: "condicional", nota: "Según límites del plan (gratis: 5 en total; Básico: 20/mes; Pro/Business: ilimitado)" },
      tecnico: { valor: "si", nota: "Activada por defecto al invitarlo; límites del plan heredado de su empresa" },
      partner: NA,
      movil: { valor: "condicional", nota: "Según límites del plan" },
    },
    gating: "verificarLimiteCotizacion() (lib/plan-limits.ts); Técnico: plan_tipo copiado del Gerente al invitar",
  },

  // ───────────────────────── Facturas ─────────────────────────
  {
    id: "emitir-factura",
    modulo: "Facturas",
    accion: "Emitir factura / boleta",
    celdas: {
      admin: NA,
      gerente: { valor: "condicional", nota: "Requiere plan con facturación (Pro o Business)" },
      tecnico: { valor: "condicional", nota: "Activada por defecto al invitarlo — el Gerente puede desactivarla en cualquier momento" },
      partner: NA,
      movil: { valor: "condicional", nota: "Requiere plan con facturación (Pro o Business)" },
    },
    gating:
      "verificarLimiteFactura() (lib/plan-limits.ts) + empresa_empleados.factura_habilitada — (auth)/layout.tsx:37-38, facturas/page.tsx:17, facturas/nueva/page.tsx:17",
  },
  {
    id: "habilitar-permisos-tecnico",
    modulo: "Facturas",
    accion: "Activar / desactivar Factura o Informe de un Técnico",
    celdas: {
      admin: { valor: "no", nota: "Decisión exclusiva del Gerente de cada empresa" },
      gerente: { valor: "si", nota: "Libremente, en cualquier momento, módulo por módulo — no es una elección única al invitar" },
      tecnico: NO,
      partner: NA,
      movil: NA,
    },
    gating: "EmpresaEmpleadosView.tsx (toggles) → empresa_empleados.factura_habilitada/informe_habilitado; RLS empresa_empleados_gerente (solo el Gerente escribe)",
  },

  // ───────────────────────── Informes ─────────────────────────
  {
    id: "ver-informes",
    modulo: "Informes",
    accion: "Ver Informes",
    celdas: {
      admin: NA,
      gerente: SI,
      tecnico: { valor: "condicional", nota: "Opcional — solo si el Gerente activa su informe propio" },
      partner: NA,
      movil: SI,
    },
    gating: "empresa_empleados.informe_habilitado — mas/informes/page.tsx (redirect server-side) + MasOpcionesList/MasTabs",
  },

  // ───────────────────────── Planes y pagos ─────────────────────────
  {
    id: "ver-mis-planes",
    modulo: "Planes y pagos",
    accion: "Ver “Mis planes” y cambiar de plan",
    celdas: {
      admin: NA,
      gerente: SI,
      tecnico: { valor: "no", nota: "Nunca — el plan es de la empresa, lo gestiona el Gerente" },
      partner: NA,
      movil: SI,
    },
    gating: "mas/plan/page.tsx:19 (redirect incondicional para Técnico) + MasOpcionesList.tsx:107",
  },
  {
    id: "solo-lectura-mora",
    modulo: "Planes y pagos",
    accion: "Queda en solo lectura tras 3 días de pago fallido",
    celdas: {
      admin: { valor: "no", nota: "Sin condición de pago" },
      gerente: { valor: "si", nota: "Aplica a planes de pago; 3 días de gracia" },
      tecnico: { valor: "si", nota: "Hereda la mora de su empresa (vía su Gerente)" },
      partner: { valor: "no", nota: "Sin regla automática de pago — bloqueo manual desde Admin" },
      movil: { valor: "si", nota: "Aplica a planes de pago; 3 días de gracia" },
    },
    gating:
      "lib/mora-pagos.ts + es_cuenta_solo_lectura() (migración 20260721120000, PENDIENTE de ejecutar) — inerte hasta que el propietario corra la migración",
  },
  {
    id: "gestionar-catalogo-planes",
    modulo: "Planes y pagos",
    accion: "Modificar el catálogo de planes o sus precios",
    celdas: {
      admin: { valor: "no", nota: "Catálogo de solo lectura por diseño — fijo a 3 planes (Básico S/49, Pro S/89, Business S/130)" },
      gerente: NO,
      tecnico: NO,
      partner: NO,
      movil: NO,
    },
    gating: "PRECIOS_OFICIALES/LIMITES_PLAN (lib/roles-planes-oficial.ts) — constantes sin UI de edición; Admin Suscripciones es de solo lectura",
  },

  // ───────────────────────── Empresa ─────────────────────────
  {
    id: "acceder-clientes-empresa",
    modulo: "Empresa",
    accion: "Ver y gestionar Clientes de la empresa",
    celdas: {
      admin: NA,
      gerente: SI,
      tecnico: { valor: "si", nota: "Módulo base, siempre disponible — no existe (ni se necesita) un flag de activación como en Factura/Informe" },
      partner: NA,
      movil: { valor: "noaplica", nota: "Sin empresa no hay clientes compartidos" },
    },
    // Investigado en la Etapa 7 (21/07/2026, decisión 3): a diferencia de
    // Factura/Informe, "Cliente" no tiene columna de permiso en
    // empresa_empleados — todo empleado vinculado ve el mismo listado que el
    // Gerente, sin restricción de rol en ningún punto de gating. No hace
    // falta un 3er flag: el propio acceso a la empresa (vía user_id) ya lo
    // resuelve.
    gating: "empresa_empleados (vínculo user_id↔empresa_id); sin columna de permiso propia, sin gate adicional por rol",
  },
  {
    id: "gestionar-empleados-empresa",
    modulo: "Empresa",
    accion: "Gestionar empleados de su empresa (invitar, activar, permisos)",
    celdas: {
      admin: { valor: "noaplica", nota: "Admin administra empresas como cuentas, no los empleados internos de cada una" },
      gerente: { valor: "condicional", nota: "Plan Business (hasta 5 técnicos incluidos)" },
      tecnico: NO,
      partner: NA,
      movil: { valor: "noaplica", nota: "Sin empresa no hay empleados" },
    },
    gating: "empresa/empleados/actions.ts (invitarEmpleadoAction, ...) + RLS empresa_empleados_gerente",
  },
  {
    id: "roles-personalizados",
    modulo: "Empresa",
    accion: "Crear roles personalizados (sistema aparte, por empresa)",
    celdas: {
      admin: NA,
      gerente: { valor: "pendiente", nota: "Sistema ya construido (plan Business) — su activación real es una decisión de negocio pendiente" },
      tecnico: NO,
      partner: NA,
      movil: NA,
    },
    gating: "RolesPermisosView.tsx + tabla roles_personalizados — construido pero sin enforcement en rutas (RBAC custom inerte, decisión pendiente)",
  },
  {
    id: "mis-tarifas",
    modulo: "Empresa",
    accion: "Personalizar Mis Tarifas (precios propios)",
    celdas: {
      admin: { valor: "no", nota: "Admin administra la Tarifa Pro del Catálogo Maestro, nunca las tarifas de una empresa" },
      gerente: SI,
      tecnico: { valor: "no", nota: "Decidido — el Técnico solo consulta tarifas, nunca las administra" },
      partner: NA,
      movil: SI,
    },
    // Divergencia real detectada en la Etapa 6 (21/07/2026) cerrada en la
    // Etapa 7 (mismo día, decisión 4): la arquitectura oficial ya decía que
    // el Técnico no administra Mis Tarifas, pero no existía ningún bloqueo
    // real en código. MasTabs.tsx ahora oculta la pestaña "Mis Tarifas" por
    // completo cuando obtenerContextoAcceso().rol === "tecnico".
    gating: "MasTabs.tsx (prop ocultarTarifas, calculada desde obtenerContextoAcceso().rol==='tecnico') — (auth)/mas/page.tsx y empresa/mas/page.tsx",
  },

  // ───────────────────────── Administración de plataforma ─────────────────────────
  {
    id: "bloquear-usuario",
    modulo: "Administración de plataforma",
    accion: "Bloquear / desbloquear usuarios",
    celdas: { admin: SI, gerente: NO, tecnico: NO, partner: NO, movil: NO },
    gating: "admin/usuarios/actions.ts (bloquearUsuarioAction/desbloquearUsuarioAction) — errorSiNoEsAdmin()",
  },
  {
    id: "cambiar-plan-cuenta",
    modulo: "Administración de plataforma",
    accion: "Cambiar el plan de una cuenta (usuario o empresa)",
    celdas: { admin: SI, gerente: NO, tecnico: NO, partner: NO, movil: NO },
    // El upgrade que un usuario se compra a sí mismo pasa por checkout/webhook
    // (service_role), no por esta acción administrativa — no es la misma fila.
    gating:
      "admin/usuarios/actions.ts (cambiarPlanUsuarioAction) + admin/empresas/actions.ts (cambiarPlanEmpresaAction); trigger RLS de perfiles bloquea la autoescalada por sesión (migración 20260721160000, PENDIENTE de ejecutar)",
  },
  {
    id: "gestionar-empresas-admin",
    modulo: "Administración de plataforma",
    accion: "Crear / activar / desactivar empresas",
    celdas: { admin: SI, gerente: NO, tecnico: NO, partner: NO, movil: NO },
    gating: "admin/empresas/actions.ts — errorSiNoEsAdmin()",
  },
  {
    id: "gestionar-catalogo-maestro",
    modulo: "Administración de plataforma",
    accion: "Administrar Catálogo Maestro y Tarifa Pro",
    celdas: {
      admin: SI,
      gerente: { valor: "no", nota: "Solo personaliza Mis Tarifas, nunca el Catálogo Maestro" },
      tecnico: NO,
      partner: NO,
      movil: { valor: "no", nota: "Solo personaliza Mis Tarifas" },
    },
    gating: "admin/catalogo/actions.ts — errorSiNoEsAdmin(); RLS catalogo_* (escritura solo is_darivo_admin())",
  },
  {
    id: "activar-partner",
    modulo: "Administración de plataforma",
    accion: "Activar / suspender un Partner",
    celdas: {
      admin: { valor: "si", nota: "Manual — sin regla automática de pago" },
      gerente: NO,
      tecnico: NO,
      partner: { valor: "no", nota: "No puede autoactivarse" },
      movil: NO,
    },
    gating: "admin/partners/actions.ts → partners.estado; RLS partners_own (solo SELECT) impide la autoactivación",
  },

  // ───────────────────────── Partner ─────────────────────────
  {
    id: "ver-comisiones-partner",
    modulo: "Partner",
    accion: "Ver comisiones de Partner",
    celdas: {
      admin: { valor: "si", nota: "Todas, desde el módulo Partners" },
      gerente: NO,
      tecnico: NO,
      partner: { valor: "si", nota: "Solo las propias" },
      movil: NO,
    },
    gating: "RLS partner_comisiones_historial_partner (FOR SELECT, solo el partner propio) + is_darivo_admin()",
  },

  // ───────────────────────── Soporte ─────────────────────────
  {
    id: "crear-ticket-soporte",
    modulo: "Soporte",
    accion: "Crear tickets de soporte",
    celdas: {
      admin: { valor: "noaplica", nota: "Es quien atiende los tickets" },
      gerente: { valor: "si", nota: "Incluso en modo solo lectura por mora" },
      tecnico: { valor: "si", nota: "Incluso en modo solo lectura por mora" },
      partner: { valor: "si", nota: "Decidido — mismo sistema real de tickets que Móvil/Empresa, sección propia en el Panel Partner" },
      movil: { valor: "si", nota: "Incluso en modo solo lectura por mora" },
    },
    gating: "api/soporte/tickets (RLS fila propia, auth.uid()=user_id, sin restricción de rol/plan) + SoporteTicketsView en PartnerPanel.tsx",
  },
];

/** Celdas sin regla cerrada — requieren decisión del propietario. */
export function celdasPendientes(): Array<{ permiso: PermisoMatriz; rol: RolMatriz; nota?: string }> {
  const out: Array<{ permiso: PermisoMatriz; rol: RolMatriz; nota?: string }> = [];
  for (const p of MATRIZ_PERMISOS) {
    for (const r of ROLES_MATRIZ) {
      const c = p.celdas[r.id];
      if (c.valor === "pendiente") out.push({ permiso: p, rol: r.id, nota: c.nota });
    }
  }
  return out;
}

/** Consulta programática de la matriz (para futuros puntos de gating). */
export function permisoDe(id: string, rol: RolMatriz): CeldaPermiso | null {
  const fila = MATRIZ_PERMISOS.find((p) => p.id === id);
  return fila ? fila.celdas[rol] : null;
}

/** Módulos en orden de aparición (agrupación de la UI). */
export function modulosMatriz(): string[] {
  const vistos: string[] = [];
  for (const p of MATRIZ_PERMISOS) if (!vistos.includes(p.modulo)) vistos.push(p.modulo);
  return vistos;
}
