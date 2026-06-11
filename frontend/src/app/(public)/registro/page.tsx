"use client";
// DARIVO PRO — Crear cuenta
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { T } from "@/lib/theme";

export default function RegistroPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [loading, setLoading] = useState(false);

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError("No se pudo crear la cuenta. Inténtalo de nuevo.");
      return;
    }
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setExito(true); // requiere confirmación por correo
    }
  };

  if (exito) {
    return (
      <div className="su rounded-3xl p-6 text-center" style={{ background: T.white }}>
        <div className="text-4xl">📬</div>
        <h2 className="mt-3 text-lg font-extrabold" style={{ color: T.text }}>Revisa tu correo</h2>
        <p className="mt-1 text-sm" style={{ color: T.textMid }}>
          Te enviamos un enlace para confirmar tu cuenta.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={registrar} className="su flex flex-col gap-4 rounded-3xl p-6" style={{ background: T.white }}>
      <h2 className="text-lg font-extrabold" style={{ color: T.text }}>Crear cuenta</h2>

      <Input
        label="Correo electrónico"
        type="email"
        placeholder="tu@correo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Contraseña"
        type="password"
        placeholder="Mínimo 8 caracteres"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p className="text-sm font-semibold" style={{ color: T.red }}>{error}</p>}

      <Button type="submit" full disabled={loading}>
        {loading ? "Creando cuenta…" : "Crear cuenta gratis"}
      </Button>

      <p className="text-center text-sm" style={{ color: T.textMid }}>
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-bold" style={{ color: T.blue }}>
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
