"use client";
// DARIVO PRO — Input con etiqueta
import { T } from "@/lib/theme";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
          {label}
        </span>
      )}
      <input
        {...props}
        className={`w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-colors focus:ring-2 ${props.className ?? ""}`}
        style={{
          background: T.white,
          color: T.text,
          border: `1.5px solid ${error ? T.red : T.slateD}`,
        }}
      />
      {error && <span className="mt-1 block text-xs font-semibold" style={{ color: T.red }}>{error}</span>}
    </label>
  );
}
