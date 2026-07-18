"use client";
// DARIVO PRO — Widget de chat flotante de la landing pública.
// Completamente independiente del sistema de tickets interno (soporte_tickets/
// mensajes, /api/soporte/*) — este es solo para visitantes que TODAVÍA no son
// clientes (dudas sobre planes/precios/cómo funciona). No comparte backend,
// tabla ni componente con SoporteTicketsView/DarivoChat.
// Sin backend de IA ni respuestas automáticas: envía el mensaje por email
// best-effort a soporte@darivopro.com (mismo patrón que el resto de eventos
// transaccionales — ver lib/email/send.ts) y siempre confirma recepción en
// pantalla, la haya podido enviar el correo o no.
import { useState } from "react";
import { IconChatBubble, IconClose, IconCheck } from "@/components/landing/Icons";

const NAVY = "#0A1628";
const BLUE = "#2563EB";

type Estado = "idle" | "enviando" | "enviado";

export function LandingChatWidget() {
  const [abierto, setAbierto] = useState(false);
  const [estado, setEstado] = useState<Estado>("idle");
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [mensaje, setMensaje] = useState("");

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !mensaje.trim()) return;
    setEstado("enviando");
    try {
      await fetch("/api/landing/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), contacto: contacto.trim(), mensaje: mensaje.trim() }),
      });
    } catch {
      /* best-effort — igual confirmamos recepción abajo */
    }
    setEstado("enviado");
  };

  const cerrarYReiniciar = () => {
    setAbierto(false);
    // Reinicia el formulario después de un rato, no de golpe al cerrar
    // (si el visitante reabre enseguida, no queremos que pierda el contexto).
    setTimeout(() => {
      setEstado("idle");
      setNombre("");
      setContacto("");
      setMensaje("");
    }, 400);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {abierto && (
        <div
          className="mb-3 w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-3xl bg-white"
          style={{ boxShadow: "0 20px 50px rgba(10,22,40,0.25)" }}
        >
          {/* Encabezado */}
          <div className="px-5 py-4" style={{ background: NAVY }}>
            <p className="text-sm font-black text-white">Darivo Pro</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
              Normalmente respondemos el mismo día hábil
            </p>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
            {estado === "enviado" ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white"
                  style={{ background: "#16A34A" }}
                >
                  <IconCheck />
                </span>
                <p className="text-sm font-bold" style={{ color: NAVY }}>
                  ¡Recibimos tu mensaje!
                </p>
                <p className="text-xs text-slate-500">
                  Te contactaremos pronto{contacto.trim() ? ` a ${contacto.trim()}` : ""}.
                </p>
                <button
                  type="button"
                  onClick={cerrarYReiniciar}
                  className="mt-2 text-xs font-bold"
                  style={{ color: BLUE }}
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 rounded-2xl px-4 py-3" style={{ background: "#EFF4FF" }}>
                  <p className="text-sm font-semibold" style={{ color: NAVY }}>
                    ¡Bienvenido a Darivo Pro! 👋 ¿En qué podemos ayudarte?
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Cuéntanos tu duda sobre planes, precios o cómo funciona — te respondemos por correo o
                    teléfono, lo que prefieras.
                  </p>
                </div>

                <form onSubmit={enviar} className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Tu nombre
                    </span>
                    <input
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Carlos Ramírez"
                      required
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-blue-400"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Correo o WhatsApp (opcional)
                    </span>
                    <input
                      value={contacto}
                      onChange={(e) => setContacto(e.target.value)}
                      placeholder="Para poder responderte"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-blue-400"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Tu mensaje
                    </span>
                    <textarea
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      placeholder="Escribe tu pregunta aquí..."
                      required
                      rows={3}
                      className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-blue-400"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={estado === "enviando"}
                    className="rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
                    style={{ background: BLUE }}
                  >
                    {estado === "enviando" ? "Enviando…" : "Enviar mensaje"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => (abierto ? cerrarYReiniciar() : setAbierto(true))}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white transition-transform active:scale-95"
        style={{ background: BLUE, boxShadow: "0 10px 30px rgba(37,99,235,0.45)" }}
        aria-label={abierto ? "Cerrar chat" : "Abrir chat de ayuda"}
      >
        {abierto ? <IconClose /> : <IconChatBubble />}
      </button>
    </div>
  );
}
