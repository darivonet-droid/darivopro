"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { T } from "@/lib/theme";

function NuevaContrasenaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listo, setListo] = useState(false);
  const [inicializando, setInicializando] = useState(true);

  useEffect(() => {
    let activo = true;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const code = searchParams.get("code");
      if (code) {
        const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!activo) return;
        if (codeError) {
          setError("El enlace expiró o no es válido. Pide uno nuevo, maestro.");
          setInicializando(false);
          return;
        }
        router.replace("/nueva-contrasena");
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!activo) return;
        if (event === "PASSWORD_RECOVERY" || session) {
          setListo(true);
          setError(null);
          setInicializando(false);
        }
      });
      unsubscribe = () => subscription.unsubscribe();

      // Hash tokens (#access_token) los detecta el cliente de Supabase al cargar
      await new Promise((r) => setTimeout(r, 150));
      const { data: { session } } = await supabase.auth.getSession();

      if (!activo) return;
      if (session) {
        setListo(true);
        setError(null);
      } else if (!code) {
        setError("Enlace inválido o expirado. Solicita uno nuevo.");
      }
      setInicializando(false);
    })();

    return () => {
      activo = false;
      unsubscribe?.();
    };
  }, [router, searchParams, supabase]);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden, maestro");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("No se pudo guardar la contraseña. Inténtalo de nuevo.");
      return;
    }

    await supabase.auth.signOut();
    setExito(true);
    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 2000);
  };

  if (inicializando) {
    return (
      <div
        className="rounded-2xl bg-white p-8 text-center"
        style={{ boxShadow: "0 2px 20px rgba(10,22,40,0.09)" }}
      >
        <p className="text-sm font-semibold" style={{ color: T.textMid }}>
          Verificando enlace…
        </p>
      </div>
    );
  }

  if (exito) {
    return (
      <div
        className="flex flex-col gap-4 rounded-2xl bg-white p-6"
        style={{ boxShadow: "0 2px 20px rgba(10,22,40,0.09)" }}
      >
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
              ¡Contraseña actualizada!
            </p>
            <p className="mt-0.5 text-xs leading-relaxed" style={{ color: T.greenD }}>
              Ya puedes iniciar sesión con tu nueva contraseña. Te llevamos al login…
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!listo) {
    return (
      <div className="flex flex-col gap-6">
        <div
          className="rounded-2xl bg-white p-6"
          style={{ boxShadow: "0 2px 20px rgba(10,22,40,0.09)" }}
        >
          <h1 className="mb-1 text-xl font-extrabold" style={{ color: T.text }}>
            Enlace no válido
          </h1>
          <p className="mb-4 text-sm leading-relaxed" style={{ color: T.textMid }}>
            {error ?? "Este enlace ya expiró o ya fue usado."}
          </p>
          <Link
            href="/recuperar"
            className="block text-center text-sm font-bold"
            style={{ color: T.blue }}
          >
            Solicitar nuevo enlace →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className="rounded-2xl bg-white p-6"
        style={{ boxShadow: "0 2px 20px rgba(10,22,40,0.09)" }}
      >
        <h1 className="mb-1 text-xl font-extrabold" style={{ color: T.text }}>
          Nueva contraseña
        </h1>
        <p className="mb-6 text-sm" style={{ color: T.textMid }}>
          Elige una contraseña segura para tu cuenta Darivo Pro
        </p>

        <form onSubmit={guardar} className="flex flex-col gap-4">
          <PasswordInput
            label="Nueva contraseña"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            visible={verPassword}
            onToggle={() => setVerPassword((v) => !v)}
            autoComplete="new-password"
            required
          />
          <AuthInput
            label="Confirmar contraseña"
            type="password"
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />

          {error && <ErrorBanner mensaje={error} />}

          <AuthButton
            loading={loading}
            texto="Guardar nueva contraseña"
            textoLoading="Guardando…"
          />
        </form>
      </div>

      <p className="text-center text-sm" style={{ color: T.textMid }}>
        <Link href="/login" className="font-bold" style={{ color: T.blue }}>
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  );
}

export default function NuevaContrasenaPage() {
  return (
    <Suspense
      fallback={
        <div
          className="rounded-2xl bg-white p-8 text-center"
          style={{ boxShadow: "0 2px 20px rgba(10,22,40,0.09)" }}
        >
          <p className="text-sm font-semibold" style={{ color: T.textMid }}>
            Cargando…
          </p>
        </div>
      }
    >
      <NuevaContrasenaForm />
    </Suspense>
  );
}

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
          background: "#fff",
          color: T.text,
          border: `1.5px solid ${T.slateD}`,
          // @ts-expect-error custom property
          "--tw-ring-color": T.blue,
        }}
      />
    </label>
  );
}

interface PasswordInputProps extends Omit<AuthInputProps, "type"> {
  visible: boolean;
  onToggle: () => void;
}

function PasswordInput({ label, visible, onToggle, ...props }: PasswordInputProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
        {label}
      </span>
      <div className="relative">
        <input
          {...props}
          type={visible ? "text" : "password"}
          className="w-full rounded-xl px-4 py-3.5 pr-12 text-sm font-medium outline-none transition-all focus:ring-2"
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
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-xs font-bold"
          style={{ color: T.textMid }}
          aria-label={visible ? "Ocultar contraseña" : "Ver contraseña"}
        >
          {visible ? "🙈" : "👁"}
        </button>
      </div>
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
