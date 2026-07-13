import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";

export function AdminKpiGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">{children}</div>;
}

export function AdminKpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
    >
      <p className="text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-black" style={{ color: ADMIN_COLORS.text }}>
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function AdminErrorBanner({ mensaje }: { mensaje: string }) {
  return (
    <div
      className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold"
      style={{ background: ADMIN_COLORS.redPale, color: ADMIN_COLORS.red }}
    >
      ⚠️ {mensaje}
    </div>
  );
}

export function AdminServiceRoleNotice() {
  return (
    <div
      className="mb-4 rounded-xl px-4 py-3 text-sm"
      style={{ background: ADMIN_COLORS.amberPale, color: ADMIN_COLORS.amberD }}
    >
      Configure <span className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</span> en{" "}
      <span className="font-mono text-xs">.env.local</span> para datos agregados de plataforma.
    </div>
  );
}

export function AdminTable({
  headers,
  rows,
  vacio,
  onRowClick,
  filaActivaIndex,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  vacio?: string;
  /** Fila clickeable completa — usado por el panel lateral de Empresa Clientes. */
  onRowClick?: (index: number) => void;
  /** Resalta la fila seleccionada (panel lateral abierto). */
  filaActivaIndex?: number;
}) {
  if (!rows.length) {
    return (
      <p
        className="rounded-2xl py-10 text-center text-sm"
        style={{ color: ADMIN_COLORS.textMid, background: ADMIN_COLORS.slate }}
      >
        {vacio ?? "Sin registros"}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: `1px solid ${ADMIN_COLORS.slateD}` }}>
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead style={{ background: ADMIN_COLORS.tableHeaderBg }}>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-xs font-bold uppercase"
                style={{ color: ADMIN_COLORS.tableHeaderText }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ background: ADMIN_COLORS.white }}>
          {rows.map((cells, i) => (
            <tr
              key={i}
              onClick={onRowClick ? () => onRowClick(i) : undefined}
              style={{
                borderTop: `1px solid ${ADMIN_COLORS.slateD}`,
                cursor: onRowClick ? "pointer" : undefined,
                background: filaActivaIndex === i ? ADMIN_COLORS.purplePale : undefined,
              }}
            >
              {cells.map((cell, j) => (
                <td key={j} className="px-4 py-3" style={{ color: ADMIN_COLORS.text }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
