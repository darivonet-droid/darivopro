"use client";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { T } from "@/lib/theme";

const ERRORES: Record<string, string> = {
  over_email_send_rate_limit: "Espera un momento antes de pedir otro enlace",
  email_address_invalid:      "Ese correo no parece válido, revísalo",
};

function mensajeError(code?: string): string {
  return ERRORES[code ?? ""] ?? "No se pudo enviar el correo. Inténtalo de nuevo";
}

export default function RecuperarPage() {
  const supabase = createClient();
  const [email,   setEmail]   = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nueva-contrasena`,
    });

    setLoading(false);
    if (error) {
      setError(mensajeError(error.code));
      return;
    }
    setEnviado(true);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Back */}
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm font-semibold"
        style={{ color: T.textMid }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M5 12l7-7M5 12l7 7" />
        </svg>
        Volver al inicio de sesión
      </Link>

      <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 20px rgba(10,22,40,0.09)" }}>
        <h1 className="mb-1 text-xl font-extrabold" style={{ color: T.text }}>
          Recuperar contraseña
        </h1>
        <p className="mb-6 text-sm leading-relaxed" style={{ color: T.textMid }}>
          Ingresa tu correo y te enviamos un enlace para crear una nueva contraseña.
        </p>

        {/* ── Confirmación verde ─────────────────────────────── */}
        {enviado ? (
          <div
            className="flex items-start gap-3 rounded-xl p-4"
            style={{ background: T.greenPale, border: `1.5px solid ${T.green}44` }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
              style={{ background: T.green, color: T.white }}
            >
              ✓
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: T.greenD }}>
                ¡Enlace enviado!
              </p>
              <p className="mt-0.5 text-xs leading-relaxed" style={{ color: T.greenD }}>
                Revisa tu correo{" "}
                <span className="font-bold">{email}</span>.
                {" "}Si no aparece, revisa tu carpeta de spam.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={enviar} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
                Correo electrónico
              </span>
              <input
                type="email"
                placeholder="tu@correo.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all focus:ring-2"
                style={{
                  background: "#fff",
                  color:      T.text,
                  border:     `1.5px solid ${T.slateD}`,
                  // @ts-expect-error custom property
                  "--tw-ring-color": T.blue,
                }}
              />
            </label>

            {error && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                style={{ background: T.redPale, border: `1px solid ${T.red}22` }}
              >
                <span className="mt-0.5 text-base">⚠️</span>
                <p className="text-sm font-semibold leading-snug" style={{ color: T.red }}>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-60"
              style={{ background: T.blue }}
            >
              {loading ? "Enviando…" : "Enviar enlace"}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
