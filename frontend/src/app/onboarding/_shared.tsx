"use client";
// DARIVO PRO — Componentes compartidos del onboarding
import { T } from "@/lib/theme";

/* ── Barra de progreso ─────────────────────────────────────── */
export function ProgressBar({ paso }: { paso: 1 | 2 | 3 }) {
  return (
    <div className="mb-6 flex gap-2">
      {([1, 2, 3] as const).map((n) => (
        <div
          key={n}
          className="h-1.5 flex-1 rounded-full transition-all duration-500"
          style={{ background: n <= paso ? T.blue : T.slateD }}
        />
      ))}
    </div>
  );
}

/* ── Input de onboarding ───────────────────────────────────── */
interface OnbInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label:     string;
  opcional?: boolean;
  error?:    string;
}
export function OnbInput({ label, opcional, error, ...props }: OnbInputProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
        {label}
        {opcional && (
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-semibold normal-case tracking-normal"
            style={{ background: T.slate, color: T.textLight }}
          >
            opcional
          </span>
        )}
      </span>
      <input
        {...props}
        className="w-full rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all focus:ring-2"
        style={{
          background:  props.disabled ? T.slate : "#fff",
          color:       T.text,
          border:      `1.5px solid ${error ? T.red : T.slateD}`,
          // @ts-expect-error custom property
          "--tw-ring-color": T.blue,
        }}
      />
      {error && (
        <span className="text-xs font-semibold" style={{ color: T.red }}>
          {error}
        </span>
      )}
    </label>
  );
}

/* ── Botón principal ───────────────────────────────────────── */
export function OnbButton({
  loading,
  texto,
  textoLoading = "Guardando…",
  onClick,
  type = "button",
}: {
  loading:      boolean;
  texto:        string;
  textoLoading?: string;
  onClick?:     () => void;
  type?:        "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className="mt-2 w-full rounded-2xl py-4 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-60"
      style={{ background: T.blue, boxShadow: `0 4px 16px rgba(37,99,235,0.30)` }}
    >
      {loading ? textoLoading : texto}
    </button>
  );
}

/* ── Banner de error ───────────────────────────────────────── */
export function ErrorBanner({ mensaje }: { mensaje: string }) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-xl px-4 py-3"
      style={{ background: T.redPale, border: `1px solid ${T.red}22` }}
    >
      <span className="mt-0.5 shrink-0">⚠️</span>
      <p className="text-sm font-semibold leading-snug" style={{ color: T.red }}>
        {mensaje}
      </p>
    </div>
  );
}
