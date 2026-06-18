"use client";
// DARIVO PRO — Input con etiqueta
import { T } from "@/lib/theme";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  dark?: boolean;
}

export function Input({ label, error, dark = false, ...props }: InputProps) {
  const bgColor    = dark ? T.navyLight  : T.white;
  const textColor  = dark ? T.white      : T.text;
  const labelColor = dark ? T.textLight  : T.textMid;
  const borderColor = error
    ? T.red
    : dark
    ? "rgba(37,99,235,0.25)"
    : T.slateD;

  return (
    <label className="block">
      {label && (
        <span
          className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide"
          style={{ color: labelColor }}
        >
          {label}
        </span>
      )}
      <input
        {...props}
        className={`w-full rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-colors focus:ring-2 focus:ring-blue-500/40 ${props.className ?? ""}`}
        style={{
          background: bgColor,
          color: textColor,
          border: `1.5px solid ${borderColor}`,
        }}
      />
      {error && (
        <span className="mt-1 block text-xs font-semibold" style={{ color: T.red }}>
          {error}
        </span>
      )}
    </label>
  );
}
