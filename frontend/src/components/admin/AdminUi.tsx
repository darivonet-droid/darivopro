import { T } from "@/lib/design-system/tokens";

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
      style={{ background: T.white, border: `1px solid ${T.slateD}` }}
    >
      <p className="text-xs font-bold uppercase" style={{ color: T.textMid }}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-black" style={{ color: T.text }}>
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs" style={{ color: T.textLight }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function AdminServiceRoleNotice() {
  return (
    <div
      className="mb-4 rounded-xl px-4 py-3 text-sm"
      style={{ background: T.amberPale, color: T.amberD }}
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
}: {
  headers: string[];
  rows: React.ReactNode[][];
  vacio?: string;
}) {
  if (!rows.length) {
    return (
      <p className="rounded-2xl py-10 text-center text-sm" style={{ color: T.textMid, background: T.slate }}>
        {vacio ?? "Sin registros"}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: `1px solid ${T.slateD}` }}>
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead style={{ background: T.navyLight }}>
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-xs font-bold text-white">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ background: T.white }}>
          {rows.map((cells, i) => (
            <tr key={i} style={{ borderTop: `1px solid ${T.slateD}` }}>
              {cells.map((cell, j) => (
                <td key={j} className="px-4 py-3" style={{ color: T.text }}>
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
