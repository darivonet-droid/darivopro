"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { T } from "@/lib/theme";
import { destinoPostLogin } from "@/lib/subdominios";

const ERRORES: Record<string, string> = {
  invalid_credentials:         "Ese correo o contraseña no coinciden, revísalos 🔍",
  email_not_confirmed:         "Confirma tu correo primero, te mandamos el enlace",
  over_email_send_rate_limit:  "Espera un momento antes de intentar de nuevo",
  user_not_found:              "Ese correo no está registrado, maestro",
};

function mensajeError(code?: string): string {
  return ERRORES[code ?? ""] ?? "Algo salió mal. Inténtalo de nuevo";
}

export default function LoginPage() {
  const router   = useRouter();
  const supabase = createClient();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "confirmacion") {
      setError("El enlace de confirmación expiró o no es válido. Pide uno nuevo desde registro.");
    }
  }, []);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(mensajeError(error.code));
      return;
    }
    // Best-effort — nunca bloquea el login si falla (ver route.ts).
    void fetch("/api/empleados/marcar-actividad", { method: "POST" }).catch(() => {});
    // Antes siempre "/dashboard" (Móvil) sin importar el subdominio — un
    // Admin/Gerente/Partner que iniciaba sesión desde admin./empresa./partners.
    // caía en el panel equivocado y tenía que navegar manualmente al suyo.
    // Fix 19/07/2026, ver frontend/src/lib/subdominios.ts.
    router.push(destinoPostLogin(window.location.hostname));
    router.refresh();
  };

  // OAuth Google — reutiliza el callback existente (/auth/callback intercambia el
  // código y enruta a next). El destino respeta el subdominio real (mismo fix de
  // arriba); el gating de onboarding del layout (auth) sigue mandando igual que
  // antes para usuario nuevo → /onboarding/1 (ver auth/callback/route.ts).
  const entrarConGoogle = async () => {
    setError(null);
    setLoading(true);
    const next = destinoPostLogin(window.location.hostname);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    // Si signInWithOAuth devuelve error, no hubo redirección: mostrarlo.
    if (error) {
      setLoading(false);
      setError(mensajeError(error.code));
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Card */}
      <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 20px rgba(10,22,40,0.09)" }}>
        <h1 className="mb-1 text-xl font-extrabold" style={{ color: T.text }}>
          Iniciar sesión
        </h1>
        <p className="mb-6 text-sm" style={{ color: T.textMid }}>
          Bienvenido de vuelta a Darivo Pro
        </p>

        <form onSubmit={entrar} className="flex flex-col gap-4">
          <AuthInput
            label="Correo electrónico"
            type="email"
            placeholder="tu@correo.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div>
            <PasswordInput
              label="Contraseña"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="mt-2 flex justify-end">
              <Link
                href="/recuperar"
                className="text-xs font-semibold"
                style={{ color: T.blue }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          {error && <ErrorBanner mensaje={error} />}

          <AuthButton loading={loading} texto="Entrar" textoLoading="Entrando…" />
        </form>

        {/* Separador */}
        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1" style={{ background: T.slateD }} />
          <span className="text-xs font-semibold" style={{ color: T.textMid }}>o</span>
          <span className="h-px flex-1" style={{ background: T.slateD }} />
        </div>

        <GoogleButton loading={loading} onClick={entrarConGoogle} />
      </div>

      {/* Link registro */}
      <p className="text-center text-sm" style={{ color: T.textMid }}>
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-bold" style={{ color: T.blue }}>
          Regístrate gratis
        </Link>
      </p>

    </div>
  );
}

/* ── Componentes internos de auth ───────────────────────────── */

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
function AuthInput({ label, ...props }: AuthInputProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all focus:ring-2"
        style={{
          background:  "#fff",
          color:       T.text,
          border:      `1.5px solid ${T.slateD}`,
          /* ring color via CSS variable override */
          // @ts-expect-error custom property
          "--tw-ring-color": T.blue,
        }}
      />
    </label>
  );
}

function ErrorBanner({ mensaje }: { mensaje: string }) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-xl px-4 py-3"
      style={{ background: T.redPale, border: `1px solid ${T.red}22` }}
    >
      <span className="mt-0.5 text-base">⚠️</span>
      <p className="text-sm font-semibold leading-snug" style={{ color: T.red }}>
        {mensaje}
      </p>
    </div>
  );
}

function GoogleButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-2xl py-3.5 text-sm font-bold transition-all active:scale-95 disabled:opacity-60"
      style={{ background: "#fff", color: T.text, border: `1.5px solid ${T.slateD}` }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
        <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
      </svg>
      Continuar con Google
    </button>
  );
}

function AuthButton({ loading, texto, textoLoading }: { loading: boolean; texto: string; textoLoading: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-60"
      style={{ background: T.blue }}
    >
      {loading ? textoLoading : texto}
    </button>
  );
}
