"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { T } from "@/lib/theme";
import { ProgressBar, OnbInput, OnbButton, ErrorBanner } from "../_shared";

export default function OnboardingStep1() {
  const router   = useRouter();
  const supabase = createClient();

  const [nombre,  setNombre]  = useState("");
  const [ruc,     setRuc]     = useState("");
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const continuar = async () => {
    setError(null);

    if (!nombre.trim()) {
      setError("Ingresa tu nombre, maestro 👷‍♂️");
      return;
    }
    if (ruc && !/^\d{10,11}$/.test(ruc)) {
      setError("El RUC debe tener 10 u 11 dígitos numéricos");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error: dbErr } = await supabase
      .from("perfiles")
      .update({
        razon_social: nombre.trim(),
        ...(ruc ? { ruc: ruc.trim() } : {}),
      })
      .eq("id", user.id);

    setLoading(false);
    if (dbErr) {
      setError("No se pudo guardar, inténtalo de nuevo");
      return;
    }
    router.push("/onboarding/2");
  };

  return (
    <div>
      <ProgressBar paso={1} />

      {/* Título */}
      <h1 className="mb-1 text-2xl font-black leading-tight" style={{ color: T.text }}>
        ¿Cómo te llaman,{"\n"}maestro? 👷‍♂️
      </h1>
      <p className="mb-6 text-sm" style={{ color: T.textMid }}>
        Paso 1 de 3 — datos de tu empresa
      </p>

      {/* Card */}
      <div
        className="rounded-2xl bg-white p-5"
        style={{ boxShadow: "0 2px 20px rgba(10,22,40,0.08)" }}
      >
        <div className="flex flex-col gap-4">
          <OnbInput
            label="Nombre completo o razón social"
            type="text"
            placeholder="Ej: Juan Pérez Construcciones"
            autoComplete="organization"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <OnbInput
            label="RUC"
            opcional
            type="text"
            inputMode="numeric"
            placeholder="10 u 11 dígitos"
            maxLength={11}
            value={ruc}
            onChange={(e) => setRuc(e.target.value.replace(/\D/g, ""))}
            error={
              ruc && !/^\d{10,11}$/.test(ruc)
                ? "Solo 10 u 11 dígitos numéricos"
                : undefined
            }
          />
        </div>

        {error && (
          <div className="mt-4">
            <ErrorBanner mensaje={error} />
          </div>
        )}

        <OnbButton
          loading={loading}
          texto="Continuar →"
          textoLoading="Guardando…"
          onClick={continuar}
        />
      </div>
    </div>
  );
}
