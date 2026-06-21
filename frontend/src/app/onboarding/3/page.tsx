"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { T } from "@/lib/theme";
import { ProgressBar } from "../_shared";

export default function OnboardingStep3() {
  const router   = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const empezar = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("perfiles")
        .update({ onboarding_done: true })
        .eq("id", user.id);
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div>
      <ProgressBar paso={3} />

      {/* Celebración */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div
          className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl text-5xl"
          style={{
            background:  T.amberPale,
            boxShadow:   "0 4px 24px rgba(245,158,11,0.20)",
          }}
        >
          🎉
        </div>
        <h1 className="text-2xl font-black" style={{ color: T.text }}>
          ¡Listo, maestro!
        </h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: T.textMid }}>
          Tienes{" "}
          <span className="font-bold" style={{ color: T.blue }}>
            5 cotizaciones gratis
          </span>{" "}
          para empezar.
          <br />
          Sin tarjeta, sin trucos.
        </p>
      </div>

      {/* Card azul CTA */}
      <div
        className="mb-5 rounded-2xl p-5"
        style={{
          background:  T.blue,
          boxShadow:   "0 6px 24px rgba(37,99,235,0.35)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            ⚡
          </div>
          <div>
            <p className="text-base font-extrabold leading-snug" style={{ color: T.white }}>
              Haz tu primera cotización
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.70)" }}>
              en menos de 1 minuto
            </p>
          </div>
        </div>
      </div>

      {/* Beneficios rápidos */}
      <div
        className="mb-6 rounded-2xl bg-white p-4"
        style={{ boxShadow: "0 2px 16px rgba(10,22,40,0.07)" }}
      >
        {[
          { emoji: "⚡", texto: "Catálogo de partidas incluido" },
          { emoji: "📄", texto: "PDF profesional listo para enviar" },
          { emoji: "💬", texto: "Envío directo por WhatsApp" },
        ].map((item) => (
          <div key={item.texto} className="flex items-center gap-3 py-2">
            <span className="text-base">{item.emoji}</span>
            <span className="text-sm font-medium" style={{ color: T.text }}>
              {item.texto}
            </span>
          </div>
        ))}
      </div>

      {/* Botón final */}
      <button
        type="button"
        onClick={empezar}
        disabled={loading}
        className="w-full rounded-2xl py-4 text-base font-extrabold text-white transition-all active:scale-95 disabled:opacity-60"
        style={{
          background:  T.blue,
          boxShadow:   "0 4px 20px rgba(37,99,235,0.35)",
        }}
      >
        {loading ? "Abriendo tu panel…" : "Crear mi primera cotización →"}
      </button>

      <p className="mt-3 text-center text-xs" style={{ color: T.textLight }}>
        Siempre puedes completar tus datos en Configuración
      </p>
    </div>
  );
}
