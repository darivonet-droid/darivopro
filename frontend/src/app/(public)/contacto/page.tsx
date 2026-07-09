"use client";
import { useState } from "react";
import { T } from "@/lib/theme";

// Canal de contacto: email hola@darivo.pro — el mismo que ya usa el CTA de
// precios (lib/planes.ts). Sin base de datos: el formulario compone un mailto.
const CONTACTO_EMAIL = "hola@darivo.pro";

export default function ContactoPage() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const asunto = `Contacto Darivo Pro — ${nombre || "sin nombre"}`;
    const cuerpo = `${mensaje}\n\n—\n${nombre}${correo ? ` · ${correo}` : ""}`;
    window.location.href = `mailto:${CONTACTO_EMAIL}?subject=${encodeURIComponent(
      asunto
    )}&body=${encodeURIComponent(cuerpo)}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 20px rgba(10,22,40,0.09)" }}>
        <h1 className="mb-1 text-xl font-extrabold" style={{ color: T.text }}>
          Contacto
        </h1>
        <p className="mb-6 text-sm" style={{ color: T.textMid }}>
          ¿Dudas o sugerencias? Escríbenos y te respondemos pronto.
        </p>

        <form onSubmit={enviar} className="flex flex-col gap-4">
          <Campo label="Nombre">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-xl px-4 py-3.5 text-sm font-medium outline-none"
              style={{ background: "#fff", color: T.text, border: `1.5px solid ${T.slateD}` }}
              required
            />
          </Campo>
          <Campo label="Correo electrónico">
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
              className="w-full rounded-xl px-4 py-3.5 text-sm font-medium outline-none"
              style={{ background: "#fff", color: T.text, border: `1.5px solid ${T.slateD}` }}
              required
            />
          </Campo>
          <Campo label="Mensaje">
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Cuéntanos en qué te ayudamos…"
              rows={4}
              className="w-full rounded-xl px-4 py-3.5 text-sm font-medium outline-none"
              style={{ background: "#fff", color: T.text, border: `1.5px solid ${T.slateD}` }}
              required
            />
          </Campo>

          <button
            type="submit"
            className="w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all active:scale-95"
            style={{ background: T.blue }}
          >
            Enviar por correo
          </button>
        </form>

        <p className="mt-5 text-center text-xs" style={{ color: T.textMid }}>
          También puedes escribirnos directamente a{" "}
          <a href={`mailto:${CONTACTO_EMAIL}`} className="font-bold" style={{ color: T.blue }}>
            {CONTACTO_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
        {label}
      </span>
      {children}
    </label>
  );
}
