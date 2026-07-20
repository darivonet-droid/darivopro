"use client";
// DARIVO PRO — Selector Móvil/Empresa para el Gerente de una empresa
// (20/07/2026). Único caso que aterriza aquí tras el login: Empresa +
// Gerente tiene acceso legítimo a ambos paneles; un Técnico nunca ve esta
// pantalla (va directo a Móvil, ver destino-post-login.ts).
import { useRouter } from "next/navigation";
import { T } from "@/lib/theme";

export default function ElegirPanelPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 20px rgba(10,22,40,0.09)" }}>
        <h1 className="mb-1 text-xl font-extrabold" style={{ color: T.text }}>
          ¿A dónde quieres entrar?
        </h1>
        <p className="mb-6 text-sm" style={{ color: T.textMid }}>
          Tu cuenta tiene acceso a Darivo Pro Móvil y Empresa
        </p>

        <div className="flex flex-col gap-3">
          <OpcionPanel
            titulo="Darivo Pro Móvil"
            descripcion="Cotiza, factura y gestiona clientes desde tu celular"
            onClick={() => router.push("/dashboard")}
          />
          <OpcionPanel
            titulo="Darivo Pro Empresa"
            descripcion="Panel de escritorio para tu equipo y tu negocio"
            onClick={() => router.push("/empresa")}
          />
        </div>
      </div>
    </div>
  );
}

function OpcionPanel({
  titulo,
  descripcion,
  onClick,
}: {
  titulo: string;
  descripcion: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-1 rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
      style={{ border: `1.5px solid ${T.slateD}` }}
    >
      <span className="text-sm font-bold" style={{ color: T.text }}>
        {titulo}
      </span>
      <span className="text-xs" style={{ color: T.textMid }}>
        {descripcion}
      </span>
    </button>
  );
}
