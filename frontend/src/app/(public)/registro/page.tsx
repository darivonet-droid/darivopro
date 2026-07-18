"use client";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { T } from "@/lib/theme";
import type { AuthError } from "@supabase/supabase-js";

const ERRORES: Record<string, string> = {
  user_already_exists: "Ya existe una cuenta con ese correo 👀",
  email_address_invalid: "Ese correo no parece válido, revísalo",
  weak_password: "La contraseña es muy débil, ponle más caracteres",
  over_email_send_rate_limit: "Espera un momento antes de intentar de nuevo",
  signup_disabled: "El registro está desactivado por ahora",
};

function mensajeError(error: AuthError): string {
  if (error.code && ERRORES[error.code]) return ERRORES[error.code];

  const msg = error.message.toLowerCase();
  if (msg.includes("already registered") || msg.includes("user already registered")) {
    return "Ya existe una cuenta con ese correo 👀";
  }
  if (msg.includes("password")) {
    return "La contraseña no cumple los requisitos mínimos";
  }

  // No mapear por "incluye la palabra email" — ese heurístico capturaba
  // errores reales no relacionados con el formato (rate limit, fallo de
  // envío SMTP, redirect URL no permitida) y los mostraba como "correo
  // inválido", ocultando la causa real. El código exacto ya se maneja
  // arriba vía ERRORES[error.code]; para todo lo demás, mostrar el
  // mensaje real de Supabase es más honesto que adivinar.
  return error.message || "No se pudo crear la cuenta. Inténtalo de nuevo";
}

export default function RegistroPage() {
  const supabase = createClient();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [loading, setLoading] = useState(false);

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden, chécalas 👀");
      return;
    }

    setLoading(true);

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/onboarding/1")}`;
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { nombre_empresa: nombre.trim() },
        emailRedirectTo: redirectTo,
      },
    });

    setLoading(false);

    if (authError) {
      setError(mensajeError(authError));
      return;
    }

    // Supabase oculta usuarios duplicados: identities vacío = correo ya registrado
    if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
      setError("Ya existe una cuenta con ese correo 👀");
      return;
    }

    if (data.session && data.user) {
      await supabase.from("perfiles").upsert({
        id: data.user.id,
        razon_social: nombre.trim() || null,
      });
      // Registra el referido de Partner si venía de /ref/{codigo}. Se espera
      // (para que no se cancele por la navegación siguiente) pero un fallo
      // nunca bloquea el registro — el catch garantiza que igual redirige.
      await fetch("/api/partners/registrar-referido", { method: "POST" }).catch(() => {});
      // Email de Bienvenida — best-effort, nunca bloquea el registro.
      // (Este es el único punto de "registro completado" sin ambigüedad; el
      // flujo de confirmación por correo comparte /auth/callback con el login
      // de Google y no tiene todavía una señal fiable para distinguir un
      // registro nuevo de un inicio de sesión recurrente — ver nota en esa ruta.)
      await fetch("/api/emails/bienvenida", { method: "POST" }).catch(() => {});
      window.location.assign("/onboarding/1");
      return;
    }

    setExito(true);
  };

  /* ── Estado de éxito (confirmar correo) */
  if (exito) {
    return (
      <div className="flex flex-col gap-6">
        <div
          className="rounded-2xl bg-white p-8 text-center"
          style={{ boxShadow: "0 2px 20px rgba(10,22,40,0.09)" }}
        >
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
            style={{ background: T.greenPale }}
          >
            📬
          </div>
          <h2 className="text-lg font-extrabold" style={{ color: T.text }}>
            ¡Revisa tu correo!
          </h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: T.textMid }}>
            Enviamos un enlace de confirmación a{" "}
            <span className="font-bold" style={{ color: T.blue }}>{email}</span>.
            <br />Activa tu cuenta para entrar.
          </p>
          <Link
            href="/login"
            className="mt-5 block text-sm font-bold"
            style={{ color: T.blue }}
          >
            Volver al inicio de sesión →
          </Link>
        </div>
      </div>
    );
  }

  /* ── Formulario */
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 20px rgba(10,22,40,0.09)" }}>
        <h1 className="mb-1 text-xl font-extrabold" style={{ color: T.text }}>
          Crear cuenta gratis
        </h1>
        <p className="mb-6 text-sm" style={{ color: T.textMid }}>
          Tu primera cotización en menos de 60 segundos
        </p>

        <form onSubmit={registrar} className="flex flex-col gap-4">
          <AuthInput
            label="Nombre de tu empresa"
            type="text"
            placeholder="Ej: Construcciones Pérez"
            autoComplete="organization"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <AuthInput
            label="Correo electrónico"
            type="email"
            placeholder="tu@correo.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <PasswordInput
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordInput
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />

          {error && <ErrorBanner mensaje={error} />}

          <AuthButton loading={loading} texto="Crear cuenta" textoLoading="Creando cuenta…" />
        </form>
      </div>

      <p className="text-center text-sm" style={{ color: T.textMid }}>
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-bold" style={{ color: T.blue }}>
          Inicia sesión
        </Link>
      </p>
    </div>
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
