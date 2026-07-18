"use client";
// DARIVO PRO — Campo de contraseña con botón mostrar/ocultar (ícono de ojo).
// Área táctil grande (44x44px mínimo) a propósito: el público objetivo incluye
// maestros de obra mayores, en pantallas de celular, con dedos grandes.
import { useState } from "react";
import { T } from "@/lib/theme";

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function PasswordInput({ label, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
        {label}
      </span>
      <div className="relative">
        <input
          {...props}
          type={visible ? "text" : "password"}
          className="w-full rounded-xl py-3.5 pl-4 pr-12 text-sm font-medium outline-none transition-all focus:ring-2"
          style={{
            background: "#fff",
            color: T.text,
            border: `1.5px solid ${T.slateD}`,
            // @ts-expect-error custom property
            "--tw-ring-color": T.blue,
          }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center"
          style={{ color: T.textMid }}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </label>
  );
}

function EyeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 5.2C11.05 5.07 11.52 5 12 5c7 0 10.5 7 10.5 7-.6 1.2-1.68 2.86-3.3 4.28M6.2 6.86C3.9 8.4 2.1 10.8 1.5 12c0 0 3.5 7 10.5 7 1.63 0 3.05-.38 4.27-.98M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
