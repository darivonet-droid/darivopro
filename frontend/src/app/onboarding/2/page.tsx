"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { T } from "@/lib/theme";
import { ProgressBar, OnbButton, ErrorBanner } from "../_shared";

const CATEGORIAS = [
  { id: "albanileria",   emoji: "🧱", label: "Albañilería"   },
  { id: "fontaneria",    emoji: "💧", label: "Fontanería"    },
  { id: "electricidad",  emoji: "⚡", label: "Electricidad"  },
  { id: "pintura",       emoji: "🎨", label: "Pintura"       },
  { id: "carpinteria",   emoji: "🚪", label: "Carpintería"   },
  { id: "climatizacion", emoji: "❄️", label: "Climatización" },
];

export default function OnboardingStep2() {
  const router   = useRouter();
  const supabase = createClient();

  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [error,         setError]         = useState<string | null>(null);
  const [loading,       setLoading]       = useState(false);

  const toggle = (id: string) => {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const continuar = async () => {
    setError(null);
    if (seleccionadas.length === 0) {
      setError("Selecciona al menos una categoría");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error: dbErr } = await supabase
      .from("perfiles")
      .update({ categorias: seleccionadas })
      .eq("id", user.id);

    setLoading(false);
    if (dbErr) {
      setError("No se pudo guardar, inténtalo de nuevo");
      return;
    }
    router.push("/onboarding/3");
  };

  return (
    <div>
      <ProgressBar paso={2} />

      <h1 className="mb-1 text-2xl font-black leading-tight" style={{ color: T.text }}>
        ¿A qué te dedicas?
      </h1>
      <p className="mb-6 text-sm" style={{ color: T.textMid }}>
        Paso 2 de 3 — puedes elegir varias
      </p>

      {/* Grid de chips */}
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIAS.map((cat) => {
          const activo = seleccionadas.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              className="flex items-center gap-3 rounded-2xl px-4 py-4 text-left transition-all active:scale-95"
              style={{
                background: activo ? "#FEF3C7" : "#fff",
                border:     `2px solid ${activo ? T.amber : T.slateD}`,
                boxShadow:  activo
                  ? `0 2px 12px rgba(245,158,11,0.20)`
                  : "0 1px 4px rgba(10,22,40,0.06)",
              }}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span
                className="text-sm font-bold leading-tight"
                style={{ color: activo ? T.amberD : T.text }}
              >
                {cat.label}
              </span>
              {activo && (
                <span
                  className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold"
                  style={{ background: T.amber, color: "#fff" }}
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {seleccionadas.length > 0 && (
        <p className="mt-4 text-center text-xs font-semibold" style={{ color: T.textMid }}>
          {seleccionadas.length} categoría{seleccionadas.length !== 1 ? "s" : ""} seleccionada{seleccionadas.length !== 1 ? "s" : ""}
        </p>
      )}

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
  );
}
