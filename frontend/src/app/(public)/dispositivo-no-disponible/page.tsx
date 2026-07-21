"use client";
// DARIVO PRO — Pantalla de bloqueo por dispositivo (Etapa 7 — continuación,
// 21/07/2026, EN FASE DE PRUEBAS). Middleware redirige aquí con `?rol=` en
// vez de dejar pasar la request al panel real — BLOQUEO TOTAL, no un aviso
// dentro del panel (ver frontend/src/lib/restriccion-dispositivo.ts).
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { T } from "@/lib/theme";
import {
  mensajeDispositivoCorrecto,
  type RolDispositivo,
} from "@/lib/restriccion-dispositivo";
import { createClient } from "@/lib/supabase/client";

const ROLES_VALIDOS: RolDispositivo[] = ["admin", "gerente", "movil", "partner"];

function esRolValido(v: string | null): v is RolDispositivo {
  return !!v && (ROLES_VALIDOS as string[]).includes(v);
}

function DispositivoNoDisponibleContenido() {
  const params = useSearchParams();
  const router = useRouter();
  const rolParam = params.get("rol");
  const rol: RolDispositivo = esRolValido(rolParam) ? rolParam : "movil";
  const mensaje = mensajeDispositivoCorrecto(rol) ||
    "Este panel no está disponible desde este dispositivo.";

  const cerrarSesion = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        className="rounded-2xl bg-white p-8 text-center"
        style={{ boxShadow: "0 2px 20px rgba(10,22,40,0.09)" }}
      >
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
          style={{ background: T.redPale }}
        >
          🚫
        </div>
        <h1 className="text-lg font-extrabold" style={{ color: T.text }}>
          Dispositivo no disponible
        </h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: T.textMid }}>
          {mensaje}
        </p>
        <button
          type="button"
          onClick={cerrarSesion}
          className="mt-6 w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all active:scale-95"
          style={{ background: T.blue }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default function DispositivoNoDisponiblePage() {
  return (
    <Suspense fallback={null}>
      <DispositivoNoDisponibleContenido />
    </Suspense>
  );
}
