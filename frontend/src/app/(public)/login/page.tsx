"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { T } from "@/lib/theme";

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
    router.push("/dashboard");
    router.refresh();
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
            <AuthInput
              label="Contraseña"
              type="password"
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
