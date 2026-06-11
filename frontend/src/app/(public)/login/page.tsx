"use client";
// DARIVO PRO — Iniciar sesión
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { T } from "@/lib/theme";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Correo o contraseña incorrectos");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={entrar} className="su flex flex-col gap-4 rounded-3xl p-6" style={{ background: T.white }}>
      <h2 className="text-lg font-extrabold" style={{ color: T.text }}>Iniciar sesión</h2>

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
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p className="text-sm font-semibold" style={{ color: T.red }}>{error}</p>}

      <Button type="submit" full disabled={loading}>
        {loading ? "Entrando…" : "Entrar"}
      </Button>

      <p className="text-center text-sm" style={{ color: T.textMid }}>
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-bold" style={{ color: T.blue }}>
          Regístrate gratis
        </Link>
      </p>
    </form>
  );
}
