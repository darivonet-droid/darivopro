"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Botón de logout real, reutilizable en Admin/Empresa/Partner.
 * Misma lógica que `cerrarSesion` en `AjustesForm.tsx` (Móvil):
 * signOut de Supabase + redirect a /login.
 */
export function CerrarSesionButton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);

  const cerrarSesion = async () => {
    setSaliendo(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      disabled={saliendo}
      onClick={() => void cerrarSesion()}
      className={className ?? "text-xs font-bold"}
      style={style}
    >
      {saliendo ? "Cerrando sesión…" : "Cerrar sesión"}
    </button>
  );
}
